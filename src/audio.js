export class AudioRecorder {
  async start() {
    if(this.recorder||this.starting)throw new Error('audio.busy');
    if(!navigator.mediaDevices?.getUserMedia||!globalThis.MediaRecorder)throw new Error('audio.unsupported');
    this.starting=true;const epoch=this.epoch||0;
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if((this.epoch||0)!==epoch){stream.getTracks().forEach(t=>t.stop());throw new Error('audio.cancelled');}
      this.stream=stream;
      const mimeType=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t));
      this.recorder=new MediaRecorder(this.stream,mimeType?{mimeType}:undefined);const chunks=[];this.chunks=chunks;
      this.sampleRate=this.stream.getAudioTracks()[0]?.getSettings().sampleRate||null;
      this.recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      this.started=performance.now();this.recorder.start(500);
    } catch(error){this.release();throw new Error(error.name==='NotAllowedError'?'audio.denied':'audio.unsupported');}
    finally{this.starting=false;}
  }
  stop() {
    if(!this.recorder)return Promise.reject(new Error('audio.notRecording'));
    return new Promise((resolve,reject)=>{
      const recorder=this.recorder,chunks=this.chunks;
      recorder.onstop=()=>{const result={blob:new Blob(chunks,{type:recorder.mimeType}),duration:(performance.now()-this.started)/1000,sample_rate:this.sampleRate};this.release();resolve(result);};
      recorder.onerror=()=>{this.release();reject(new Error('audio.recordError'));};recorder.stop();
    });
  }
  release(){this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.recorder=null;}
  cancel(){this.epoch=(this.epoch||0)+1;if(this.recorder?.state==='recording')this.recorder.stop();this.release();}
}
export class SpeechRecognitionAdapter {
  async status(){return {available:false,engine:null};}
  async transcribe(){throw new Error('audio.asrUnavailable');}
}
export class LocalWhisperAdapter extends SpeechRecognitionAdapter {
  constructor(){super();this.local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);}
  async status(){if(!this.local)return super.status();try{const response=await fetch('/api/asr/status',{signal:AbortSignal.timeout(2500)});return response.ok?await response.json():super.status();}catch{return super.status();}}
  async transcribe(asset,language='auto') {
    if(!this.local||!asset.consent_for_transcription)throw new Error('audio.asrUnavailable');
    const data=new FormData();data.append('file',asset.blob,asset.name);data.append('language',language);data.append('consent_for_transcription','true');
    let response;try{response=await fetch('/api/asr/transcribe',{method:'POST',body:data,signal:AbortSignal.timeout(180000)});}catch{throw new Error('audio.asrUnavailable');}
    if(!response.ok)throw new Error('audio.asrError');
    const result=await response.json();if(!['ja','zh','en'].includes(result.language)||typeof result.text!=='string')throw new Error('audio.asrError');
    return result;
  }
}
export class VoiceCloneAdapter {
  candidates=['openvoice-v2','xtts-v2'];
  async synthesize(){throw new Error('audio.cloneNotEnabled');}
}
