import * as THREE from './assets/vendor/three.module.min.js';
import { RoundedBoxGeometry } from './assets/vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './assets/vendor/RoomEnvironment.js';

const host=document.querySelector('.hero-visual');
const canvas=document.getElementById('character-canvas');
const status=document.getElementById('model-status');
const greeting=document.getElementById('bot-greeting');
const greetingText=document.getElementById('bot-greeting-text');
let greetingTimer,onGreet=()=>{},greetingWidth=84,greetingHeight=44;
// Place the compact bubble above an anchor, clamped inside the robot stage.
const placeGreeting=(x,y,bounds,controls)=>{
 const half=greetingWidth/2,margin=8;
 x=Math.max(half+margin,Math.min(bounds.width-half-margin,x));
 y=Math.max(greetingHeight+margin,Math.min(bounds.height-margin,y));
 if(controls&&controls.width&&x+half>controls.left-bounds.left-margin&&x-half<controls.right-bounds.left+margin&&y>controls.top-bounds.top-margin&&y-greetingHeight<controls.bottom-bounds.top+margin){
   const leftSlot=controls.left-bounds.left-half-12;
   if(leftSlot>=half+margin)x=leftSlot;
   else y=controls.bottom-bounds.top+greetingHeight+12;
 }
 greeting.style.setProperty('--greeting-x',`${x}px`);
 greeting.style.setProperty('--greeting-y',`${y}px`);
};
let positionGreeting=()=>{
 const bounds=host.getBoundingClientRect();
 const image=document.querySelector('.character-fallback img').getBoundingClientRect();
 placeGreeting(image.left-bounds.left+image.width*.5,image.top-bounds.top+image.height*.14-12,bounds);
};
const greet=()=>{
 greetingText.textContent='Hi! 👋';
 greeting.hidden=false;
 greetingWidth=greeting.offsetWidth;greetingHeight=greeting.offsetHeight;
 onGreet();positionGreeting();
 clearTimeout(greetingTimer);
 greetingTimer=setTimeout(()=>{greeting.hidden=true},5000);
};
window.addEventListener('resize',()=>{if(!greeting.hidden)positionGreeting()},{passive:true});
// The illustrated fallback can say hello too when WebGL is unavailable.
document.getElementById('bot-fallback-button').addEventListener('click',greet);
try {
 // A compact product-render setup: soft studio reflections, restrained highlights,
 // and distinct ceramic, painted aluminium, rubber and optical-glass surfaces.
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=.88;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,.1,50);
 camera.position.set(0,.65,8.6);camera.lookAt(0,.25,0);
 const pmrem=new THREE.PMREMGenerator(renderer);
 const room=new RoomEnvironment();
 const environment=pmrem.fromScene(room,.065);
 scene.environment=environment.texture;
 scene.environmentIntensity=.7;
 room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfff8ee,0x6d6258,.65));
 const key=new THREE.DirectionalLight(0xfff3df,2.5);key.position.set(-3,5,4);scene.add(key);
 const rim=new THREE.DirectionalLight(0xe2edff,1.8);rim.position.set(4,3,-4);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xe2edff,.6);fill.position.set(3,0,4);scene.add(fill);
 const shell=new THREE.MeshPhysicalMaterial({color:0xeee5d6,roughness:.32,metalness:.06,clearcoat:.35,clearcoatRoughness:.24});
 const accent=new THREE.MeshPhysicalMaterial({color:0xc8512a,roughness:.36,metalness:.25,clearcoat:.3,clearcoatRoughness:.3});
 const metal=new THREE.MeshStandardMaterial({color:0xa4a8aa,roughness:.29,metalness:.88});
 const joint=new THREE.MeshStandardMaterial({color:0x42474c,roughness:.4,metalness:.7});
 const rubber=new THREE.MeshStandardMaterial({color:0x202528,roughness:.82,metalness:0});
 const glass=new THREE.MeshPhysicalMaterial({color:0x101d27,roughness:.16,metalness:.16,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:.65});
 const glow=new THREE.MeshStandardMaterial({color:0xffe1ae,emissive:0xffc878,emissiveIntensity:.65,roughness:.4});
 const lens=new THREE.MeshPhysicalMaterial({color:0x16384b,roughness:.08,metalness:.5,clearcoat:1});
 const robot=new THREE.Group();scene.add(robot);robot.rotation.set(.04,-.28,0);
 const mesh=(geometry,material,parent,pos=[0,0,0])=>{const m=new THREE.Mesh(geometry,material);m.position.set(...pos);parent.add(m);return m;};
 // Thin inset panels need a rounded outline independent of their depth;
 // RoundedBoxGeometry alone clamps corner radius to half the thin dimension.
 const panelGeometry=(w,h,d,r)=>{
   const shape=new THREE.Shape(),x=-w/2,y=-h/2;
   r=Math.min(r,w/2,h/2);
   shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
   shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
   shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
   shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
   const bevel=Math.min(d*.2,.008);
   const geometry=new THREE.ExtrudeGeometry(shape,{depth:d-2*bevel,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:12});
   geometry.translate(0,0,-d/2+bevel);return geometry;
 };
 const box=(w,h,d,r,mat,parent,pos)=>mesh(r>d/2?panelGeometry(w,h,d,r):new RoundedBoxGeometry(w,h,d,5,r),mat,parent,pos);
 const ball=(r,mat,parent,pos,scale=[1,1,1])=>{const m=mesh(new THREE.SphereGeometry(r,32,24),mat,parent,pos);m.scale.set(...scale);return m;};
 const cylinder=(r,h,mat,parent,pos)=>mesh(new THREE.CylinderGeometry(r,r,h,40),mat,parent,pos);
 const ring=(r,t,mat,parent,pos)=>mesh(new THREE.TorusGeometry(r,t,8,48),mat,parent,pos);
 const screw=(parent,x,y,z)=>{
   const s=cylinder(.022,.012,metal,parent,[x,y,z]);s.rotation.x=Math.PI/2;
   box(.022,.004,.004,.001,rubber,parent,[x,y,z+.008]);
 };
 // A gasket between front and rear castings gives the shell a believable assembly seam.
 box(1.16,1.08,.84,.23,rubber,robot,[0,-.45,-.025]);
 box(1.14,1.06,.55,.22,accent,robot,[0,-.45,.145]);
 box(1.12,1.04,.3,.2,shell,robot,[0,-.45,-.31]);
  // Leave a real gap above the torso, with a visible neck and swivel joint.
 cylinder(.2,.045,metal,robot,[0,.105,0]);
 cylinder(.13,.2,joint,robot,[0,.22,0]);
 for(let y=.145;y<.29;y+=.045)cylinder(.145,.018,rubber,robot,[0,y,0]);
 ball(.115,metal,robot,[0,.315,0]);
 // Recessed ceramic badge with a machined frame and small status indicators.
 box(.76,.66,.045,.13,rubber,robot,[0,-.4,.427]);
 box(.71,.61,.055,.12,metal,robot,[0,-.4,.446]);
 box(.65,.55,.04,.1,shell,robot,[0,-.4,.48]);
 const badge=new THREE.Group();robot.add(badge);badge.position.set(0,-.36,.51);
 ball(.09,accent,badge,[-.1,0,0],[1,.8,.2]);ball(.13,accent,badge,[0,.04,0],[1,.9,.2]);ball(.09,accent,badge,[.11,0,0],[1,.8,.2]);box(.26,.09,.018,.025,accent,badge,[0,-.024,0]);
 box(.2,.052,.02,.018,rubber,robot,[0,-.79,.425]);
 box(.12,.017,.025,.007,glow,robot,[0,-.79,.438]);
 for(const x of [-.43,.43])for(const y of [-.12,-.77])screw(robot,x,y,.419);
 for(let i=0;i<4;i++)box(.06,.015,.025,.006,rubber,robot,[-.12+i*.08,-.61,.508]);
 // Turn around the neck joint rather than through the middle of the face.
 const headPivot=new THREE.Group();headPivot.name='head-pivot';headPivot.position.y=.3;headPivot.rotation.order='YXZ';robot.add(headPivot);
 const head=new THREE.Group();head.name='head-shell';head.position.y=.74;headPivot.add(head);
 box(1.9,1.35,1.16,.36,rubber,head,[0,0,-.025]);
 box(1.91,1.37,.78,.35,shell,head,[0,0,.2]);
 box(1.87,1.33,.42,.2,shell,head,[0,0,-.42]);
 // Three nested layers produce a recessed screen instead of a shiny protruding block.
 box(1.65,1.02,.1,.21,joint,head,[0,-.015,.598]);
 box(1.59,.96,.075,.2,rubber,head,[0,-.015,.65]);
 box(1.52,.89,.06,.19,glass,head,[0,-.015,.693]);
 const eyeRig=new THREE.Group();eyeRig.name='eye-rig';head.add(eyeRig);
 const eyes=[];
 for(const x of [-.34,.34])eyes.push(box(.115,.235,.012,.052,glow,eyeRig,[x,.035,.73]));
 const smileCurve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.15,-.19,.732),new THREE.Vector3(0,-.3,.736),new THREE.Vector3(.15,-.19,.732));
 mesh(new THREE.TubeGeometry(smileCurve,32,.014,8,false),glow,head);
 // Camera lens, microphone perforations and tiny fasteners at real assembly points.
 const sensor=ring(.035,.009,metal,head,[0,.535,.587]);
 ball(.027,lens,head,[0,.535,.597],[1,1,.35]);
 for(let i=0;i<5;i++)ball(.011,rubber,head,[-.06+i*.03,-.57,.586],[1,1,.25]);
 for(const x of [-.79,.79])for(const y of [-.48,.48])screw(head,x,y,.535);
 for(const side of [-1,1]){
   const seal=cylinder(.215,.06,rubber,head,[side*.963,-.02,-.02]);seal.rotation.z=Math.PI/2;
   const ear=cylinder(.19,.12,accent,head,[side*1.01,-.02,-.02]);ear.rotation.z=Math.PI/2;
   const disc=cylinder(.13,.13,metal,head,[side*1.035,-.02,-.02]);disc.rotation.z=Math.PI/2;
   const hub=cylinder(.08,.135,joint,head,[side*1.04,-.02,-.02]);hub.rotation.z=Math.PI/2;
 }
 cylinder(.065,.05,rubber,head,[0,.7,-.08]);
 cylinder(.027,.21,metal,head,[0,.82,-.08]);
 ball(.087,accent,head,[0,.96,-.08]);
 ball(.032,glow,head,[0,1.015,-.035]);
 const arms=[];
 for(const side of [-1,1]){
   const arm=new THREE.Group();arm.position.set(side*.68,-.15,0);robot.add(arm);arms.push(arm);
   ball(.16,joint,arm,[0,0,0]);
   const shoulder=cylinder(.115,.2,metal,arm,[side*.04,0,0]);shoulder.rotation.z=Math.PI/2;
   box(.29,.36,.32,.11,shell,arm,[side*.065,-.22,0]);
   ball(.12,rubber,arm,[side*.08,-.4,0]);
   box(.3,.22,.34,.085,accent,arm,[side*.09,-.51,.015]);
   box(.24,.2,.27,.065,joint,arm,[side*.09,-.68,.035]);
   // Individual finger sections and an opposable thumb retain the friendly silhouette.
   for(let i=0;i<3;i++)box(.062,.145,.12,.026,shell,arm,[side*.09+(i-1)*.073,-.72,.15]);
   box(.09,.14,.15,.04,shell,arm,[-side*.065,-.64,.12]);
   arm.rotation.z=side*.12;
   cylinder(.15,.19,joint,robot,[side*.3,-1.04,0]);
   for(let i=0;i<3;i++)cylinder(.165,.025,rubber,robot,[side*.3,-1.04-i*.045,0]);
   box(.34,.27,.38,.1,shell,robot,[side*.3,-1.23,0]);
   box(.51,.13,.73,.06,rubber,robot,[side*.32,-1.51,.16]);
   box(.51,.25,.73,.12,shell,robot,[side*.32,-1.38,.16]);
   box(.34,.035,.018,.01,accent,robot,[side*.32,-1.4,.528]);
 }
 // Serviceable rear housing: cooling fins, screws and a recessed charging socket.
 box(.75,.77,.12,.12,rubber,robot,[0,-.4,-.5]);
 box(.7,.72,.11,.1,joint,robot,[0,-.4,-.565]);
 for(let i=0;i<5;i++)box(.42,.035,.025,.012,rubber,robot,[0,-.19-i*.075,-.628]);
 box(.17,.07,.035,.02,metal,robot,[0,-.66,-.63]);
 box(.125,.035,.04,.012,rubber,robot,[0,-.66,-.65]);
 for(const x of [-.27,.27])for(const y of [-.12,-.68]){
   const backScrew=cylinder(.022,.016,metal,robot,[x,y,-.631]);backScrew.rotation.x=Math.PI/2;
 }
 for(let i=0;i<5;i++)box(.52,.026,.025,.01,rubber,head,[0,-.18+i*.075,-.636]);
 // Soft contact shadows are baked into small radial textures. They stay smooth
 // on mobile and avoid the old hard-edged directional silhouette on the backdrop.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
 const ctx=shadowCanvas.getContext('2d');
 const gradient=ctx.createRadialGradient(64,64,2,64,64,64);
 gradient.addColorStop(0,'rgba(39,29,18,.34)');gradient.addColorStop(.35,'rgba(39,29,18,.20)');gradient.addColorStop(1,'rgba(39,29,18,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const shadowTexture=new THREE.CanvasTexture(shadowCanvas);shadowTexture.colorSpace=THREE.SRGBColorSpace;
 const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,toneMapped:false});
 const plinthMaterial=new THREE.MeshStandardMaterial({color:0xc8bfae,roughness:.65,metalness:.14});
 cylinder(1.48,.11,plinthMaterial,scene,[0,-1.625,0]);
 const baseShadow=mesh(new THREE.PlaneGeometry(4.4,3.8),shadowMaterial,scene,[0,-1.682,0]);baseShadow.rotation.x=-Math.PI/2;
 const contact=mesh(new THREE.PlaneGeometry(2.2,1.6),shadowMaterial,scene,[0,-1.569,.12]);contact.rotation.x=-Math.PI/2;
 for(const side of [-1,1]){
   const footShadow=mesh(new THREE.PlaneGeometry(.85,1.05),shadowMaterial,scene,[side*.32,-1.568,.16]);footShadow.rotation.x=-Math.PI/2;
 }
 const baseTrim=ring(1.455,.009,metal,scene,[0,-1.566,0]);baseTrim.rotation.x=Math.PI/2;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduce.matches,inView=true,dragging=false,lastX=0,lastY=0,targetY=-.28,targetX=.04,yaw=-.28,pitch=.04,spinRemaining=0,time=0,lastFrame=0,lastInteraction=0,pointerX=0,pointerY=0,pointerActive=false,gazeX=0,gazeY=0,waveElapsed=Infinity,pressX=0,pressY=0,pressMoved=false;
 onGreet=()=>{updateCanvasBounds();if(!paused&&!reduce.matches)waveElapsed=0};
 const pauseButton=document.getElementById('model-pause');
 function syncPause(){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.innerHTML=paused?'▶ <span>Play</span>':'Ⅱ <span>Pause</span>';pauseButton.setAttribute('aria-label',paused?'Play idle animation':'Pause idle animation');}
 syncPause();reduce.addEventListener('change',()=>{paused=reduce.matches;syncPause()});
 // Cache the canvas bounds, then project the head to screen coordinates. This
 // makes the gaze follow the mouse anywhere in the viewport, relative to the bot.
 let canvasBounds=canvas.getBoundingClientRect(),hostBounds=host.getBoundingClientRect(),controlsBounds=document.querySelector('.model-controls').getBoundingClientRect();
 const headScreen=new THREE.Vector3(),greetingAnchor=new THREE.Vector3();
 const updateCanvasBounds=()=>{canvasBounds=canvas.getBoundingClientRect();hostBounds=host.getBoundingClientRect();controlsBounds=document.querySelector('.model-controls').getBoundingClientRect()};
 positionGreeting=()=>{
   robot.updateMatrixWorld(true);camera.updateMatrixWorld();
   greetingAnchor.set(0,1.17,0);head.localToWorld(greetingAnchor);greetingAnchor.project(camera);
   placeGreeting(canvasBounds.left-hostBounds.left+(greetingAnchor.x+1)*canvasBounds.width/2,canvasBounds.top-hostBounds.top+(1-greetingAnchor.y)*canvasBounds.height/2-10,hostBounds,controlsBounds);
 };
 const clearGaze=()=>{pointerActive=false};
 window.addEventListener('pointermove',e=>{
   if(e.pointerType==='touch')return;
   pointerX=e.clientX;pointerY=e.clientY;pointerActive=true;
 },{passive:true});
 document.addEventListener('pointerleave',clearGaze);
 window.addEventListener('blur',clearGaze);
 window.addEventListener('scroll',updateCanvasBounds,{passive:true});
 const resize=()=>{updateCanvasBounds();const r=canvas.parentElement.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=camera.aspect<.85?9.6:8.6;camera.updateProjectionMatrix();renderer.render(scene,camera)};
 new ResizeObserver(resize).observe(canvas.parentElement);
 const reset=()=>{targetY=-.28;targetX=.04;spinRemaining=0;waveElapsed=Infinity;greeting.hidden=true;clearTimeout(greetingTimer);pointerActive=false;gazeX=gazeY=0;headPivot.rotation.set(0,0,0);eyeRig.position.set(0,0,0);status.textContent='Character view reset.'};
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;pressX=lastX=e.clientX;pressY=lastY=e.clientY;pressMoved=false;spinRemaining=0;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');lastInteraction=performance.now()});
 canvas.addEventListener('pointermove',e=>{if(dragging){if(Math.hypot(e.clientX-pressX,e.clientY-pressY)>8)pressMoved=true;targetY+=(e.clientX-lastX)*.012;targetX=THREE.MathUtils.clamp(targetX+(e.clientY-lastY)*.006,-.4,.4);lastX=e.clientX;lastY=e.clientY;lastInteraction=performance.now()}});
 // Greet on a short tap directly on the robot, not a drag or the stage background.
 const raycaster=new THREE.Raycaster(),tapPoint=new THREE.Vector2();
 const endDrag=()=>{dragging=false;canvas.classList.remove('dragging');lastInteraction=performance.now()};
 canvas.addEventListener('pointerup',e=>{
   const tapped=dragging&&!pressMoved&&Math.hypot(e.clientX-pressX,e.clientY-pressY)<=8;
   endDrag();
   if(!tapped)return;
   updateCanvasBounds();
   tapPoint.set((e.clientX-canvasBounds.left)/canvasBounds.width*2-1,-(e.clientY-canvasBounds.top)/canvasBounds.height*2+1);
   camera.updateMatrixWorld();robot.updateMatrixWorld(true);
   raycaster.setFromCamera(tapPoint,camera);
   if(raycaster.intersectObject(robot,true).length)greet();
 });
 canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 canvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat)greet()}});
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)){e.preventDefault();lastInteraction=performance.now();if(e.key==='ArrowLeft')targetY-=.25;if(e.key==='ArrowRight')targetY+=.25;if(e.key==='ArrowUp')targetX=Math.max(-.4,targetX-.12);if(e.key==='ArrowDown')targetX=Math.min(.4,targetX+.12);if(e.key==='Home')reset()}});
 document.getElementById('model-spin').addEventListener('click',()=>{spinRemaining=Math.PI*2;status.textContent='Spinning Gokul-bot through 360 degrees.'});
 pauseButton.addEventListener('click',()=>{paused=!paused;syncPause();status.textContent=paused?'Idle animation paused. Drag to rotate.':'Idle animation playing.'});document.getElementById('model-reset').addEventListener('click',reset);
 new IntersectionObserver(([e])=>{inView=e.isIntersecting},{threshold:0}).observe(canvas);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('three-ready');host.classList.add('three-unavailable');status.textContent='3D is unavailable in this browser. A robot illustration is displayed.'});canvas.addEventListener('webglcontextrestored',()=>{resize();host.classList.remove('three-unavailable');host.classList.add('three-ready')});
 renderer.setAnimationLoop(now=>{if(document.hidden||!inView){lastFrame=now;return}if(now-lastFrame<1000/40)return;const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;if(!paused)time+=dt;
 if(spinRemaining>0){const step=Math.min(spinRemaining,dt*3.7);targetY+=step;spinRemaining-=step;lastInteraction=now;}
 const smoothing=reduce.matches?1:1-Math.exp(-dt*10);yaw+=(targetY-yaw)*smoothing;pitch+=(targetX-pitch)*smoothing;
 robot.rotation.y=yaw+(!paused&&!dragging?Math.sin(time*.5)*.07:0);robot.rotation.x=pitch;
 robot.position.y=paused?0:Math.sin(time*1.8)*.012;
 // Eyes lead the turn slightly; the heavier head catches up at the neck.
 // Keep rotations bounded so the shell clears the torso even at the extremes.
 let lookX=0,lookY=0;
 if(pointerActive&&!paused&&!reduce.matches&&!dragging&&spinRemaining<=0){
   robot.updateMatrixWorld(true);head.getWorldPosition(headScreen);headScreen.project(camera);
   const screenX=canvasBounds.left+(headScreen.x+1)*canvasBounds.width/2;
   const screenY=canvasBounds.top+(1-headScreen.y)*canvasBounds.height/2;
   lookX=THREE.MathUtils.clamp((pointerX-screenX)/Math.max(window.innerWidth*.45,300),-1,1);
   lookY=THREE.MathUtils.clamp((pointerY-screenY)/Math.max(window.innerHeight*.45,220),-1,1);
 }
 const headSmoothing=1-Math.exp(-dt*5.5),eyeSmoothing=1-Math.exp(-dt*11);
 headPivot.rotation.y+=(lookX*.55-headPivot.rotation.y)*headSmoothing;
 headPivot.rotation.x+=(lookY*.22-headPivot.rotation.x)*headSmoothing;
 gazeX+=(lookX-gazeX)*eyeSmoothing;gazeY+=(lookY-gazeY)*eyeSmoothing;
 eyeRig.position.set(gazeX*.095,-gazeY*.065,0);
 arms[0].rotation.z=-.12+(!paused?Math.sin(time*1.5)*.025:0);arms[1].rotation.z=.12+(!paused?Math.sin(time*1.5+1)*.025:0);
 if(!paused&&!reduce.matches&&waveElapsed<1.8){
   waveElapsed=Math.min(waveElapsed+dt,1.8);
   const lift=Math.sin(Math.PI*waveElapsed/1.8);
   arms[1].rotation.z+=lift*(2.05+Math.sin(waveElapsed*17)*.18);
 }
 const blink=!paused&&time%5.2>5.03?.15:1;eyes.forEach(e=>e.scale.y=blink);
 if(!greeting.hidden)positionGreeting();
 renderer.render(scene,camera);
 });
 resize();renderer.render(scene,camera);host.classList.add('three-ready');
 canvas.dataset.engine='three.js';
} catch(error) { console.warn('3D character could not initialize:',error);host.classList.remove('three-ready');host.classList.add('three-unavailable');status.textContent='3D is unavailable in this browser. A robot illustration is displayed.'; }
