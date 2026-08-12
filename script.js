const body=document.body,intro=document.getElementById('intro'),skip=document.getElementById('skipIntro');
body.classList.add('intro-active');
function finishIntro(){intro.classList.add('done');body.classList.remove('intro-active');body.classList.add('page-ready')}
function runIntro(){setTimeout(()=>intro.classList.add('explode'),2400);setTimeout(finishIntro,3150)}
if(matchMedia('(prefers-reduced-motion: reduce)').matches) finishIntro(); else runIntro();
skip.addEventListener('click',finishIntro);

document.querySelectorAll('details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('details').forEach(other=>{if(other!==item)other.open=false})}));

(function buildCornerSteve(){
 const container=document.getElementById('steveModel');if(!container)return;const S=3,SKIN='sprites/steve_skin.png';
 function faceStyle(ux,uy,uw,uh,w,h){const sx=(w/(uw*S))*64*S,sy=(h/(uh*S))*64*S;return`background-image:url('${SKIN}');background-size:${sx}px ${sy}px;background-position:${-(ux*S*(w/(uw*S)))}px ${-(uy*S*(h/(uh*S)))}px;image-rendering:pixelated;`}
 function box(parent,x,y,z,w,h,d,uv){const el=document.createElement('div');el.className='s-box';el.style.cssText=`width:${w}px;height:${h}px;transform:translate3d(${x}px,${y}px,${z}px);transform-style:preserve-3d;`;[{w,h,t:`translateZ(${d/2}px)`,u:uv.front},{w,h,t:`translateZ(${-d/2}px) rotateY(180deg)`,u:uv.back},{w:d,h,t:`translateX(${-d/2}px) rotateY(-90deg)`,u:uv.left},{w:d,h,t:`translateX(${w-d/2}px) rotateY(90deg)`,u:uv.right},{w,h:d,t:`translateY(${-d/2}px) rotateX(90deg)`,u:uv.top},{w,h:d,t:`translateY(${h-d/2}px) rotateX(-90deg)`,u:uv.bottom}].forEach(f=>{const q=document.createElement('div');q.className='s-face';q.style.cssText=`width:${f.w}px;height:${f.h}px;transform:${f.t};${faceStyle(...f.u,f.w,f.h)}`;el.appendChild(q)});parent.appendChild(el);return el}
 const HW=48,HH=48,CX=24;const headPivot=document.createElement('div');headPivot.className='s-box';headPivot.style.cssText='width:0;height:0;transform:translate3d(48px,48px,-24px);transform-style:preserve-3d;';box(headPivot,-24,-48,0,48,48,48,{front:[8,8,8,8],back:[24,8,8,8],left:[0,8,8,8],right:[16,8,8,8],top:[8,0,8,8],bottom:[16,0,8,8]});container.appendChild(headPivot);
 box(container,CX,HH,-12,48,72,24,{front:[20,20,8,12],back:[32,20,8,12],left:[16,20,4,12],right:[28,20,4,12],top:[20,16,8,4],bottom:[28,16,8,4]});
 const armUv={front:[44,20,4,12],back:[52,20,4,12],left:[40,20,4,12],right:[48,20,4,12],top:[44,16,4,4],bottom:[48,16,4,4]},legUv={front:[4,20,4,12],back:[12,20,4,12],left:[0,20,4,12],right:[8,20,4,12],top:[4,16,4,4],bottom:[8,16,4,4]};box(container,0,48,-12,24,72,24,armUv);box(container,75,48,-12,24,72,24,armUv);box(container,24,120,-12,24,72,24,legUv);box(container,48,120,-12,24,72,24,legUv);
 let yaw=0,pitch=0,ty=0,tp=0;document.addEventListener('mousemove',e=>{const r=document.getElementById('corner-steve').getBoundingClientRect(),dx=e.clientX-(r.left+40),dy=e.clientY-(r.top+22);ty=Math.max(-55,Math.min(55,Math.atan2(dx,350)*180/Math.PI));tp=Math.max(-28,Math.min(28,-Math.atan2(dy,350)*180/Math.PI))});
 (function animate(){yaw+=(ty-yaw)*.1;pitch+=(tp-pitch)*.1;container.style.transform=`rotateY(${(-18+yaw*.45).toFixed(2)}deg) rotateX(${(8+pitch*.15).toFixed(2)}deg)`;headPivot.style.transform=`translate3d(48px,48px,-24px) rotateY(${(yaw*.65).toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg)`;requestAnimationFrame(animate)})();
})();

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.12});document.querySelectorAll('.feature-row,.manifesto,.moments,.trust>div').forEach(el=>revealObserver.observe(el));
