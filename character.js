import * as THREE from './assets/vendor/three.module.min.js';
import { RoundedBoxGeometry } from './assets/vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './assets/vendor/RoomEnvironment.js';

const host=document.querySelector('.hero-visual');
const canvas=document.getElementById('character-canvas');
const status=document.getElementById('model-status');
try {
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,.1,50);
 camera.position.set(0,.65,8.6); camera.lookAt(0,.25,0);
 const pmrem=new THREE.PMREMGenerator(renderer);
 const room=new RoomEnvironment();
 const environment=pmrem.fromScene(room,.04);
 scene.environment=environment.texture;
 room.dispose(); pmrem.dispose();
 scene.add(new THREE.AmbientLight(0xffffff,1.4));
 const key=new THREE.DirectionalLight(0xfff5e8,4);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-4;key.shadow.normalBias=.03;key.shadow.bias=-.0002;scene.add(key);
 const rim=new THREE.DirectionalLight(0x729aff,3);rim.position.set(4,2,-3);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xffffff,1);fill.position.set(1,0,5);scene.add(fill);
 const plastic=(color,roughness=.2,metalness=.08)=>new THREE.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.4});
 const shell=plastic(0xeaf1ff,.19,.12),accent=plastic(0x527fed,.19,.22),dark=plastic(0x07172d,.15,.23),joint=plastic(0x475572,.3,.5);
 const glow=new THREE.MeshStandardMaterial({color:0x7eeaff,emissive:0x59dfff,emissiveIntensity:2,roughness:.2});
 const warm=plastic(0xffae63,.22,.1);
 const robot=new THREE.Group();scene.add(robot);robot.rotation.set(.04,-.28,0);
 const mesh=(geometry,material,parent,pos=[0,0,0])=>{const m=new THREE.Mesh(geometry,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const box=(w,h,d,r,mat,parent,pos)=>mesh(new RoundedBoxGeometry(w,h,d,5,r),mat,parent,pos);
 const ball=(r,mat,parent,pos,scale=[1,1,1])=>{const m=mesh(new THREE.SphereGeometry(r,40,28),mat,parent,pos);m.scale.set(...scale);return m;};
 // Rounded vinyl body and articulated toy limbs.
 box(1.15,1.1,.83,.25,accent,robot,[0,-.45,0]);
 box(.69,.56,.07,.16,shell,robot,[0,-.42,.435]);
 const badge=new THREE.Group();robot.add(badge);badge.position.set(0,-.38,.49);
 ball(.11,accent,badge,[-.12,0,0],[1,.75,.3]);ball(.15,accent,badge,[0,.05,0],[1,.9,.3]);ball(.105,accent,badge,[.13,0,0],[1,.8,.3]);box(.3,.12,.045,.04,accent,badge,[0,-.025,0]);
 box(.15,.035,.06,.015,glow,robot,[0,-.77,.44]);
 const head=new THREE.Group();head.position.y=.72;robot.add(head);
 box(1.91,1.37,1.23,.4,shell,head,[0,0,0]);
 box(1.59,.88,.3,.27,dark,head,[0,-.015,.59]);
 const eyes=[];
 for(const x of [-.38,.38]){eyes.push(box(.135,.28,.065,.06,glow,head,[x,.02,.765]));ball(.04,warm,head,[x*1.4,-.17,.748],[1.8,.7,.25]);}
 const smileCurve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.16,-.22,.77),new THREE.Vector3(0,-.34,.79),new THREE.Vector3(.16,-.22,.77));
 mesh(new THREE.TubeGeometry(smileCurve,24,.021,8,false),glow,head);
 for(const side of [-1,1]){const ear=mesh(new THREE.CylinderGeometry(.22,.22,.13,40),accent,head,[side*.985,-.02,0]);ear.rotation.z=Math.PI/2;const disc=mesh(new THREE.CylinderGeometry(.12,.12,.15,32),joint,head,[side*1.04,-.02,0]);disc.rotation.z=Math.PI/2;}
 mesh(new THREE.CylinderGeometry(.035,.035,.29,16),joint,head,[0,.78,-.08]);ball(.12,accent,head,[0,.96,-.08]);ball(.065,glow,head,[0,1.03,-.02]);
 const arms=[];
 for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.69,-.15,0);robot.add(arm);arms.push(arm);ball(.17,joint,arm,[0,0,0]);box(.31,.63,.36,.15,shell,arm,[side*.08,-.28,0]);ball(.19,accent,arm,[side*.1,-.6,.025],[1,1.1,1]);arm.rotation.z=side*.17;box(.38,.49,.41,.15,joint,robot,[side*.31,-1.12,0]);box(.53,.31,.76,.14,shell,robot,[side*.33,-1.4,.15]);}
 // Backpack details make the back view worthwhile when the visitor spins the model.
 box(.72,.77,.31,.16,joint,robot,[0,-.4,-.51]);
 for(let i=0;i<3;i++)box(.4,.045,.05,.015,accent,robot,[0,-.22-i*.12,-.69]);
 const plinthMaterial=plastic(0x1c293f,.34,.5);
 const plinth=mesh(new THREE.CylinderGeometry(1.45,1.55,.14,80),plinthMaterial,scene,[0,-1.72,0]);
 const ringMaterial=new THREE.MeshStandardMaterial({color:0x82b9ff,emissive:0x4e80fa,emissiveIntensity:1.4,roughness:.3,metalness:.25});
 const ring=mesh(new THREE.TorusGeometry(1.48,.016,8,96),ringMaterial,scene,[0,-1.665,0]);ring.rotation.x=Math.PI/2;
 const shadow=mesh(new THREE.PlaneGeometry(15,15),new THREE.ShadowMaterial({opacity:.18}),scene,[0,-1.805,0]);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
 const orbiters=new THREE.Group();scene.add(orbiters);
 const satellites=[];for(let i=0;i<3;i++){const m=mesh(new THREE.OctahedronGeometry(.075+i*.02,1),i===1?shell:accent,orbiters);satellites.push(m);}
 const palettes={dark:{shell:0xe3edff,accent:0x4b7de7,rim:0x729aff,eye:0x72e3ff,base:0x182338,ring:0x719ef8},neon:{shell:0xc8b9fa,accent:0x8651d7,rim:0xd651ff,eye:0x52ffe1,base:0x241d3b,ring:0x61f7e9},editorial:{shell:0xfff1d9,accent:0xe66235,rim:0xffd399,eye:0xffd891,base:0xc6b8a0,ring:0xf29a65}};
 let theme='';function updateTheme(){theme=document.body.dataset.theme;const p=palettes[theme]||palettes.dark;shell.color.setHex(p.shell);accent.color.setHex(p.accent);rim.color.setHex(p.rim);glow.color.setHex(p.eye);glow.emissive.setHex(p.eye);plinthMaterial.color.setHex(p.base);ringMaterial.color.setHex(p.ring);ringMaterial.emissive.setHex(p.ring);renderer.toneMappingExposure=theme==='editorial'?1.05:1.15;}
 new MutationObserver(updateTheme).observe(document.body,{attributes:true,attributeFilter:['data-theme']});updateTheme();
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduce.matches,inView=true,dragging=false,lastX=0,lastY=0,targetY=-.28,targetX=.04,yaw=-.28,pitch=.04,spinRemaining=0,time=0,lastFrame=0,lastInteraction=0,pointerX=0,pointerY=0;
 const pauseButton=document.getElementById('model-pause');
 function syncPause(){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.innerHTML=paused?'▶ <span>Play</span>':'Ⅱ <span>Pause</span>';pauseButton.setAttribute('aria-label',paused?'Play idle animation':'Pause idle animation');}
 syncPause();reduce.addEventListener('change',()=>{paused=reduce.matches;syncPause()});
 const resize=()=>{const r=canvas.parentElement.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=camera.aspect<.85?9.6:8.6;camera.updateProjectionMatrix();renderer.render(scene,camera)};
 new ResizeObserver(resize).observe(canvas.parentElement);
 const reset=()=>{targetY=-.28;targetX=.04;spinRemaining=0;pointerX=pointerY=0;status.textContent='Character view reset.'};
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;lastX=e.clientX;lastY=e.clientY;spinRemaining=0;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');lastInteraction=performance.now()});
 canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();pointerX=((e.clientX-rect.left)/rect.width-.5);pointerY=((e.clientY-rect.top)/rect.height-.5);if(dragging){targetY+=(e.clientX-lastX)*.012;targetX=THREE.MathUtils.clamp(targetX+(e.clientY-lastY)*.006,-.4,.4);lastX=e.clientX;lastY=e.clientY;lastInteraction=performance.now()}});
 const endDrag=()=>{dragging=false;canvas.classList.remove('dragging');lastInteraction=performance.now()};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);canvas.addEventListener('pointerleave',()=>{pointerX=pointerY=0});
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)){e.preventDefault();lastInteraction=performance.now();if(e.key==='ArrowLeft')targetY-=.25;if(e.key==='ArrowRight')targetY+=.25;if(e.key==='ArrowUp')targetX=Math.max(-.4,targetX-.12);if(e.key==='ArrowDown')targetX=Math.min(.4,targetX+.12);if(e.key==='Home')reset()}});
 document.getElementById('model-spin').addEventListener('click',()=>{spinRemaining=Math.PI*2;status.textContent='Spinning Gokul-bot through 360 degrees.'});
 pauseButton.addEventListener('click',()=>{paused=!paused;syncPause();status.textContent=paused?'Idle animation paused. Drag to rotate.':'Idle animation playing.'});document.getElementById('model-reset').addEventListener('click',reset);
 new IntersectionObserver(([e])=>{inView=e.isIntersecting},{threshold:0}).observe(canvas);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('three-ready');host.classList.add('three-unavailable');status.textContent='3D is unavailable in this browser. A robot illustration is displayed.'});canvas.addEventListener('webglcontextrestored',()=>{resize();host.classList.add('three-ready')});
 renderer.setAnimationLoop(now=>{if(document.hidden||!inView){lastFrame=now;return}if(now-lastFrame<1000/40)return;const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;if(!paused)time+=dt;
 if(spinRemaining>0){const step=Math.min(spinRemaining,dt*3.7);targetY+=step;spinRemaining-=step;lastInteraction=now;}
 const smoothing=reduce.matches?1:1-Math.exp(-dt*10);yaw+=(targetY-yaw)*smoothing;pitch+=(targetX-pitch)*smoothing;
 robot.rotation.y=yaw+(!paused&&!dragging?Math.sin(time*.5)*.07:0);robot.rotation.x=pitch;
 robot.position.y=paused?0:Math.sin(time*1.8)*.055;
 head.rotation.y=paused||dragging?0:pointerX*.12;head.rotation.x=paused||dragging?0:pointerY*.08;
 arms[0].rotation.z=-.17+(!paused?Math.sin(time*1.5)*.055:0);arms[1].rotation.z=.17+(!paused?Math.sin(time*1.5+1)*.055:0);
 const blink=!paused&&time%5.2>5.03?.15:1;eyes.forEach(e=>e.scale.y=blink);
 satellites.forEach((m,i)=>{const a=(paused?0:time*.3)+i*Math.PI*2/3;m.position.set(Math.cos(a)*1.95,.4+Math.sin(a*1.3+i)*.8,Math.sin(a)*.7-.7);m.rotation.set(time*.3+i,time*.5,0)});
 renderer.render(scene,camera);
 });
 resize();renderer.render(scene,camera);host.classList.add('three-ready');
 canvas.dataset.engine='three.js';
} catch(error) { console.warn('3D character could not initialize:',error);host.classList.remove('three-ready');host.classList.add('three-unavailable');status.textContent='3D is unavailable in this browser. A robot illustration is displayed.'; }
