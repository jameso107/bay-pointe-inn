/* The docks: a white gangway from the patio out to a long walkway parallel to the shore, boat slips on the lake side,
   pontoons tied up, and American flags on poles along the walkway (they're there in every summer photo). */
(function(B){
var THREE = window.THREE, M = B.mat, rnd = B.rnd;
var DY=-0.05, WZ1=-14, WZ2=-12;   // deck top; walkway band

function deck(x1,z1,x2,z2){ B.box(x2-x1,0.12,z2-z1,(x1+x2)/2,DY-0.12,(z1+z2)/2,'deck'); B.walkable(x1,z1,x2,z2,DY);
  B.mapRect(x1,z1,x2,z2,'#eeeae2');
  for(var x=x1+0.1;x<=x2;x+=2.4) for(var z=z1+0.1; z<=z2; z+=Math.max(0.1,z2-z1-0.2)){ B.cyl(0.07,0.07,1.2,x,B.WATER_Y-0.6,z,'metal',6,{cast:false}); } }
deck(0.1,-12.05,1.9,-2.3);                       // gangway
deck(-30,WZ1,28,WZ2);                            // the long walkway
B.rail(0.15,-11.9,0.15,-2.5,DY,0.9); B.rail(1.85,-11.9,1.85,-2.5,DY,0.9);
B.solid(0.0,-11.9,0.2,-2.3); B.solid(1.8,-11.9,2.0,-2.3);
var fingers=[]; for(var fx=-27.5; fx<=26; fx+=4.9){ deck(fx-0.45,-20.5,fx+0.45,WZ1); fingers.push(fx); }
B.box(1.2,0.12,0.8,-30.6,DY-0.12,-13,'deck'); // ladder landing
for(var lx=-30.4;lx<-29.8;lx+=0.25) B.box(0.04,0.04,0.5,lx,DY-0.6,-13.6,'metal');

// boats in some of the slips: pontoons (white rails, navy biminis) and a runabout
function pontoon(cx,cz,ry,color){ var c=Math.cos(ry), s=Math.sin(ry);
  function P(lx,lz){ return [cx+lx*c+lz*s, cz-lx*s+lz*c]; }
  [-0.85,0.85].forEach(function(o){ var p=P(o,0); B.add(new THREE.CylinderGeometry(0.3,0.3,6.4,10),'metal',p[0],B.WATER_Y+0.12,p[1],ry,{rx:Math.PI/2}); });
  B.box(2.5,0.16,7,cx,B.WATER_Y+0.42,cz,'deck',ry);
  [[-1.22,0,0.06,7],[1.22,0,0.06,7],[0,-3.47,2.5,0.06],[0,3.47,2.5,0.06]].forEach(function(f){ var p=P(f[0],f[1]); B.box(f[2]===0.06?0.06:f[2],0.75,f[3],p[0],B.WATER_Y+0.58,p[1],'white',ry); });
  var q=P(0,0.6); B.box(2.3,0.04,3.4,q[0],B.WATER_Y+2.3,q[1],color,ry);
  [[-1.1,-1],[1.1,-1],[-1.1,2.2],[1.1,2.2]].forEach(function(f){ var p=P(f[0],f[1]); B.cyl(0.02,0.02,1.7,p[0],B.WATER_Y+0.6,p[1],'metal',4); });
  var st=P(-0.6,-1.8); B.box(0.7,0.9,0.5,st[0],B.WATER_Y+0.58,st[1],'white',ry);
  var seat=P(0,1.6); B.box(2.2,0.45,1.8,seat[0],B.WATER_Y+0.58,seat[1],'cream',ry);
}
pontoon(fingers[1]+2.45,-17.6,0,'navy'); pontoon(fingers[3]+2.45,-17.6,0,'navy'); pontoon(fingers[4]+2.45,-17.6,0,'blue');
pontoon(fingers[7]+2.45,-17.6,0,'navy'); pontoon(fingers[9]+2.45,-17.6,0,'navy');
(function(){ var x=fingers[6]+2.45, z=-17.4;   // runabout
  B.box(2.1,0.7,6.0,x,B.WATER_Y-0.1,z,'white'); B.box(2.0,0.08,5.8,x,B.WATER_Y+0.58,z,'navy'); B.box(1.7,0.4,0.6,x,B.WATER_Y+0.64,z-0.6,'glass'); })();

// flags on poles along the lake edge of the walkway, rippling in the breeze
var flagTex=B.canvasTex(380,200,function(g,w,h){ for(var i=0;i<13;i++){ g.fillStyle=i%2?'#f8f6f0':'#b22234'; g.fillRect(0,i*h/13,w,h/13+1); }
  g.fillStyle='#3c3b6e'; g.fillRect(0,0,w*0.4,h*7/13); g.fillStyle='#fff';
  for(var r=0;r<9;r++) for(var c=0;c<(r%2?5:6);c++){ g.beginPath(); g.arc(w*0.4*(c*2+1+(r%2))/12, h*7/13*(r+1)/10, 3.4, 0, 7); g.fill(); } },{repeat:false});
var flagMat=new THREE.MeshLambertMaterial({map:flagTex,side:THREE.DoubleSide}), flags=[];
[-24,-12.2,0,12.2,24].forEach(function(x,i){ var z=WZ1+0.15;
  B.cyl(0.045,0.06,6.2,x,DY,z,'white',8); B.add(new THREE.SphereGeometry(0.09,8,6),'gold',x,DY+6.25,z,0);
  var g=new THREE.PlaneGeometry(1.75,0.95,14,6); g.translate(0.875,0,0);
  var m=new THREE.Mesh(g,flagMat); m.position.set(x+0.05,DY+5.55,z); m.castShadow=true; B.scene.add(m);
  flags.push({m:m,base:Float32Array.from(g.attributes.position.array),ph:i*1.3}); });
var downwind=B.bearingDir(45,0);   // a light SW breeze off the land: flags stream out over the lake
var windYaw=Math.atan2(-downwind.z,downwind.x);
B.onUpdate(function(dt,t){ flags.forEach(function(f){ var p=f.m.geometry.attributes.position, a=p.array, b=f.base;
  f.m.rotation.y=windYaw+0.25*Math.sin(t*0.4+f.ph);
  for(var i=0;i<p.count;i++){ var x=b[i*3], y=b[i*3+1], k=x/1.75; a[i*3+2]=Math.sin(x*3.2-t*5.2+f.ph)*0.13*k+Math.sin(y*2.4+x*1.7-t*3.1)*0.04*k; a[i*3+1]=y-0.06*k*k; }
  p.needsUpdate=true; f.m.geometry.computeVertexNormals(); }); });

B.place({n:8, name:'The docks', desc:'Flags out over Gun Lake · the best seat in the house for the 10 pm fireworks', x:1, z:-13, r:9, at:[7.5,-13.2,Math.PI+0.2]});
})(window.BP);
