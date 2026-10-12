import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {dictionaries} from './src/i18n.js';
import {createMesh} from './src/brain.js';
const require=createRequire(process.env.MC_TEST_DEPENDENCIES+'/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const base=process.env.MC_TEST_URL||'http://127.0.0.1:4174';
const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'en-US',acceptDownloads:true});
const errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
const nav=async route=>{await page.locator(`nav a[data-page=${route}]`).click();await page.waitForFunction(p=>location.hash==='#'+p&&document.querySelector('h1')?.textContent.includes(p==='home'?'MindClone':({clone:'My Clone',builder:'Clone Builder',dashboard:'Persona Progress',settings:'Settings'}[p])),route);};
const noPercentage=async()=>{assert.ok(!/\d\s*[%％]/.test(await page.locator('#app').innerText()));assert.equal(await page.locator('progress,[role=progressbar]').count(),0);};
await page.goto(base);await page.locator('canvas').waitFor();
assert.equal(await page.locator('.brain-module').count(),6);
const modelOrder=await page.locator('.brain-module').evaluateAll(a=>a.map(e=>e.dataset.brainRegion));
assert.deepEqual(modelOrder,['memory','personality','values','reasoning','language','emotion']);
await page.mouse.move(100,100);
await page.waitForFunction(()=>document.querySelector('canvas').dataset.running==='true');
const angle1=await page.locator('canvas').getAttribute('data-angle');
await page.waitForFunction(a=>document.querySelector('canvas').dataset.angle!==a,angle1);
const bounds=await page.locator('canvas').boundingBox();
await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
await page.waitForFunction(()=>document.querySelector('canvas').dataset.running==='false');
const paused=await page.locator('canvas').getAttribute('data-angle');
await page.waitForTimeout(250);
assert.equal(await page.locator('canvas').getAttribute('data-angle'),paused);
await page.mouse.move(100,100);
await page.waitForFunction(a=>document.querySelector('canvas').dataset.angle!==a,paused);
for(const region of modelOrder){
 const module=page.locator(`[data-brain-region=${region}]`);
 await module.hover();assert.equal(await page.locator('.brain-workspace').getAttribute('data-hovered'),region);
 assert.equal(await page.locator('.brain-connector').getAttribute('data-region'),region);
 assert.ok((await page.locator('.brain-connector path').getAttribute('d')).includes('L'));
 await module.focus();await page.keyboard.press('Enter');assert.equal(await module.getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('.region-panel,#explore-records').count(),0);assert.equal(new URL(page.url()).hash,'');
}
await page.locator('[data-brain-region=memory]').click();
await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
const angle=Number(await page.locator('canvas').getAttribute('data-angle'));
const node=createMesh().points.find(p=>p.region==='values'&&p.z>0&&p.x>95&&p.y>20);
const z=-node.x*Math.sin(angle)+node.z*Math.cos(angle),scale=Math.min(bounds.width/405,bounds.height/342)*(600/(600-z));
const px=bounds.x+bounds.width/2+(node.x*Math.cos(angle)+node.z*Math.sin(angle))*scale;
const py=bounds.y+bounds.height/2+(node.y-3)*scale;
await page.mouse.click(px,py);assert.equal(await page.locator('.brain-workspace').getAttribute('data-selected'),'values');
await page.locator('[data-brain-region=memory]').click();await page.mouse.move(100,100);
await noPercentage();await page.screenshot({path:'screenshots/overview-desktop.png',fullPage:true});
await nav('clone');assert.equal(await page.locator('canvas').count(),1);
await page.locator('#sample-chat').click();await page.locator('.clone-message').waitFor();
await page.locator('#query').fill('Where was I born?');await page.locator('#chat-form').evaluate(e=>e.requestSubmit());await page.locator('.clone-message').nth(1).waitFor();
assert.ok((await page.locator('.clone-message').nth(1).innerText()).includes('No reliable memory found'));
await page.locator('#query').blur();await page.evaluate(()=>window.scrollTo(0,0));await noPercentage();
await page.screenshot({path:'screenshots/my-clone-desktop.png',fullPage:true});
await nav('builder');assert.equal(await page.locator('canvas').count(),1);await page.locator('#fragment-files').waitFor({state:'attached'});
await page.locator('#start').click();await page.locator('#answer').fill('Draft retained');await page.locator('[data-language=ja]').click();assert.equal(await page.locator('#answer').inputValue(),'Draft retained');await page.locator('[data-language=en]').click();
for(let i=0;i<5;i++){await page.locator('#sample-answer').click();await page.locator('#answer-form').evaluate(e=>e.requestSubmit());await page.waitForFunction(n=>document.querySelector('.capture-totals strong')?.textContent===String(n),i+1);}
await page.locator('#end').click();await page.locator('#generate').click();await page.locator('.memory-capsule').waitFor();
assert.deepEqual(await page.locator('.shard-counts b').allTextContents(),['2','3','2','4','3']);
let pending=page.waitForEvent('download');await page.locator('#download-json').click();const download=await pending;
const content=await readFile(await download.path());
const file={name:download.suggestedFilename(),mimeType:'application/json',buffer:content};
await page.locator('#fragment-files').setInputFiles(file);await page.getByRole('status').waitFor();
assert.equal(await page.locator('.fragment-list li').count(),2);
await page.locator('#fragment-files').setInputFiles(file);await page.getByText(dictionaries.en['upload.duplicate'],{exact:true}).waitFor();assert.equal(await page.locator('.fragment-list li').count(),2);
await page.locator('#fragment-files').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{invalid')});await page.getByRole('alert').waitFor();assert.equal(await page.locator('.fragment-list li').count(),2);
await page.locator('#fragment-files').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('sample')});await page.getByText(dictionaries.en['upload.typeError'],{exact:true}).waitFor();
pending=page.waitForEvent('download');await page.locator('#download-md').click();const md=await pending;
await page.locator('#fragment-files').setInputFiles({name:md.suggestedFilename(),mimeType:'text/markdown',buffer:await readFile(await md.path())});await page.getByRole('status').waitFor();assert.equal(await page.locator('.fragment-list li').count(),3);
await page.evaluate(()=>window.scrollTo(0,0));await noPercentage();await page.screenshot({path:'screenshots/clone-builder-desktop.png',fullPage:true});
await nav('dashboard');await page.locator('.metrics strong').first().waitFor();assert.deepEqual(await page.locator('.metrics strong').allTextContents(),['1','3','2','0']);assert.equal(await page.locator('.fragment-list li').count(),3);await noPercentage();await page.screenshot({path:'screenshots/dashboard-desktop.png',fullPage:true});
for(const width of [375,390,768,1024,1440]){
 await page.setViewportSize({width,height:844});
 for(const locale of ['en','zh','ja']){
  await page.locator(`[data-language=${locale}]`).click();
  for(const route of ['home','clone','builder','dashboard','settings']){
   await page.locator(`nav a[data-page=${route}]`).click();await page.waitForFunction(title=>document.querySelector('h1')?.textContent.includes(title),route==='home'?'MindClone':dictionaries[locale]['nav.'+route]);
   const dims=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);assert.ok(dims[0]<=dims[1],`${route}/${locale}/${width} overflow`);await noPercentage();
   if(['home','clone','builder'].includes(route)){assert.equal(await page.locator('.brain-module').count(),6);const positions=await page.locator('.brain-module').evaluateAll(a=>a.map(e=>[e.getBoundingClientRect().left,e.getBoundingClientRect().top]));assert.ok(positions.every(p=>Math.abs(p[0]-positions[0][0])<1));assert.ok(positions.every((p,i)=>!i||p[1]>positions[i-1][1]));if(width<=390)assert.ok(Number(await page.locator('canvas').getAttribute('data-dpr'))<=1);}
   if(width===390&&locale==='zh'&&route!=='settings'){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`screenshots/${route}-mobile.png`,fullPage:true});}
   if(width===1440&&route==='home'){await page.mouse.move(0,0);await page.screenshot({path:`screenshots/overview-${locale}.png`,fullPage:true});}
  }
 }
}
await page.locator('[data-language=en]').click();await nav('settings');await page.locator('#motion-toggle').check();await nav('home');assert.equal(await page.locator('canvas').getAttribute('data-running'),'false');
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('canvas').getAttribute('data-running'),'false');
await nav('dashboard');await page.reload();await page.locator('.metrics strong').first().waitFor();assert.deepEqual(await page.locator('.metrics strong').allTextContents(),['0','0','0','0']);
assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),['mindclone.language']);
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await browser.close();
console.log('PASS: shared 3D brain, rotation pause/resume, canvas/module selection and connectors, cumulative counts with no percentages, JSON/MD round-trip imports and rejection/duplicates, three languages at five screen sizes, mobile DPR, reduced motion, no external requests or browser errors.');
