
'use strict';
const $=(id)=>document.getElementById(id);
const gNum=(id)=>Number($(id)?.value||0);
const fmt=(x,d=2)=> Number.isFinite(x)?(+x.toFixed(d)).toString():'–';
function xmlsafe(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function oninputs(ids,cb){ids.forEach(id=>$(id)?.addEventListener('input',cb));cb();}
function put(id,html){let e=$(id);if(e)e.innerHTML=html;}
// Vector traces: [{name,points:[[x,y]],color,stem?,dashed?,dots?}], optional {xMin,xMax,yMin,yMax,xLabel,yLabel}
function chart(id,traces,opts={}){
 const el=$(id); if(!el)return;
 const W=780,H=300,L=62,R=24,T=24,B=53;
 let all=traces.flatMap(t=>t.points||[]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
 if(!all.length)return;
 let xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
 let minX=opts.xMin??Math.min(...xs),maxX=opts.xMax??Math.max(...xs),minY=opts.yMin??Math.min(0,...ys),maxY=opts.yMax??Math.max(0,...ys);
 if(maxX===minX){minX-=1;maxX+=1}if(maxY===minY){maxY+=1;minY-=1}
 if(opts.yMin===undefined||opts.yMax===undefined){let p=(maxY-minY)*.1;maxY+=p;minY-=p}
 const x=v=>L+(v-minX)/(maxX-minX)*(W-L-R),y=v=>T+(maxY-v)/(maxY-minY)*(H-T-B);
 let svg=`<title>${xmlsafe(opts.title||'Grafik sinyal interaktif')}</title><rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="#fbfcff"/>`;
 for(let j=0;j<=4;j++){let v=minY+(maxY-minY)*j/4, Y=y(v);svg+=`<line x1="${L}" x2="${W-R}" y1="${Y}" y2="${Y}" stroke="#e4e9f2"/><text x="${L-9}" y="${Y+4}" text-anchor="end" font-size="11" fill="#7a89a3">${fmt(v,2)}</text>`}
 for(let j=0;j<=7;j++){let v=minX+(maxX-minX)*j/7, X=x(v);svg+=`<line x1="${X}" x2="${X}" y1="${T}" y2="${H-B}" stroke="#e8ebf4"/><text x="${X}" y="${H-B+20}" text-anchor="middle" font-size="11" fill="#7a89a3">${fmt(v,2)}</text>`}
 if(minY<=0&&maxY>=0)svg+=`<line x1="${L}" x2="${W-R}" y1="${y(0)}" y2="${y(0)}" stroke="#6d7896" stroke-width="1.5"/>`;
 let colors=['#5745dd','#1396af','#e78f28','#dc6280','#19896f'];
 traces.forEach((tr,i)=>{let pts=tr.points||[],c=tr.color||colors[i%colors.length];if(!pts.length)return;
   if(tr.stem){pts.forEach(([px,py])=>{if(px<minX||px>maxX)return;svg+=`<line x1="${x(px)}" y1="${y(0)}" x2="${x(px)}" y2="${y(py)}" stroke="${c}" stroke-width="2.4"/><circle cx="${x(px)}" cy="${y(py)}" r="4.7" fill="${c}" stroke="white" stroke-width="1"><title>${xmlsafe(tr.name||'Sampel')}: n=${fmt(px,3)}, x=${fmt(py,3)}</title></circle>`});}
   else {let parts=pts.map(([a,b],j)=>`${j?'L':'M'}${x(a).toFixed(2)},${y(b).toFixed(2)}`).join(' ');svg+=`<path d="${parts}" fill="none" stroke="${c}" stroke-width="2.5" ${tr.dashed?'stroke-dasharray="7 5"':''} stroke-linecap="round" stroke-linejoin="round"/>`;if(tr.dots)pts.forEach(([a,b])=>{svg+=`<circle cx="${x(a)}" cy="${y(b)}" r="4" fill="${c}"><title>${xmlsafe(tr.name||'Titik')} (${fmt(a,2)}, ${fmt(b,3)})</title></circle>`})}
 });
 svg+=`<text x="${W/2}" y="${H-12}" text-anchor="middle" fill="#5b6e8d" font-size="12">${xmlsafe(opts.xLabel||'Waktu (s) / indeks n')}</text><text transform="translate(18 ${H/2}) rotate(-90)" text-anchor="middle" font-size="12" fill="#5b6e8d">${xmlsafe(opts.yLabel||'Amplitudo')}</text>`;
 el.setAttribute('viewBox',`0 0 ${W} ${H}`);el.innerHTML=svg;
 let leg=$(id+'-legend');if(leg)leg.innerHTML=traces.map((t,i)=>`<span style="white-space:nowrap;margin-right:15px;font-size:12px;color:#55657c"><b style="display:inline-block;width:10px;height:10px;background:${t.color||colors[i%colors.length]};border-radius:30px;margin-right:5px"></b>${xmlsafe(t.name||'Sinyal')}</span>`).join('');
}
function dense(fn,x0,x1,num=420){return Array.from({length:num+1},(_,i)=>{let x=x0+(x1-x0)*i/num;return [x,fn(x)]})}
function seq(fn,n0,n1){return Array.from({length:n1-n0+1},(_,i)=>{let n=n0+i;return [n,fn(n)]})}
function renderBank(cat='all'){
 let q=EXERCISES.map((x,i)=>({...x,idx:i+1})).filter(x=>cat==='all'||x.t===cat);
 put('exerciseCount',`Menampilkan <b>${q.length}</b> dari <b>${EXERCISES.length}</b> soal • Klik judul soal untuk melihat pembahasan.`);
 put('exerciseBank',q.map(x=>`<details class="worked exercise"><summary><b>#${String(x.idx).padStart(2,'0')}</b> · ${x.q}<div class="micro">${xmlsafe(x.t)}</div></summary><div class="answer"><b>Penyelesaian:</b><p>${x.a}</p></div></details>`).join(''));
}
document.querySelectorAll('#exerciseFilters button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#exerciseFilters button').forEach(x=>x.classList.toggle('selected',x===b));renderBank(b.dataset.filter)}));renderBank();
function evaluateQuiz(){let correct=0,body='';QUIZ.forEach((q,i)=>{let picked=document.querySelector(`input[name="check${i}"]:checked`),p=picked?Number(picked.value):-1,ok=p===q.answer;correct+=ok?1:0;body+=`<p><b>Soal ${i+1}:</b> ${ok?'✅ Tepat':'❌ Belum tepat'} — ${xmlsafe(q.explain)} </p>`});put('quizResult',`<b>Skor: ${correct} dari ${QUIZ.length}</b>${body}`);$('quizResult').classList.add('visible');$('quizResult').scrollIntoView({behavior:'smooth',block:'nearest'});}
function resetQuiz(){document.querySelectorAll('#kuis input[type="radio"]').forEach(x=>x.checked=false);$('quizResult').classList.remove('visible');}
