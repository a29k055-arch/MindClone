# Builder-first capture and local speech

MindClone builds a persona through capture → accumulation → experience. It does not present the owner's private clone. Overview → Clone Builder → Persona Progress → My Clone. Settings is a small profile-area icon. All three languages and the existing Digital Brain remain shared.

## Working capabilities

Free conversation defaults open. A small deterministic InterviewEngine asks topic-sensitive reflective follow-ups. It is explicitly a demo, not an LLM. Typed conversation and short-interview raw answers are persisted in origin-local IndexedDB. The short interview asks at most five questions, using the preceding answer to choose a follow-up; the exact fictional specimen path remains reproducible. No real evidence extraction is claimed.

AudioRecorder uses getUserMedia + MediaRecorder, with browser permission, stop/cancel handling and a 10-minute limit. Audio uploads validate extension (WAV/MP3/M4A/WebM), nonempty size (25 MB), actual browser audio decoding and duration (10 minutes). Maximum prototype audio storage: 100 MB. Original blobs, metadata and separate linked transcripts are stored in IndexedDB (`mindclone-capture`, `records`) on the user's device. Original capture sample rate is stored when the microphone supplies it. Uploaded original sample rate is nullable; a decoded playback rate must not be mistaken for the original rate.

There is no automatic voice upload, browser SpeechRecognition cloud fallback, extraction or training. Public GitHub Pages does not execute ASR: it clearly reports the local service is disconnected, while capture, local storage, manual transcript editing and downloads work. The local Node server proxies only to 127.0.0.1:8765. Model inference stays on the device. A finished recording is transcribed after stop; streaming transcription is not implemented. Review/edit before sending.

UI language is saved independently (Japanese default). Conversation language supports Auto / Japanese / Chinese / English. Text Auto uses kana → Japanese, Han-only → Chinese, Latin → English, then previous language. Han-only Japanese and mixed-language text are ambiguous: choose manually. Audio Auto uses Whisper's actual language detection. The service uses `task=transcribe`, never `translate`, and rejects detected languages outside the three supported languages. Transcripts are unreviewed and can contain errors, especially with the small base model.

## Run local ASR

Use Python 3.12 and Node 22+. Keep virtual environments, models and test audio **outside this repository**. Dependencies are pinned in `services/requirements.txt` (PyAV 16.0.1 is necessary for this faster-whisper release).

```powershell
python -m venv D:\MindCloneRuntime\asr
D:\MindCloneRuntime\asr\Scripts\python.exe -m pip install -r services/requirements.txt
D:\MindCloneRuntime\asr\Scripts\python.exe -c "from huggingface_hub import snapshot_download; snapshot_download('Systran/faster-whisper-base',local_dir=r'D:\MindCloneRuntime\models\base',allow_patterns=['model.bin','config.json','tokenizer.json','vocabulary.*'])"
D:\MindCloneRuntime\asr\Scripts\python.exe services/asr.py --model-dir D:\MindCloneRuntime\models\base
# In another terminal, inside the web project:
node server.mjs
```

For this workstation, the verified environment already exists at `D:\数字生命\mindclone-asr-runtime` and model at `D:\数字生命\mindclone-models\faster-whisper-base`. Use its Scripts/python.exe with the same service command. Open http://127.0.0.1:4173. The Python service has no CORS or public bind; Node validates Host/Origin and forwards a service-only header. Audio requests are bounded and only processed with transcription consent. The service does not retain uploads after the request or log transcript content. Multipart processing may use operating-system temporary files during the request. Public hosting cannot call this service automatically.

## Consent and retention

`consent_for_transcription`, `consent_for_persona_analysis`, `consent_for_voice_clone` are independent and all initially false. Each asset snapshots the permissions at capture. Changing the new-capture checkboxes does not retroactively grant permission to existing recordings. Voice Collection requires explicit voice-reference permission; adding an existing recording requires its separate authorization checkbox. Revoking a voice sample removes the sample and clears the original asset's voice-clone flag. Deleting audio removes associated transcripts and samples. No training runs even when permission is true.

IndexedDB is persistent per device/browser/origin, **not encrypted Vault storage or a backup**. Public-site and localhost data are separate; clearing site data deletes it. Anyone using this browser profile or same-origin application code may access these records. Download original audio for backup. This is prototype local collection, not production biometric storage. Memory-fragment staging remains tab-local, independently of persistent audio/conversation records. No archives, database adapters, identities or remote private data are connected.

## Replaceable adapters and candidates

AudioRecorder → SpeechRecognitionAdapter → AudioTranscript. ConversationLanguageDetector and InterviewEngine are separate from UI localization. VoiceSampleCollector → VoiceProfile → VoiceCloneAdapter is a reserved path; `synthesize()` explicitly fails until an engine is configured.

- [faster-whisper](https://github.com/SYSTRAN/faster-whisper): selected local multilingual ASR implementation, CPU int8, original-language transcription and actual language detection. Model files are downloaded separately, not committed.
- [OpenVoice V2](https://github.com/myshell-ai/OpenVoice): preferred future voice candidate. Official documentation lists native Japanese/Chinese/English support and MIT licensing. Requires separate speaker authorization and integration evaluation.
- [XTTS-v2](https://huggingface.co/coqui/XTTS-v2): alternative with Japanese, Chinese and English support. **Model weights use Coqui Public Model License**, distinct from code licensing; review intended usage before adoption. No inference/training integration was implemented for either voice engine.

## Validation

Local ASR was tested with Windows built-in synthetic English and Chinese and a Japanese [Google FLEURS](https://huggingface.co/datasets/google/fleurs) validation sample (CC BY 4.0). Automatic detection returned en / zh / ja and nonempty original-language transcripts; errors remained in the small-model text, so this is a functional check, not an accuracy benchmark. Test audio stays outside Git and is not used for training. Browser tests use a fake microphone backed by synthetic audio, never the user's microphone. Public tests explicitly verify the disconnected ASR state.
