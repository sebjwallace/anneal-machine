globalThis.WORLD_SIZE = 16; const S='/home/claude/anneal-machine/src/'; const { rng } = require(S+'worlds/catalogue.js'); const Wd = require(S+'worlds/moving.js');
const { Model } = require(S+'engine/see.js'); const { Codes } = require(S+'engine/cells.js'); const { Change } = require(__dirname + '/change.js');
const W=16, EP=+(process.env.EP||100); const m=new Model(), r=rng(1), eps=[]; let seen=0; const t0=Date.now();
for (let e=0;e<EP;e++){const ep=Wd.episode(r,W);eps.push(ep);ep.pics.forEach((x,i)=>{m.step(x,i?ep.pics[i-1]:null);if(++seen%98===0)m.rest();});} m.rest(); console.log('learnt',(Date.now()-t0)/1000|0,'s');
const C=new Codes(m), HIST=!!process.env.HIST;
for (const kinds of [false,true]) { const L=new Change(C,{kinds}), cache=new Map(), now=(x)=>{let n=cache.get(x);if(!n){n=L.now(x);cache.set(x,n);}return n;}; const t1=Date.now();
  for (const ep of eps.slice(0, +(process.env.TR||EP))) for (let t=1;t+1<ep.pics.length;t++) L.learn(L.state(now(ep.pics[t]),HIST?now(ep.pics[t-1]):null),now(ep.pics[t+1]));
  const nk=L.rest(); const full=(c)=>L.full(c);
  const score=(pool,seed)=>{const f=rng(seed);let ok=0,n=0;for(let k=0;k<30;k++){const ep=Wd.episode(f,W,5,pool);for(let t=1;t+1<ep.pics.length;t++){n++;const p=L.predict(L.state(now(ep.pics[t]),HIST?now(ep.pics[t-1]):null)),B=now(ep.pics[t+1]);const P=new Set(p.map(full));if(P.size===B.length&&B.every(c=>P.has(full(c))))ok++;}}return (100*ok/n).toFixed(0)+'%';};
  const shown=Object.entries(Wd.SHOWN).flatMap(([b,fs])=>fs.map(f=>[b,f]));
  console.log(kinds?'with slot cells':'without slot cells', '· changes kept',nk,'·',(Date.now()-t1)/1000|0,'s · next state right: seen objects',score(shown,5),'· never-seen',score(Wd.HELD,6)); }
