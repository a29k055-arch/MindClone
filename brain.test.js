import test from 'node:test';
import assert from 'node:assert/strict';
import {createMesh} from './src/brain-geometry.js';
for(const coarse of [false,true])test(`closed volumetric brain ${coarse?'mobile':'desktop'}`,()=>{
  const m=createMesh(coarse),counts=new Map();let volume=0;
  for(const [a,b,c] of m.faces){const p=m.points[a],q=m.points[b],r=m.points[c];volume+=(p.x*(q.y*r.z-q.z*r.y)+p.y*(q.z*r.x-q.x*r.z)+p.z*(q.x*r.y-q.y*r.x))/6;
    for(const [u,v] of [[a,b],[b,c],[c,a]]){const key=[Math.min(u,v),Math.max(u,v)].join(',');counts.set(key,(counts.get(key)||0)+1);}}
  assert.ok([...counts.values()].every(n=>n===2),'each mesh edge has exactly two incident faces');
  assert.ok(volume>1000000,'outward faces enclose positive volume');
  for(const axis of ['x','y','z'])assert.ok(Math.max(...m.points.map(p=>p[axis]))-Math.min(...m.points.map(p=>p[axis]))>130);
  assert.equal(m.points.length-m.edges.length+m.faces.length,2,'closed genus-zero surface');
  assert.equal(new Set(m.points.map(p=>p.region)).size,6);
});
