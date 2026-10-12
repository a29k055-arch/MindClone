import {createMesh} from './brain-geometry.js';
export {createMesh} from './brain-geometry.js';
export const regions = ['memory','personality','values','reasoning','language','emotion'];
export function brainMarkup(t,{selected=null,pulse=[],captures=0}={}) {
  return `<section class="neural-observatory" aria-label="${t('brain.title')}">
    <div class="neural-top"><span class="eyebrow">${t('brain.neural')}</span><span class="small-status">${t('brain.lateral')}</span></div>
    <div class="brain-workspace" data-selected="${selected||''}" data-pulse="${pulse.join(',')}">
      <div class="brain-modules" role="group" aria-label="${t('brain.explore')}">${regions.map((r,i)=>`<button type="button" class="brain-module ${selected===r?'selected':''}" data-brain-region="${r}" aria-pressed="${selected===r}"><span class="module-index">0${i+1}</span><span>${t('region.'+r)}</span><span class="module-marker" aria-hidden="true">${selected===r?'●':'○'}</span></button>`).join('')}</div>
      <div class="brain-stage"><canvas class="brain-canvas" tabindex="0" role="img" aria-label="${t('brain.canvasLabel')}"></canvas></div>
      <svg class="brain-connector" aria-hidden="true"><path/><circle r="3"/></svg>
    </div>
    <div class="neural-bottom"><span>${t('brain.instructions')}</span><span>${captures?`${t('builder.answered')} ${captures}`:t('brain.abstract')}</span></div>
  </section>`;
}
export function connectBrain(container,onSelect,reducedMotion=false) {
  const workspace=container.querySelector('.brain-workspace');if(!workspace)return()=>{};
  let dead=false,dispose=()=>{};
  import('../vendor/three.module.js').then(T=>{if(dead)return;dispose=mount(T);}).catch(()=>{workspace.dataset.error='webgl';});
  return()=>{dead=true;dispose();};
  function mount(T){
    const canvas=workspace.querySelector('canvas'),stage=workspace.querySelector('.brain-stage'),modules=[...workspace.querySelectorAll('.brain-module')],connector=workspace.querySelector('svg');
    const mobile=matchMedia('(max-width:700px), (pointer:coarse)'),motion=matchMedia('(prefers-reduced-motion:reduce)');
    const model=createMesh(mobile.matches),geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(model.points.flatMap(p=>[p.x,p.y,p.z]),3));geometry.setIndex(model.faces.flat());geometry.computeVertexNormals();
    const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:!mobile.matches});renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile.matches?1:1.5));
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,1,2000),group=new T.Group();camera.position.set(0,0,480);camera.lookAt(0,0,0);scene.add(group);
    const surface=new T.Mesh(geometry,new T.MeshBasicMaterial({color:0x91bccb,transparent:true,opacity:.055,side:T.DoubleSide,depthWrite:false}));group.add(surface);
    const wireGeometry=new T.BufferGeometry();wireGeometry.setAttribute('position',new T.Float32BufferAttribute(model.edges.flatMap(e=>e.flatMap(i=>{const p=model.points[i];return[p.x,p.y,p.z];})),3));
    group.add(new T.LineSegments(wireGeometry,new T.LineBasicMaterial({color:0x719bb4,transparent:true,opacity:.24,depthWrite:false})));
    const nodeGeometry=new T.BufferGeometry();nodeGeometry.setAttribute('position',geometry.getAttribute('position').clone());
    const selectedAttribute=new T.Float32BufferAttribute(model.points.map(()=>0),1);nodeGeometry.setAttribute('chosen',selectedAttribute);
    const nodeMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{dpr:{value:renderer.getPixelRatio()}},vertexShader:'attribute float chosen; varying float pick; uniform float dpr; void main(){pick=chosen; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(chosen>.5?5.0:2.0)*dpr*(480.0/-mv.z);}',fragmentShader:'varying float pick; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(mix(vec3(.48,.68,.78),vec3(.8,.96,1.),pick),mix(.42,.95,pick)*(1.-smoothstep(.2,.5,d)));}'});
    group.add(new T.Points(nodeGeometry,nodeMaterial));
    let selectedDomain=regions.includes(workspace.dataset.selected)?workspace.dataset.selected:null,hoveredDomain=null,paused=false,visible=true,angle=.35,raf=0,last=0,width=1,height=1;
    const raycaster=new T.Raycaster(),pointer=new T.Vector2(),anchor=new T.Vector3();
    const listeners=[];const listen=(el,type,fn)=>{el.addEventListener(type,fn);listeners.push(()=>el.removeEventListener(type,fn));};
    function sync(){workspace.dataset.selected=selectedDomain||'';workspace.dataset.hovered=hoveredDomain||'';canvas.dataset.angle=angle.toFixed(5);canvas.dataset.running=String(!paused&&visible&&!document.hidden&&!reducedMotion&&!motion.matches);
      for(const b of modules){const yes=b.dataset.brainRegion===selectedDomain;b.classList.toggle('selected',yes);b.classList.toggle('hovered',b.dataset.brainRegion===hoveredDomain);b.setAttribute('aria-pressed',String(yes));b.querySelector('.module-marker').textContent=yes?'●':'○';}
    }
    function link(){const domain=hoveredDomain||selectedDomain;connector.dataset.region=domain||'';connector.style.opacity=domain?'1':'0';if(!domain)return;
      const candidates=model.points.filter(p=>p.region===domain);anchor.set(0,0,0);for(const p of candidates)anchor.add(new T.Vector3(p.x,p.y,p.z));anchor.divideScalar(candidates.length).applyMatrix4(group.matrixWorld).project(camera);
      const a=workspace.getBoundingClientRect(),b=canvas.getBoundingClientRect(),target=modules.find(m=>m.dataset.brainRegion===domain).getBoundingClientRect();
      const sx=(anchor.x+1)*width/2+b.left-a.left,sy=(1-anchor.y)*height/2+b.top-a.top,tx=target.right-a.left,ty=target.top+target.height/2-a.top,bend=tx+18;
      if(![sx,sy,tx,ty].every(Number.isFinite)){connector.style.opacity='0';return;}
      connector.setAttribute('viewBox',`0 0 ${a.width} ${a.height}`);connector.querySelector('path').setAttribute('d',`M${sx} ${sy} L${bend+20} ${sy} L${bend} ${ty} L${tx} ${ty}`);connector.querySelector('circle').setAttribute('cx',sx);connector.querySelector('circle').setAttribute('cy',sy);
    }
    function draw(){if(dead)return;group.rotation.set(.10,angle,.025);group.updateMatrixWorld(true);renderer.render(scene,camera);link();sync();}
    function select(domain){selectedDomain=domain;model.points.forEach((p,i)=>selectedAttribute.setX(i,p.region===domain?1:0));selectedAttribute.needsUpdate=true;draw();onSelect(domain);}
    function hover(domain){if(hoveredDomain===domain)return;hoveredDomain=domain;draw();}
    function hit(event){const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObject(surface)[0];return hit?model.points[hit.face.a].region:null;}
    function stop(){cancelAnimationFrame(raf);raf=0;last=0;sync();}
    function tick(time){if(dead)return;if(paused||!visible||document.hidden||reducedMotion||motion.matches){stop();return;}if(!last)last=time;if(time-last>(mobile.matches?80:40)){angle+=Math.min(time-last,150)*.000065;last=time;draw();}raf=requestAnimationFrame(tick);}
    function resume(){if(!raf&&!paused&&visible&&!document.hidden&&!reducedMotion&&!motion.matches)raf=requestAnimationFrame(tick);sync();}
    listen(stage,'pointerenter',()=>{paused=true;stop();});listen(stage,'pointerleave',()=>{paused=false;hover(null);resume();});
    listen(canvas,'pointermove',e=>{hover(hit(e));canvas.style.cursor=hoveredDomain?'pointer':'default';});listen(canvas,'click',e=>{const domain=hit(e);if(domain)select(domain);});
    listen(canvas,'focus',()=>{paused=true;stop();});listen(canvas,'blur',()=>{paused=false;resume();});listen(canvas,'keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(regions[(regions.indexOf(selectedDomain)+(e.key==='ArrowRight'?1:5)+6)%6]);}});
    for(const b of modules){const r=b.dataset.brainRegion;listen(b,'pointerenter',()=>hover(r));listen(b,'pointerleave',()=>hover(null));listen(b,'focus',()=>hover(r));listen(b,'blur',()=>hover(null));listen(b,'click',()=>select(r));}
    function resize(){const r=stage.getBoundingClientRect();if(r.width<=0||r.height<=0)return;width=r.width;height=r.height;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=Math.max(480,280/camera.aspect);camera.updateProjectionMatrix();draw();}
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);const intersection=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){draw();resume();}else stop();});intersection.observe(workspace);
    const change=()=>{stop();draw();resume();};listen(motion,'change',change);listen(document,'visibilitychange',change);
    // Expose only geometric/render diagnostics, never captured data.
    canvas.dataset.nodes=model.points.length;canvas.dataset.faces=model.faces.length;canvas.dataset.dpr=renderer.getPixelRatio();canvas.dataset.renderer='webgl';
    if(selectedDomain)select(selectedDomain);resize();resume();
    return()=>{stop();resizeObserver.disconnect();intersection.disconnect();listeners.forEach(fn=>fn());geometry.dispose();wireGeometry.dispose();nodeGeometry.dispose();surface.material.dispose();nodeMaterial.dispose();group.children[1].material.dispose();renderer.dispose();};
  }
}
