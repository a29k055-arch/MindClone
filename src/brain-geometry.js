// Original implicit 3D anatomy. Marching tetrahedra samples the entire volume,
// not a silhouette or extrusion. Units are arbitrary conceptual coordinates.
export function domainFor(x,y,z) {
  if(y < -35) return 'emotion';
  if(x < -45) return 'memory';
  if(x > 45) return y > 20 ? 'personality' : 'values';
  if(y > 38) return 'reasoning';
  return z > 0 ? 'language' : 'emotion';
}
function field(x,y,z) {
  const ell=(cx,cy,cz,rx,ry,rz)=>1-Math.sqrt(((x-cx)/rx)**2+((y-cy)/ry)**2+((z-cz)/rz)**2);
  const union=(a,b)=>{const k=.12,h=Math.max(k-Math.abs(a-b),0)/k;return Math.max(a,b)+h*h*k*.25;};
  let cerebral=ell(3,21,0,113,81,72);
  // Dorsal fissure and shallow cortical folds deform a full ellipsoidal volume.
  cerebral-=.075*Math.exp(-((z/9)**2))*Math.max(0,(y-15)/85);
  cerebral+=.025*Math.sin(x*.11+y*.065)*Math.cos(z*.105+y*.045);
  return union(union(cerebral,ell(-66,-39,0,48,35,49)),ell(-19,-67,0,18,44,20));
}
export function createMesh(coarse=false) {
  const step=coarse?22:18,points=[],faces=[],edges=[],weld=new Map();
  const vertex=p=>{const key=p.map(v=>v.toFixed(5)).join(',');if(weld.has(key))return weld.get(key);const i=points.length;points.push({x:p[0],y:p[1],z:p[2],region:domainFor(...p)});weld.set(key,i);return i;};
  const corners=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
  const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const emit=(a,b,c,inside)=>{const normal=cross(sub(b,a),sub(c,a));if(normal.reduce((s,v,i)=>s+v*(inside[i]-a[i]),0)>0)[b,c]=[c,b];const f=[vertex(a),vertex(b),vertex(c)];if(new Set(f).size===3)faces.push(f);};
  for(let x=-144;x<144;x+=step)for(let y=-132;y<120;y+=step)for(let z=-96;z<96;z+=step){
    const p=corners.map(c=>[x+c[0]*step,y+c[1]*step,z+c[2]*step]),v=p.map(a=>field(...a));
    for(const ids of tetra){const ins=ids.filter(i=>v[i]>0),out=ids.filter(i=>v[i]<=0);if(!ins.length||!out.length)continue;
      const cut=(a,b)=>p[a].map((n,j)=>n+(p[b][j]-n)*v[a]/(v[a]-v[b]));
      if(ins.length===1){const a=ins[0];emit(...out.map(b=>cut(a,b)),p[a]);}
      else if(ins.length===3){const b=out[0];emit(...ins.map(a=>cut(a,b)),p[ins[0]]);}
      else{const [a,b]=ins,[c,d]=out,A=cut(a,c),B=cut(a,d),C=cut(b,c),D=cut(b,d);emit(A,B,C,p[a]);emit(B,D,C,p[a]);}
    }
  }
  const unique=new Set();for(const f of faces)for(let i=0;i<3;i++){const a=f[i],b=f[(i+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(',');if(!unique.has(key)){unique.add(key);edges.push([a,b]);}}
  return {points,faces,edges};
}
