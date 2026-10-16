/* 10 pm on the Fourth: fireworks launched from a barge ~200 m out on Gun Lake, bursting 70-140 m up.
   Red, white, blue and gold peonies, chrysanthemums, willows, rings and glitter; each burst flashes the lake and the venue,
   and its boom arrives late (sound travels ~343 m/s). F fires a finale. One Points draw call plus its reflection. */
(function(B){
var THREE = window.THREE, rnd = B.rnd;
var N = B.LOW ? 2600 : 5200, BARGE = {x:12, z:-200};
var pos=new Float32Array(N*3), vel=new Float32Array(N*3), col=new Float32Array(N*3), base=new Float32Array(N*3), size=new Float32Array(N), sz0=new Float32Array(N);
var life=new Float32Array(N), max=new Float32Array(N), kind=new Uint8Array(N), next=0;   // kind: 0 star, 1 glitter, 2 willow, 3 rocket, 4 smoke-less trail spark
var g=new THREE.BufferGeometry();
g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('gcolor',new THREE.BufferAttribute(col,3)); g.setAttribute('size',new THREE.BufferAttribute(size,1));
function mat(gain){ return new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
  uniforms:{uScale:{value:900},gain:{value:gain}},
  vertexShader:'attribute float size; attribute vec3 gcolor; uniform float uScale; varying vec3 vC; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(size*uScale/max(1.0,-mv.z),0.0,64.0); vC=gcolor; }',
  fragmentShader:'uniform float gain; varying vec3 vC; void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d)*2.0; if(r>1.0) discard; float a=pow(1.0-r,1.6)+smoothstep(0.3,0.0,r); gl_FragColor=vec4(vC*a*gain,1.0); }'}); }
var mSky=mat(1.0), mRef=mat(0.3);
var sky=new THREE.Points(g,mSky); sky.frustumCulled=false; sky.visible=false; B.scene.add(sky);
var refl=new THREE.Points(g,mRef); refl.frustumCulled=false; refl.visible=false; refl.scale.y=-1; refl.position.y=2*B.WATER_Y; B.scene.add(refl);
// barge out on the water
B.box(9,0.6,5,BARGE.x,B.WATER_Y-0.3,BARGE.z,'darkMetal'); for(var i=0;i<6;i++) B.cyl(0.15,0.15,0.9,BARGE.x-3+i*1.2,0.2-0.75,BARGE.z,'black',6);
B.glow(BARGE.x-4,0.3,BARGE.z+2.4,1.2,0xff3b30,0,true); B.glow(BARGE.x+4,0.3,BARGE.z+2.4,1.2,0x3bff6a,0,true);

// the flash: one point light, plus a tint on the water shader
var flash=new THREE.PointLight(0xffffff,0,900,1); flash.position.set(BARGE.x,100,BARGE.z); B.scene.add(flash);
var flashLevel=0, flashCol=new THREE.Color();

var PAL=[[1,0.18,0.2],[1,0.97,0.92],[0.3,0.48,1],[1,0.78,0.36],[0.85,0.25,1],[0.35,0.95,0.75]];
var RWB=[0,1,2,3];
function spawn(x,y,z,vx,vy,vz,c,l,s,k){ var i=next; next=(next+1)%N;
  pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z; vel[i*3]=vx; vel[i*3+1]=vy; vel[i*3+2]=vz;
  base[i*3]=c[0]; base[i*3+1]=c[1]; base[i*3+2]=c[2]; life[i]=max[i]=l; sz0[i]=s; kind[i]=k; return i; }
var shells=[], audioQ=[];
function launch(o){ o=o||{}; var x=BARGE.x+rnd(-40,40), z=BARGE.z+rnd(-12,12), h=o.h||rnd(80,135);
  shells.push({x:x,y:0,z:z,vy:Math.sqrt(2*9.8*h)*1.03,ty:h,type:o.type||['peony','peony','chrys','willow','ring','glitter','double'][(Math.random()*7)|0],
    c1:o.c1!=null?o.c1:RWB[(Math.random()*RWB.length)|0], c2:o.c2!=null?o.c2:RWB[(Math.random()*RWB.length)|0], trail:0});
  boom(x,0,z,0.25,true); }
function burst(s){ var n=s.type==='ring'?70:s.type==='willow'?110:s.type==='double'?150:130, sp=s.type==='willow'?27:rnd(33,43), c1=PAL[s.c1], c2=PAL[s.c2];
  var ax=rnd(-1,1), az=rnd(-1,1), al=Math.hypot(ax,az)||1;
  for(var k=0;k<n;k++){ var vx,vy,vz;
    if(s.type==='ring'){ var a=k/n*Math.PI*2; vx=Math.cos(a)*sp; vy=Math.sin(a)*sp*Math.abs(az/al); vz=Math.sin(a)*sp*(ax/al); }
    else { var u=rnd(-1,1), th=rnd(0,Math.PI*2), r=Math.sqrt(1-u*u); vx=r*Math.cos(th)*sp; vy=u*sp; vz=r*Math.sin(th)*sp; if(s.type==='double' && k%2){ vx*=0.55; vy*=0.55; vz*=0.55; } }
    var c=(s.type==='double' ? (k%2?c2:c1) : (k%3===0?c2:c1)), kd=s.type==='willow'?2:s.type==='glitter'?1:0;
    if(s.type==='willow') c=PAL[3];
    spawn(s.x,s.y,s.z,vx,vy,vz,c, kd===2?rnd(3.2,4.2):rnd(1.6,2.4), kd===2?2.4:3.2, kd); }
  flashLevel=Math.min(1.6,flashLevel+1.0); flashCol.setRGB(c1[0],c1[1],c1[2]); flash.position.set(s.x,s.y,s.z);
  boom(s.x,s.y,s.z,s.type==='willow'?0.7:1.0,false,s.type==='glitter'); }

// ---------- sound: launch thumps and booms, delayed by distance ----------
function boom(x,y,z,vol,launchThump,crackle){ var A=B.audio(); if(!A||!B.night()) return;
  var cp=B.camera.getWorldPosition(new THREE.Vector3()), d=Math.hypot(cp.x-x,cp.y-y,cp.z-z), at=A.currentTime+d/343;
  var src=A.createBufferSource(); src.buffer=B.noiseBuf; var lp=A.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=launchThump?260:(crackle?2200:520);
  var gn=A.createGain(), v=Math.min(1,vol*180/d)*(launchThump?0.5:1.2);
  gn.gain.setValueAtTime(0,at); gn.gain.linearRampToValueAtTime(v,at+0.01); gn.gain.exponentialRampToValueAtTime(0.001,at+(launchThump?0.5:crackle?1.6:2.2));
  src.connect(lp); lp.connect(gn); gn.connect(B.master()); src.start(at,Math.random()*2); src.stop(at+2.5); }

// ---------- the show ----------
var showT=1.5, finale=0;
B.finale=function(){ if(!B.night()){ B.setNight(true); B.flash('10:00 pm · the finale'); } finale=7; };
B.onUpdate(function(dt,t){
  var on=B.night(); sky.visible=refl.visible=on||shells.length>0||flashLevel>0.01;
  if(B.pxScale){ mSky.uniforms.uScale.value=mRef.uniforms.uScale.value=B.pxScale; }
  if(!sky.visible) return;
  if(on){ showT-=dt; if(finale>0){ finale-=dt; if(showT<=0){ launch({h:rnd(70,140)}); if(Math.random()<0.5) launch({h:rnd(90,140),type:'glitter',c1:1}); showT=rnd(0.12,0.3); } }
    else if(showT<=0){ launch(); if(Math.random()<0.25) launch(); showT=rnd(0.7,2.2); } }
  // shells rising, with a little spark trail
  for(var s=shells.length-1;s>=0;s--){ var sh=shells[s]; sh.vy-=9.8*dt; sh.y+=sh.vy*dt; sh.trail-=dt;
    if(sh.trail<=0){ sh.trail=0.03; spawn(sh.x+rnd(-0.2,0.2),sh.y,sh.z+rnd(-0.2,0.2),rnd(-1,1),rnd(-2,0),rnd(-1,1),[1,0.75,0.45],0.45,1.1,4); }
    if(sh.vy<=2 || sh.y>=sh.ty){ burst(sh); shells.splice(s,1); } }
  // stars
  var dragK=Math.pow(0.32,dt), dragW=Math.pow(0.55,dt);
  for(var i=0;i<N;i++){ if(life[i]<=0){ if(size[i]){ size[i]=0; col[i*3]=col[i*3+1]=col[i*3+2]=0; } continue; }
    life[i]-=dt; var k=kind[i], dr=k===2?dragW:dragK;
    vel[i*3]*=dr; vel[i*3+1]=vel[i*3+1]*dr-(k===2?4.2:5.5)*dt; vel[i*3+2]*=dr;
    pos[i*3]+=vel[i*3]*dt; pos[i*3+1]+=vel[i*3+1]*dt; pos[i*3+2]+=vel[i*3+2]*dt;
    var f=Math.max(0,life[i]/max[i]), br=k===4?f:Math.pow(f,0.6);
    if(k===1 && f<0.6) br*=Math.random()<0.45?1.8:0.15;           // glitter
    if(k===2){ br*=0.9; }
    var warm=k===2?1:(1-f)*0.35;                                     // cool to orange as they die
    col[i*3]=Math.min(1,base[i*3]+warm*0.3)*br; col[i*3+1]=(base[i*3+1]*(1-warm*0.4))*br; col[i*3+2]=(base[i*3+2]*(1-warm))*br;
    size[i]=sz0[i]*(k===4?1:0.6+0.4*f); }
  g.attributes.position.needsUpdate=g.attributes.gcolor.needsUpdate=g.attributes.size.needsUpdate=true;
  flashLevel*=Math.pow(0.08,dt); flash.intensity=flashLevel*1.4;
  B.waterU.flashC.value.copy(flashCol).multiplyScalar(flashLevel*0.8); B.waterU.flashP.value.copy(flash.position);
});
})(window.BP);
