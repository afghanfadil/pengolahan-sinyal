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


const practice=[["Sifat Z", "Apa definisi transformasi Z bilateral?", "X(z)=Σ dari n=−∞ sampai ∞ x[n]z^(−n). Bentuk aljabar dan ROC diperlukan agar pasangan transformasi lengkap."], ["Sifat Z", "x[n]=δ[n−3]. Tentukan X(z) dan ROC.", "X(z)=z⁻³; terdefinisi untuk z≠0."], ["Sifat Z", "Jika Y(z)=z⁻²X(z), apa operasi waktunya?", "y[n]=x[n−2], tunda dua sampel (bilateral Z). ROC umumnya sama kecuali kemungkinan z=0/∞."], ["Sifat Z", "Jika y[n]=x[n+2], tentukan Y(z).", "Y(z)=z²X(z). Pergeseran ke kiri 2 sampel dengan definisi bilateral."], ["Sifat Z", "Jika x[n]=0,4ⁿu[n], hitung X(z).", "X(z)=1/(1−0,4z⁻¹), ROC |z|>0,4."], ["Sifat Z", "Bagaimana transformasi Z dari cⁿ x[n]?", "Z{cⁿx[n]}=X(z/c) untuk c≠0; ROC ikut diskalakan oleh |c|."], ["Sifat Z", "Jika x[n] dan h[n] konvolusi, apa Y(z)?", "Y(z)=X(z)H(z) pada ROC yang sesuai, bukan hanya mengalikan fungsi dan mengabaikan ROC."], ["Sifat Z", "Apa transformasi Z dari n x[n]?", "Z{n x[n]}=−z dX(z)/dz bila diferensiasi deret sah dalam ROC."], ["ROC dua sisi", "Untuk a=0,3; b=1,2 dan x[n]=aⁿu[n]−bⁿu[−n−1], tulis ROC.", "Term kanan: |z|>0,3, term kiri: |z|<1,2. Irisan ROC: 0,3<|z|<1,2."], ["ROC dua sisi", "Apakah unit circle termasuk ROC 0,3<|z|<1,2?", "Ya, karena 0,3<1<1,2. Dengan konvergensi absolut, DTFT dapat diperoleh dari z=eʲω."], ["ROC dua sisi", "Apakah unit circle termasuk ROC 0,3<|z|<0,8?", "Tidak, sebab 1>0,8. DTFT dua-sisi tidak diperoleh dari unit circle pada ROC tersebut."], ["ROC dua sisi", "Jika dua ROC parsial tidak beririsan, apa artinya?", "Penjumlahan transformasi harus dianalisis terpisah; tidak ada ROC bersama untuk representasi deret absolut-konvergen dari kedua komponen."], ["ROC dua sisi", "Bolehkah ROC memuat sebuah pole?", "Tidak. Pole adalah lokasi fungsi rasional tidak berhingga; ROC tidak memuat pole tak dibatalkan."], ["ROC dua sisi", "Jika X(z)=z/(z−a), apakah X(z) menentukan x[n] secara unik?", "Tidak. ROC |z|>|a| memberi aⁿu[n], sedangkan ROC |z|<|a| memberi −aⁿu[−n−1]."], ["Pecahan parsial", "H(z)=1/[(1−0,2z⁻¹)(1−0,7z⁻¹)]. Tuliskan h[0].", "Untuk masukan impuls initial rest, h[0]=1, terlihat dari persamaan beda atau konvolusi dua urutan geometri."], ["Pecahan parsial", "Untuk H yang sama, hitung h[1].", "h[1]=0,2+0,7=0,9 (dua jalur n=1 dari konvolusi deret geometri)."], ["Pecahan parsial", "H(z)=1/[(1−0,2z⁻¹)(1−0,7z⁻¹)], cari A dan B untuk A/(1−0,2z⁻¹)+B/(1−0,7z⁻¹).", "A=0,2/(0,2−0,7)=−0,4; B=0,7/(0,7−0,2)=1,4. Jadi h[n]=(−0,4·0,2ⁿ+1,4·0,7ⁿ)u[n]."], ["Pecahan parsial", "Apa respons impuls ketika H(z)=1/(1−0,5z⁻¹)²?", "h[n]=(n+1)(0,5)ⁿu[n], karena pole berulang orde 2."], ["Pecahan parsial", "Jika sistem kausal memiliki pole 0,4 dan 0,9, apakah stabil?", "Ya jika tidak ada pole tambahan pada/di luar lingkaran satuan dan sistem minimal; keduanya memiliki magnitudo <1."], ["Pecahan parsial", "Apakah perubahan amplitudo numerator menggeser semua pole?", "Tidak. Pole berasal dari denominator setelah pembatalan faktor umum. Numerator umumnya memengaruhi zero dan gain."], ["Persamaan beda", "Dari H(z)=1/[(1−az⁻¹)(1−bz⁻¹)], tulis persamaan beda.", "y[n]−(a+b)y[n−1]+ab y[n−2]=x[n] untuk keadaan awal diam (initial rest)."], ["Persamaan beda", "Untuk a=0,2 dan b=0,7, hitung h[2].", "h[2]=(a+b)h[1]−ab h[0]=(0,9)(0,9)−(0,14)(1)=0,67."], ["Persamaan beda", "Untuk y[n]=0,5y[n−1]+x[n], x[n]=u[n], y[−1]=0, hitung y[2].", "y[0]=1; y[1]=1,5; y[2]=1,75."], ["Persamaan beda", "Untuk y[n]=1,1y[n−1]+x[n] (initial rest), apakah stabil BIBO?", "Tidak. Pole 1,1 menyebabkan respons impuls 1,1ⁿu[n] tidak absolut-terjumlah."], ["Persamaan beda", "Apakah fungsi alih zero-state berlaku sama untuk kondisi awal bukan nol?", "Fungsi alih H(z)=Y(z)/X(z) didefinisikan untuk kondisi awal nol; respons total dengan kondisi awal bukan nol harus mencakup respons keadaan awal."], ["Persamaan beda", "Bagaimana cek angka y[0] dari sistem dua pole saat impuls masuk?", "Dengan initial rest dan x[0]=1, y[−1]=y[−2]=0, jadi y[0]=1."], ["Stabilitas & kasus", "Mengapa pole dekat lingkaran satuan membuat respons transien panjang?", "Faktor |p|ⁿ mereda lebih lambat jika |p| mendekati 1 dari bawah."], ["Stabilitas & kasus", "Apa arti pole di z=−0,8 pada respons waktu?", "Respons homogen memuat (−0,8)ⁿ: amplitudonya berkurang tetapi bertukar tanda setiap sampel."], ["Stabilitas & kasus", "Apa syarat sistem rasional minimal kausal stabil BIBO?", "Semua pole berhingga harus berada ketat di dalam unit circle |z|<1."], ["Stabilitas & kasus", "Pada kendali motor, keluaran berosilasi teredam. Pole seperti apa yang mungkin?", "Pole kompleks konjugat di dalam unit circle menyebabkan osilasi teredam; sudut menentukan frekuensi osilasi, radius menentukan redam."]],exam=[["ROC untuk 0,4ⁿu[n]?", ["|z|>0,4", "|z|<0,4", "Semua z", "|z|=0,4"], "|z|>0,4", "Deret geometri sisi kanan konvergen bila |0,4/z|<1."], ["Z{x[n−2]} pada bilateral Z?", ["z²X(z)", "z⁻²X(z)", "−2X(z)", "X(z)²"], "z⁻²X(z)", "Delay dua sampel memberi faktor z⁻²."], ["ROC X(z) dengan pole 0,2 dan 1,4 untuk sinyal dua sisi?", ["0,2<|z|<1,4", "|z|>1,4", "|z|<0,2", "|z|=1"], "0,2<|z|<1,4", "Wilayah annulus adalah irisan ROC masing-masing sisi."], ["Untuk H=1/[(1−0,2z⁻¹)(1−0,7z⁻¹)], h[1]?", ["0,14", "0,9", "1,0", "1,4"], "0,9", "Konvolusi dua respons geometri memberi h[1]=a+b=0,9."], ["H(z)=1/(1−0,5z⁻¹)² memiliki h[n]?", ["0,5ⁿu[n]", "(n+1)0,5ⁿu[n]", "n0,5ⁿu[n]", "δ[n]"], "(n+1)0,5ⁿu[n]", "Pole berulang orde dua menghasilkan faktor n+1."], ["Sistem kausal minimal dengan pole 1,1 adalah?", ["Stabil BIBO", "Tidak stabil BIBO", "Tanpa memori", "Tidak linear"], "Tidak stabil BIBO", "Pole di luar unit circle membuat respons impuls tidak absolut-terjumlah."], ["Rumus H dua pole menghasil persamaan beda?", ["y[n]−(a+b)y[n−1]+ab y[n−2]=x[n]", "y[n]=x[n−1]", "y[n]+a y[n−1]=0", "y[n]=a+b"], "y[n]−(a+b)y[n−1]+ab y[n−2]=x[n]", "Kalikan Y(z) dengan (1−az⁻¹)(1−bz⁻¹)."], ["Z{nx[n]} terkait turunan adalah?", ["z dX/dz", "−z dX/dz", "X(z²)", "X(z)/z"], "−z dX/dz", "Turunkan z^−n: z(d/dz) z^−n = −n z^−n."]];
function s7shift(){let k=+$('s7shift').value,c=+$('s7gain').value,ref=new Map([[0,1],[1,2],[2,1]]);
$('s7shift').parentElement.childNodes[0].textContent=`Delay k = ${k}`;
$('s7gain').parentElement.childNodes[0].textContent=`Faktor c = ${fmt(c,2)}`;
let x=Array.from({length:14},(_,i)=>[i-5,ref.get(i-5)||0]),
y=Array.from({length:14},(_,i)=>{let n=i-5;return[n,Math.pow(c,n)*(ref.get(n-k)||0)]});
lineplot('s7shiftPlot',[{pts:x,type:'stem',label:'Asli x[n]'},{pts:y,type:'stem',label:'y[n]',color:'#de8c36'}],{xmin:-5,xmax:8});
$('s7shiftInfo').innerHTML=`y[n]=(${fmt(c,2)})ⁿ x[n−(${k})]. Dukungan sampel nonnol pindah ke <b>n=${k},${k+1},${k+2}</b>. Transformasi bilateral Z: Y(z)=cᵏ X(z/c)z⁻ᵏ. Faktor tambahan cᵏ muncul karena scaling dilakukan setelah shifting.`;
}
function s7annulus(){let a=+$('s7inner').value,b=+$('s7outer').value,svg=$('s7annulus'),cx=310,cy=113,S=72;
$('s7inner').parentElement.childNodes[0].textContent=`Pole dalam a = ${fmt(a,2)}`;
$('s7outer').parentElement.childNodes[0].textContent=`Pole luar b = ${fmt(b,2)}`;
const xy=v=>cx+v*S;
let t=`<defs><mask id="annmask"><rect width="620" height="225" fill="white"/><circle cx="${cx}" cy="${cy}" r="${a*S}" fill="black"/></mask></defs><rect width="620" height="225" fill="#fcfdff"/><circle cx="${cx}" cy="${cy}" r="${b*S}" fill="#d7f1fd" mask="url(#annmask)"/><line x1="75" x2="550" y1="${cy}" y2="${cy}" stroke="#9ba9c0"/><line x1="${cx}" x2="${cx}" y1="4" y2="222" stroke="#9ba9c0"/><circle cx="${cx}" cy="${cy}" r="${S}" fill="none" stroke="#8562d5" stroke-dasharray="6 4" stroke-width="2"/>`;
for(let [value,color,label] of [[a,'#c2587a','a'],[b,'#bd6348','b']]){let x=xy(value);t+=`<path d="M${x-6} ${cy-6}l12 12 M${x-6} ${cy+6}l12 -12" stroke="${color}" stroke-width="3"/><text x="${x+9}" y="${cy-12}" fill="${color}" font-size="12">${label}=${fmt(value,2)}</text>`;}
t+=`<text x="400" y="24" fill="#7c61bc" font-size="12">Unit circle |z|=1</text><text x="120" y="208" fill="#2776a6" font-size="12">Area biru: ${fmt(a,2)} &lt; |z| &lt; ${fmt(b,2)}</text>`;
svg.innerHTML=t;
let seq=Array.from({length:15},(_,i)=>{let n=i-7;return[n,n>=0?Math.pow(a,n):-Math.pow(b,n)]});
lineplot('s7twosided',[{pts:seq,type:'stem',label:'x[n]'}],{xmin:-7,xmax:7});
$('s7rocInfo').innerHTML=`ROC: <b>${fmt(a,2)} &lt; |z| &lt; ${fmt(b,2)}</b>. Lingkaran satuan ${b>1?'<b>termasuk</b> ROC sehingga DTFT ada.':'<b>tidak termasuk</b> ROC sehingga DTFT tidak tersedia sebagai deret absolut-konvergen.'} Kedua pole tidak termasuk ROC.`;
}
function plot2pole(a,b){let svg=$('s7polePlot'),cx=310,cy=113,S=82;let t=`<rect width="620" height="225" fill="#fcfdff"/><line x1="60" x2="560" y1="${cy}" y2="${cy}" stroke="#8e9db5"/><line x1="${cx}" x2="${cx}" y1="8" y2="220" stroke="#8e9db5"/><circle cx="${cx}" cy="${cy}" r="${S}" stroke="#8a6fda" fill="none" stroke-dasharray="5 4" stroke-width="2"/>`;
[[a,'a','#ca5a7b'],[b,'b','#19a3b9']].forEach(([p,label,color],i)=>{let x=cx+p*S;t+=`<path d="M${x-6} ${cy-6}l12 12 M${x-6} ${cy+6}l12 -12" stroke="${color}" stroke-width="3"/><text x="${x+9}" y="${cy-16-i*18}" font-size="12" fill="${color}">${label}=${fmt(p,2)}</text>`;});
svg.innerHTML=t;
}
function coefficients7(){return{a:+$('s7a').value,b:+$('s7b').value}}
function h7(n,a,b){if(n<0)return 0;if(Math.abs(a-b)<1e-8)return (n+1)*Math.pow(a,n);return (Math.pow(a,n+1)-Math.pow(b,n+1))/(a-b)}
function s7partial(){let {a,b}=coefficients7(),same=Math.abs(a-b)<1e-8,A=same?null:a/(a-b),B=same?null:b/(b-a);
$('s7a').parentElement.childNodes[0].textContent=`Pole a = ${fmt(a,2)}`;
$('s7b').parentElement.childNodes[0].textContent=`Pole b = ${fmt(b,2)}`;
plot2pole(a,b);lineplot('s7impulsePlot',[{pts:Array.from({length:19},(_,n)=>[n,h7(n,a,b)]),type:'stem',label:'h[n]'}],{xmin:0,xmax:18});
$('s7partialInfo').innerHTML=same?`<b>Pole berulang:</b> a=b=${fmt(a,2)}; h[n]=(n+1)(${fmt(a,2)})ⁿu[n]. Sistem kausal stabil selama |a|&lt;1.`:`A=<b>${fmt(A,3)}</b>, B=<b>${fmt(B,3)}</b>. h[n]=A(${fmt(a,2)})ⁿ+B(${fmt(b,2)})ⁿ untuk n≥0. ROC kausal |z|&gt;${fmt(Math.max(Math.abs(a),Math.abs(b)),2)}; kedua pole di dalam unit circle.`;
s7diff();}
function s7diff(){let {a,b}=coefficients7(),mode=$('s7input').value,x=[],y=[],rows='';
for(let n=0;n<18;n++){let xi=mode==='imp'?(n===0?1:0):mode==='step'?1:n<4?1:0,
p1=n>0?y[n-1]:0,p2=n>1?y[n-2]:0,yi=(a+b)*p1-a*b*p2+xi;
x.push(xi);y.push(yi);
if(n<9)rows+=`<tr><td>${n}</td><td>${fmt(xi,2)}</td><td>${fmt(p1,3)}</td><td>${fmt(p2,3)}</td><td><b>${fmt(yi,4)}</b></td></tr>`;}
$('s7diffRows').innerHTML=rows;
lineplot('s7differencePlot',[{pts:x.map((v,n)=>[n,v]),type:'stem',label:'x[n]'},{pts:y.map((v,n)=>[n,v]),label:'y[n]',color:'#d8873d'}],{xmin:0,xmax:17});
$('s7diffInfo').innerHTML=`Koefisien: (a+b)=<b>${fmt(a+b,2)}</b>, ab=<b>${fmt(a*b,2)}</b>. y[0]=${fmt(y[0],3)}, y[1]=${fmt(y[1],3)}, y[2]=${fmt(y[2],3)}. Contoh perhitungan menggunakan kondisi awal nol.`;
}
function s7stable(){let p=+$('s7stableP').value,mode=$('s7stableInput').value,arr=[],y=0;
$('s7stableP').parentElement.childNodes[0].textContent=`Pole p = ${fmt(p,2)}`;
for(let n=0;n<=20;n++){let x=mode==='imp'?(n===0?1:0):1;y=p*y+x;arr.push([n,y])}
lineplot('s7stablePlot',[{pts:arr,type:'stem',label:'y[n]'}],{xmin:0,xmax:20});
$('s7stableInfo').innerHTML=`ROC kausal |z|&gt;${fmt(Math.abs(p),2)}. ${Math.abs(p)<1?'<b>Stabil BIBO</b>: pole berada ketat di dalam lingkaran satuan.':'<b>Tidak stabil BIBO</b>: |p|≥1; unit circle tidak berada di dalam ROC.'} y[0]=${fmt(arr[0][1],3)}, y[10]=${fmt(arr[10][1],3)}, y[20]=${fmt(arr[20][1],3)}.`;
}
[['s7shift','input',s7shift],['s7gain','input',s7shift],['s7inner','input',s7annulus],['s7outer','input',s7annulus],['s7a','input',s7partial],['s7b','input',s7partial],['s7input','change',s7diff],['s7stableP','input',s7stable],['s7stableInput','change',s7stable]].forEach(([id,e,fn])=>$(id).addEventListener(e,fn));
s7shift();s7annulus();s7partial();s7stable();renderPractice(practice);renderTest(exam);
