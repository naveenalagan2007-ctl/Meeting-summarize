from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import assemblyai as aai
import os
import shutil
import tempfile
import json
import requests
import re

app = FastAPI(title="Bilingual Audio Summarizer")

# Provided by the user
aai.settings.api_key = "f9f3827f4a6d49679648ffe38b313a43"

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

def call_openrouter_api(api_key, formatted_text):
    prompt = f"""
You are an expert Tamil meeting summarizer.

Task:
1. Generate ONE overall meeting summary (reduce to about 2/3 length of the original transcript).
2. Generate detailed points for each speaker. You MUST capture ALL their main arguments, ideas, and decisions accurately and comprehensively. Do NOT over-summarize into a single sentence; provide a thorough account of what each speaker communicated. Do NOT copy the input verbatim.
3. Extract all Action Items from the meeting.
4. Keep the english words as it is.Don't change the meaning of the input.

STRICT RULES:
- Don't replace any words in the input.
- The entire output MUST be in Tamil.
- Provide a clean and professional Tamil translation/summary.
- Keep it natural and clean
- Do NOT mix speakers
- Combine all turns for each speaker, turning them into a concise summary point rather than a list of their exact quotes.
- Name the speakers purely as "A", "B", "C", etc. in the speaker points.
- You MUST output your response purely as a valid JSON object.

Output JSON format:
{{
  "overall_summary": "...",
  "action_items": ["item 1", "item 2"],
  "speaker_points": [
    {{ "speaker": "A", "text": "..." }},
    {{ "speaker": "B", "text": "..." }}
  ]
}}

Input:
{formatted_text}
"""
    clean_api_key = api_key.strip().encode('ascii', 'ignore').decode('ascii')
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {clean_api_key}",
        "Content-Type": "application/json; charset=utf-8"
    }
    data = {"model": "openai/gpt-4o-mini", "response_format": {"type": "json_object"}, "messages": [{"role": "user", "content": prompt}]}
    response = requests.post(url, headers=headers, data=json.dumps(data, ensure_ascii=False).encode('utf-8'))
    response.raise_for_status() 
    return response.json()['choices'][0]['message']['content']

@app.post("/api/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    openrouter_key: str = Form(...)
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        config = aai.TranscriptionConfig(speaker_labels=True, speech_models=["universal"])
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(tmp_path, config)
        os.unlink(tmp_path)

        if transcript.status == aai.TranscriptStatus.error:
            raise HTTPException(status_code=500, detail=transcript.error)

        formatted_text = ""
        if transcript.utterances:
            for utterance in transcript.utterances:
                formatted_text += f"Speaker {utterance.speaker}: {utterance.text}\n"
        else:
            formatted_text = transcript.text or ""

        # Now call OpenRouter
        if not openrouter_key:
            raise HTTPException(status_code=400, detail="OpenRouter API Key is missing.")

        summary_text = call_openrouter_api(openrouter_key, formatted_text)

        # Parse summary
        try:
            cleaned_text = summary_text.strip()
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text.split("\n", 1)[-1]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            parsed_data = json.loads(cleaned_text)
            overall_summary = parsed_data.get("overall_summary", "")
            action_items = parsed_data.get("action_items", [])
            speaker_points = parsed_data.get("speaker_points", [])
        except Exception as e:
            overall_summary = summary_text
            action_items = []
            speaker_points = []
            print("JSON parsing error:", e)

        return {
            "status": "success", 
            "raw_transcript": formatted_text,
            "overall_summary": overall_summary,
            "action_items": action_items,
            "speaker_points": speaker_points
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
