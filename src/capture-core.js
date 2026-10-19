// Private, origin-local browser storage. No network, training or automatic extraction.
export class CaptureStore {
  async db() {
    if (!this.connection) this.connection = new Promise((resolve,reject)=>{
      const request=indexedDB.open('mindclone-capture',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('records',{keyPath:'id'});
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
    return this.connection;
  }
  async operation(mode,action) {
    const db=await this.db();return new Promise((resolve,reject)=>{
      const tx=db.transaction('records',mode),request=action(tx.objectStore('records'));
      tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
  }
  async put(record) {await this.operation('readwrite',s=>s.put(record));return record;}
  async all() {return this.operation('readonly',s=>s.getAll());}
  async remove(id) {return this.operation('readwrite',s=>s.delete(id));}
}
export class ConversationLanguageDetector {
  detect(input,{manual='auto',previous='ja'}={}) {
    if(['ja','zh','en'].includes(manual))return manual;
    if(/[\u3040-\u30ff]/u.test(input))return 'ja';
    if(/[\u3400-\u9fff]/u.test(input))return 'zh';
    if(/[a-z]{2}/i.test(input))return 'en';
    return previous;
  }
}
export class InterviewEngine {
  // Deliberately bounded reflective demo, not an LLM or extracted persona.
  reply(input,turn=0) {
    if(/価値|大切|重要|价值|important|value/i.test(input))return 'capture.followValues';
    if(/選|決|决定|选择|decid|choice/i.test(input))return 'capture.followReasoning';
    return turn%2?'capture.followExample':'capture.followWhy';
  }
}
export const emptyConsent=()=>({consent_for_transcription:false,consent_for_persona_analysis:false,consent_for_voice_clone:false});
export function validateAudio(file) {
  if(!/\.(wav|mp3|m4a|webm)$/i.test(file.name))throw new Error('audio.typeError');
  if(!file.size||file.size>25*1024*1024)throw new Error('audio.sizeError');
}
export async function audioMetadata(blob) {
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!Context)throw new Error('audio.decodeError');
  const context=new Context();
  try {const buffer=await context.decodeAudioData(await blob.arrayBuffer());
    if(!Number.isFinite(buffer.duration)||buffer.duration<=0||buffer.duration>600)throw new Error('audio.durationError');
    return {duration:buffer.duration,decoded_sample_rate:buffer.sampleRate};
  } catch(error){throw new Error(error.message==='audio.durationError'?'audio.durationError':'audio.decodeError');}
  finally {await context.close();}
}
export class VoiceSampleCollector {
  constructor(store){this.store=store;}
  async collect(asset) {
    if(!asset.consent_for_voice_clone)throw new Error('audio.voiceConsentRequired');
    const existing=(await this.store.all()).find(r=>r.kind==='voice_sample'&&r.audio_asset_id===asset.id);
    if(existing)return existing;
    return this.store.put({id:crypto.randomUUID(),kind:'voice_sample',audio_asset_id:asset.id,
      duration:asset.duration,language:asset.language,sample_rate:asset.sample_rate,
      transcript_id:asset.transcript_id||null,created_at:new Date().toISOString(),
      consent_for_transcription:asset.consent_for_transcription,
      consent_for_persona_analysis:asset.consent_for_persona_analysis,consent_for_voice_clone:true});
  }
}
export function personaProgress(records) {
  const count=kind=>records.filter(r=>r.kind===kind).length;
  return {conversations:count('conversation'),interviews:count('interview'),voiceSamples:count('voice_sample'),
    voiceDuration:records.filter(r=>r.kind==='voice_sample').reduce((n,r)=>n+r.duration,0),transcripts:count('transcript')};
}
export const formatDuration=seconds=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
