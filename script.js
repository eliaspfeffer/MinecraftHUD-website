const body=document.body,intro=document.getElementById('intro'),skip=document.getElementById('skipIntro'),introVideo=intro.querySelector('video'),introCanvas=document.getElementById('introTntCanvas');
// Give the TNT two seconds to build before revealing the page behind it.
body.classList.add('intro-active');
const heroRevealTimer=setTimeout(()=>body.classList.add('page-ready'),2000);
let introFrame=0;
function chromaFrame(video,canvas){const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!canvas.width){canvas.width=640;canvas.height=360}ctx.drawImage(video,0,0,canvas.width,canvas.height);const frame=ctx.getImageData(0,0,canvas.width,canvas.height),p=frame.data;for(let i=0;i<p.length;i+=4){const r=p[i],g=p[i+1],b=p[i+2],dominance=g-Math.max(r,b);if(g>95&&dominance>20){p[i+3]=Math.max(0,255-(dominance-20)*9)}}ctx.putImageData(frame,0,0);return ctx}
function finishIntro(){cancelAnimationFrame(introFrame);clearTimeout(heroRevealTimer);introVideo.pause();intro.classList.add('done');body.classList.remove('intro-active');body.classList.add('page-ready')}
function runIntro(){const paint=()=>{if(introVideo.paused||introVideo.ended){finishIntro();return}chromaFrame(introVideo,introCanvas);introFrame=requestAnimationFrame(paint)};introVideo.currentTime=0;introVideo.play().then(paint).catch(finishIntro)}
if(matchMedia('(prefers-reduced-motion: reduce)').matches) finishIntro(); else runIntro();
skip.addEventListener('click',finishIntro);

document.querySelectorAll('details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('details').forEach(other=>{if(other!==item)other.open=false})}));

// Build the hero fan from the real shortcut cards so their content has one source of truth.
const heroCardStack=document.getElementById('heroCardStack');
const xpOrbits=document.querySelector('.xp-orbits');if(xpOrbits){for(let i=0;i<10;i++){const orb=document.createElement('img');orb.src='assets/app/xp-orb.png';orb.alt='';orb.style.setProperty('--orb-i',i);xpOrbits.appendChild(orb)}}

(function buildCornerSteve(){
 const container=document.getElementById('steveModel');if(!container)return;const S=3,SKIN='assets/app/steve_skin.png';
 function faceStyle(ux,uy,uw,uh,w,h){const scale=w/uw;return`background-image:url('${SKIN}');background-size:${64*scale}px ${32*scale}px;background-position:${-ux*scale}px ${-uy*scale}px;image-rendering:pixelated;background-repeat:no-repeat;`}
 function box(parent,x,y,z,w,h,d,uv){const el=document.createElement('div');el.className='s-box';el.style.cssText=`width:${w}px;height:${h}px;transform:translate3d(${x}px,${y}px,${z}px);transform-style:preserve-3d;`;[{w,h,t:`translateZ(${d/2}px)`,u:uv.front},{w,h,t:`translateZ(${-d/2}px) rotateY(180deg)`,u:uv.back},{w:d,h,t:`translateX(${-d/2}px) rotateY(-90deg)`,u:uv.left},{w:d,h,t:`translateX(${w-d/2}px) rotateY(90deg)`,u:uv.right},{w,h:d,t:`translateY(${-d/2}px) rotateX(90deg)`,u:uv.top},{w,h:d,t:`translateY(${h-d/2}px) rotateX(-90deg)`,u:uv.bottom}].forEach(f=>{const q=document.createElement('div');q.className='s-face';q.style.cssText=`width:${f.w}px;height:${f.h}px;transform:${f.t};${faceStyle(...f.u,f.w,f.h)}`;el.appendChild(q)});parent.appendChild(el);return el}
 const HW=48,HH=48,CX=24;const headPivot=document.createElement('div');headPivot.className='s-box s-head-pivot';headPivot.style.cssText='width:0;height:0;transform:translate3d(48px,48px,0);transform-style:preserve-3d;';box(headPivot,-24,-48,0,48,48,48,{front:[8,8,8,8],back:[24,8,8,8],left:[0,8,8,8],right:[16,8,8,8],top:[8,0,8,8],bottom:[16,0,8,8]});container.appendChild(headPivot);
 box(container,CX,HH,-12,48,72,24,{front:[20,20,8,12],back:[32,20,8,12],left:[16,20,4,12],right:[28,20,4,12],top:[20,16,8,4],bottom:[28,16,8,4]});
 const armUv={front:[44,20,4,12],back:[52,20,4,12],left:[48,20,4,12],right:[40,20,4,12],top:[44,16,4,4],bottom:[48,16,4,4]},legUv={front:[4,20,4,12],back:[12,20,4,12],left:[8,20,4,12],right:[0,20,4,12],top:[4,16,4,4],bottom:[8,16,4,4]};box(container,0,48,-12,24,72,24,armUv);box(container,72,48,-12,24,72,24,armUv);box(container,24,120,-12,24,72,24,legUv);box(container,48,120,-12,24,72,24,legUv);
 document.querySelectorAll('.skin-preview').forEach(preview=>{const clone=container.cloneNode(true);clone.removeAttribute('id');clone.classList.add('steve-model');preview.appendChild(clone)});
 const featureModel=document.getElementById('featureSteveModel');if(featureModel){const clone=container.cloneNode(true);clone.id='featureSteveModel';featureModel.replaceWith(clone)}
})();

let cursorX=innerWidth/2,cursorY=innerHeight/2;const steveMotion=new WeakMap();
document.addEventListener('pointermove',event=>{cursorX=event.clientX;cursorY=event.clientY});
(function animateEverySteve(){document.querySelectorAll('#steveModel,.steve-stage .steve-model').forEach(steve=>{const anchor=steve.closest('.feature-steve-wrap')||steve.closest('#corner-steve')||steve,r=anchor.getBoundingClientRect(),dx=cursorX-(r.left+r.width/2),dy=cursorY-(r.top+r.height*.2),targetYaw=Math.max(-55,Math.min(55,dx/350*55)),targetPitch=Math.max(-30,Math.min(30,-dy/350*30)),state=steveMotion.get(steve)||{yaw:0,pitch:0,bodyYaw:0,bodyPitch:0};state.yaw+=(targetYaw-state.yaw)*.13;state.pitch+=(targetPitch-state.pitch)*.13;state.bodyYaw+=(state.yaw*.55-state.bodyYaw)*.04;state.bodyPitch+=(state.pitch*.4-state.bodyPitch)*.04;steveMotion.set(steve,state);const nervous=steve.id==='steveModel'&&document.getElementById('corner-steve').classList.contains('nervous'),shake=nervous?Math.sin(Date.now()/35)*18:0,head=steve.querySelector(':scope > .s-head-pivot');steve.style.transform=`translateZ(18px) rotateY(${state.bodyYaw.toFixed(2)}deg) rotateX(${state.bodyPitch.toFixed(2)}deg)`;if(head)head.style.transform=`translate3d(48px,48px,0) rotateY(${(state.yaw-state.bodyYaw+shake).toFixed(2)}deg) rotateX(${(state.pitch-state.bodyPitch).toFixed(2)}deg)`});requestAnimationFrame(animateEverySteve)})();

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
function initTntStage(stage){
 const video=stage.querySelector('video'),canvas=stage.querySelector('canvas');let frameId=0;
 function size(){canvas.width=480;canvas.height=Math.round(480*(video.videoHeight||1080)/(video.videoWidth||1920))}
 function paint(){if(video.paused||video.ended)return;chromaFrame(video,canvas);frameId=requestAnimationFrame(paint)}
 function play(withSound=false){cancelAnimationFrame(frameId);video.currentTime=0;if(withSound)playCardSound(stage.closest('.shortcut-card'));video.play().then(paint).catch(()=>{})}
 video.addEventListener('loadedmetadata',size,{once:true});video.addEventListener('ended',()=>play(true));
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))play()},{threshold:.45});observer.observe(stage);
 stage.closest('.shortcut-card')?.addEventListener('pointerenter',()=>play(true));
}
document.querySelectorAll('.tnt-stage').forEach(initTntStage);

const creeperCard=document.querySelector('.creeper-card'),cornerSteve=document.getElementById('corner-steve');
if(creeperCard&&cornerSteve){creeperCard.addEventListener('pointerenter',()=>cornerSteve.classList.add('nervous'));creeperCard.addEventListener('pointerleave',()=>cornerSteve.classList.remove('nervous'));creeperCard.addEventListener('click',()=>{cornerSteve.classList.add('nervous');setTimeout(()=>cornerSteve.classList.remove('nervous'),1800)})}

const mobFrames={cow:['assets/app/cow_walk1.png','assets/app/cow_walk2.png'],pig:['assets/app/pig_walk1.png','assets/app/pig_walk2.png']};
Object.entries(mobFrames).forEach(([mob,frames])=>document.querySelectorAll(`.app-${mob}`).forEach(img=>{let n=0;setInterval(()=>{n=1-n;img.src=frames[n]},260)}));

const playCardSound=card=>{const audio=card.querySelector('audio');if(!audio)return;audio.currentTime=0;audio.play().catch(()=>{})};
const mobObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const card=entry.target;card.classList.remove('mob-visible');void card.offsetWidth;card.classList.add('mob-visible');playCardSound(card)}),{threshold:.55});
document.querySelectorAll('#features .shortcut-card[data-effect="cow"],#features .shortcut-card[data-effect="pig"]').forEach(card=>mobObserver.observe(card));
const soundObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)playCardSound(entry.target)}),{threshold:.6});
document.querySelectorAll('#features .shortcut-card[data-effect="tnt"],#features .shortcut-card[data-effect="villager"]').forEach(card=>soundObserver.observe(card));

document.addEventListener('click',event=>{const picture=event.target.closest('.villager-image');if(!picture)return;const audio=picture.parentElement.querySelector('audio');if(!audio)return;audio.currentTime=0;audio.play();picture.classList.add('playing');setTimeout(()=>picture.classList.remove('playing'),900)});
document.addEventListener('click',event=>{const card=event.target.closest('.shortcut-card');if(card)playCardSound(card)});

document.querySelectorAll('#features .shortcut-card').forEach(card=>{card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;card.style.setProperty('--tilt-x',`${(-y*8).toFixed(2)}deg`);card.style.setProperty('--tilt-y',`${(x*10).toFixed(2)}deg`)});card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')})});

const sizeSlider=document.getElementById('steveScale'),sizeOutput=document.getElementById('steveScaleOutput'),steveWrap=document.querySelector('#corner-steve .steve-wrap');
if(sizeSlider&&steveWrap){sizeSlider.addEventListener('input',()=>{const scale=Number(sizeSlider.value);sizeOutput.value=`${scale.toFixed(1)}×`;steveWrap.style.transform=`scale(${(.67*scale).toFixed(3)})`})}

if(heroCardStack){document.querySelectorAll('#features .shortcut-card').forEach((card,index)=>{const clone=card.cloneNode(true);clone.classList.remove('mob-visible');clone.classList.add('hero-stack-card');clone.style.setProperty('--stack-i',index);clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));heroCardStack.appendChild(clone)});heroCardStack.querySelectorAll('.tnt-stage').forEach(initTntStage);heroCardStack.querySelectorAll('.hero-stack-card[data-effect="cow"],.hero-stack-card[data-effect="pig"]').forEach(card=>{card.addEventListener('pointerenter',()=>{const img=card.querySelector('.mob-stage img');img.style.animation='none';void img.offsetWidth;img.style.animation='';playCardSound(card)})});heroCardStack.querySelectorAll('.hero-stack-card[data-effect="villager"]').forEach(card=>card.addEventListener('pointerenter',()=>playCardSound(card)))}

document.querySelectorAll('#features .shortcut-card[data-effect="cow"],#features .shortcut-card[data-effect="pig"],#features .shortcut-card[data-effect="villager"]').forEach(card=>card.addEventListener('pointerenter',()=>playCardSound(card)));
document.querySelectorAll('.app-cow,.app-pig').forEach(img=>img.addEventListener('animationiteration',()=>playCardSound(img.closest('.shortcut-card'))));

// Mirror PixelHUD's global input sounds while this browser page has focus.
const popSound=new Audio('sounds/pop.aiff');popSound.volume=.35;
const dirtSounds=['sounds/dirt1.aiff','sounds/dirt2.aiff','sounds/dirt3.aiff'].map(src=>{const audio=new Audio(src);audio.volume=.35;return audio});
let lastDirtPlay=0;
function replaySound(audio){const sound=audio.cloneNode();sound.volume=audio.volume;sound.play().catch(()=>{})}
document.addEventListener('pointerdown',()=>replaySound(popSound));
document.addEventListener('keydown',event=>{if(event.repeat)return;const now=performance.now();if(now-lastDirtPlay<60)return;lastDirtPlay=now;replaySound(dirtSounds[Math.floor(Math.random()*dirtSounds.length)])});
