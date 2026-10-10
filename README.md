# Stroke-Training-Platform

Flask backend and Vue 3 frontend for a stroke rehabilitation training platform: patients take cognitive assessment and training exercises, doctors pair with patients and review their scores, and an LLM turns a patient's results into a new set of personalized exercises and written advice.

## Context

Course project on stroke ("脑卒中") rehabilitation training. Backend in `application/`, frontend in `frontend/`. In-app content, prompts and question data are Chinese.

## Features

- Registration and login (bcrypt passwords, with a legacy unsalted-MD5 verification path in `application/login.py`), user and doctor profiles.
- Assessment and training question flows across five domains — acalculia (`失算症`), thought disorder, attention, perceptual and memory training — with score submission and per-user score history (`/api/submit`, `/api/submitTrain`, `/api/deliverScoreData_train`, `/api/getLastScore`).
- Doctor tooling: list patients, pair or unpair a doctor with a patient (`/api/doctorpair`), view per-patient scores and detail, and edit the AI advice shown to a patient (`/api/ai_doctor_tips`).
- AI-generated exercises: `GET /api/aiTrain` reads the patient's latest advice and asks the LLM for 20 questions (multiple choice `model=0`, fill-in-the-blank `model=1`) as JSON, then stores them per user.
- AI assessment: `GET /api/AI` collects the patient's training scores and the previous advice and asks the LLM for a follow-up analysis, appended to the patient's advice history.
- Text-to-speech: `GET /dealAudio` synthesizes speech to an MP3 with the edge-tts CLI, using one of 14 mapped zh-CN / zh-HK / zh-TW voices.
- Speech recognition, two implementations:
  - iFlytek (讯飞) real-time ASR (`application/rtasr_p.py`, `application/asr_bp.py`). The server captures audio from its own microphone with PyAudio and streams it to iFlytek over WebSocket. Clients drive it through REST session endpoints: `/asr/start`, `/asr/stop`, `/asr/status`, `/asr/get_current_transcription`, `/asr/active_sessions`, `/asr/connection_status`; at most 5 concurrent sessions, sessions expire after 300 s.
  - Local OpenAI Whisper (`application/ten.py`, `application/wapp.py`). Audio is uploaded to `/api/receiveRecordingDataTest`, buffered for the session, and transcribed offline with `whisper.load_model` (size `base`, CUDA when available).

## Architecture

- `run.py` calls `application/__init__.py:create_app()`. 22 blueprints are assembled in `application/routes.py`, exposing 33 routes.
- MongoDB through pymongo (`application/utils.py`), 10 collections: `users`, `questions`, `questions_train`, `save`, `deliver_score`, `deliver_score_train`, `images`, `aiTips`, `userinfo`, `doctor_patient`.
- LLM calls use the `openai` Python SDK pointed at DeepSeek (`https://api.deepseek.com`), model `deepseek-chat`.
- Frontend: Vue 3 + Vite with Pinia, Element Plus, Tailwind, ECharts; one app with separate patient and doctor views (`frontend/src/views/`), dev proxy to `http://localhost:5000`.

## Getting started

Backend:

```bash
pip install -r requirement.txt
# env vars used: DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL (default https://api.deepseek.com),
#               SECRET_KEY, FLASK_DEBUG (default false)
python run.py        # serves http://127.0.0.1:5000
```

MongoDB is expected at `mongodb://127.0.0.1:27017` (hard-coded in `application/utils.py`). The `edge-tts` executable must be on PATH, since TTS is invoked as a subprocess.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Status and limitations

- The Flask app exposes no WebSocket endpoint; ASR is driven by REST polling. No video or FFmpeg processing is implemented, despite `moviepy`/FFmpeg appearing in the dependency dump.
- `requirement.txt` is a full `pip freeze` of the development machine (UTF-16 encoded, ~330 unrelated entries including torch, PyQt5, pyautogui), not a curated dependency list.
- `application/base.py` contains a hard-coded server host, and the iFlytek credentials live in `application/rtasr_p.py`; both should be environment variables.
- `application/__pycache__/*.pyc`, `tts/test.mp3` and several `*.vue.bak` files are committed.

## Contributors / License

MIT — see `LICENSE`. Only Seal-Re has commits.
