import {createRequire} from 'node:module';
const {chromium}=createRequire(process.env.MC_TEST_DEPENDENCIES+'/package.json')('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({viewport:{width:800,height:600}});await page.goto(process.env.MC_TEST_URL);
for(const [label,angle] of [['side',0],['front',Math.PI/2],['rear',-Math.PI/2],['opposite',Math.PI]]){
 await page.evaluate(async angle=>{
  const T=await import('./vendor/three.module.js'),{createMesh}=await import('./src/brain-geometry.js');
  document.querySelector('#angle-proof')?.remove();const canvas=document.createElement('canvas');canvas.id='angle-proof';canvas.style.cssText='position:fixed;inset:0;z-index:1000;background:#0b111b';document.body.append(canvas);
  const m=createMesh(),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(m.points.flatMap(p=>[p.x,p.y,p.z]),3));g.setIndex(m.faces.flat());
  const r=new T.WebGLRenderer({canvas,antialias:true});r.setSize(800,600);r.setClearColor(0x0b111b);const s=new T.Scene(),c=new T.PerspectiveCamera(34,800/600,1,1000);c.position.z=480;
  const group=new T.Group();group.rotation.y=angle;s.add(group);group.add(new T.Mesh(g,new T.MeshBasicMaterial({color:0x8fbccc,transparent:true,opacity:.065,side:T.DoubleSide,depthWrite:false})));
  group.add(new T.LineSegments(new T.WireframeGeometry(g),new T.LineBasicMaterial({color:0x81afc5,transparent:true,opacity:.3})));
  group.add(new T.Points(g,new T.PointsMaterial({color:0xb3dce7,size:1.8})));r.render(s,c);r.dispose();
 },angle);await page.screenshot({path:`screenshots/brain-${label}.png`});
}
await browser.close();console.log('Captured four orthogonal views of the same closed 3D mesh.');
