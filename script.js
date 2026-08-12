const body=document.body,intro=document.getElementById('intro'),skip=document.getElementById('skipIntro'),introVideo=intro.querySelector('video'),introCanvas=document.getElementById('introTntCanvas');
// The page is the backdrop of the transparent TNT intro, so reveal it immediately.
body.classList.add('intro-active','page-ready');
let introFrame=0;
function chromaFrame(video,canvas){const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!canvas.width){canvas.width=640;canvas.height=360}ctx.drawImage(video,0,0,canvas.width,canvas.height);const frame=ctx.getImageData(0,0,canvas.width,canvas.height),p=frame.data;for(let i=0;i<p.length;i+=4){const r=p[i],g=p[i+1],b=p[i+2],dominance=g-Math.max(r,b);if(g>95&&dominance>20){p[i+3]=Math.max(0,255-(dominance-20)*9)}}ctx.putImageData(frame,0,0);return ctx}
function finishIntro(){cancelAnimationFrame(introFrame);introVideo.pause();intro.classList.add('done');body.classList.remove('intro-active');body.classList.add('page-ready')}
function runIntro(){const paint=()=>{if(introVideo.paused||introVideo.ended){finishIntro();return}chromaFrame(introVideo,introCanvas);introFrame=requestAnimationFrame(paint)};introVideo.currentTime=0;introVideo.play().then(paint).catch(finishIntro)}
if(matchMedia('(prefers-reduced-motion: reduce)').matches) finishIntro(); else runIntro();
skip.addEventListener('click',finishIntro);

document.querySelectorAll('details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('details').forEach(other=>{if(other!==item)other.open=false})}));

(function buildCornerSteve(){
 const container=document.getElementById('steveModel');if(!container)return;const S=3,SKIN='assets/app/steve_skin.png';
 function faceStyle(ux,uy,uw,uh,w,h){const sx=(w/(uw*S))*64*S,sy=(h/(uh*S))*64*S;return`background-image:url('${SKIN}');background-size:${sx}px ${sy}px;background-position:${-(ux*S*(w/(uw*S)))}px ${-(uy*S*(h/(uh*S)))}px;image-rendering:pixelated;`}
 function box(parent,x,y,z,w,h,d,uv){const el=document.createElement('div');el.className='s-box';el.style.cssText=`width:${w}px;height:${h}px;transform:translate3d(${x}px,${y}px,${z}px);transform-style:preserve-3d;`;[{w,h,t:`translateZ(${d/2}px)`,u:uv.front},{w,h,t:`translateZ(${-d/2}px) rotateY(180deg)`,u:uv.back},{w:d,h,t:`translateX(${-d/2}px) rotateY(-90deg)`,u:uv.left},{w:d,h,t:`translateX(${w-d/2}px) rotateY(90deg)`,u:uv.right},{w,h:d,t:`translateY(${-d/2}px) rotateX(90deg)`,u:uv.top},{w,h:d,t:`translateY(${h-d/2}px) rotateX(-90deg)`,u:uv.bottom}].forEach(f=>{const q=document.createElement('div');q.className='s-face';q.style.cssText=`width:${f.w}px;height:${f.h}px;transform:${f.t};${faceStyle(...f.u,f.w,f.h)}`;el.appendChild(q)});parent.appendChild(el);return el}
 const HW=48,HH=48,CX=24;const headPivot=document.createElement('div');headPivot.className='s-box';headPivot.style.cssText='width:0;height:0;transform:translate3d(48px,48px,-24px);transform-style:preserve-3d;';box(headPivot,-24,-48,0,48,48,48,{front:[8,8,8,8],back:[24,8,8,8],left:[16,8,8,8],right:[0,8,8,8],top:[8,0,8,8],bottom:[16,0,8,8]});container.appendChild(headPivot);
 box(container,CX,HH,-12,48,72,24,{front:[20,20,8,12],back:[32,20,8,12],left:[16,20,4,12],right:[28,20,4,12],top:[20,16,8,4],bottom:[28,16,8,4]});
 const armUv={front:[44,20,4,12],back:[52,20,4,12],left:[48,20,4,12],right:[40,20,4,12],top:[44,16,4,4],bottom:[48,16,4,4]},legUv={front:[4,20,4,12],back:[12,20,4,12],left:[8,20,4,12],right:[0,20,4,12],top:[4,16,4,4],bottom:[8,16,4,4]};box(container,0,48,-12,24,72,24,armUv);box(container,75,48,-12,24,72,24,armUv);box(container,24,120,-12,24,72,24,legUv);box(container,48,120,-12,24,72,24,legUv);
 document.querySelectorAll('.skin-preview').forEach(preview=>{const clone=container.cloneNode(true);clone.removeAttribute('id');clone.classList.add('steve-model');preview.appendChild(clone)});
 const featureModel=document.getElementById('featureSteveModel');if(featureModel){const clone=container.cloneNode(true);clone.id='featureSteveModel';featureModel.replaceWith(clone)}
 let yaw=0,pitch=0,ty=0,tp=0;document.addEventListener('mousemove',e=>{const r=document.getElementById('corner-steve').getBoundingClientRect(),dx=e.clientX-(r.left+40),dy=e.clientY-(r.top+22);ty=Math.max(-55,Math.min(55,Math.atan2(dx,350)*180/Math.PI));tp=Math.max(-28,Math.min(28,-Math.atan2(dy,350)*180/Math.PI))});
 (function animate(){const nervous=document.getElementById('corner-steve').classList.contains('nervous'),shake=nervous?Math.sin(Date.now()/35)*18:0;yaw+=(ty-yaw)*.1;pitch+=(tp-pitch)*.1;container.style.transform=`rotateY(${(-18+yaw*.45).toFixed(2)}deg) rotateX(${(8+pitch*.15).toFixed(2)}deg)`;headPivot.style.transform=`translate3d(48px,48px,-24px) rotateY(${(yaw*.65+shake).toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg)`;requestAnimationFrame(animate)})();
})();

const featureSteve=document.getElementById('featureSteveModel'),featureStage=document.querySelector('.steve-stage');
if(featureSteve&&featureStage){featureStage.addEventListener('pointermove',event=>{const r=featureStage.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;featureSteve.style.transform=`rotateY(${(-x*55).toFixed(1)}deg) rotateX(${(y*18).toFixed(1)}deg)`})}

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.12});document.querySelectorAll('.feature-row,.moments,.trust>div').forEach(el=>revealObserver.observe(el));

// Pixel-perfect HUD icons, transcribed from PixelHUD's HeartView and HungerBarView.
const heartShape=['0110110','1111111','1111111','0111110','0011100','0001000'];
const hungerShape=['0001100','0011110','0010010','0100000','1000000','1100000','0100000'];
function buildPixelBar(bar,shape,type){
 const fill=Number(bar.dataset.fill||0);bar.replaceChildren();
 for(let n=0;n<9;n++){
  const amount=Math.max(0,Math.min(1,fill-n)),icon=document.createElement('span');icon.className=`pixel-icon ${type}`;
  shape.forEach((row,y)=>[...row].forEach((cell,x)=>{const px=document.createElement('i');if(cell==='1'){
   const lit=amount>=1||(amount>=.5&&x<Math.ceil(row.length/2));
   if(type==='heart')px.style.background=lit?(amount>=1?'rgb(255,26,26)':'rgb(255,128,128)'):'rgb(64,0,0)';
   else px.style.background=lit?(amount>=1?'rgb(217,140,38)':'rgba(191,115,26,.7)'):'rgb(77,46,15)';
  }icon.appendChild(px)}));bar.appendChild(icon);
 }
}
document.querySelectorAll('.native-hearts').forEach(bar=>buildPixelBar(bar,heartShape,'heart'));
document.querySelectorAll('.native-hunger').forEach(bar=>buildPixelBar(bar,hungerShape,'hunger'));

// The requested YouTube excerpt is a chroma-key source. Remove its green at runtime.
document.querySelectorAll('.tnt-stage').forEach(stage=>{
 const video=stage.querySelector('video'),canvas=stage.querySelector('canvas');let frameId=0;
 function size(){canvas.width=480;canvas.height=Math.round(480*(video.videoHeight||1080)/(video.videoWidth||1920))}
 function paint(){if(video.paused||video.ended)return;chromaFrame(video,canvas);frameId=requestAnimationFrame(paint)}
 function play(){cancelAnimationFrame(frameId);video.currentTime=0;video.play().then(paint).catch(()=>{})}
 video.addEventListener('loadedmetadata',size,{once:true});video.addEventListener('ended',()=>cancelAnimationFrame(frameId));stage.querySelector('button').addEventListener('click',play);
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){play();observer.disconnect()}},{threshold:.45});observer.observe(stage);
});

const creeperCard=document.querySelector('.creeper-card'),cornerSteve=document.getElementById('corner-steve');
if(creeperCard&&cornerSteve){creeperCard.addEventListener('pointerenter',()=>cornerSteve.classList.add('nervous'));creeperCard.addEventListener('pointerleave',()=>cornerSteve.classList.remove('nervous'));creeperCard.addEventListener('click',()=>{cornerSteve.classList.add('nervous');setTimeout(()=>cornerSteve.classList.remove('nervous'),1800)})}

const mobFrames={cow:['assets/app/cow_walk1.png','assets/app/cow_walk2.png'],pig:['assets/app/pig_walk1.png','assets/app/pig_walk2.png']};
Object.entries(mobFrames).forEach(([mob,frames])=>{const img=document.querySelector(`.app-${mob}`);if(img){let n=0;setInterval(()=>{n=1-n;img.src=frames[n]},260)}});

const creeperGrid=['...GGG...','..GGGGG..','.GGGGGGG.','GGGGGGGGG','GG.G.G.GG','GG.G.G.GG','GGGGGGGGG','GG.GGG.GG','GGG.G.GGG','.GGGGGGG.','.GGGGGGG.','.GGGGGGG.','.GGGGGGG.','GG..G..GG','GG..G..GG','GG..G..GG','GG..G..GG'];
document.querySelectorAll('.app-creeper').forEach(creeper=>{creeperGrid.forEach((row,y)=>[...row].forEach((cell,x)=>{const px=document.createElement('i');if(cell==='G'){const face=(y===4||y===5)&&([2,3,5,6].includes(x))||(y===7&&[3,4,5].includes(x))||(y===8&&[2,6].includes(x));px.style.background=face?'#111':y<9?'rgb(115,186,51)':'rgb(56,115,20)'}creeper.appendChild(px)}))});

document.querySelectorAll('.villager-play').forEach(button=>button.addEventListener('click',()=>{const audio=button.parentElement.querySelector('audio');audio.currentTime=0;audio.play();button.classList.add('playing');setTimeout(()=>button.classList.remove('playing'),900)}));

const sizeSlider=document.getElementById('steveScale'),sizeOutput=document.getElementById('steveScaleOutput'),steveWrap=document.querySelector('#corner-steve .steve-wrap');
if(sizeSlider&&steveWrap){sizeSlider.addEventListener('input',()=>{const scale=Number(sizeSlider.value);sizeOutput.value=`${scale.toFixed(1)}×`;steveWrap.style.transform=`scale(${(.67*scale).toFixed(3)})`})}
