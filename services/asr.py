"""Optional loopback-only ASR. Models/cache live outside the repository.
Run: python services/asr.py --model-dir D:/path/to/faster-whisper-small
"""
import argparse
import io
import threading
from pathlib import Path

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from faster_whisper import WhisperModel
import uvicorn

parser = argparse.ArgumentParser()
parser.add_argument('--model-dir', required=True)
parser.add_argument('--port', type=int, default=8765)
args = parser.parse_args()
model_path = Path(args.model_dir).resolve()
if not (model_path / 'model.bin').is_file():
    raise SystemExit('A downloaded multilingual faster-whisper model directory is required.')
model = WhisperModel(str(model_path), device='cpu', compute_type='int8', local_files_only=True)
lock = threading.Lock()
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

def authorize(local, origin):
    # Browser cross-origin requests cannot add this header without a denied preflight.
    if local != '1' or origin:
        raise HTTPException(403, 'Use the loopback MindClone Node server.')

@app.get('/status')
def status(x_mindclone_local: str = Header(default=''), origin: str = Header(default='')):
    authorize(x_mindclone_local, origin)
    return {'available': True, 'engine': 'faster-whisper', 'languages': ['ja', 'zh', 'en'], 'auto_detection': True}

@app.post('/transcribe')
def transcribe(file: UploadFile = File(...), language: str = Form('auto'),
               consent_for_transcription: str = Form('false'),
               x_mindclone_local: str = Header(default=''), origin: str = Header(default='')):
    authorize(x_mindclone_local, origin)
    if consent_for_transcription != 'true' or language not in ('auto', 'ja', 'zh', 'en'):
        raise HTTPException(400, 'Consent and supported language required.')
    if Path(file.filename or '').suffix.lower() not in ('.wav', '.mp3', '.m4a', '.webm'):
        raise HTTPException(415, 'Unsupported audio type.')
    content = file.file.read(25 * 1024 * 1024 + 1)
    if not content or len(content) > 25 * 1024 * 1024:
        raise HTTPException(413, 'Audio exceeds 25 MB limit.')
    if not lock.acquire(blocking=False):
        raise HTTPException(429, 'ASR busy.')
    try:
        from faster_whisper.audio import decode_audio
        audio = decode_audio(io.BytesIO(content))
        if len(audio) > 600 * 16000:
            raise HTTPException(413, 'Audio exceeds 10 minutes.')
        segments, info = model.transcribe(audio, language=None if language == 'auto' else language,
            task='transcribe', beam_size=3, vad_filter=True, condition_on_previous_text=False)
        if info.language not in ('ja', 'zh', 'en'):
            raise HTTPException(422, 'Detected language is not supported.')
        text = ''.join(segment.text for segment in segments).strip()
        return {'text': text, 'language': info.language, 'language_probability': info.language_probability,
                'engine': 'faster-whisper', 'task': 'transcribe'}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(422, 'Audio could not be decoded or transcribed.') from None
    finally:
        lock.release()

if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=args.port, access_log=False)
