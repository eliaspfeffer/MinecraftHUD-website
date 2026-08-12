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
const realAppDownload=document.getElementById('realAppDownload'),headerDownload=document.querySelector('.header-download');if(realAppDownload&&headerDownload){const clone=headerDownload.cloneNode(true);clone.classList.remove('header-download');clone.classList.add('showcase-download');clone.querySelector('.button').textContent='Download for Mac';clone.querySelector('.xp-orbits').replaceChildren();realAppDownload.appendChild(clone)}
const xpPaths=[[-82,-45,76,38,-28,58,91,-12],[-55,46,84,-37,24,-59,-94,7],[-96,-8,39,54,88,-46,-18,-57],[-30,-61,97,6,53,55,-79,34],[-74,31,12,-58,96,-22,36,61],[-14,59,-91,-27,68,-54,93,28],[-88,-33,48,-61,87,47,-45,55],[-47,-56,-95,19,75,58,91,-35],[-99,14,18,62,94,-48,-52,-52],[-65,57,89,24,-11,-63,-96,-18]];document.querySelectorAll('.xp-orbits').forEach(xpOrbits=>xpPaths.forEach((path,i)=>{const orb=document.createElement('img');orb.src='assets/app/xp-orb.png';orb.alt='';orb.style.setProperty('--x1',`${path[0]}px`);orb.style.setProperty('--y1',`${path[1]}px`);orb.style.setProperty('--x2',`${path[2]}px`);orb.style.setProperty('--y2',`${path[3]}px`);orb.style.setProperty('--x3',`${path[4]}px`);orb.style.setProperty('--y3',`${path[5]}px`);orb.style.setProperty('--x4',`${path[6]}px`);orb.style.setProperty('--y4',`${path[7]}px`);orb.style.setProperty('--duration',`${4.4+i*.37}s`);orb.style.setProperty('--delay',`${-i*.73}s`);orb.style.setProperty('--depth',i%3===0?'3':'1');xpOrbits.appendChild(orb)}));
const cursorXpDownload=document.querySelector('.cursor-xp-download'),cursorXpSwarm=document.querySelector('.cursor-xp-swarm');if(cursorXpDownload&&cursorXpSwarm){for(let i=0;i<5;i++){const orb=document.createElement('img');orb.src='assets/app/xp-orb.png';orb.alt='';orb.style.setProperty('--cursor-orb-i',i);orb.style.setProperty('--cursor-radius',`${27+i*7}px`);orb.style.setProperty('--cursor-speed',`${1.15+i*.19}s`);cursorXpSwarm.appendChild(orb)}cursorXpDownload.addEventListener('pointerenter',()=>cursorXpDownload.classList.add('xp-active'));cursorXpDownload.addEventListener('pointermove',event=>{const r=cursorXpDownload.getBoundingClientRect();cursorXpSwarm.style.setProperty('--mouse-x',`${event.clientX-r.left}px`);cursorXpSwarm.style.setProperty('--mouse-y',`${event.clientY-r.top}px`)});cursorXpDownload.addEventListener('pointerleave',()=>cursorXpDownload.classList.remove('xp-active'))}

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
(function animateEverySteve(){document.querySelectorAll('#steveModel,.steve-stage .steve-model').forEach(steve=>{const anchor=steve.closest('.feature-steve-wrap')||steve.closest('#corner-steve')||steve,r=anchor.getBoundingClientRect(),dx=cursorX-(r.left+r.width/2),dy=cursorY-(r.top+r.height*.2),targetYaw=Math.max(-55,Math.min(55,dx/350*55)),targetPitch=Math.max(-30,Math.min(30,-dy/350*30)),state=steveMotion.get(steve)||{yaw:0,pitch:0,bodyYaw:0,bodyPitch:0};state.yaw+=(targetYaw-state.yaw)*.13;state.pitch+=(targetPitch-state.pitch)*.13;state.bodyYaw+=(state.yaw*.55-state.bodyYaw)*.04;state.bodyPitch+=(state.pitch*.4-state.bodyPitch)*.04;steveMotion.set(steve,state);const nervous=steve.id==='steveModel'&&document.getElementById('corner-steve').classList.contains('nervous'),shake=nervous?Math.sin(Date.now()/140)*18:0,head=steve.querySelector(':scope > .s-head-pivot');steve.style.transform=`translateZ(18px) rotateY(${state.bodyYaw.toFixed(2)}deg) rotateX(${state.bodyPitch.toFixed(2)}deg)`;if(head)head.style.transform=`translate3d(48px,48px,0) rotateY(${(state.yaw-state.bodyYaw+shake).toFixed(2)}deg) rotateX(${(state.pitch-state.bodyPitch).toFixed(2)}deg)`});requestAnimationFrame(animateEverySteve)})();

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

function buildCreeper(model){
 const uv={head:[[8,8,8,8],[24,8,8,8],[0,8,8,8],[16,8,8,8],[8,0,8,8],[16,0,8,8]],body:[[20,20,8,12],[32,20,8,12],[16,20,4,12],[28,20,4,12],[20,16,8,4],[28,16,8,4]],leg:[[4,20,4,6],[12,20,4,6],[0,20,4,6],[8,20,4,6],[4,16,4,4],[8,16,4,4]]};
 const makeBox=(name,type)=>{const box=document.createElement('div');box.className=`creeper-box ${name}`;uv[type].forEach((crop,i)=>{const face=document.createElement('i');face.className=`creeper-face face-${i}`;face.style.setProperty('--uv-x',crop[0]);face.style.setProperty('--uv-y',crop[1]);face.style.setProperty('--uv-w',crop[2]);face.style.setProperty('--uv-h',crop[3]);box.appendChild(face)});return box};
 const rig=document.createElement('div');rig.className='creeper-rig';rig.append(makeBox('creeper-head','head'),makeBox('creeper-body','body'));
 ['front-left','front-right','back-left','back-right'].forEach(name=>rig.appendChild(makeBox(`creeper-leg ${name}`,'leg')));
 model.replaceChildren(rig);
}
document.querySelectorAll('.app-creeper').forEach(buildCreeper);

// The requested YouTube excerpt is a chroma-key source. Remove its green at runtime.
function initTntStage(stage){
 const video=stage.querySelector('video'),canvas=stage.querySelector('canvas');let frameId=0;
 function size(){canvas.width=480;canvas.height=Math.round(480*(video.videoHeight||1080)/(video.videoWidth||1920))}
 function paint(){if(video.paused||video.ended)return;chromaFrame(video,canvas);frameId=requestAnimationFrame(paint)}
 function play(){cancelAnimationFrame(frameId);video.currentTime=0;stage.closest('.shortcut-card')?.classList.add('tnt-playing');video.play().then(paint).catch(()=>{})}
 video.addEventListener('loadedmetadata',size,{once:true});video.addEventListener('ended',()=>{cancelAnimationFrame(frameId);canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);stage.closest('.shortcut-card')?.classList.remove('tnt-playing')});
 stage.closest('.shortcut-card')?.addEventListener('pointerenter',play);
}
document.querySelectorAll('.tnt-stage').forEach(initTntStage);

const creeperCard=document.querySelector('.creeper-card'),cornerSteve=document.getElementById('corner-steve');
if(creeperCard&&cornerSteve){creeperCard.addEventListener('pointerenter',()=>cornerSteve.classList.add('nervous'));creeperCard.addEventListener('pointerleave',()=>cornerSteve.classList.remove('nervous'));creeperCard.addEventListener('click',()=>{cornerSteve.classList.add('nervous');setTimeout(()=>cornerSteve.classList.remove('nervous'),1800)})}

const mobFrames={cow:['assets/app/cow_walk1.png','assets/app/cow_walk2.png'],pig:['assets/app/pig_walk1.png','assets/app/pig_walk2.png']};
Object.entries(mobFrames).forEach(([mob,frames])=>document.querySelectorAll(`.app-${mob}`).forEach(img=>{let n=0;setInterval(()=>{n=1-n;img.src=frames[n]},260)}));

let audioUnlocked=false;
let soundsMuted=localStorage.getItem('pixelhud-muted')==='true';
const soundToggle=document.getElementById('soundToggle');
function renderSoundToggle(){if(!soundToggle)return;soundToggle.setAttribute('aria-pressed',String(soundsMuted));soundToggle.setAttribute('aria-label',soundsMuted?'Alle Sounds aktivieren':'Alle Sounds deaktivieren')}
renderSoundToggle();
soundToggle?.addEventListener('click',event=>{event.stopPropagation();audioUnlocked=true;soundsMuted=!soundsMuted;localStorage.setItem('pixelhud-muted',String(soundsMuted));document.querySelectorAll('audio').forEach(audio=>{audio.pause();audio.currentTime=0});renderSoundToggle()});
const playCardSound=card=>{const audio=card?.querySelector('audio');if(!audio||!audioUnlocked||soundsMuted)return false;const sound=audio.cloneNode();sound.volume=card.dataset.effect==='tnt'?.6:.65;sound.play().catch(()=>{});return true};
document.querySelectorAll('#features .shortcut-card[data-effect="cow"],#features .shortcut-card[data-effect="pig"]').forEach(card=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;card.classList.remove('mob-visible');void card.offsetWidth;card.classList.add('mob-visible')}),{threshold:.55});observer.observe(card)});

const bindCardHoverSound=root=>root.querySelectorAll('.shortcut-card:not([data-effect="tnt"])').forEach(card=>card.addEventListener('pointerenter',()=>playCardSound(card)));
const bindTntHoverSound=root=>root.querySelectorAll('.shortcut-card[data-effect="tnt"]').forEach(card=>card.addEventListener('pointerenter',()=>{if(card.dataset.tntSoundPlayed==='true')return;if(playCardSound(card))card.dataset.tntSoundPlayed='true'}));

document.querySelectorAll('#features .shortcut-card').forEach(card=>{card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;card.style.setProperty('--tilt-x',`${(-y*8).toFixed(2)}deg`);card.style.setProperty('--tilt-y',`${(x*10).toFixed(2)}deg`)});card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')})});

const sizeSlider=document.getElementById('steveScale'),sizeOutput=document.getElementById('steveScaleOutput'),steveWrap=document.querySelector('#corner-steve .steve-wrap');
if(sizeSlider&&steveWrap){sizeSlider.addEventListener('input',()=>{const scale=Number(sizeSlider.value);sizeOutput.value=`${scale.toFixed(1)}×`;steveWrap.style.transform=`scale(${(.67*scale).toFixed(3)})`})}

if(heroCardStack){document.querySelectorAll('#features .shortcut-card').forEach((card,index)=>{const clone=card.cloneNode(true);clone.classList.remove('mob-visible');clone.classList.add('hero-stack-card');clone.style.setProperty('--stack-i',index);clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));heroCardStack.appendChild(clone)});heroCardStack.querySelectorAll('.tnt-stage').forEach(initTntStage);heroCardStack.querySelectorAll('.hero-stack-card[data-effect="cow"],.hero-stack-card[data-effect="pig"]').forEach(card=>{card.addEventListener('pointerenter',()=>{const img=card.querySelector('.mob-stage img');img.style.animation='none';void img.offsetWidth;img.style.animation=''})})}
bindCardHoverSound(document);
bindTntHoverSound(document);

// Mirror PixelHUD's global input sounds while this browser page has focus.
const popSound=new Audio('sounds/pop.mp3');popSound.preload='auto';popSound.volume=.55;
const dirtSounds=['sounds/dirt1.mp3','sounds/dirt2.mp3','sounds/dirt3.mp3'].map(src=>{const audio=new Audio(src);audio.preload='auto';audio.volume=.45;return audio});
let lastDirtPlay=0;
function replaySound(audio){if(soundsMuted)return;const sound=audio.cloneNode();sound.volume=audio.volume;sound.play().catch(()=>{})}
document.addEventListener('pointerdown',event=>{audioUnlocked=true;if(!event.target.closest('#soundToggle'))replaySound(popSound)},{capture:true});
document.addEventListener('keydown',event=>{if(event.repeat)return;audioUnlocked=true;const now=performance.now();if(now-lastDirtPlay<60)return;lastDirtPlay=now;replaySound(dirtSounds[Math.floor(Math.random()*dirtSounds.length)])});
