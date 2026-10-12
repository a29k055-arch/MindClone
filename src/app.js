import { core, fragmentFilename, fragmentMarkdown } from './core.js';
import { translate, initialLanguage, saveLanguage, languageNames } from './i18n.js';
import { regions, brainMarkup, connectBrain } from './brain.js';

const app = document.querySelector('#app');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let language = initialLanguage();
let region = 'memory';
let explored = false;
let reduceMotion = false;
let answers = [];
let active = false;
let closed = false;
let fragment = null;
let fragmentOpen = false;
let messages = [];
let draftAnswer = '';
let draftQuery = '';
let busy = false;
let notification = '';
let pulse = [];
const progress = await core.getProgress();
const t = key => escape(translate(key, language));
const text = key => translate(key, language);
const route = () => ['home','clone','builder','dashboard','settings'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
const link = (key, page, secondary=false) => `<a class="button ${secondary?'secondary':''}" href="#${page}">${t(key)} <span aria-hidden="true">↗</span></a>`;
const counts = f => ({memory:f?.candidate_memories.length||0, values:f?.values.length||0, reasoning:f?.reasoning_patterns.length||0, personality:f?.personality_evidence.length||0, language:f?.language_features.length||0});

function shell() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  document.title = `MindClone · ${text('nav.'+route())}`;
  document.querySelector('#sidebar').innerHTML = `
    <a class="brand" href="#home"><span class="logo">m<span>c</span></span><strong>MindClone<small>${t('brand.subtitle')}</small></strong></a>
    <div class="workspace-label">${t('shell.workspace')}<span>v0.3</span></div>
    <nav aria-label="${t('shell.workspace')}">${['home','clone','builder','dashboard','settings'].map((page,i)=>`<a href="#${page}" data-page="${page}" class="${route()===page?'active':''}" ${route()===page?'aria-current="page"':''}><span class="nav-symbol" aria-hidden="true">${['⌂','◉','◇','▥','⚙'][i]}</span><span>${t('nav.'+page)}</span></a>`).join('')}</nav>
    <div class="sidebar-bottom"><div class="local-dot">${t('shell.local')}</div><p>${t('shell.disconnected')}</p><div class="profile"><span class="avatar">M</span><div>MindClone<small>${t('shell.private')}</small></div></div></div>`;
  document.querySelector('#header').innerHTML = `<span class="breadcrumb">${t('shell.workspace')} <span>/</span> ${t('nav.'+route())}</span><div class="header-tools"><span class="private-status"><i></i>${t('shell.private')}</span><div class="language-switch" role="group" aria-label="${t('settings.language')}">${Object.entries(languageNames).map(([locale,name])=>`<button type="button" data-language="${locale}" lang="${locale}" aria-pressed="${locale===language}" class="${locale===language?'active':''}">${name}</button>`).join('')}</div></div>`;
  document.querySelector('#footer').innerHTML = `<span>MindClone</span><span>${t('shell.principles')}</span><span>${t('shell.footer')}</span>`;
  document.body.classList.toggle('reduced-motion', reduceMotion);
  document.querySelectorAll('[data-language]').forEach(button => button.onclick = () => {
    const next = button.dataset.language;
    if (next === language) return;
    saveDrafts();
    language = next;
    saveLanguage(language);
    render();
    document.querySelector(`[data-language="${next}"]`)?.focus({preventScroll:true});
  });
}
function saveDrafts() {
  if (document.querySelector('#answer')) draftAnswer = document.querySelector('#answer').value;
  if (document.querySelector('#query')) draftQuery = document.querySelector('#query').value;
}
function pageTitle(page, eyebrow, description) {
  return `<section class="page-title"><span class="eyebrow">${t(eyebrow)}</span><h1>${t('nav.'+page)}<span class="pill">${t('shell.demo')}</span></h1><p>${t(description)}</p></section>`;
}
function regionPanel() {
  return `<aside class="panel region-panel" aria-live="polite"><div class="panel-top"><span>${t('brain.explore')}</span><span class="pill">${t('brain.selected')}</span></div><div class="region-body"><span class="region-number">0${regions.indexOf(region)+1} / 06</span><h2>${t('region.'+region)}</h2><p>${t('region.'+region+'Note')}</p><div class="region-total"><strong>0</strong><span>${t('metrics.fragments')}</span></div><dl><div><dt>${t('metrics.memories')}</dt><dd>0</dd></div><div><dt>${t('metrics.coverage')}</dt><dd>${t('brain.coverage')}</dd></div></dl><button class="button secondary" id="explore-records">${t('brain.inspect')} ↗</button>${explored?`<div class="empty-records"><h3>${t('brain.empty')}</h3><p>${t('brain.emptyNote')}</p></div>`:''}<small>${t('shell.disconnected')}</small></div></aside>`;
}
function home() {
  return `<section class="hero"><div class="eyebrow"><i></i>${t('home.eyebrow')}</div><h1>MindClone</h1><h2>${t('home.headline')}</h2><p class="hero-copy">${t('home.description')}</p><div class="home-observatory"><div>${brainMarkup(t,{selected:region})}</div>${regionPanel()}</div><div class="hero-actions">${link('home.talk','clone')}${link('home.build','builder',true)}</div><p class="fine centered">${t('brain.instructions')}</p></section>
    <section class="workflow"><span class="eyebrow">${t('home.process')}</span><h2>${t('home.workflowTitle')}</h2><div class="steps">${['talk','capture','structure','remember','clone'].map((s,i)=>`<div><small>0${i+1}</small><h3>${t('workflow.'+s)}</h3><p>${t('workflow.'+s+'Note')}</p></div>`).join('')}</div></section>
    <section class="feature-grid"><a class="feature" href="#clone"><span class="tile-icon">◉</span><span class="eyebrow">01 / ${t('nav.clone')}</span><h2>${t('home.cloneTitle')}</h2><p>${t('home.cloneNote')}</p><span class="text-link">${t('home.talk')} ↗</span></a><a class="feature" href="#builder"><span class="tile-icon">◇</span><span class="eyebrow">02 / ${t('nav.builder')}</span><h2>${t('home.builderTitle')}</h2><p>${t('home.builderNote')}</p><span class="text-link">${t('home.build')} ↗</span></a><div class="stage panel"><span class="eyebrow">${t('project.stage')}</span><span class="stage-badge">v0.3</span><h2>${t('project.mvp')}</h2><p>${t('privacy.demo')}</p><small>${t('project.next')}</small></div></section>`;
}
function conversation() {
  const log = messages.length ? messages.map(m=>m.role==='user'?`<div class="user-message">${escape(m.text)}</div>`:`<article class="clone-message"><span class="avatar">m</span><div><small>MindClone · ${t('shell.demo')}</small><p>${t(m.reply.answer_key)}</p><div class="evidence"><div><small>${t('clone.memories')}</small><span>${m.reply.memories.length?t('clone.memoryTitle')+' · '+t('shell.demo'):t('clone.none')}</span></div><div><small>${t('clone.source')}</small><span>${m.reply.source||t('clone.none')}</span></div><div><small>${t('clone.confidence')}</small><span>${t('clone.unknown')}</span></div></div><details><summary>${t('clone.why')}</summary><p>${t(m.reply.why_key)}</p></details></div></article>`).join('') : `<div class="chat-empty"><span class="chat-core" aria-hidden="true">◉</span><h2>${t('clone.emptyTitle')}</h2><p>${t('clone.emptyNote')}</p><button class="suggestion" id="sample-chat">${t('clone.sample')} ↗</button></div>`;
  return `${pageTitle('clone','clone.eyebrow','clone.description')}<div class="clone-observatory"><div>${brainMarkup(t,{selected:region,pulse})}<div class="region-tabs" role="group" aria-label="${t('brain.explore')}">${regions.map(r=>`<button data-region-tab="${r}" aria-pressed="${region===r}"><span aria-hidden="true">${region===r?'◉':'○'}</span>${t('region.'+r)}</button>`).join('')}</div></div>${regionPanel()}</div><div class="conversation-layer"><section class="panel chat"><div class="panel-top"><span>${t('clone.conversation')}</span><button class="quiet" id="clear-chat">${t('clone.clear')}</button></div><div class="chat-log" aria-live="polite">${log}</div><form id="chat-form"><label class="sr-only" for="query">${t('clone.messageLabel')}</label><input id="query" maxlength="2000" required placeholder="${t('clone.placeholder')}" value="${escape(draftQuery)}" autocomplete="off"><button class="send" aria-label="${t('clone.send')}" ${busy?'disabled':''}>↑</button></form><p class="fine chat-note">${t('privacy.demo')}</p></section><aside class="panel context"><span class="eyebrow">${t('brain.feedback')}</span><h2>${t('clone.memoryTitle')}</h2><div class="memory-card"><small>DEMO-M001 / OPINION</small><p>“${t('clone.memoryQuote')}”</p><span class="pill">${t('fragment.synthetic')}</span></div><p>${t('clone.whyKnown')}</p><div class="notice">${t('privacy.counts')}</div></aside></div>`;
}
function fragmentCard() {
  if (!fragment) return '';
  const c = counts(fragment);
  return `<section class="memory-capsule"><div class="capsule-art" aria-hidden="true"><div class="shard"></div><span>F0001</span></div><div class="capsule-content"><span class="eyebrow">${t('fragment.capsule')}</span><div class="capsule-heading"><h2>${t('fragment.title')}</h2><span class="pill">${t('fragment.unconfirmed')}</span></div><span class="fragment-id">${fragment.display_id} / ${fragment.fragment_id}</span><h3>${t('fragment.topic')}</h3><p class="fine">${new Intl.DateTimeFormat(language==='zh'?'zh-CN':language,{dateStyle:'medium'}).format(new Date(fragment.created_at))}</p><div class="shard-counts">${Object.entries(c).map(([r,n])=>`<span>${t('region.'+r)} <b>${n}</b></span>`).join('')}</div><p class="fine specimen-note">${t(fragment.synthetic?'fragment.synthetic':'fragment.raw')}</p><div class="actions"><button class="button secondary" id="view-fragment" aria-expanded="${fragmentOpen}">${t('fragment.view')}</button><button class="button secondary" id="download-md">${t('fragment.exportMd')} ↓</button><button class="button" id="download-json">${t('fragment.exportJson')} ↓</button></div></div></section>${fragmentOpen?`<section class="panel fragment-detail"><h3>${t('fragment.detail')}</h3><p class="fine">${t('fragment.note')}</p><div class="candidate-list">${['candidate_memories','values','reasoning_patterns','personality_evidence','language_features'].flatMap(field=>fragment[field]).map(e=>`<div><span>${t(e.key)}</span><small>${e.kind} · Q${e.source_answer+1} · ${t('shell.demo')} · ${t('clone.unknown')}</small><blockquote>${escape(fragment.raw_answers[e.source_answer].answer)}</blockquote></div>`).join('')}</div><pre>${escape(fragmentMarkdown(fragment,language))}</pre></section>`:''}<p class="fine">${t('privacy.export')}</p>`;
}
function builder() {
  const question = answers.length < 5 ? t('question.'+answers.length) : null;
  const capture = answers.length * 20;
  const preview = core.previewCapture(answers);
  const count = counts(fragment);
  const summary = [['builder.answered',answers.length],['builder.memories',count.memory],['builder.values',count.values],['builder.reasoning',count.reasoning],['builder.personality',count.personality]];
  const body = closed ? `<span class="tile-icon">✓</span><h2>${t('builder.summaryTitle')}</h2><p>${t('builder.summaryNote')}</p><div class="summary-grid">${summary.map(([key,n])=>`<div><strong>${n}</strong><span>${t(key)}</span></div>`).join('')}</div>${fragment?'':`<button class="button" id="generate">${t('builder.generate')} ↗</button>`}${fragmentCard()}<button class="quiet reset" id="reset">${t('builder.reset')}</button>` : active ? `<span class="eyebrow">${t('builder.question')} ${String(answers.length+1).padStart(2,'0')} · ${t('builder.scripted')}</span><h2>${question||t('builder.completeTitle')}</h2>${question?`<form id="answer-form"><label for="answer">${t('builder.answer')}</label><textarea id="answer" maxlength="6000" rows="5" required placeholder="${t('builder.placeholder')}">${escape(draftAnswer)}</textarea><div class="actions"><button class="button">${t('builder.continue')} →</button><button class="quiet" type="button" id="sample-answer">${t('builder.sample')}</button></div></form>`:`<p>${t('builder.closeNote')}</p>`}<button class="quiet reset" id="end" ${answers.length?'':'disabled'}>${t('builder.end')}</button>` : `<span class="tile-icon">◇</span><h2>${t('builder.startTitle')}</h2><p>${t('builder.startNote')}</p><div class="notice">${t('privacy.input')}</div><button class="button" id="start">${t('builder.start')} ↗</button>`;
  return `${pageTitle('builder','builder.eyebrow','builder.description')}<div class="builder-layout"><div class="builder-main">${brainMarkup(t,{selected:region,progress:capture,mode:'capture'})}<div class="capture-progress"><span>${t('builder.progress')}</span><strong>${capture}%</strong><progress max="5" value="${answers.length}" aria-label="${t('builder.progress')}"></progress>${answers.length?`<small>${t('builder.capture')} +${answers.length} · ${t('shell.demo')}</small>`:''}</div>${preview.synthetic?`<div class="capture-evidence"><span>${t('fragment.synthetic')}</span>${Object.entries(preview.counts).map(([r,n])=>`<span>${t('region.'+r)} <b>+${n}</b></span>`).join('')}</div>`:''}<section class="panel interview"><div class="panel-top"><span>${t(closed?'builder.closed':active?'builder.active':'builder.ready')}</span><span>${answers.length} / 5</span></div><div class="interview-body">${body}</div></section></div><aside class="panel context"><span class="eyebrow">${t('builder.map')}</span><h2>${t('builder.mapTitle')}</h2><ol class="session-map">${['builder.start','builder.scripted','builder.answer','builder.continue','builder.end','builder.generate'].map(key=>`<li>${t(key)}</li>`).join('')}</ol><div class="notice">${t('privacy.counts')}</div><p class="fine">${t('builder.progressNote')}</p>${answers.length?`<details><summary>${t('builder.review')} (${answers.length})</summary>${answers.map(a=>`<h4>${escape(a.question)}</h4><p>${escape(a.answer)}</p>`).join('')}</details>`:''}</aside></div>`;
}
function dashboard() {
  return `${pageTitle('dashboard','dashboard.eyebrow','dashboard.description')}<div class="notice">${t('metrics.zeroNote')}</div><section class="metrics">${['sessions','fragments','memories','opinions'].map(key=>`<div class="panel"><span>${t('metrics.'+key)}</span><strong>${progress[key]}</strong><small>${t('metrics.noRecords')}</small></div>`).join('')}</section><div class="dashboard-grid"><section class="panel progress"><span class="eyebrow">${t('dashboard.coverage')}</span><h2>${t('dashboard.title')}</h2>${regions.map(r=>`<div class="dimension"><span>${t('region.'+r)}</span><span>${progress[r]} ${t('metrics.records')}</span><div class="progress-track"></div><small>${t('brain.coverage')}</small></div>`).join('')}</section><section class="panel context"><span class="eyebrow">${t('dashboard.roadmap')}</span><h2>${t('dashboard.roadmapTitle')}</h2><ul class="roadmap">${['foundation','web','api','engine'].map((key,i)=>`<li><span class="roadmap-number">0${i+1}</span><span>${t('roadmap.'+key)}</span></li>`).join('')}</ul>${link('home.build','builder',true)}</section></div>`;
}
function settings() {
  return `${pageTitle('settings','shell.private','settings.description')}<section class="panel settings-panel"><div><h2>${t('settings.language')}</h2><p>${t('settings.description')}</p><div class="language-settings">${Object.entries(languageNames).map(([locale,name])=>`<button class="button ${locale===language?'':'secondary'}" data-settings-language="${locale}" aria-pressed="${locale===language}" lang="${locale}">${name}</button>`).join('')}</div></div><div><label class="motion-toggle"><input id="motion-toggle" type="checkbox" ${reduceMotion?'checked':''}><span>${t('settings.motion')}</span></label><p>${t('settings.motionNote')}</p></div><div><h2>${t('settings.auth')}</h2><p>${t('settings.authNote')}</p><div class="notice">${t('privacy.input')}</div></div></section>`;
}
function chooseRegion(next) {
  saveDrafts();
  const scroll = scrollY;
  const wasAnchor = document.activeElement?.hasAttribute('data-brain-region');
  region = next;
  explored = false;
  render();
  window.scrollTo(0,scroll);
  const selector = wasAnchor ? `[data-brain-region="${next}"]` : `[data-region-tab="${next}"]`;
  document.querySelector(selector)?.focus({preventScroll:true});
}
function bind() {
  connectBrain(app,chooseRegion,reduceMotion);
  app.querySelectorAll('[data-region-tab]').forEach(button=>button.onclick=()=>chooseRegion(button.dataset.regionTab));
  app.querySelector('#explore-records')?.addEventListener('click',()=>{
    saveDrafts(); explored=true;
    const scroll=scrollY; render(); window.scrollTo(0,scroll);
    app.querySelector('#explore-records')?.focus({preventScroll:true});
  });
  app.querySelector('#chat-form')?.addEventListener('submit',async event=>{
    event.preventDefault(); if(busy)return;
    const query=app.querySelector('#query').value.trim(); if(!query)return;
    busy=true; draftQuery='';
    try {
      const reply=await core.chat(query);
      messages.push({role:'user',text:query},{role:'assistant',reply});
      pulse=reply.regions;
      if(pulse.length)region=pulse[0];
    } catch { notification='error.generic'; }
    finally {busy=false;render();}
    app.querySelector('#query')?.focus({preventScroll:true});
    const log=app.querySelector('.chat-log'); if(log)log.scrollTop=log.scrollHeight;
  });
  app.querySelector('#sample-chat')?.addEventListener('click',()=>{
    app.querySelector('#query').value=text('clone.sample');
    app.querySelector('#chat-form').requestSubmit();
  });
  app.querySelector('#clear-chat')?.addEventListener('click',()=>{messages=[];pulse=[];draftQuery='';render();});
  app.querySelector('#start')?.addEventListener('click',()=>{active=true;render();});
  app.querySelector('#answer-form')?.addEventListener('submit',async event=>{
    event.preventDefault();
    const answer=app.querySelector('#answer').value; if(!answer.trim())return;
    answers.push({question:text('question.'+answers.length),answer,locale:language});
    draftAnswer='';
    await core.nextQuestion(answers);
    render();
    app.querySelector('#answer')?.focus({preventScroll:true});
  });
  app.querySelector('#sample-answer')?.addEventListener('click',()=>{
    draftAnswer=text('sample.'+answers.length);
    app.querySelector('#answer').value=draftAnswer;
  });
  app.querySelector('#end')?.addEventListener('click',()=>{closed=true;draftAnswer='';render();});
  app.querySelector('#generate')?.addEventListener('click',async()=>{
    try {fragment=await core.generateFragment(answers);fragmentOpen=false;render();}
    catch {notification='error.generic';render();}
  });
  app.querySelector('#view-fragment')?.addEventListener('click',()=>{
    fragmentOpen=!fragmentOpen;const scroll=scrollY;render();window.scrollTo(0,scroll);
    app.querySelector('#view-fragment')?.focus({preventScroll:true});
  });
  app.querySelector('#reset')?.addEventListener('click',()=>{
    answers=[];active=false;closed=false;fragment=null;fragmentOpen=false;draftAnswer='';render();
  });
  for(const extension of ['md','json'])app.querySelector('#download-'+extension)?.addEventListener('click',()=>{
    const content=extension==='md'?fragmentMarkdown(fragment,language):JSON.stringify(fragment,null,2);
    const blob=new Blob([content],{type:extension==='md'?'text/markdown':'application/json'});
    const url=URL.createObjectURL(blob);const anchor=document.createElement('a');
    anchor.href=url;anchor.download=fragmentFilename(fragment.created_at.slice(0,10),extension);anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  app.querySelector('#motion-toggle')?.addEventListener('change',event=>{
    reduceMotion=event.target.checked;document.body.classList.toggle('reduced-motion',reduceMotion);
  });
  app.querySelectorAll('[data-settings-language]').forEach(button=>button.onclick=()=>{
    language=button.dataset.settingsLanguage;saveLanguage(language);render();
    app.querySelector(`[data-settings-language="${language}"]`)?.focus({preventScroll:true});
  });
}
function render() {
  shell();
  app.innerHTML=({home,clone:conversation,builder,dashboard,settings}[route()])();
  if(notification)app.insertAdjacentHTML('afterbegin',`<div role="alert" class="notice">${t(notification)}</div>`);
  bind();
}
addEventListener('hashchange',()=>{saveDrafts();notification='';render();window.scrollTo(0,0);});
render();
