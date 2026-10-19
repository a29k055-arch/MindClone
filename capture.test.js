import test from 'node:test';import assert from 'node:assert/strict';
import {ConversationLanguageDetector,InterviewEngine,emptyConsent,validateAudio,personaProgress,VoiceSampleCollector} from './src/capture-core.js';
test('conversation language is independent of UI and respects manual choice',()=>{
  const d=new ConversationLanguageDetector();assert.equal(d.detect('我喜欢旅行'),'zh');assert.equal(d.detect('私は旅行が好きです'),'ja');assert.equal(d.detect('I like travelling'),'en');assert.equal(d.detect('我喜欢旅行',{manual:'en'}),'en');assert.equal(d.detect('123',{previous:'zh'}),'zh');
});
test('voice use requires explicit independent consent and never trains',async()=>{
  assert.deepEqual(emptyConsent(),{consent_for_transcription:false,consent_for_persona_analysis:false,consent_for_voice_clone:false});
  const records=[],store={all:async()=>records,put:async r=>{records.push(r);return r;}};const collector=new VoiceSampleCollector(store);
  const asset={id:'fixture',duration:2,language:'ja',sample_rate:48000,...emptyConsent()};
  await assert.rejects(()=>collector.collect(asset),/voiceConsentRequired/);
  asset.consent_for_voice_clone=true;await collector.collect(asset);await collector.collect(asset);
  assert.equal(records.length,1);assert.equal(records[0].audio_asset_id,'fixture');assert.equal(records[0].consent_for_persona_analysis,false);
  assert.deepEqual(personaProgress(records),{conversations:0,interviews:0,voiceSamples:1,voiceDuration:2,transcripts:0});
});
test('audio limits and adaptive demo prompts are explicit',()=>{
  assert.throws(()=>validateAudio({name:'password.txt',size:10}),/typeError/);assert.throws(()=>validateAudio({name:'x.wav',size:26*1024*1024}),/sizeError/);
  validateAudio({name:'x.m4a',size:20});assert.equal(new InterviewEngine().reply('What is important to me?'),'capture.followValues');assert.equal(new InterviewEngine().reply('How did I decide?'),'capture.followReasoning');
});
