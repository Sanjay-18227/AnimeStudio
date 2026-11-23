import json
from typing import Dict, Any, List, Optional

MANGA_SYSTEM_PROMPT = """You are Anime Studio AI's Master Manga Screenplay Engine & Narrative Architect.
Your mission is to generate professional, publication-ready Japanese manga scripts structured for comic page generation and anime art synthesis.

CRITICAL ARCHITECTURE RULES:
1. OUTPUT FORMAT: You must ALWAYS respond with ONLY a valid, parseable JSON object matching the requested schema. Do not include introductory text, conversational chatter, or markdown formatting outside the JSON code block.
2. COMIC VISUAL THINKING: Every panel must have a precise shot_type (Wide Shot, Close-Up, Extreme Close-Up, Dutch Angle, Over the Shoulder, Splash Page, Low Angle, High Angle) and vivid visual_description detailing characters' poses, facial expressions, camera framing, lighting, and environmental background.
3. AUTHENTIC DIALOGUE & EMOTION: Characters speak with unique vocal cadences, motivations, and subtext. Each dialogue item must specify character name, text, emotion (Determined, Angry, Shocked, Smiling, Tearful, Whisper, Smirking), and dialogue_type (speech, thought, shout, whisper, scream).
4. SOUND EFFECTS (SFX): Include classic manga onomatopoeia with Japanese katakana (e.g., ドドド [Rumble], ゴゴゴ [Menacing], バキッ [Crack/Impact], スパッ [Clean Slash], ドキッ [Heartbeat], ドン [Sudden Realization/Doom]) with English meaning and visual_style.
5. CONTINUITY: Honor all established project memories, character traits, lore, and world rules. Never contradict previously established canon.
6. LANGUAGE: If language is 'ta' (Tamil), generate character dialogues, scene titles, and narrative in rich, expressive Tamil while keeping technical JSON keys in English. If 'ja' (Japanese), provide dialogues in Japanese. If 'en', provide in English.
"""

def build_story_generation_prompt(
    premise: str,
    genre: str = "Action",
    subgenre: str = "",
    title: str = "",
    protagonist: str = "",
    supporting_characters: str = "",
    setting: str = "",
    time_period: str = "",
    art_direction: str = "",
    target_audience: str = "Shonen",
    chapter_count: int = 3,
    language: str = "en",
    tone: str = "Dramatic",
    ending_type: str = "Epic",
    project_memories: Optional[List[Dict[str, str]]] = None,
    personality: str = "Creative"
) -> str:
    """Builds comprehensive prompt for initial multi-chapter manga story generation."""
    
    memory_context = ""
    if project_memories:
        memory_lines = [f"- [{m.get('category', 'lore').upper()}] {m.get('key')}: {m.get('content')}" for m in project_memories]
        memory_context = "\nPROJECT LORE & CONTINUITY CONTEXT:\n" + "\n".join(memory_lines) + "\n"

    lang_instruction = "English"
    if language == "ta":
        lang_instruction = "Tamil (தமிழ்). Dialogues, synopsis, descriptions, and scene titles must be written in Tamil."
    elif language == "ja":
        lang_instruction = "Japanese (日本語). Dialogues and narrative in Japanese."

    prompt = f"""Generate a complete, structured Manga Story Script based on the following specifications:

TITLE: {title or 'Generate an iconic anime/manga title'}
GENRE: {genre} (Subgenre: {subgenre or 'None specified'})
TARGET AUDIENCE: {target_audience}
STORY PREMISE: {premise}
MAIN PROTAGONIST: {protagonist or 'Develop a compelling protagonist with signature look & drive'}
SUPPORTING CAST: {supporting_characters or 'Create 1-2 key supporting characters / rivals'}
SETTING & WORLD: {setting or 'Imaginative anime setting'}
TIME PERIOD: {time_period or 'Modern / Near-future'}
ART DIRECTION: {art_direction or 'Crisp modern anime aesthetic with dynamic action ink lines'}
TONE: {tone}
ENDING TYPE: {ending_type}
CHAPTERS TO GENERATE: {chapter_count}
LANGUAGE FOR STORY & DIALOGUE: {lang_instruction}
{memory_context}
REQUIRED JSON OUTPUT SCHEMA:
{{
  "title": "Story Title",
  "genre": ["{genre}"],
  "subgenre": "{subgenre}",
  "premise": "{premise}",
  "synopsis": "Engaging 2-3 paragraph story overview detailing protagonist arc, escalating conflict, and climax.",
  "world_building": "Rules of this world, powers, technology, factions, and key locations.",
  "setting": "Primary location",
  "time_period": "Time period",
  "art_direction": "Visual aesthetic notes",
  "target_audience": "{target_audience}",
  "language": "{language}",
  "tone": "{tone}",
  "ending_type": "{ending_type}",
  "main_conflict": "The central struggle",
  "story_arcs": "Outline of story progression across arcs",
  "characters": [
    {{
      "name": "Character Name",
      "role": "Protagonist / Antagonist / Mentor / Companion / Rival",
      "age": "Age",
      "appearance": "Physical build, face, notable scars or traits",
      "hair": "Hairstyle, color, texture",
      "eye_color": "Eye color and gaze intensity",
      "clothing": "Iconic outfit, accessories, color palette",
      "body_type": "Athletic / Slender / Muscular / etc.",
      "personality": "Core traits, flaws, motivations",
      "abilities": "Powers, combat style, or signature skills",
      "relationships": "Relationship with other cast members",
      "visual_prompt": "Prompt for text-to-image generator (e.g. '1boy, anime style, spiky black hair, violet eyes, ...')"
    }}
  ],
  "chapters": [
    {{
      "chapter_number": 1,
      "title": "Chapter 1 Title",
      "summary": "Summary of this chapter",
      "cliffhanger": "Hook ending for next chapter",
      "scenes": [
        {{
          "scene_number": 1,
          "title": "Scene 1 Title",
          "location": "Location name",
          "time_of_day": "Night / Day / Sunset / etc.",
          "description": "Visual setting and atmosphere description",
          "mood": "Tense / Epic / Playful / Melancholic",
          "visual_prompt": "Scene background prompt for image generator",
          "panels": [
            {{
              "panel_number": 1,
              "shot_type": "Wide Shot / Close-Up / Extreme Close-Up / Dutch Angle / Over the Shoulder / Splash Page",
              "camera_angle": "Eye Level / Low Angle / High Angle / Worm's Eye",
              "visual_description": "Detailed artwork description of what is drawn in this comic panel",
              "dialogues": [
                {{
                  "character": "Speaker Name",
                  "text": "Spoken line or inner thought",
                  "emotion": "Determined / Shocked / Angry / etc.",
                  "dialogue_type": "speech / thought / shout / whisper / scream"
                }}
              ],
              "sound_effects": [
                {{
                  "text": "ドドド",
                  "meaning": "Rumble",
                  "visual_style": "impact"
                }}
              ],
              "narration": "Optional narrative caption box text",
              "emotion": "Emotional tone of this panel",
              "visual_prompt": "Detailed anime art generation prompt"
            }}
          ]
        }}
      ]
    }}
  ]
}}

Generate {chapter_count} full chapters, each containing 2 to 3 dynamic scenes, each scene containing 3 to 5 detailed comic panels. Ensure the story is gripping, high stakes, and true to the {genre} genre! Return ONLY valid JSON."""
    return prompt

def build_chapter_generation_prompt(
    story_context: Dict[str, Any],
    chapter_number: int,
    focus_prompt: str = "",
    action: str = "create",
    project_memories: Optional[List[Dict[str, str]]] = None,
    language: str = "en"
) -> str:
    """Builds prompt to generate a new chapter or rewrite an existing chapter maintaining continuity."""
    
    characters_summary = ", ".join([c.get("name", "Unknown") for c in story_context.get("characters", [])])
    
    memory_context = ""
    if project_memories:
        memory_lines = [f"- [{m.get('category', 'lore').upper()}] {m.get('key')}: {m.get('content')}" for m in project_memories]
        memory_context = "\nPROJECT LORE CONTEXT:\n" + "\n".join(memory_lines) + "\n"

    action_directive = "Create a brand new continuation chapter."
    if action == "rewrite":
        action_directive = f"Rewrite Chapter {chapter_number} with heightened drama, better pacing, and stronger visual impact."
    elif action == "add_twist":
        action_directive = f"Write Chapter {chapter_number} featuring a massive, unpredictable plot twist that upends character expectations!"

    prompt = f"""You are continuing the manga '{story_context.get('title', 'Manga')}' ({story_context.get('genre', 'Action')}).

STORY SYNOPSIS:
{story_context.get('synopsis', '')}

MAIN CHARACTERS: {characters_summary}
WORLD RULES & SETTING: {story_context.get('world_building', '')}
{memory_context}
TASK: {action_directive}
CHAPTER NUMBER: {chapter_number}
SPECIFIC FOCUS / USER PROMPT: {focus_prompt or 'Advance the central story arc with high tension and character development.'}
LANGUAGE: {language}

RETURN ONLY A VALID JSON OBJECT matching this ChapterScript schema:
{{
  "chapter_number": {chapter_number},
  "title": "Chapter Title",
  "summary": "Detailed summary of chapter events",
  "cliffhanger": "Thrilling hook ending this chapter",
  "scenes": [
    {{
      "scene_number": 1,
      "title": "Scene Title",
      "location": "Location",
      "time_of_day": "Night / Day / Sunset",
      "description": "Visual setting and atmosphere",
      "mood": "Mood",
      "visual_prompt": "Background prompt",
      "panels": [
        {{
          "panel_number": 1,
          "shot_type": "Shot Type",
          "camera_angle": "Angle",
          "visual_description": "Precise artwork description",
          "dialogues": [
            {{
              "character": "Speaker Name",
              "text": "Dialogue line",
              "emotion": "Emotion",
              "dialogue_type": "speech / thought / shout"
            }}
          ],
          "sound_effects": [
            {{
              "text": "ドドド",
              "meaning": "Rumble",
              "visual_style": "impact"
            }}
          ],
          "narration": "",
          "emotion": "Emotion",
          "visual_prompt": "Image prompt"
        }}
      ]
    }}
  ]
}}
Provide 2-3 scenes, each with 3-5 complete manga panels. Return ONLY valid JSON."""
    return prompt

def build_transform_prompt(
    action: str,
    target_data: Dict[str, Any],
    parameters: Dict[str, Any],
    story_context: Dict[str, Any],
    language: str = "en"
) -> str:
    """Builds prompt for granular AI actions on scenes, dialogues, panels, or plot twists."""
    
    if action == "expand_scene":
        return f"""Expand the following manga scene by adding richer sensory atmosphere, escalating tension, and 2-3 additional high-impact comic panels:
SCENE DATA:
{json.dumps(target_data, ensure_ascii=False, indent=2)}

USER INSTRUCTION: {parameters.get('instruction', 'Add more dramatic tension and character beats.')}
LANGUAGE: {language}

Return ONLY the updated Scene JSON object conforming to SceneScript schema."""

    elif action == "improve_dialogue":
        return f"""Refine and polish the dialogue in this scene or panel. Make the character voices more distinct, emotional, poetic, and true to their anime archetype:
DATA:
{json.dumps(target_data, ensure_ascii=False, indent=2)}

USER INSTRUCTION: {parameters.get('instruction', 'Make dialogues punchier, more dramatic, with deeper subtext.')}
LANGUAGE: {language}

Return ONLY the updated JSON with improved dialogues matching the schema."""

    elif action == "change_tone":
        new_tone = parameters.get("tone", "Dark & Gritty")
        return f"""Rewrite this manga scene or chapter to match the requested tone: '{new_tone}'.
ORIGINAL DATA:
{json.dumps(target_data, ensure_ascii=False, indent=2)}

LANGUAGE: {language}
Return ONLY the updated JSON matching the schema."""

    elif action == "add_twist":
        return f"""Introduce a surprising, thrilling plot twist into this manga scene or chapter:
DATA:
{json.dumps(target_data, ensure_ascii=False, indent=2)}

TWIST DIRECTION: {parameters.get('instruction', 'A trusted ally reveals a hidden identity or secret motive.')}
LANGUAGE: {language}

Return ONLY the updated JSON matching the schema."""

    elif action == "regenerate_panel":
        return f"""Regenerate the artwork visual description, camera angle, shot type, and sound effects for this individual manga panel:
PANEL DATA:
{json.dumps(target_data, ensure_ascii=False, indent=2)}

SHOT TYPE PREFERENCE: {parameters.get('shot_type', 'Dramatic Angle')}
INSTRUCTION: {parameters.get('instruction', 'Make the artwork visual description cinematic and breathtaking.')}
LANGUAGE: {language}

Return ONLY a single valid Panel JSON object matching PanelScript schema."""

    elif action == "alternative_ending":
        return f"""Generate an alternative ending chapter for the story '{story_context.get('title', 'Manga')}'.
ENDING TYPE: {parameters.get('ending_type', 'Bittersweet')}
INSTRUCTION: {parameters.get('instruction', 'Provide a poignant, unforgettable resolution.')}
LANGUAGE: {language}

Return ONLY a valid Chapter JSON object matching ChapterScript schema."""

    return f"Transform the manga data: {json.dumps(target_data)}"
