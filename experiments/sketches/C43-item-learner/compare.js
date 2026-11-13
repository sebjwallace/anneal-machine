const { Learner } = require('./items.js');
const { rng } = require('../../../src/worlds/catalogue.js');
for (const WIN of [100, 300, 1000]) {
const starts='ABCDEF'.split(''), ends='PQRSTU'.split(''), held=new Set(['AQ','BP']), eps=[]; for (const a of starts) for (const b of ends) if(!held.has(a+b)) eps.push([a,'J',b]);
const r=rng(43), counts=new Map(), keyed=new Map(); for(let i=0;i<WIN;i++){const e=eps[Math.floor(r()*eps.length)],k=e.join(); if(!keyed.has(k)) keyed.set(k,new Map([[0,e[0]],[1,e[1]],[2,e[2]]])); counts.set(k,(counts.get(k)||0)+1);}
const window=[...counts].map(([k,n])=>[keyed.get(k),n]); const items=['J',...starts,...ends];
const L=new Learner(items,3); L.rest(window); const learnt=L.energy(window);
const H=new Learner(items,3); H.kinds=[{id:1,at:[['J',1]],slots:[{t:0,fill:starts.slice()},{t:2,fill:ends.slice()}]}]; const one=H.energy(window);
const N=new Learner(items,3); const none=N.energy(window);
console.log(`window ${WIN}: nothing stored ${none.E.toFixed(0)} · learnt (${L.kinds.length} kinds, ${L.things.length} episodes) ${learnt.E.toFixed(0)} · ONE kind "? J ?" (6 x 6) ${one.E.toFixed(0)} (structure ${one.st.toFixed(0)}, flow ${one.fl.toFixed(0)})`); }
