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
 el.querySelectorAll(`button[data-index="${i}"]`).forEach(k=>{k.disabled=true;if(k.dataset.opt===right)k.classList.add('correct');else if(k===b)k.classList.add('wrong')});let a=$('testAns'+i);a.classList.add('show');a.innerHTML=`<b>${ok?'Benar ✓':'Belum tepat'}</b> · Jawaban: ${right}. ${test[i][3]}`;$('testScore').textContent=`${score} benar dari ${answered.size} dijawab (${test.length} soal)`;}));
 $('testReset').addEventListener('click',()=>renderTest(test),{once:true});
}
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{const content=$(b.dataset.copy).textContent;try{await navigator.clipboard.writeText(content)}catch(e){let input=document.createElement('textarea');input.value=content;document.body.appendChild(input);input.select();document.execCommand('copy');input.remove()}b.textContent='Tersalin ✓';setTimeout(()=>b.textContent='Salin kode MATLAB',1400)}));
if('IntersectionObserver' in window){const links=[...document.querySelectorAll('aside .nav-link')];const observer=new IntersectionObserver(entries=>{for(let e of entries)if(e.isIntersecting){let link=links.find(l=>l.getAttribute('href')==='#'+e.target.id);if(link){links.forEach(l=>l.classList.remove('active'));link.classList.add('active')}}},{rootMargin:'-25% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s))}


const practice=[["Konsep dasar", "Apa beda sinyal analog dan sinyal diskrit?", "Analog kontinu pada waktu; sinyal waktu-diskrit hanya didefinisikan pada indeks waktu diskrit n (amplitudo belum tentu terkuantisasi)."], ["Konsep dasar", "Apa beda sampling dan kuantisasi?", "Sampling mendiskritkan waktu, kuantisasi membatasi nilai amplitudo ke level representasi tertentu."], ["Konsep dasar", "Apa arti 8-bit ADC ideal terkait jumlah kode?", "2⁸=256 kemungkinan kode. Lebar kuantisasi bergantung rentang input dan konvensi ADC."], ["Konsep dasar", "Sebutkan penerapan DSP dalam elektro.", "Contoh: penyaringan noise akselerometer, pemantauan getaran, pengolahan sinyal encoder, dan kontrol digital."], ["Sinyal diskrit", "Untuk Tₛ=2 ms, berapa fₛ?", "fₛ=1/0,002=500 Hz."], ["Sinyal diskrit", "Berapa δ[−2] dan δ[0]?", "δ[−2]=0 dan δ[0]=1."], ["Sinyal diskrit", "Berapa nilai u[−1],u[0],u[2]?", "0,1,1 untuk u[n] mulai bernilai satu pada n=0."], ["Sinyal diskrit", "Jika x[0]=2, maka y[n]=x[n−3] memiliki y[3] berapa?", "y[3]=x[0]=2; artinya tertunda tiga sampel."], ["Sinyal diskrit", "Jika x[−1]=3 maka x[−n] pada n=1 adalah?", "x[−1]=3 sehingga y[1]=3."], ["Sinyal diskrit", "Apa ciri sinyal ganjil pada n=0?", "x[0]=−x[0] sehingga x[0]=0."], ["Sistem dan konvolusi", "Apa definisi sistem linear?", "Memenuhi superposisi: T{ax₁+bx₂}=aT{x₁}+bT{x₂} untuk semua masukan dan konstanta."], ["Sistem dan konvolusi", "Apakah y[n]=x[n]² linear?", "Tidak; penggandaan masukan dua kali membuat keluaran empat kali."], ["Sistem dan konvolusi", "Apakah y[n]=x[n]−x[n−1] kausal?", "Ya; keluaran pada n hanya bergantung pada masukan saat dan sebelum n."], ["Sistem dan konvolusi", "Konvolusi x=[1,2,1], h=[1,1] berindeks mulai nol.", "y=[1,3,3,1] dengan panjang 3+2−1=4."], ["Sistem dan konvolusi", "Untuk y[n]=0,5y[n−1]+x[n], x=δ[n], initial rest, berapa h[2]?", "h[0]=1,h[1]=0,5,h[2]=0,25."], ["Sistem dan konvolusi", "Jika h=[1,−1], sinyal masukan konstan menghasilkan keluaran tunak apa?", "Nol: x[n]−x[n−1]=0 setelah kondisi transien awal."], ["DTFT dan sampling", "Apa definisi DTFT?", "X(eʲω)=Σ x[n]e^(−jωn), periodik 2π bila transformasi terdefinisi."], ["DTFT dan sampling", "Berapa DTFT δ[n−2]?", "e^(−j2ω) dengan magnitudo 1 dan fase −2ω (mod 2π)."], ["DTFT dan sampling", "Hitung X(eʲ0) untuk x=[1,2,1].", "X(eʲ0)=1+2+1=4."], ["DTFT dan sampling", "Mengapa h=[0,5;0,5] meredam komponen ω=π?", "H(eʲπ)=0,5(1+e^(−jπ))=0."], ["DTFT dan sampling", "Untuk fₛ=20 Hz dan sinyal 14 Hz, berapa alias positif dasar?", "|14−20|=6 Hz."], ["DTFT dan sampling", "Mengapa filter anti-alias sebelum ADC diperlukan?", "Mengurangi energi frekuensi di atas fₛ/2 agar tidak terlipat ke pita dasar saat sampling."], ["DTFT dan sampling", "Apa beda DFT dan DTFT?", "DTFT mendeskripsikan spektrum kontinu terhadap ω (periodik); DFT menghitung sampel spektrum pada indeks frekuensi tertentu."], ["Transformasi Z", "Tulis Z{aⁿu[n]} dan ROC untuk a=0,6.", "X(z)=1/(1−0,6z⁻¹), ROC |z|>0,6."], ["Transformasi Z", "Untuk pole kausal z=1,1, apakah stabil?", "Tidak; unit circle tidak termasuk ROC dan respons impuls tumbuh."], ["Transformasi Z", "Jika ROC 0,3<|z|<1,2, apakah DTFT ada?", "Ya karena lingkaran satuan |z|=1 termasuk ROC."], ["Transformasi Z", "Apa efek pergeseran x[n−2] pada X(z)?", "Mengalikan X(z) dengan z⁻² untuk bilateral Z; ujung ROC bisa berubah di z=0/∞."], ["Transformasi Z", "Hitung pole H(z)=1/(1−0,7z⁻¹).", "Pole di z=0,7 dengan ROC kausal |z|>0,7."], ["Transformasi Z", "Dari H(z)=1/(1−0,5z⁻¹)², cari h[n].", "h[n]=(n+1)0,5ⁿu[n] untuk realisasi kausal."], ["Kasus terintegrasi", "Sensor memuat 50 Hz dan 250 Hz. Dipakai fₛ=400 Hz, berapa alias 250 Hz?", "|250−400|=150 Hz, maka filtrasi anti-alias atau peningkatan fₛ diperlukan."], ["Kasus terintegrasi", "Filter rata-rata 2 titik h=[0,5;0,5] dipakai pada x=[2,4,6]. Hitung y.", "Konvolusi linear y=[1,3,5,3] dengan asumsi indeks mulai n=0."], ["Kasus terintegrasi", "Proses y[n]=0,8y[n−1]+0,2x[n] initial rest menerima step. Nilai akhir?", "Karena pole 0,8 stabil, keadaan tunak memenuhi y=0,8y+0,2, maka y=1."]],exam=[["Sampling mengubah dimensi mana?", ["Waktu", "Satuan tegangan", "Jenis sensor", "Penguatan"], "Waktu", "Sampling mendiskritkan indeks waktu; kuantisasi yang membatasi amplitudo."], ["Banyak kode ADC ideal 6-bit?", ["6", "32", "64", "128"], "64", "Jumlah kode adalah 2^6."], ["Jika Tₛ=1 ms, fₛ?", ["100 Hz", "500 Hz", "1000 Hz", "2000 Hz"], "1000 Hz", "fₛ=1/(0,001 s)."], ["x[n−2] menggeser sinyal?", ["Ke kiri 2", "Ke kanan 2", "Tidak berubah", "Mencermin"], "Ke kanan 2", "Delay dua sampel = bergeser kanan."], ["Sistem y[n]=x[n+1] termasuk?", ["Kausal", "Tak kausal", "Memoryless", "Tak linear"], "Tak kausal", "Output saat n bergantung sampel mendatang pada n+1."], ["Konvolusi [1,2,1] dan [1,1]?", ["[1,2,1]", "[1,3,3,1]", "[2,4,2]", "[1,1,1,1]"], "[1,3,3,1]", "Produk diagonal dijumlah pada indeks yang sesuai."], ["Apa DTFT dari δ[n]?", ["0", "1", "ω", "e^(jω)"], "1", "Hanya n=0 berkontribusi."], ["Frekuensi alias 14 Hz bila fₛ=20 Hz?", ["14 Hz", "10 Hz", "6 Hz", "4 Hz"], "6 Hz", "14 Hz dan −6 Hz menghasilkan sampel identik dalam konvensi sinus berfase terkait."], ["Untuk x=[1,2,1], X(0)?", ["2", "3", "4", "0"], "4", "Jumlah seluruh x[n]=4."], ["Transformasi Z dari aⁿu[n]?", ["1/(1−az⁻¹), ROC |z|>|a|", "z−a", "e^(−jω)", "0"], "1/(1−az⁻¹), ROC |z|>|a|", "Deret geometri sisi kanan."], ["Pole kausal z=1,2 menyatakan?", ["Stabil", "Tidak stabil BIBO", "FIR", "Tanpa memori"], "Tidak stabil BIBO", "Unit circle tidak termasuk ROC."], ["Sistem y[n]=0,5y[n−1]+x[n], initial rest dengan input impuls, h[2]?", ["2", "1", "0,5", "0,25"], "0,25", "h[n]=(0,5)^n u[n]."], ["Jika h=[1,−1], H(eʲ0)?", ["0", "1", "2", "−1"], "0", "1−e^(−j0)=0, DC ditolak."], ["ROC 0,3<|z|<1,3 memuat unit circle?", ["Ya", "Tidak", "Hanya jika n=0", "Hanya untuk FIR"], "Ya", "Karena 0,3<1<1,3."], ["Anti-alias analog dipasang?", ["Setelah filter digital", "Setelah DAC", "Sebelum ADC", "Di layar monitor"], "Sebelum ADC", "Komponen >Nyquist harus ditekan sebelum proses sampling."]];
function s8adc(){let f=+$('s8f').value,fs=+$('s8fs').value,bits=+$('s8bits').value,step=2/(Math.pow(2,bits)-1),dense=[],sample=[],quant=[],err=[];
$('s8f').parentElement.childNodes[0].textContent=`Frekuensi f = ${f} Hz`;
$('s8fs').parentElement.childNodes[0].textContent=`Sampling rate fₛ = ${fs} Hz`;
$('s8bits').parentElement.childNodes[0].textContent=`Resolusi ADC = ${bits} bit`;
for(let i=0;i<=600;i++){let t=i/600;dense.push([t,.8*Math.sin(2*pi*f*t)])}
for(let n=0;n<=fs;n++){let t=n/fs,x=.8*Math.sin(2*pi*f*t),q=clamp(Math.round((x+1)/step),0,Math.pow(2,bits)-1)*step-1;sample.push([t,x]);quant.push([t,q]);err.push([n,q-x])}
lineplot('s8adcPlot',[{pts:dense,label:'Analog'},{pts:sample,type:'dots',label:'Sampel',color:'#bf6da5'},{pts:quant,type:'stem',label:'Digital',color:'#148ba9'}],{xmin:0,xmax:1,ymin:-1.15,ymax:1.15});
lineplot('s8adcError',[{pts:err,type:'stem',label:'e[n]'}],{xmin:0,xmax:fs,ymin:-step,ymax:step});
$('s8adcInfo').innerHTML=`Nyquist = <b>${fmt(fs/2,2)} Hz</b>. ${f>=fs/2?'<b>f ≥ fₛ/2, aliasing atau ketidakunikan dapat terjadi.</b>':'f berada di bawah Nyquist untuk satu sinus ini.'} Total kode ADC ${Math.pow(2,bits)}; Δ=${fmt(step,5)} unit. Error kuantisasi ideal ≈ ±Δ/2 dalam rentang tanpa clipping.`;
}
function s8series(){let k=+$('s8delay').value,flip=$('s8flip').value==='yes',base=new Map([[-2,1],[-1,2],[0,0],[1,-1],[2,1]]);
$('s8delay').parentElement.childNodes[0].textContent=`Pergeseran k = ${k}`;
let n=Array.from({length:17},(_,i)=>i-8),original=n.map(i=>[i,base.get(i)||0]),after=n.map(i=>[i,base.get((flip?-1:1)*(i-k))||0]);
lineplot('s8seriesPlot',[{pts:original,type:'stem',label:'x[n]'},{pts:after,type:'stem',label:'y[n]',color:'#cf9135'}],{xmin:-8,xmax:8});
$('s8seriesInfo').innerHTML=`Rumus: y[n]=<b>x[${flip?'−(n−'+k+')':'n−('+k+')'}]</b>. Sampel x[−1]=2 akan tampak di y[${flip?k+1:k-1}]=2. ${flip?'Pencerminan dilakukan lebih dahulu terhadap n=0, kemudian bergeser k.':'Sinyal hanya ditunda/dimajukan k sampel.'}`;
}
function s8conv(){let x=[1,2,1],h=[1,1],y=[1,3,3,1],n=+$('s8convN').value,rows='';
$('s8convN').parentElement.childNodes[0].textContent=`Indeks keluaran n = ${n}`;
for(let k=0;k<3;k++){let hv=h[n-k]??0;rows+=`<tr><td>${k}</td><td>${x[k]}</td><td>${hv}</td><td><b>${x[k]*hv}</b></td></tr>`}
$('s8convRows').innerHTML=rows;
lineplot('s8convPlot',[{pts:[-1,0,1,2,3].map(k=>[k,x[k]??0]),type:'stem',label:'x[k]'},{pts:[-1,0,1,2,3].map(k=>[k,h[n-k]??0]),type:'stem',label:'h[n−k]',color:'#d88d3d'}],{xmin:-1,xmax:3,ymin:0,ymax:2.4});
lineplot('s8convOut',[{pts:y.map((v,n)=>[n,v]),type:'stem',label:'y[n]'}],{xmin:0,xmax:3,ymin:0,ymax:3.6,marker:n});
$('s8convInfo').innerHTML=`Pada n=${n}, y[${n}]=Σₖ x[k]h[${n}−k]=<b>${y[n]}</b>. Pindahkan slider untuk melacak produk sampel demi sampel.`;
}
function s8dtft(){let mode=$('s8filter').value,w=+$('s8omega').value*pi,pts=[],H=omega=>mode==='lp'?mul(C(.5,0),plus(C(1,0),ej(-omega))):minus(C(1,0),ej(-omega));
$('s8omega').parentElement.childNodes[0].textContent=`Frekuensi ω/π = ${fmt(w/pi,2)}`;
for(let i=0;i<=220;i++){let omega=pi*i/220;pts.push([omega/pi,absC(H(omega))])}
let h=H(w),wavesIn=Array.from({length:26},(_,n)=>[n,Math.cos(w*n)]),wavesOut=wavesIn.map(([n])=>[n,absC(h)*Math.cos(w*n+argC(h))]);
lineplot('s8dtftMag',[{pts,label:'|H|'}],{xmin:0,xmax:1,ymin:0,ymax:2.3,marker:w/pi});
lineplot('s8dtftWave',[{pts:wavesIn,label:'Input'},{pts:wavesOut,label:'Output tunak'}],{xmin:0,xmax:25,ymin:-2.3,ymax:2.3});
$('s8dtftInfo').innerHTML=`Filter ${mode==='lp'?'rata-rata 2 titik':'beda pertama'}: pada ω=${fmt(w/pi,2)}π, gain |H|=<b>${fmt(absC(h),4)}</b>; fase ${absC(h)<1e-9?'tak terdefinisi saat H=0':fmt(argC(h),3)+' rad'}.`;
}
function s8pole(){let p=+$('s8pole').value,stable=Math.abs(p)<1,n=Array.from({length:19},(_,i)=>[i,Math.pow(p,i)]);
$('s8pole').parentElement.childNodes[0].textContent=`Pole p = ${fmt(p,2)}`;
zplot('s8pzPlot',p,null,'right');lineplot('s8impulsePlot',[{pts:n,type:'stem',label:'h[n]'}],{xmin:0,xmax:18});
$('s8poleInfo').innerHTML=`ROC kausal |z|&gt;${fmt(Math.abs(p),2)}. <b>${stable?'Stabil BIBO':'Tidak stabil BIBO'}</b>. h[0]=1; h[1]=${fmt(p,2)}; h[2]=${fmt(p*p,3)}. ${stable?'Unit circle berada di ROC.':'Unit circle di luar ROC atau tepat pada batasnya.'}`;
}
[['s8f','input',s8adc],['s8fs','input',s8adc],['s8bits','input',s8adc],['s8delay','input',s8series],['s8flip','change',s8series],['s8convN','input',s8conv],['s8filter','change',s8dtft],['s8omega','input',s8dtft],['s8pole','input',s8pole]].forEach(([id,e,fn])=>$(id).addEventListener(e,fn));
s8adc();s8series();s8conv();s8dtft();s8pole();renderPractice(practice);
// UTS simulation: 35 minutes. Answers are only revealed after submission.
let examAnswers={},examActive=false,examDone=false,timeRemaining=35*60,examTimer=null;
function updateClock(){let m=Math.floor(timeRemaining/60),s=timeRemaining%60;$('simTimer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function startExam(){if(examTimer)clearInterval(examTimer);examAnswers={};examDone=false;examActive=true;timeRemaining=35*60;
$('examIntro').hidden=true;$('examWorkspace').hidden=false;$('examResult').hidden=true;
$('examList').innerHTML=exam.map((t,i)=>`<article class="card"><h3>${i+1}. ${t[0]}</h3><div class="optgrid">${t[1].map((o,j)=>`<button type="button" class="opt exam-option" data-q="${i}" data-choice="${j}" aria-pressed="false">${String.fromCharCode(65+j)}. ${o}</button>`).join('')}</div></article>`).join('');
$('examList').querySelectorAll('.exam-option').forEach(btn=>btn.addEventListener('click',()=>{if(examDone)return;let i=+btn.dataset.q,j=+btn.dataset.choice;examAnswers[i]=j;$('examList').querySelectorAll(`[data-q="${i}"]`).forEach(b=>{b.classList.remove('chosen');b.setAttribute('aria-pressed','false')});btn.classList.add('chosen');btn.setAttribute('aria-pressed','true');$('examProgress').textContent=`${Object.keys(examAnswers).length} dari ${exam.length} dijawab`;}));
$('examProgress').textContent=`0 dari ${exam.length} dijawab`;updateClock();
examTimer=setInterval(()=>{if(!examActive)return;timeRemaining=Math.max(0,timeRemaining-1);updateClock();if(timeRemaining===0)submitExam();},1000);
}
function submitExam(){if(!examActive||examDone)return;examActive=false;examDone=true;if(examTimer)clearInterval(examTimer);examTimer=null;let correct=0,reviews=[];
exam.forEach((t,i)=>{let selected=examAnswers[i],ansIdx=t[1].indexOf(t[2]),ok=selected===ansIdx;if(ok)correct++;reviews.push(`<details><summary>${i+1}. ${t[0]} — <b>${ok?'Benar':'Perlu ditinjau'}</b></summary><p>Jawaban Anda: ${selected===undefined?'Tidak dijawab':t[1][selected]}. <b>Kunci: ${t[2]}</b>.</p><p><b>Pembahasan:</b> ${t[3]}</p></details>`);});
$('examWorkspace').hidden=true;$('examResult').hidden=false;
$('examScore').textContent=`${Math.round(correct*100/exam.length)} / 100`;
$('examCorrect').textContent=`${correct} benar dari ${exam.length} soal. Durasi terpakai ${Math.floor((35*60-timeRemaining)/60)} menit ${((35*60-timeRemaining)%60)} detik.`;
$('examReview').innerHTML=reviews.join('');
$('examResult').scrollIntoView({behavior:'smooth',block:'start'});
}
$('simStart').addEventListener('click',startExam);
$('simSubmit').addEventListener('click',submitExam);
$('simRetry').addEventListener('click',startExam);
updateClock();
