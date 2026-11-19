import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.chat import Conversation, ChatMessage
from app.models.project import Project
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ConversationResponse,
    ConversationDetailResponse
)
from app.services.providers.manager import ai_manager
from app.services.providers.base import AIProviderAuthenticationError, AIProviderError

router = APIRouter(prefix="/chat", tags=["AI Chat Studio"])

@router.post("", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
def send_chat_message(payload: ChatMessageCreate, db: Session = Depends(get_db)):
    """Sends a user message, executes AI co-pilot reasoning, and stores the response."""
    
    # 1. Resolve or create Conversation
    conversation = None
    if payload.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == payload.conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Specified conversation not found.")
    
    if not conversation:
        conv_id = str(uuid.uuid4())
        # Generate dynamic title from prompt snippet
        raw_snippet = payload.content.strip().split("\n")[0]
        title = raw_snippet[:40] + ("..." if len(raw_snippet) > 40 else "")
        if not title:
            title = "New Anime Brainstorm"

        # Verify project if passed
        proj_id = payload.project_id
        if proj_id:
            proj = db.query(Project).filter(Project.id == proj_id).first()
            if not proj:
                proj_id = None

        conversation = Conversation(
            id=conv_id,
            project_id=proj_id,
            title=title,
            mode=payload.mode or "general",
            language=payload.language or "en"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # 2. Persist User Message
    user_msg_id = str(uuid.uuid4())
    user_message = ChatMessage(
        id=user_msg_id,
        conversation_id=conversation.id,
        sender="user",
        content=payload.content,
        provider_used=payload.preferred_provider or "user",
        model_used=""
    )
    db.add(user_message)
    db.commit()

    # 3. Retrieve conversation history for multi-turn context
    history_records = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    chat_history = []
    for msg in history_records:
        role = "user" if msg.sender == "user" else "assistant"
        chat_history.append({"role": role, "content": msg.content})

    # 4. Execute AI Generation with mode, language & fallback
    try:
        reply_text, provider_used, model_used, fallback_triggered = ai_manager.execute_chat(
            messages=chat_history,
            mode=conversation.mode,
            language=conversation.language,
            preferred_provider=payload.preferred_provider,
            preferred_model=payload.preferred_model
        )
    except AIProviderAuthenticationError as auth_err:
        # Create an error record in conversation for visibility
        err_msg_id = str(uuid.uuid4())
        err_msg = ChatMessage(
            id=err_msg_id,
            conversation_id=conversation.id,
            sender="assistant",
            content=f"⚠️ Authentication Error: {auth_err.message}",
            provider_used=auth_err.provider,
            error_message=auth_err.message
        )
        db.add(err_msg)
        db.commit()
        raise HTTPException(status_code=401, detail=auth_err.message)
    except AIProviderError as prov_err:
        raise HTTPException(status_code=502, detail=prov_err.message)
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Unexpected error in AI reasoning: {str(ex)}")

    # 5. Persist Assistant Message
    assistant_msg_id = str(uuid.uuid4())
    assistant_message = ChatMessage(
        id=assistant_msg_id,
        conversation_id=conversation.id,
        sender="assistant",
        content=reply_text,
        provider_used=provider_used,
        model_used=model_used
    )
    db.add(assistant_message)
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(assistant_message)

    return ChatMessageResponse(
        id=assistant_message.id,
        conversation_id=assistant_message.conversation_id,
        sender=assistant_message.sender,
        content=assistant_message.content,
        provider_used=assistant_message.provider_used,
        model_used=assistant_message.model_used,
        error_message=assistant_message.error_message,
        created_at=assistant_message.created_at
    )

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    project_id: Optional[str] = Query(None, description="Filter by Project ID"),
    mode: Optional[str] = Query(None, description="Filter by Mode"),
    db: Session = Depends(get_db)
):
    """List all saved chat sessions with message counts and last message snippet."""
    query = db.query(Conversation)
    if project_id:
        query = query.filter(Conversation.project_id == project_id)
    if mode:
        query = query.filter(Conversation.mode == mode)

    conversations = query.order_by(Conversation.updated_at.desc()).all()

    result = []
    for conv in conversations:
        msg_count = db.query(func.count(ChatMessage.id)).filter(ChatMessage.conversation_id == conv.id).scalar() or 0
        last_msg = (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == conv.id)
            .order_by(ChatMessage.created_at.desc())
            .first()
        )

        result.append(
            ConversationResponse(
                id=conv.id,
                project_id=conv.project_id,
                title=conv.title,
                mode=conv.mode,
                language=conv.language,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=msg_count,
                last_message=last_msg.content[:80] if last_msg else None
            )
        )
    return result

@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation_detail(conversation_id: str, db: Session = Depends(get_db)):
    """Fetch full conversation message history."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    msg_responses = [
        ChatMessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender=m.sender,
            content=m.content,
            provider_used=m.provider_used,
            model_used=m.model_used,
            error_message=m.error_message,
            created_at=m.created_at
        )
        for m in messages
    ]

    last_msg = messages[-1].content[:80] if messages else None

    return ConversationDetailResponse(
        id=conv.id,
        project_id=conv.project_id,
        title=conv.title,
        mode=conv.mode,
        language=conv.language,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        message_count=len(messages),
        last_message=last_msg,
        messages=msg_responses
    )

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Delete a conversation and all its messages."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return None

