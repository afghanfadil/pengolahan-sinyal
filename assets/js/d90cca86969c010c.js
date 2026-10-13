"use strict";
const $=id=>document.getElementById(id), pi=Math.PI;
const fmt=(v,d=3)=>(!Number.isFinite(v)?'—':Math.abs(v)<1e-9?'0':Number(v).toFixed(d).replace(/\.?0+$/,''));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function C(re=0,im=0){return {re,im}}
function plus(a,b){return C(a.re+b.re,a.im+b.im)}
function minus(a,b){return C(a.re-b.re,a.im-b.im)}
function mul(a,b){return C(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re)}
function div(a,b){let t=b.re*b.re+b.im*b.im;return t<1e-16?C(NaN,NaN):C((a.re*b.re+a.im*b.im)/t,(a.im*b.re-a.re*b.im)/t)}
function absC(a){return Math.hypot(a.re,a.im)}
function argC(a){return Math.atan2(a.im,a.re)}
function ej(q){return C(Math.cos(q),Math.sin(q))}
const SCALE=['#5349c9','#0995bd','#e39a30','#1caa7e','#e05b78'];
function lineplot(id, datasets, opt={}){
 let svg=$(id);if(!svg)return;
 const w=620,h=225,L=47,R=16,T=13,B=34,ww=w-L-R,hh=h-T-B;
 let valid=datasets.flatMap(d=>d.pts.filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])));
 let xmin=opt.xmin??(valid.length?Math.min(...valid.map(p=>p[0])):0),xmax=opt.xmax??(valid.length?Math.max(...valid.map(p=>p[0])):1);
 let ymin=opt.ymin??(valid.length?Math.min(...valid.map(p=>p[1])):-1),ymax=opt.ymax??(valid.length?Math.max(...valid.map(p=>p[1])):1);
 if(Math.abs(xmax-xmin)<1e-9){xmin-=1;xmax+=1}if(Math.abs(ymax-ymin)<1e-9){ymin-=1;ymax+=1}
 let pad=(ymax-ymin)*0.1;if(opt.ymin===undefined)ymin-=pad;if(opt.ymax===undefined)ymax+=pad;
 const X=x=>L+(x-xmin)/(xmax-xmin)*ww,Y=y=>T+(ymax-y)/(ymax-ymin)*hh;
 let body='';
 for(let i=0;i<=4;i++){let v=ymin+(ymax-ymin)*i/4;body+=`<line x1="${L}" x2="${w-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e5eaf3"/><text x="${L-5}" y="${Y(v)+4}" text-anchor="end" font-size="10" fill="#71839a">${fmt(v,2)}</text>`}
 for(let i=0;i<=4;i++){let v=xmin+(xmax-xmin)*i/4;body+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${h-B}" stroke="#f0f2f8"/><text x="${X(v)}" y="${h-12}" text-anchor="middle" font-size="10" fill="#71839a">${fmt(v,2)}</text>`}
 if(ymin<=0&&ymax>=0)body+=`<line x1="${L}" x2="${w-R}" y1="${Y(0)}" y2="${Y(0)}" stroke="#a8b2c9"/>`;
 datasets.forEach((d,i)=>{let color=d.color||SCALE[i%SCALE.length],prev=null,path='';for(let p of d.pts){if(!Number.isFinite(p[0])||!Number.isFinite(p[1])){prev=null;continue}path+=(prev?'L':'M')+X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)+' ';prev=p}
 if(d.type==='stem') {for(let p of d.pts){if(!Number.isFinite(p[1]))continue;body+=`<line x1="${X(p[0])}" y1="${Y(0)}" x2="${X(p[0])}" y2="${Y(p[1])}" stroke="${color}" stroke-width="2"/>`+`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3.4" fill="${color}"/>`}}
 else{if(d.type!=='dots')body+=`<path d="${path}" fill="none" stroke="${color}" stroke-width="${d.width||2.3}" ${d.dash?'stroke-dasharray="7 5"':''} />`;
 if(d.type==='dots')for(let p of d.pts){body+=`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3.6" fill="${color}"/>`}}
 });
 if(opt.marker!==undefined){body+=`<line x1="${X(opt.marker)}" x2="${X(opt.marker)}" y1="${T}" y2="${h-B}" stroke="#e09b4d" stroke-width="1.5" stroke-dasharray="5 4"/>`}
 let lx=L;for(let d of datasets){if(!d.label)continue;body+=`<rect x="${lx}" y="0" width="11" height="4" rx="2" fill="${d.color||SCALE[datasets.indexOf(d)%5]}"/><text x="${lx+14}" y="6" font-size="10" fill="#52627c">${d.label}</text>`;lx+=Math.max(82,d.label.length*6+28)}
 svg.innerHTML=body;
}
function zplot(id, a, b, mode='pz'){
 let svg=$(id);if(!svg)return;
 let W=620,H=225,CX=310,CY=108,S=71,lim=2;
 let X=x=>CX+x*S,Y=y=>CY-y*S;let t=`<rect width="620" height="225" fill="#fcfdff"/>`;
 if(mode==='right'||mode==='left'){
   if(mode==='right'){t+=`<circle cx="${CX}" cy="${CY}" r="${lim*S}" fill="#e4f6fd"/>`;
    t+=`<circle cx="${CX}" cy="${CY}" r="${Math.abs(a)*S}" fill="#fcfdff"/>`}
   else {t+=`<circle cx="${CX}" cy="${CY}" r="${Math.abs(a)*S}" fill="#e4f6fd"/>`}
 }
 t+=`<line x1="${X(-2)}" x2="${X(2)}" y1="${CY}" y2="${CY}" stroke="#8491aa"/><line x1="${CX}" x2="${CX}" y1="12" y2="205" stroke="#8491aa"/>`;
 for(let v=-2;v<=2;v++){if(v===0)continue;t+=`<text x="${X(v)}" y="${CY+14}" font-size="10" text-anchor="middle" fill="#71839a">${v}</text>`}
 t+=`<circle cx="${CX}" cy="${CY}" r="${S}" stroke="#875dd8" stroke-width="2" stroke-dasharray="6 4" fill="none"/><text x="${CX+S+7}" y="${CY-7}" fill="#7355b5" font-size="11">|z|=1</text>`;
 function cross(q,color){let x=X(q),y=Y(0);return `<path d="M${x-6},${y-6} L${x+6},${y+6} M${x-6},${y+6} L${x+6},${y-6}" stroke="${color}" stroke-width="3"/>`}
 if(mode!=='cancel')t+=cross(a,'#cc5175')+`<text x="${X(a)+8}" y="${CY-11}" fill="#b2486a" font-size="11">pole ${fmt(a,2)}</text>`;else t+=`<text x="${CX-120}" y="${CY-85}" fill="#3b5d94" font-size="12">H(z)=1; pole-zero dibatalkan</text>`;
 if(mode==='pz'&&b!==null&&Math.abs(a-b)>1e-7){t+=`<circle cx="${X(b)}" cy="${Y(0)}" r="7" stroke="#1186a7" stroke-width="2.5" fill="white"/><text x="${X(b)+8}" y="${CY+22}" fill="#147d9f" font-size="11">zero ${fmt(b,2)}</text>`}
 t+=`<text x="580" y="${CY-6}" font-size="11" fill="#8592a9">Re</text><text x="${CX+8}" y="17" font-size="11" fill="#8592a9">Im</text>`;
 svg.innerHTML=t;
}
function renderPractice(bank){
 const topics=['Semua',...new Set(bank.map(v=>v[0]))],target=$('quizTopics');let filter='Semua';
 function draw(){target.innerHTML=topics.map(t=>`<button type="button" data-topic="${t.replaceAll('"','&quot;')}" class="${t===filter?'active':''}">${t}</button>`).join('');
 $('quizList').innerHTML=bank.filter(v=>filter==='Semua'||v[0]===filter).map((v,i)=>`<details><summary><span class="muted">${i+1}.</span> ${v[1]}</summary><p><b>Pembahasan:</b> ${v[2]}</p></details>`).join('');
 target.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.topic;draw()}));}
 $('totalProblems').textContent=bank.length;draw();
}
function renderTest(test){let el=$('testList'),score=0,answered=new Set();el.innerHTML=test.map((t,i)=>`<div class="card"><h3>${i+1}. ${t[0]}</h3><div class="optgrid">${t[1].map(o=>`<button type="button" class="opt" data-index="${i}" data-opt="${o}">${o}</button>`).join('')}</div><div class="quick-answer" id="testAns${i}"></div></div>`).join('');
 el.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{let i=+b.dataset.index;if(answered.has(i))return;answered.add(i);let right=test[i][2],ok=b.dataset.opt===right;score+=ok?1:0;
 el.querySelectorAll(`button[data-index="${i}"]`).forEach(k=>{k.disabled=true;if(k.dataset.opt===right)k.classList.add('correct');else if(k===b)k.classList.add('wrong')});let a=$('testAns'+i);a.classList.add('show');a.innerHTML=`<b>${ok?'Benar ✓':'Belum tepat'}</b> · Jawaban: ${right}. ${test[i][3]}`;$('testScore').textContent=`${score} benar dari ${answered.size} dijawab (6 soal)`;}));
 $('testReset').addEventListener('click',()=>renderTest(test),{once:true});
}
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{const content=$(b.dataset.copy).textContent;try{await navigator.clipboard.writeText(content)}catch(e){let input=document.createElement('textarea');input.value=content;document.body.appendChild(input);input.select();document.execCommand('copy');input.remove()}b.textContent='Tersalin ✓';setTimeout(()=>b.textContent='Salin kode MATLAB',1400)}));
if('IntersectionObserver' in window){const links=[...document.querySelectorAll('aside .nav-link')];const observer=new IntersectionObserver(entries=>{for(let e of entries)if(e.isIntersecting){let link=links.find(l=>l.getAttribute('href')==='#'+e.target.id);if(link){links.forEach(l=>l.classList.remove('active'));link.classList.add('active')}}},{rootMargin:'-25% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s))}


const practice=[["Definisi dan ROC", "Tuliskan transformasi Z bilateral x[n].", "X(z)=Σ dari n=−∞ sampai ∞ x[n]z^(−n); z bilangan kompleks dan konvergensi menentukan ROC."], ["Definisi dan ROC", "Transformasi Z untuk δ[n]?", "X(z)=1, terdefinisi untuk semua z berhingga; tidak memiliki kutub hingga."], ["Definisi dan ROC", "Transformasi Z untuk δ[n−2]?", "X(z)=z^(−2), dengan z≠0."], ["Definisi dan ROC", "x[n]=a^n u[n] (a≠0). Apa X(z) dan ROC?", "X(z)=1/(1−az^(−1))=z/(z−a), ROC |z|>|a|."], ["Definisi dan ROC", "x[n]=−a^n u[−n−1]. Apa X(z) dan ROC?", "Fungsi rasional sama X(z)=z/(z−a), tetapi ROC |z|<|a|."], ["Definisi dan ROC", "Dua sinyal berbeda memiliki bentuk rasional Z yang sama. Bagaimana membedakannya?", "Sertakan ROC; fungsi rasional tanpa ROC tidak menentukan urutan dua sisi secara unik."], ["Definisi dan ROC", "Hubungan Transformasi Z dengan DTFT apa?", "DTFT X(e^{jω}) dapat diperoleh dari X(z) saat z=e^{jω} bila lingkaran satuan termasuk ROC."], ["Pole-zero", "Untuk H(z)=(1−0,2z^-1)/(1−0,8z^-1), di mana pole dan zero?", "Pole di z=0,8 dan zero di z=0,2 (tanpa pembatalan)."], ["Pole-zero", "Pada H(z)=(1−0,5z^-1)/(1−0,5z^-1), apakah ada pole di 0,5?", "Faktor identik dapat dibatalkan: H(z)=1 dengan respons impuls δ[n] jika dipahami sebagai fungsi sistem yang direduksi; perlu membedakan pembatalan formal dari internal stability pada realisasi umum."], ["Pole-zero", "Jika pole kausal berada di z=1,2 dan tidak dibatalkan, apakah sistem stabil BIBO?", "Tidak; pada model kausal orde satu, respons impuls tumbuh dan ROC |z|>1,2 tidak memuat unit circle."], ["Pole-zero", "Untuk pole kausal z=−0,4, apakah respons impuls berganti tanda?", "Ya, pada h[n]=(−0,4)^n u[n], tanda selang-seling dan amplitudo mengecil."], ["Pole-zero", "Apakah setiap zero pada unit circle menandakan frekuensi teredam?", "Pada sistem dengan respons frekuensi terdefinisi, zero z=e^{jω0} memberi H(e^{jω0})=0 (kecuali pembatalan)."], ["Pole-zero", "Apa arti orde dari penyebut fungsi rasional setelah bentuk minimal?", "Jumlah kutub menurut multiplicity, yang berhubungan dengan orde dinamika/keadaan dari sistem minimal."], ["ROC dan stabilitas", "Jika sistem kausal rasional stabil BIBO, di mana pole yang tidak dibatalkan?", "Semua pole terletak ketat di dalam lingkaran satuan |z|<1."], ["ROC dan stabilitas", "ROC x[n]=0,6^n u[n] apakah mencakup unit circle?", "Ya; ROC |z|>0,6 mencakup |z|=1, sehingga DTFT ada."], ["ROC dan stabilitas", "ROC untuk sinyal anti-kausal −(0,6)^n u[−n−1]?", "ROC |z|<0,6, sehingga unit circle tidak termasuk; rangkaian anti-kausal ini tidak stabil absolut."], ["ROC dan stabilitas", "Sinyal berhingga x[0]=1,x[1]=2,x[2]=3. Tulis X(z) dan ROC.", "X(z)=1+2z^−1+3z^−2, ROC semua z kompleks kecuali z=0."], ["ROC dan stabilitas", "Apakah kausalitas setara dengan stabilitas?", "Tidak. y[n]=1,2y[n−1]+x[n] dengan kondisi awal nol kausal tetapi tidak stabil BIBO."], ["ROC dan stabilitas", "Pole z=1 pada model integrator kausal. Stabil BIBO?", "Tidak; h[n]=u[n] tidak absolutely summable, ROC |z|>1 tidak mencakup unit circle."], ["ROC dan stabilitas", "Apa yang terjadi pada pole yang mendekati unit circle dari dalam?", "Respons waktu lebih lambat mereda; resonansi/penguatan komponen tertentu dapat menjadi lebih tajam untuk banyak struktur filter."], ["Persamaan beda", "y[n]−0,4y[n−1]=x[n], kondisi awal nol. Berapa h[0],h[1],h[2]?", "h[0]=1, h[1]=0,4, h[2]=0,16."], ["Persamaan beda", "y[n]−0,5y[n−1]=x[n]−0,2x[n−1], hitung h[0],h[1].", "Impuls unit: h[0]=1. Untuk n=1, h[1]=0,5(1)−0,2(1)=0,3."], ["Persamaan beda", "Jika y[n]=0,5y[n−1]+u[n], y[−1]=0, cari y[0:2].", "y[0]=1, y[1]=1,5, y[2]=1,75."], ["Persamaan beda", "Ubah y[n]−a y[n−1]=x[n]−b x[n−1] ke H(z) pada initial rest.", "H(z)=Y(z)/X(z)=(1−b z^(−1))/(1−a z^(−1)), dengan asumsi kondisi awal nol."], ["Persamaan beda", "Pada model y[n]=0,2y[n−1]+x[n], berapa output tunak untuk input step 1?", "y∞=1/(1−0,2)=1,25, karena |0,2|<1."], ["Persamaan beda", "Jika pole a=1,1 tanpa pembatalan, bagaimana h[n] kausal?", "h[n]=(1,1)^n u[n] meningkat, sehingga sistem tidak stabil BIBO."], ["Persamaan beda", "Apa perbedaan perintah filter dan conv dalam MATLAB?", "filter menerapkan sistem beda sesuai koefisien penyebut/pembilang dan kondisi awal; conv menghitung konvolusi dua deret berhingga secara eksplisit."], ["Persamaan beda", "Apa yang harus dinyatakan saat menghitung respons rekursif?", "Koefisien, masukan beserta indeksnya, dan kondisi awal; tanpa kondisi awal, solusi total umumnya belum unik."]],exam=[["ROC x[n]=a^n u[n], a≠0 ...", ["|z|>|a|", "|z|<|a|", "semua z", "|z|=|a|"], "|z|>|a|", "Deret geometri kanan konvergen untuk |a/z|<1."], ["Pole H(z)=1/(1−0,5z^-1) terletak di ...", ["0", "0,5", "1", "−0,5"], "0,5", "Penyebut 1−0,5/z=0 memberi z=0,5."], ["DTFT dari transformasi Z dapat diperoleh bila ...", ["z=0", "unit circle berada di ROC", "hanya ada zero", "pole di unit circle"], "unit circle berada di ROC", "Evaluasi z=e^{jω} mensyaratkan konvergensi."], ["Pole kausal tak dibatalkan pada |z|=1,2 menghasilkan ...", ["stabil", "BIBO tidak stabil", "memoryless", "filter FIR"], "BIBO tidak stabil", "|a|>1 menghasilkan respons bertumbuh."], ["Untuk y[n]−0,3y[n−1]=x[n], h[1]= ...", ["1", "0,3", "−0,3", "0"], "0,3", "Hasil iterasi impulse response pada n=1."], ["Fungsi rasional yang sama tetapi ROC berbeda dapat memberi ...", ["sinyal berbeda", "sinyal identik pasti", "fs berbeda", "DAC berbeda"], "sinyal berbeda", "ROC menentukan arah konvergensi dan urutan waktunya."]];
function s6roc(){let a=+$('s6rocA').value,mode=$('s6rocMode').value,right=mode==='right';
$('s6rocA').parentElement.childNodes[0].textContent=`|a|: ${fmt(a,2)}`;
zplot('s6rocPlot',a,null,mode);
let values=Array.from({length:17},(_,i)=>{let n=i-8;return [n,right?(n>=0?Math.pow(a,n):0):(n<0?-Math.pow(a,n):0)]});
lineplot('s6rocSeq',[{pts:values,type:'stem',label:'x[n]'}],{xmin:-8,xmax:8});
let roc=right?`|z| > ${fmt(a,2)}`:`|z| < ${fmt(a,2)}`,stable=right?a<1:a>1;
$('s6rocInfo').innerHTML=`<b>${right?'Sisi kanan':'Sisi kiri'}.</b> ROC: ${roc}. Lingkaran satuan ${stable?'masuk':'tidak masuk'} ROC. ${right?'x[n]=aⁿu[n]':'x[n]=−aⁿu[−n−1]'}; ${stable?'DTFT ada untuk model ini.':'DTFT tidak diperoleh dari unit circle untuk model ini.'}`;
}
function coeff(){return {a:+$('s6a').value,b:+$('s6b').value}}
function canceled(a,b){return Math.abs(a-b)<1e-7}
function H6(w,a,b){if(canceled(a,b))return C(1,0);let z=ej(-w);return div(minus(C(1,0),mul(C(b,0),z)),minus(C(1,0),mul(C(a,0),z)))}
function valid6(a,b){return canceled(a,b)||Math.abs(a)<1-1e-8}
function s6pole(){let {a,b}=coeff(),cancel=canceled(a,b),stable=valid6(a,b);
$('s6a').parentElement.childNodes[0].textContent=`Pole a: ${fmt(a,2)}`;$('s6b').parentElement.childNodes[0].textContent=`Zero b: ${fmt(b,2)}`;
if(cancel){zplot('s6polePlot',a,null,'cancel')}else{zplot('s6polePlot',a,b,'pz')}
$('s6poleInfo').innerHTML=cancel?'<b>Pembatalan aljabar:</b> a=b, maka H(z)=1 pada model input-output minimal. Realisasi dengan pole tersembunyi tetap perlu ditinjau terpisah.':`Pole = <b>${fmt(a,2)}</b>; zero = <b>${fmt(b,2)}</b>; ROC kausal |z|>${fmt(Math.abs(a),2)}. <span class="pill ${stable?'':'bad'}">${stable?'Stabil BIBO':'Tidak stabil BIBO'}</span> (asumsi pole tak dibatalkan).`;
let pts=[];if(stable)for(let i=0;i<=200;i++){let w=i/200*pi;pts.push([w/pi,absC(H6(w,a,b))]);}
lineplot('s6poleH',[{pts,label:stable?'|H|':'DTFT tak ada'}],{xmin:0,xmax:1,ymin:0,ymax:stable?undefined:1});
s6diff();s6freq();
}
function s6inv(){let a=+$('s6invA').value,right=$('s6invMode').value==='right';
$('s6invA').parentElement.childNodes[0].textContent=`Nilai a: ${fmt(a,2)}`;
let seq=Array.from({length:17},(_,i)=>{let n=i-8;return[n,right?(n>=0?Math.pow(a,n):0):(n<0?-Math.pow(a,n):0)]});
lineplot('s6inverseSeq',[{pts:seq,type:'stem',label:'Invers Z'}],{xmin:-8,xmax:8});
$('s6invInfo').innerHTML=right?`x[n]=${fmt(a,2)}ⁿu[n], ROC |z|>${fmt(a,2)}. Nilai awal: x[0]=1, x[1]=${fmt(a,3)}.`:`x[n]=−(${fmt(a,2)})ⁿu[−n−1], ROC |z|<${fmt(a,2)}. Contoh x[−1]=${fmt(-1/a,3)}.`;
}
function s6diff(){let {a,b}=coeff(),typ=$('s6input').value,arrx=[],arry=[],rows='';
for(let n=0;n<14;n++){let x=typ==='imp'?(n===0?1:0):typ==='step'?1:n<4?1:0;let y=a*(n?arry[n-1]:0)+x-b*(n?arrx[n-1]:0);arrx.push(x);arry.push(y);
 if(n<9)rows+=`<tr><td>${n}</td><td>${fmt(x,2)}</td><td>${fmt(y,4)}</td></tr>`;}
$('s6diffRows').innerHTML=rows;
lineplot('s6diffSeq',[{pts:arrx.map((v,n)=>[n,v]),type:'stem',label:'x[n]'},{pts:arry.map((v,n)=>[n,v]),type:'line',label:'y[n]'}],{xmin:0,xmax:13});
$('s6diffInfo').innerHTML=`Dengan a=${fmt(a,2)} dan b=${fmt(b,2)}, pada n=0: y[0]=x[0]=${fmt(arrx[0],2)}. Pada n=1: y[1]=a y[0]+x[1]−b x[0] = <b>${fmt(arry[1],3)}</b>.`;
}
function s6freq(){let {a,b}=coeff(),w0=+$('s6omega').value*pi,stable=valid6(a,b),m=[],p=[];
$('s6omega').parentElement.childNodes[0].textContent=`ω/π: ${fmt(w0/pi,2)}`;
if(stable){for(let i=0;i<=240;i++){let w=i/240*pi,H=H6(w,a,b);m.push([w/pi,absC(H)]);p.push([w/pi,absC(H)<1e-8?NaN:argC(H)]);}
let z=H6(w0,a,b);$('s6freqInfo').innerHTML=`ROC memuat |z|=1. Pada ω=${fmt(w0/pi,2)}π: |H|=<b>${fmt(absC(z),4)}</b>, fase=<b>${fmt(argC(z),4)} rad</b>.`;
}else {$('s6freqInfo').innerHTML='<b>DTFT tidak tersedia:</b> untuk realisasi kausal ini, pole tak dibatalkan berada pada atau di luar unit circle. Tidak boleh menganggap evaluasi formal H(z) di lingkaran satuan sebagai respons frekuensi.';}
lineplot('s6freqMag',[{pts:m,label:stable?'|H|':'Tidak ada DTFT'}],{xmin:0,xmax:1,ymin:0,ymax:stable?undefined:1,marker:w0/pi});
lineplot('s6freqPhase',[{pts:p,label:stable?'Fase':'Tidak ada DTFT'}],{xmin:0,xmax:1,ymin:-pi,ymax:pi,marker:w0/pi});
}
[['s6rocA','input',s6roc],['s6rocMode','change',s6roc],['s6a','input',s6pole],['s6b','input',s6pole],['s6invA','input',s6inv],['s6invMode','change',s6inv],['s6input','change',s6diff],['s6omega','input',s6freq]].forEach(([id,evt,fn])=>$(id).addEventListener(evt,fn));
s6roc();s6pole();s6inv();s6diff();s6freq();renderPractice(practice);renderTest(exam);
