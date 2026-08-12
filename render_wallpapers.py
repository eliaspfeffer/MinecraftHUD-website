from PIL import Image, ImageDraw
import math, random, os, subprocess

W,H,FPS,SECONDS=1280,720,30,6
os.makedirs('assets/app/wallpaper-frames',exist_ok=True)
random.seed(7)
clouds=[(random.randint(0,W),random.randint(180,430),random.uniform(.7,1.6),i%3) for i in range(6)]
birds=[(random.randint(0,W),random.randint(350,500),random.uniform(1,2)) for _ in range(3)]
cloud_shapes=[[(1,0),(2,0),(3,0),(0,1),(1,1),(2,1),(3,1),(4,1),(1,2),(2,2),(3,2)],[(2,0),(3,0),(1,1),(2,1),(3,1),(4,1),(5,1),(0,2),(1,2),(2,2),(3,2),(4,2)],[(1,0),(2,0),(0,1),(1,1),(2,1),(3,1),(1,2),(2,2)]]
trees=[.04,.12,.20,.31,.45,.57,.69,.78,.88,.96]
def frame(n,night):
 im=Image.new('RGB',(W,H)); d=ImageDraw.Draw(im); gy=int(H*.82)
 top=(5,5,26) if night else (102,184,255); bot=(13,13,46) if night else (173,224,255)
 for y in range(gy):
  q=y/gy; c=tuple(round(top[i]*(1-q)+bot[i]*q) for i in range(3)); d.line((0,y,W,y),fill=c)
 if night:
  rng=random.Random(12345)
  for _ in range(80):
   x=rng.randrange(W); y=rng.randrange(gy); s=rng.randrange(1,4); d.rectangle((x,y,x+s,y+s),fill=(220,220,230))
 d.rectangle((W*.5-14,95,W*.5+14,123),fill=(217,217,204) if night else (255,235,51))
 if night: d.rectangle((W*.5-4,101,W*.5+2,107),fill=(179,179,166))
 for x,y,scale,v in clouds:
  ps=round(14*scale); xx=(x-n*.65)%(W+300)-150
  for bx,by in cloud_shapes[v]: d.rectangle((xx+bx*ps,y+by*ps,xx+(bx+1)*ps-1,y+(by+1)*ps-1),fill=(235,235,240))
 for x,y,speed in birds:
  xx=(x-n*speed)%(W+50); d.rectangle((xx,y,xx+6,y+3),fill=(25,25,25)); up=(n//4)%2; d.line((xx-6,y-3 if up else y+4,xx,y),fill=(25,25,25),width=2); d.line((xx+6,y,xx+12,y-3 if up else y+4),fill=(25,25,25),width=2)
 peaks=[(.05,.45),(.15,.55),(.28,.42),(.38,.60),(.50,.48),(.62,.58),(.72,.44),(.84,.56),(.95,.46),(1.05,.52)]
 pts=[(0,gy)]+[(x*W-n*.08,gy-y*(H-gy)) for x,y in peaks]+[(W,gy)]
 d.polygon(pts,fill=(20,26,36) if night else (64,97,56))
 d.rectangle((0,gy,W,H),fill=(107,107,107)); d.rectangle((0,gy,W,gy+65),fill=(122,82,41)); d.rectangle((0,gy,W,gy+12),fill=(79,179,31)); d.rectangle((0,gy,W,gy+5),fill=(61,140,26))
 for i,f in enumerate(trees):
  x=f*W; th=[40,32,36][i%3]; ls=th*.55; d.rectangle((x-4,gy-th,x+4,gy),fill=(89,56,26)); d.rectangle((x-ls/2,gy-th-ls*.7,x+ls/2,gy-th+ls*.3),fill=(33,122,20)); d.rectangle((x-ls*.325,gy-th-ls*1.25,x+ls*.325,gy-th-ls*.6),fill=(20,89,13))
 return im
for night,name in [(False,'day'),(True,'night')]:
 folder=f'assets/app/wallpaper-frames/{name}';os.makedirs(folder,exist_ok=True)
 for n in range(FPS*SECONDS): frame(n,night).save(f'{folder}/{n:04d}.png')
 subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(FPS),'-i',f'{folder}/%04d.png','-c:v','libx264','-pix_fmt','yuv420p','-crf','24','-movflags','+faststart',f'assets/app/wallpaper-{name}.mp4'],check=True)
