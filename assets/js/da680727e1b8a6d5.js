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


const practice=[["Dasar DTFT", "Apa keluaran DTFT untuk x[n]=δ[n]?", "X(e^{jω})=Σ δ[n]e^{-jωn}=1 untuk semua ω; magnitudo sama dengan 1 dan fase 0."], ["Dasar DTFT", "Jika x[n]=δ[n−2], tentukan spektrum.", "X(e^{jω})=e^{-j2ω}; magnitudo 1, fase −2ω modulo 2π."], ["Dasar DTFT", "Hitung DTFT untuk x[0]=1 dan x[1]=1.", "X=1+e^{-jω}=2e^{-jω/2}cos(ω/2). Untuk −π≤ω≤π, magnitudo 2|cos(ω/2)|."], ["Dasar DTFT", "Untuk x=[1,2,1] mulai n=0, berapa X pada ω=0?", "X(0)=Σ x[n]=1+2+1=4."], ["Dasar DTFT", "Untuk x[n]=[1,−1] mulai n=0, berapa X pada ω=π?", "X=1−e^{-jπ}=1−(−1)=2."], ["Dasar DTFT", "Apa periode X(e^{jω}) terhadap ω?", "Periode 2π karena e^{-j(ω+2π)n}=e^{-jωn} untuk n bilangan bulat."], ["Dasar DTFT", "Apakah DTFT sama dengan DFT?", "Tidak. DTFT fungsi kontinu terhadap frekuensi normalisasi ω dan periodik 2π; DFT memberi nilai pada sejumlah titik diskrit frekuensi."], ["Sifat dan fase", "x[n] ditunda 3 sampel. Apa efek terhadap spektrum?", "Y(e^{jω})=e^{-j3ω}X(e^{jω}); magnitudo sama, fase bergeser −3ω, kecuali titik spektrum nol yang fasenya tidak terdefinisi."], ["Sifat dan fase", "Untuk sinyal real, bagaimana hubungan X(−ω) dan X(ω)?", "X(−ω)=X*(ω); magnitudo genap dan fase bersifat ganjil secara modulo 2π pada titik nonnol."], ["Sifat dan fase", "Jika y[n]=2x[n], bagaimana Y(ω)?", "Y(ω)=2X(ω): magnitudo dua kali, fase sama untuk faktor positif 2."], ["Sifat dan fase", "Untuk x[n]=δ[n]+δ[n−1], cari nilai spektrum pada ω=π.", "X(π)=1+e^{-jπ}=0; sehingga ada null pada frekuensi Nyquist."], ["Sifat dan fase", "Jika sinyal dipantulkan menjadi x[−n], DTFT-nya apa?", "Y(e^{jω})=X(e^{-jω}), yaitu spektrum frekuensi terbalik."], ["Sifat dan fase", "Untuk dua deret x dan h dikonvolusikan, apa Y pada ranah frekuensi?", "Y(e^{jω})=X(e^{jω})H(e^{jω}) ketika DTFT yang terkait terdefinisi."], ["Filter dan LTI", "Filter rata-rata 2 tap: h=[0,5;0,5]. Berapa gain pada ω=0?", "H(0)=0,5+0,5=1: komponen DC lolos."], ["Filter dan LTI", "Filter rata-rata 2 tap: berapa gain pada ω=π?", "H(π)=0,5(1+e^{-jπ})=0: komponen berubah tanda tiap sampel diredam."], ["Filter dan LTI", "Filter beda pertama h=[1,−1]: berapa H(0)?", "H(0)=1−1=0; sinyal konstan dihilangkan."], ["Filter dan LTI", "Filter beda pertama h=[1,−1]: berapa |H(π)|?", "|1−e^{-jπ}|=|2|=2; perubahan cepat diperkuat relatif terhadap DC."], ["Filter dan LTI", "Sinyal cosinus amplitudo 3 masuk LTI dengan |H(ω₀)|=0,4. Amplitudo keluaran tunak?", "Amplitudo keluaran tunak 3×0,4=1,2 dengan pergeseran fase sebesar arg H(ω₀)."], ["Filter dan LTI", "Pada h[n]=(0,5)^n u[n], berapa H(0)?", "H(0)=Σ(0,5)^n=1/(1−0,5)=2; konvergen karena |0,5|<1."], ["Filter dan LTI", "Mengapa magnitude spektrum berbeda dengan phase spektrum?", "Magnitudo menunjukkan penguatan komponen frekuensi; fase menunjukkan pergeseran relatif. Keduanya diperlukan untuk merekonstruksi sinyal dengan tepat."], ["Sampling", "Untuk fs=20 Hz, berapa frekuensi Nyquist?", "fN=fs/2=10 Hz; agar rekonstruksi unik sinyal harus dibatasi pita secara tepat di bawah ambang ini dalam praktik."], ["Sampling", "Sinus 14 Hz disampling pada fs=20 Hz. Frekuensi alias positif terendah?", "14−20=−6 Hz, sehingga frekuensi alias teramati besarnya 6 Hz (dengan pembalikan fase terkait tanda)."], ["Sampling", "Sinyal 3 Hz disampling 20 Hz: berapa ω₀ dalam rad/sampel?", "ω₀=2πf/fs=2π×3/20=0,3π rad/sampel."], ["Sampling", "Mengapa diperlukan filter anti-alias sebelum ADC?", "Mencegah komponen di atas fs/2 terlipat ke pita dasar dan tak dapat dibedakan dari komponen sinyal asli."], ["Sampling", "Jika interval sampling 2 ms, berapa fs?", "fs=1/(0,002)=500 sampel/detik."], ["Sampling", "Sinus 5 Hz disampling 10 Hz tepat batas Nyquist. Apakah semua informasi pasti bisa pulih?", "Tidak dijamin pada batas; misalnya sin(2π·5n/10)=sin(πn)=0 untuk semua n jika fasenya nol."], ["Sampling", "Apa arti rekonstruksi ideal dari sampel?", "Dalam kondisi pita-terbatas <fs/2 dan sampling ideal, sinyal kontinu asli dapat dipulihkan dengan interpolasi sinc ideal (sifat matematis, bukan filter praktis langsung)."], ["Sampling", "Apakah menaikkan resolusi bit ADC otomatis menghilangkan aliasing?", "Tidak. Resolusi bit memengaruhi langkah kuantisasi, sedangkan aliasing disebabkan sampling dalam waktu dan spektrum masukan di atas fs/2."]],exam=[["X(e^{jω}) untuk δ[n] adalah ...", ["1", "e^jω", "0", "ω"], "1", "Hanya n=0 yang menyumbang nilai 1."], ["Pergeseran x[n−k] pada DTFT menghasilkan ...", ["X(ω+k)", "e^(−jωk)X(ω)", "kX(ω)", "e^(jωk)X(ω)"], "e^(−jωk)X(ω)", "Pergeseran waktu menghasilkan fase linear negatif."], ["Nyquist bagi fs=24 Hz adalah ...", ["48 Hz", "12 Hz", "6 Hz", "24 Hz"], "12 Hz", "fs dibagi dua."], ["Filter h=[1,−1] paling kuat menolak ...", ["DC", "Nyquist", "semua frekuensi", "tidak ada"], "DC", "H(0)=1−1=0."], ["Frekuensi alias positif dari 17 Hz pada fs=20 Hz adalah ...", ["3 Hz", "17 Hz", "10 Hz", "7 Hz"], "3 Hz", "17−20=−3, besarnya 3 Hz."], ["Sistem LTI steady-state memengaruhi sinusoid lewat ...", ["gain dan fase", "mengubah frekuensi selalu", "hanya DC", "kuantisasi"], "gain dan fase", "Gain adalah |H|, fase adalah arg H di ω masukan."]];
function getSignal5(){let mode=$('s5mode').value,N=+$('s5N').value,a=+$('s5a').value;
if(mode==='imp')return [1];if(mode==='two')return [1,1];if(mode==='three')return [1,2,1];if(mode==='difference')return [1,-1];
if(mode==='exp')return Array.from({length:N},(_,n)=>Math.pow(a,n));
return Array.from({length:N},(_,n)=>Math.cos(Math.PI*a*n));}
function dtft5(x,w){let s=C();for(let n=0;n<x.length;n++){s=plus(s,C(x[n]*Math.cos(w*n),-x[n]*Math.sin(w*n)))}return s;}
function s5spectrum(){let x=getSignal5(),w=+$('s5w').value*pi,a=+$('s5a').value,N=+$('s5N').value,mode=$('s5mode').value;
$('s5a').parentElement.childNodes[0].textContent=`Parameter a / ω₀: ${fmt(a,2)}${mode==='cos'?'π rad/sampel':''}`;
$('s5N').parentElement.childNodes[0].textContent=`Jumlah sampel N: ${N}`;
$('s5w').parentElement.childNodes[0].textContent=`Pengamat ω/π: ${fmt(w/pi,2)}`;
$('s5form').innerHTML='x[n]=['+x.map(v=>fmt(v,2)).join(', ')+'] untuk n=0..'+(x.length-1);
let z=dtft5(x,w);$('s5num').textContent=`ω = ${fmt(w/pi,2)}π rad/sampel\nRe X = ${fmt(z.re,4)}; Im X = ${fmt(z.im,4)}\n|X| = ${fmt(absC(z),4)}; fase = ${absC(z)<1e-7?'tak terdefinisi':fmt(argC(z),4)+' rad'}`;
let ma=[],ph=[];for(let i=0;i<=240;i++){let q=(i/120-1)*pi,u=dtft5(x,q);ma.push([q/pi,absC(u)]);ph.push([q/pi,absC(u)<1e-6?NaN:argC(u)]);}
lineplot('s5mag',[{pts:ma,label:'|X|'}],{xmin:-1,xmax:1,ymin:0,marker:w/pi});lineplot('s5phase',[{pts:ph,label:'∠X'}],{xmin:-1,xmax:1,ymin:-pi,ymax:pi,marker:w/pi});
lineplot('s5sequence',[{pts:x.map((v,n)=>[n,v]),type:'stem',label:'x[n]'}],{xmin:-0.5,xmax:Math.max(3,x.length-0.5)});}
function s5shift(){let k=+$('s5delay').value,A=+$('s5gain').value,mm=[],mm2=[],ph=[],ph2=[];
$('s5delay').parentElement.childNodes[0].textContent=`Delay k: ${k}`;$('s5gain').parentElement.childNodes[0].textContent=`Gain A: ${fmt(A,2)}`;
for(let i=0;i<=240;i++){let w=(i/120-1)*pi,z=dtft5([1,2,1],w),p=mul(C(A,0),mul(ej(-k*w),z));mm.push([w/pi,absC(z)]);mm2.push([w/pi,absC(p)]);ph.push([w/pi,absC(z)<1e-6?NaN:argC(z)]);ph2.push([w/pi,absC(p)<1e-6?NaN:argC(p)]);}
lineplot('s5shiftMag',[{pts:mm,label:'Asli'},{pts:mm2,label:'Geser × gain'}],{xmin:-1,xmax:1,ymin:0});lineplot('s5shiftPhase',[{pts:ph,label:'Fase asli'},{pts:ph2,label:'Fase geser'}],{xmin:-1,xmax:1,ymin:-pi,ymax:pi});
$('s5shiftInfo').innerHTML=`y[n]=${fmt(A,2)}x[n−${k}] memiliki sampel tak nol di indeks n=${k}, ${k+1}, ${k+2}. Magnitudo <b>${A===1?'identik dengan':'sebesar '+fmt(A,2)+'× magnitudo'}</b> sinyal asal; tambahan fase = <b>−${k}ω</b>.`;
}
function H5(w){let type=$('s5filter').value,a=+$('s5fa').value,z=ej(-w);
if(type==='avg2')return mul(C(.5,0),plus(C(1,0),z));
if(type==='avg3')return mul(C(1/3,0),plus(plus(C(1,0),z),mul(z,z)));
if(type==='diff')return minus(C(1,0),z);
return div(C(1-a,0),minus(C(1,0),mul(C(a,0),z)));}
function s5filter(){let type=$('s5filter').value,a=+$('s5fa').value,w0=+$('s5fw').value*pi,mag=[],h0=H5(w0);let formula={avg2:'H(eʲω)=½(1+e⁻ʲω)',avg3:'H(eʲω)=⅓(1+e^(−jω)+e^(−j2ω))',diff:'H(eʲω)=1−e⁻ʲω',iir:'H(eʲω)=(1−a)/(1−ae⁻ʲω)'};
$('s5fa').parentElement.childNodes[0].textContent=`Koefisien a untuk IIR: ${fmt(a,2)}`;$('s5fw').parentElement.childNodes[0].textContent=`Frekuensi masukan ω₀/π: ${fmt(w0/pi,2)}`;
$('s5Hform').textContent=formula[type];for(let i=0;i<=250;i++){let q=i/250*pi;mag.push([q/pi,absC(H5(q))]);}
let ix=[],iy=[];for(let n=0;n<=35;n++){ix.push([n,Math.cos(w0*n)]);iy.push([n,absC(h0)*Math.cos(w0*n+argC(h0))]);}
lineplot('s5filterMag',[{pts:mag,label:'|H|'}],{xmin:0,xmax:1,ymin:0,marker:w0/pi});lineplot('s5wave',[{pts:ix,label:'Input cos'},{pts:iy,label:'Output tunak'}],{xmin:0,xmax:35});
$('s5filterInfo').innerHTML=`Pada ω₀=${fmt(w0/pi,2)}π rad/sampel: |H|=<b>${fmt(absC(h0),3)}</b> dan fase=${fmt(argC(h0),3)} rad. Untuk input cos(ω₀n), output tunaknya |H|cos(ω₀n+∠H).`;
}
function s5alias(){let f=+$('s5f').value,fs=+$('s5fs').value,fa=f-Math.round(f/fs)*fs,ny=fs/2,analog=[],samples=[],alias=[];
$('s5f').parentElement.childNodes[0].textContent=`Frekuensi analog f: ${f} Hz`;$('s5fs').parentElement.childNodes[0].textContent=`Sampling rate fₛ: ${fs} Hz`;
for(let i=0;i<=600;i++){let t=i/600;analog.push([t,Math.sin(2*pi*f*t)]);alias.push([t,Math.sin(2*pi*fa*t)]);}
for(let n=0;n<=fs;n++){let t=n/fs;samples.push([t,Math.sin(2*pi*f*t)]);}
lineplot('s5alias',[{pts:analog,label:'Analog asli'},{pts:alias,label:'Model alias',dash:true},{pts:samples,label:'Cuplikan',type:'dots',color:'#a64a9d'}],{xmin:0,xmax:1,ymin:-1.2,ymax:1.2});
lineplot('s5aliasFreq',[{pts:[[f,1]],type:'stem',label:'f analog'},{pts:[[Math.abs(fa),.7]],type:'stem',label:'|f alias|',color:'#13a68a'},{pts:[[ny,1.1]],type:'stem',label:'Nyquist',color:'#e6a13e'}],{xmin:0,xmax:Math.max(30,f+3,ny+3),ymin:0,ymax:1.4});
let safe=f<ny,limit=f===ny;
$('s5aliasInfo').innerHTML=`Tₛ=<b>${fmt(1000/fs,2)} ms</b>, ω₀=<b>${fmt(2*pi*f/fs,3)} rad/sampel</b>, f<sub>Nyquist</sub>=<b>${fmt(ny,1)} Hz</b>. Frekuensi alias dasar = <b>${fmt(Math.abs(fa),2)} Hz</b>. ${safe?'<span class="pill">Sinyal berada di bawah Nyquist</span>':limit?'<span class="pill bad">Tepat pada batas Nyquist</span>':'<span class="pill bad">Terjadi aliasing untuk sinus ini</span>'}.`;
}
[['s5mode','change',s5spectrum],['s5a','input',s5spectrum],['s5N','input',s5spectrum],['s5w','input',s5spectrum],['s5delay','input',s5shift],['s5gain','input',s5shift],['s5filter','change',s5filter],['s5fa','input',s5filter],['s5fw','input',s5filter],['s5f','input',s5alias],['s5fs','input',s5alias]].forEach(([id,evt,fn])=>$(id).addEventListener(evt,fn));
s5spectrum();s5shift();s5filter();s5alias();renderPractice(practice);renderTest(exam);
