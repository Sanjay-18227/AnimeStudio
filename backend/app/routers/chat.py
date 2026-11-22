import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, select

from app.core.database import get_db
from app.models.chat import Conversation, ChatMessage
from app.models.project import Project
from app.models.character import Character
from app.models.memory import ProjectMemory
from app.models.settings import UserSettings
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ConversationResponse,
    ConversationDetailResponse
)
from app.services.providers.manager import ai_manager
from app.services.providers.base import AIProviderAuthenticationError, AIProviderError

router = APIRouter(prefix="/chat", tags=["AI Chat Studio"])

def get_user_settings_helper(db: Session) -> UserSettings:
    s = db.query(UserSettings).filter(UserSettings.id == "default_user").first()
    if not s:
        s = UserSettings(id="default_user")
        db.add(s)
        db.commit()
        db.refresh(s)
    return s

def build_project_context(project_id: Optional[str], db: Session) -> tuple[Optional[dict], Optional[list]]:
    if not project_id:
        return None, None
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        return None, None

    chars = db.query(Character).filter(Character.project_id == project_id).all()
    char_list = [
        {"name": c.name, "role": c.role, "appearance": c.appearance or "", "personality": c.personality or ""}
        for c in chars
    ]

    proj_context = {
        "title": proj.title,
        "genre": proj.genre,
        "target_audience": proj.target_audience,
        "description": proj.description or "",
        "characters": char_list
    }

    mems = db.query(ProjectMemory).filter(ProjectMemory.project_id == project_id).all()
    mem_list = [{"key": m.key, "content": m.content, "category": m.category} for m in mems]

    return proj_context, mem_list

@router.post("", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
def send_chat_message(payload: ChatMessageCreate, db: Session = Depends(get_db)):
    """Sends a user message, executes AI co-pilot reasoning, and stores the response."""
    user_settings = get_user_settings_helper(db)

    # 1. Resolve or create Conversation
    conversation = None
    if payload.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == payload.conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Specified conversation not found.")
    
    if not conversation:
        conv_id = str(uuid.uuid4())
        raw_snippet = payload.content.strip().split("\n")[0]
        title = raw_snippet[:40] + ("..." if len(raw_snippet) > 40 else "")
        if not title:
            title = "New Anime Brainstorm"

        proj_id = payload.project_id
        if proj_id:
            proj = db.query(Project).filter(Project.id == proj_id).first()
            if not proj:
                proj_id = None

        conversation = Conversation(
            id=conv_id,
            project_id=proj_id,
            title=title,
            mode=payload.mode or user_settings.default_role or "general",
            language=payload.language or user_settings.language or "en"
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

    # 4. Gather project context & memory if enabled
    proj_context, mem_list = None, None
    if user_settings.memory_enabled and conversation.project_id:
        proj_context, mem_list = build_project_context(conversation.project_id, db)

    # 5. Execute AI Generation with personalized settings
    try:
        reply_text, provider_used, model_used, fallback_triggered = ai_manager.execute_chat(
            messages=chat_history,
            mode=conversation.mode,
            language=conversation.language,
            preferred_provider=payload.preferred_provider,
            preferred_model=payload.preferred_model,
            assistant_name=user_settings.assistant_name,
            personality=user_settings.personality,
            response_length=user_settings.response_length,
            response_tone=user_settings.response_tone,
            creativity_level=user_settings.creativity_level,
            project_context=proj_context,
            memories=mem_list
        )
    except AIProviderAuthenticationError as auth_err:
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

    # 6. Persist Assistant Message
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

@router.post("/conversations/{conversation_id}/regenerate", response_model=ChatMessageResponse)
def regenerate_chat_response(conversation_id: str, db: Session = Depends(get_db)):
    """Regenerates the last assistant response in a conversation."""
    user_settings = get_user_settings_helper(db)

    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    if not messages:
        raise HTTPException(status_code=400, detail="Cannot regenerate an empty conversation")

    # If last message was assistant, delete it before regenerating
    if messages[-1].sender == "assistant":
        last_to_del = messages[-1]
        db.delete(last_to_del)
        db.commit()
        messages = messages[:-1]

    if not messages:
        raise HTTPException(status_code=400, detail="No user message to regenerate from")

    chat_history = []
    for msg in messages:
        role = "user" if msg.sender == "user" else "assistant"
        chat_history.append({"role": role, "content": msg.content})

    proj_context, mem_list = None, None
    if user_settings.memory_enabled and conversation.project_id:
        proj_context, mem_list = build_project_context(conversation.project_id, db)

    try:
        reply_text, provider_used, model_used, fallback_triggered = ai_manager.execute_chat(
            messages=chat_history,
            mode=conversation.mode,
            language=conversation.language,
            assistant_name=user_settings.assistant_name,
            personality=user_settings.personality,
            response_length=user_settings.response_length,
            response_tone=user_settings.response_tone,
            creativity_level=user_settings.creativity_level,
            project_context=proj_context,
            memories=mem_list
        )
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate response: {str(ex)}")

    new_assistant_msg = ChatMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        sender="assistant",
        content=reply_text,
        provider_used=provider_used,
        model_used=model_used
    )
    db.add(new_assistant_msg)
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(new_assistant_msg)

    return ChatMessageResponse(
        id=new_assistant_msg.id,
        conversation_id=new_assistant_msg.conversation_id,
        sender=new_assistant_msg.sender,
        content=new_assistant_msg.content,
        provider_used=new_assistant_msg.provider_used,
        model_used=new_assistant_msg.model_used,
        error_message=new_assistant_msg.error_message,
        created_at=new_assistant_msg.created_at
    )

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    project_id: Optional[str] = Query(None, description="Filter by Project ID"),
    mode: Optional[str] = Query(None, description="Filter by Mode"),
    search: Optional[str] = Query(None, description="Search keyword in title or message content"),
    db: Session = Depends(get_db)
):
    """List all saved chat sessions with message counts and optional search filter."""
    query = db.query(Conversation)
    if project_id and isinstance(project_id, str):
        query = query.filter(Conversation.project_id == project_id)
    if mode and isinstance(mode, str):
        query = query.filter(Conversation.mode == mode)

    if search and isinstance(search, str) and search.strip():
        term = f"%{search.strip()}%"
        # Search title OR message content in matching conversation
        matching_conv_ids_query = select(ChatMessage.conversation_id).filter(ChatMessage.content.ilike(term))
        query = query.filter(
            or_(
                Conversation.title.ilike(term),
                Conversation.id.in_(matching_conv_ids_query)
            )
        )

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
