# 🎙️ Meeting Summarize

### *Listen Less. Understand More.*

![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![AssemblyAI](https://img.shields.io/badge/AssemblyAI-Speech%20to%20Text-orange?style=for-the-badge)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-purple?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📌 Executive Summary

**Meeting Summarize** is an AI-powered meeting analysis application that converts recorded meeting audio into a structured and easy-to-understand summary.

The application combines **speech-to-text transcription**, **speaker identification**, **AI-powered summarization**, and **Tamil translation** to help users quickly understand important meeting discussions.

Instead of manually listening to an entire meeting recording, users can upload an audio file and receive:

- 📝 Complete meeting transcript
- 👥 Speaker-wise discussion points
- 📌 Overall meeting summary
- ✅ Action items
- 🌐 Tamil-language output

The backend is built using **FastAPI**, while **AssemblyAI** handles audio transcription and speaker labeling. The summarized content is generated using an AI model through **OpenRouter**.

---

✨ Core Features
Feature	Description
🎙️ Audio Upload	Upload a meeting recording directly through the web interface.
🗣️ Speech-to-Text	Converts spoken audio into readable text using AssemblyAI.
👥 Speaker Detection	Separates the conversation according to different speakers.
🧠 AI Summarization	Produces a structured overall summary of the meeting.
📋 Action Items	Extracts tasks and follow-up activities discussed during the meeting.
👤 Speaker-wise Points	Groups the important contributions of each speaker.
🌐 Tamil Output	Generates the processed meeting information in Tamil.
📄 Raw Transcript	Displays the original speaker-labelled transcript.
📥 TXT Export	Allows users to download the processed meeting information as TXT.
📝 Markdown Export	Allows users to save the results as Markdown.
🖱️ Drag & Drop	Audio files can be selected or dragged into the upload area.
📱 Responsive Interface	Designed as a browser-based user interface.

The current frontend includes audio upload, a 50 MB upload indication, OpenRouter API-key input, processing status, raw transcript, summary, action items, and TXT/Markdown export controls.

🏗️ System Architecture
                          ┌───────────────────────┐
                         │         USER          │
                         │                       │
                         │   Upload Meeting      │
                         │       Audio           │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    WEB INTERFACE      │
                         │                       │
                         │ HTML + CSS + JS       │
                         └───────────┬───────────┘
                                     │
                              HTTP POST Request
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │       FASTAPI         │
                         │       BACKEND         │
                         │                       │
                         │ /api/transcribe       │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      ASSEMBLYAI       │
                         │                       │
                         │ Speech Recognition    │
                         │ Speaker Labels        │
                         └───────────┬───────────┘
                                     │
                                  Transcript
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      OPENROUTER       │
                         │                       │
                         │ AI Meeting Analysis   │
                         └───────────┬───────────┘
                                     │
                   ┌─────────────────┼─────────────────┐
                   │                 │                 │
                   ▼                 ▼                 ▼
             ┌───────────┐    ┌────────────┐    ┌──────────────┐
             │  Overall  │    │   Action   │    │   Speaker    │
             │  Summary  │    │   Items    │    │   Points     │
             └─────┬─────┘    └─────┬──────┘    └──────┬───────┘
                   │                │                  │
                   └────────────────┼──────────────────┘
                                    │
                                    ▼
                         ┌───────────────────────┐
                         │     TAMIL OUTPUT      │
                         │                       │
                         │ Structured Results    │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │         USER          │
                         │                       │
                         │ View / Download       │
                         └───────────────────────┘

🔄 Application Workflow
Step 1 — Select Meeting Audio

The user selects a meeting recording from the browser.

Supported audio files are handled through the browser's audio-file input.

Step 2 — Upload and Process

The selected audio file is submitted to the FastAPI backend through:

POST /api/transcribe

The frontend sends the audio file together with the OpenRouter API key.

Step 3 — Speech Recognition

The FastAPI backend temporarily stores the uploaded audio and sends it to AssemblyAI.

Speaker labels are enabled during transcription.

Example:

Speaker A: We completed the first phase.

Speaker B: Testing is still pending.

Speaker A: We can complete testing tomorrow.

The backend formats the returned utterances as speaker-labelled text.

Step 4 — AI Meeting Analysis

The generated transcript is passed to the AI processing layer through OpenRouter.

The current application requests three major outputs:

1. Overall Summary
2. Action Items
3. Speaker Points

The backend requests a structured JSON response containing these fields.

Step 5 — Tamil Processing

The application is designed to produce the generated meeting analysis in Tamil while preserving English technical words where required.

This makes the results easier to understand for Tamil-speaking users.

Step 6 — Results

The web interface displays:

📝 Raw Transcript

📊 Overall Summary

✅ Action Items

👤 Speaker-wise Points

Users can also export the processed information as:

TXT
Markdown

The current frontend contains dedicated controls for both TXT and Markdown export.

🧠 AI Output Structure

The application organizes the AI response into three main sections.

📊 1. Overall Summary

Provides a concise representation of the complete meeting.

Example:

The meeting discussed the current project progress,
testing requirements, upcoming deadlines and
responsibilities for the team.
👤 2. Speaker Points

The system combines the turns from each speaker and presents their important ideas.

Example:

Speaker A
- Discussed the current project progress.
- Explained the next development stage.

Speaker B
- Discussed testing requirements.
- Suggested completing testing before deployment.
✅ 3. Action Items

Tasks identified from the meeting are presented separately.

Example:

- Complete project testing
- Prepare project documentation
- Schedule the next review meeting
🌐 Bilingual Experience

One of the main characteristics of Meeting Summarize is its Tamil-oriented output.

The interface itself contains Tamil labels for major operations such as:

ஆடியோ ஃபைலை பதிவேற்றவும்
ஆடியோவை உரைமாற்று
ஒட்டுமொத்த சுருக்கம்
செயல் உருப்படிகள்
உரைமாற்ற முடிவு

The interface also loads Inter and Noto Sans Tamil fonts for English and Tamil presentation.

🖥️ User Interface

The application provides a modern glass-style interface containing:

🎙️ Upload Area

Users can select or drag and drop an audio file.

🔐 API Key Field

The interface provides a secure password-style field for entering the OpenRouter API key.

⏳ Processing State

While the audio is being processed, the application displays a dedicated processing state.

📄 Transcript Area

The raw speaker-labelled transcript can be viewed after processing.

📊 Summary Area

The generated overall meeting summary is displayed separately.

✅ Action Items

Important follow-up tasks are displayed as a dedicated list.

📥 Export Controls

The application provides:

TXT download
Markdown download

These interface components are present in the current project files.

🛠️ Technology Stack
Technology	Role
🐍 Python	Backend programming
⚡ FastAPI	Web API and application backend
🎙️ AssemblyAI	Speech-to-text and speaker labelling
🤖 OpenRouter	AI-based meeting analysis
🌐 HTML5	Frontend structure
🎨 CSS3	User interface design
⚙️ JavaScript	Frontend logic and API communication
📄 JSON	Structured AI response
📥 HTML2PDF.js	Client-side document/export support

The FastAPI application mounts static resources, serves the HTML interface, and exposes the transcription endpoint.

📁 Project Structure
Meeting-summarize/
│
├── app.py
│   └── FastAPI backend
│
├── index.html
│   └── Main web interface
│
├── script.js
│   └── Frontend interaction,
│       upload handling and API communication
│
├── style.css
│   └── Application styling
│
├── requirements.txt
│   └── Python dependencies
│
├── static/
│   └── Frontend static resources
│
├── README.md
│   └── Project documentation
│
└── __pycache__/
    └── Python generated cache files

The repository currently contains the main application files including app.py, index.html, script.js, style.css, and requirements.txt.

🎯 Use Cases
🎓 College & Education

Useful for:

Project meetings
Department meetings
Student discussions
Team presentations
Academic discussions
💼 Business

Useful for:

Team meetings
Project reviews
Client discussions
Planning sessions
Follow-up task extraction
👨‍💻 Software Development

Useful for:

Sprint discussions
Requirement meetings
Technical discussions
Project reviews
Development planning
🌐 Tamil-Speaking Users

👨‍💻 Author
Naveen Alagan

B.Tech Information Technology

GitHub:

https://github.com/naveenalagan2007-ctl

Project:

https://github.com/naveenalagan2007-ctl/Meeting-summarize

📜 License

This project is developed for educational and project purposes.
