export const regions = ['memory', 'personality', 'values', 'reasoning', 'language', 'emotion'];
// Original abstract lateral silhouette inspired by the references, not traced from them.
const contour = [[-177,-18],[-166,-69],[-139,-106],[-97,-129],[-43,-140],[16,-137],[76,-121],[124,-92],[153,-51],[170,-9],[163,29],[140,56],[100,68],[64,63],[30,78],[23,112],[9,143],[-13,149],[-30,124],[-42,95],[-72,86],[-92,112],[-129,117],[-158,96],[-171,63],[-162,37],[-179,17]];
function inside(x,y) {
  let result=false;
  for(let i=0,j=contour.length-1;i<contour.length;j=i++) {
    const a=contour[i],b=contour[j];
    if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])result=!result;
  }
  return result;
}
function regionFor(x,y) {
  if(y>82)return 'emotion';
  if(x>74)return y<0?'personality':'values';
  if(y<-54)return 'reasoning';
  if(x<-48)return 'memory';
  return y>20?'language':'emotion';
}
export function createMesh(coarse=false) {
  const step=coarse?34:25, points=[],faces=[],edges=[],grid=new Map();
  for(const side of [-1,1]) {
    for(let row=0,y=-127;y<143;y+=step,row++) {
      for(let col=0,x=-162;x<165;x+=step,col++) {
        const px=x+Math.sin(row*7+col)*5,py=y+Math.cos(col*5+row)*5;
        if(!inside(px,py))continue;
        const depth=Math.sqrt(Math.max(.05,1-(px/190)**2-((py+15)/165)**2))*58;
        const index=points.length;grid.set(`${side}/${row}/${col}`,index);
        points.push({x:px,y:py,z:side*depth,region:regionFor(px,py)});
      }
    }
  }
  for(const [key,a] of grid) {
    const [side,row,col]=key.split('/').map(Number);
    const b=grid.get(`${side}/${row}/${col+1}`),c=grid.get(`${side}/${row+1}/${col}`),d=grid.get(`${side}/${row+1}/${col+1}`);
    if(b!==undefined)edges.push([a,b]);if(c!==undefined)edges.push([a,c]);
    if(b!==undefined&&c!==undefined){edges.push([b,c]);faces.push([a,b,c]);}
    if(b!==undefined&&c!==undefined&&d!==undefined)faces.push([b,d,c]);
    if(side===-1 && col%3===0 && row%3===0){const other=grid.get(`1/${row}/${col}`);if(other!==undefined)edges.push([a,other]);}
  }
  const rings=[];
  for(const side of [-1,1])rings.push(contour.map(([x,y])=>({x,y,z:side*16,region:regionFor(x,y)})));
  return {points,faces,edges,rings};
}
export function brainMarkup(t,{selected='memory',pulse=[],captures=0}={}) {
  return `<section class="neural-observatory" aria-label="${t('brain.title')}">
    <div class="neural-top"><span class="eyebrow">${t('brain.neural')}</span><span class="small-status">${t('brain.lateral')}</span></div>
    <div class="brain-workspace" data-selected="${selected}" data-pulse="${pulse.join(',')}">
      <div class="brain-modules" role="group" aria-label="${t('brain.explore')}">${regions.map((r,i)=>`<button type="button" class="brain-module ${selected===r?'selected':''}" data-brain-region="${r}" aria-pressed="${selected===r}"><span class="module-index">0${i+1}</span><span>${t('region.'+r)}</span><span class="module-marker" aria-hidden="true">${selected===r?'●':'○'}</span></button>`).join('')}</div>
      <div class="brain-stage"><canvas class="brain-canvas" tabindex="0" role="img" aria-label="${t('brain.canvasLabel')}"></canvas></div>
      <svg class="brain-connector" aria-hidden="true"><path/><circle r="3"/></svg>
    </div>
    <div class="neural-bottom"><span>${t('brain.instructions')}</span><span>${captures?`${t('builder.answered')} ${captures}`:t('brain.abstract')}</span></div>
  </section>`;
}
export function connectBrain(container,onSelect,reducedMotion=false) {
  const workspace=container.querySelector('.brain-workspace');if(!workspace)return()=>{};
  const canvas=workspace.querySelector('canvas'),stage=workspace.querySelector('.brain-stage'),context=canvas.getContext('2d');
  if(!context)return()=>{};
  const modules=[...workspace.querySelectorAll('.brain-module')],connector=workspace.querySelector('.brain-connector');
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 700px), (pointer: coarse)');
  const mesh=createMesh(mobile.matches);
  let width=0,height=0,angle=.16,hover=null,paused=false,visible=true,dead=false,raf=0,last=0,projected=[];
  let selected=workspace.dataset.selected;
  const started=performance.now(),pulse=workspace.dataset.pulse.split(',');
  function project(p) {
    const x=p.x*Math.cos(angle)+p.z*Math.sin(angle),z=-p.x*Math.sin(angle)+p.z*Math.cos(angle);
    const scale=Math.min(width/405,height/342)*(600/(600-z));
    return {x:width/2+x*scale,y:height/2+(p.y-3)*scale,z,region:p.region};
  }
  function state() {
    workspace.dataset.selected=selected;workspace.dataset.hovered=hover||'';
    canvas.dataset.angle=angle.toFixed(5);
    canvas.dataset.running=String(!paused&&!reducedMotion&&!motion.matches&&visible&&!document.hidden);
    modules.forEach(b=>{const chosen=b.dataset.brainRegion===selected;b.classList.toggle('selected',chosen);b.classList.toggle('hovered',b.dataset.brainRegion===hover);b.setAttribute('aria-pressed',String(chosen));b.querySelector('.module-marker').textContent=chosen?'●':'○';});
  }
  function drawLink() {
    const region=hover||selected,points=projected.filter(p=>p.region===region);
    if(!points.length)return;
    const a=workspace.getBoundingClientRect(),b=canvas.getBoundingClientRect(),target=modules.find(m=>m.dataset.brainRegion===region).getBoundingClientRect();
    const near=points.filter(p=>p.z>0),cluster=near.length?near:points;
    const sx=cluster.reduce((n,p)=>n+p.x,0)/cluster.length+b.left-a.left,sy=cluster.reduce((n,p)=>n+p.y,0)/cluster.length+b.top-a.top;
    const tx=target.right-a.left,ty=target.top+target.height/2-a.top,bend=tx+Math.max(12,(sx-tx)*.34);
    connector.setAttribute('viewBox',`0 0 ${a.width} ${a.height}`);connector.dataset.region=region;
    connector.querySelector('path').setAttribute('d',`M${sx.toFixed(1)} ${sy.toFixed(1)} L${bend.toFixed(1)} ${sy.toFixed(1)} L${bend-12} ${ty} L${tx} ${ty}`);
    const dot=connector.querySelector('circle');dot.setAttribute('cx',sx);dot.setAttribute('cy',sy);
  }
  function draw() {
    if(dead||!width||!height)return;
    context.clearRect(0,0,width,height);projected=mesh.points.map(project);
    const active=hover||selected,feedback=performance.now()-started<2600;
    const light=r=>r===active || (feedback&&pulse.includes(r));
    const faces=mesh.faces.map(indices=>({indices,z:indices.reduce((sum,i)=>sum+projected[i].z,0)/3})).sort((a,b)=>a.z-b.z);
    for(const face of faces){const points=face.indices.map(i=>projected[i]);context.beginPath();points.forEach((p,i)=>i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y));context.closePath();context.fillStyle=light(points[0].region)?'rgba(145,205,220,.085)':'rgba(93,143,169,.022)';context.fill();}
    for(const [a,b] of mesh.edges){const p=projected[a],q=projected[b],bright=light(p.region)&&light(q.region);context.beginPath();context.moveTo(p.x,p.y);context.lineTo(q.x,q.y);context.strokeStyle=bright?'rgba(167,226,234,.58)':`rgba(118,170,194,${p.z>0?.24:.10})`;context.lineWidth=bright?.9:.6;context.stroke();}
    for(const ring of mesh.rings){context.beginPath();ring.map(project).forEach((p,i)=>i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y));context.closePath();context.strokeStyle='rgba(153,196,216,.37)';context.lineWidth=1;context.stroke();}
    projected.forEach((p,i)=>{const bright=light(p.region);context.beginPath();context.arc(p.x,p.y,bright?2.1:(i%4===0?1.7:1.2),0,Math.PI*2);context.fillStyle=bright?'rgba(198,242,246,.94)':`rgba(131,184,208,${p.z>0?.62:.22})`;context.fill();});
    drawLink();state();
  }
  function resize() {const r=stage.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,mobile.matches?1:1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);canvas.dataset.nodes=mesh.points.length;canvas.dataset.dpr=dpr;draw();}
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;state();}
  function tick(time) {
    if(dead)return;
    if(!visible||document.hidden||paused||reducedMotion||motion.matches){stop();return;}
    const interval=mobile.matches?80:40;
    if(!last)last=time;
    if(time-last>=interval){angle+=(Math.min(time-last,150)/1000)*.065;last=time;draw();}
    raf=requestAnimationFrame(tick);
  }
  function resume(){if(!dead&&!raf&&visible&&!document.hidden&&!paused&&!reducedMotion&&!motion.matches)raf=requestAnimationFrame(tick);state();}
  function hit(event) {const r=canvas.getBoundingClientRect(),x=event.clientX-r.left,y=event.clientY-r.top;let best=null,dist=28;for(const p of projected){const d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;best=p;}}return best?.region||null;}
  function select(r){selected=r;draw();onSelect(r);}
  stage.addEventListener('pointerenter',()=>{paused=true;stop();});
  stage.addEventListener('pointerleave',()=>{paused=false;hover=null;draw();resume();});
  canvas.addEventListener('pointermove',event=>{const next=hit(event);if(next!==hover){hover=next;canvas.style.cursor=hover?'pointer':'default';draw();}});
  canvas.addEventListener('click',event=>{const r=hit(event);if(r)select(r);});
  canvas.addEventListener('focus',()=>{paused=true;stop();});
  canvas.addEventListener('blur',()=>{paused=false;resume();});
  canvas.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(regions[(regions.indexOf(selected)+(event.key==='ArrowRight'?1:5))%6]);}});
  for(const module of modules){const r=module.dataset.brainRegion;module.addEventListener('pointerenter',()=>{hover=r;draw();});module.addEventListener('pointerleave',()=>{hover=null;draw();});module.addEventListener('focus',()=>{hover=r;draw();});module.addEventListener('blur',()=>{hover=null;draw();});module.addEventListener('click',()=>select(r));}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){draw();resume();}else stop();});intersection.observe(workspace);
  const change=()=>{stop();draw();resume();};motion.addEventListener('change',change);document.addEventListener('visibilitychange',change);
  resize();resume();
  return()=>{dead=true;stop();resizeObserver.disconnect();intersection.disconnect();motion.removeEventListener('change',change);document.removeEventListener('visibilitychange',change);};
}
