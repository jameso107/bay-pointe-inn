/* The inn (lake side) and the restaurant: cream lap siding, white trim, stacked white balconies, two front gables, slate roof with dormers.
   The main block's lake face is at z = 31, up on the terrace (y = 1.2). The centre stairs come down at x = -6. */
(function(B){
var THREE = window.THREE, M = B.mat, rnd = B.rnd;
var FLOOR = 3.3, BASE = 1.2;

// facade module: one window bay per floor (3.6 m wide x 3.3 m tall), with a lit-window emissive twin for 10 pm
function facadeDraw(lit){ return function(g,w,h){
  if(lit){ g.fillStyle='#000'; g.fillRect(0,0,w,h); }
  else { g.fillStyle='#e6d9bf'; g.fillRect(0,0,w,h); for(var y=0;y<h;y+=9){ g.fillStyle='rgba(0,0,0,0.11)'; g.fillRect(0,y,w,1.5); g.fillStyle='rgba(255,255,255,0.08)'; g.fillRect(0,y+2,w,2); } }
  var wx=w*0.27, ww=w*0.46, wy=h*0.2, wh=h*0.62;
  if(!lit){ g.fillStyle='#fbfaf6'; g.fillRect(wx-7,wy-7,ww+14,wh+10); g.fillStyle='#fbfaf6'; g.fillRect(0,h-6,w,6); }
  var gr=g.createLinearGradient(0,wy,0,wy+wh);
  if(lit){ gr.addColorStop(0,'#ffcf8a'); gr.addColorStop(1,'#f0a85a'); } else { gr.addColorStop(0,'#8fa7bb'); gr.addColorStop(0.5,'#4f6274'); gr.addColorStop(1,'#33424f'); }
  g.fillStyle=gr; g.fillRect(wx,wy,ww,wh);
  g.fillStyle=lit?'#000':'#fbfaf6'; g.fillRect(wx+ww/2-2.5,wy,5,wh); for(var k=1;k<4;k++) g.fillRect(wx,wy+wh*k/4-1.5,ww,3);
}; }
var facTex=B.canvasTex(256,236,facadeDraw(false)), facLit=B.canvasTex(256,236,facadeDraw(true));
M.facade=B.lam(0xffffff,{map:facTex,emissive:0xffffff,emissiveMap:facLit,emissiveIntensity:0}); M.facade.userData.tile=[3.6,FLOOR]; M.facade.userData.off=[0,BASE];
M.facadeLow=B.lam(0xffffff,{map:facTex,emissive:0xffffff,emissiveMap:facLit,emissiveIntensity:0}); M.facadeLow.userData.tile=[3.6,FLOOR]; M.facadeLow.userData.off=[0,0];
B.onTod(function(s){ M.facade.emissiveIntensity=M.facadeLow.emissiveIntensity=s*0.85; });

// white balcony railing: an alpha-tested baluster texture on a plane (own UVs so the rails line up)
var railTex=B.canvasTex(128,128,function(g,w,h){ g.clearRect(0,0,w,h); g.fillStyle='#fff'; g.fillRect(0,0,w,14); g.fillRect(0,h-12,w,12); for(var x=4;x<w;x+=16) g.fillRect(x,0,6,h); });
M.rail=B.lam(0xfbfbf8,{map:railTex,alphaTest:0.5,side:THREE.DoubleSide});
B.rail = function(x1,z1,x2,z2,y,h){ h=h||1.0; var len=Math.hypot(x2-x1,z2-z1), g=new THREE.PlaneGeometry(len,h), uv=g.attributes.uv;
  for(var i=0;i<uv.count;i++) uv.setX(i,uv.getX(i)*len/0.55);
  B.add(g,'rail',(x1+x2)/2,y+h/2,(z1+z2)/2,-Math.atan2(z2-z1,x2-x1),{uv:'own',cast:false});
  B.box(len+0.06,0.06,0.12,(x1+x2)/2,y+h,(z1+z2)/2,'trim',-Math.atan2(z2-z1,x2-x1)); };

// ---------- main block ----------
var X1=-38, X2=2, Z1=31, Z2=49, TOP=BASE+FLOOR*3;
B.box(X2-X1,TOP-BASE+0.2,Z2-Z1,(X1+X2)/2,BASE-0.2,(Z1+Z2)/2,'facade');
B.box(X2-X1+0.6,BASE+0.1,Z2-Z1+0.4,(X1+X2)/2,-0.4,(Z1+Z2)/2,'stone');   // foundation showing on the bank
B.hipRoof((X1+X2)/2,(Z1+Z2)/2,X2-X1,Z2-Z1,TOP,5.6,{ov:0.6});
B.solid(X1,Z1,X2,Z2);
// dormers on the lake slope
[-34,-15.5,-1].forEach(function(dx){ var dz=Z1+2.4, y=TOP+1.4;
  B.box(2.4,2.0,2.6,dx,y-0.6,dz,'siding'); B.box(1.3,1.25,0.06,dx,y-0.25,dz-1.32,'glass'); B.box(1.5,0.1,0.1,dx,y-0.3,dz-1.33,'trim');
  B.gableRoof(dx,dz,2.8,2.6,y+1.4,1.1,Math.PI/2,{ov:0.18,under:false}); });
// two projecting front gables (3 floors + a gable window), each with its own stacked balconies
[[-25,8.2],[-6,8.2]].forEach(function(bp){ var bx=bp[0], bw=bp[1], fz=29.4;
  B.box(bw,TOP-BASE,Z1-fz+2,bx,BASE,fz+(Z1-fz+2)/2,'facade');
  B.gableRoof(bx,fz+3.6,8.0,bw,TOP,4.4,Math.PI/2,{ov:0.45,gable:'siding'});
  B.box(1.6,1.7,0.06,bx,TOP+0.7,fz-0.04,'glass'); B.box(1.9,0.12,0.12,bx,TOP+0.6,fz-0.06,'trim');   // gable window
  B.solid(bx-bw/2,fz,bx+bw/2,Z1);
  B.mapRect(bx-bw/2,fz,bx+bw/2,Z1,'#5c626c'); });
// balconies across the whole face on floors 2 and 3, posts down to the porch
function balconies(x1,x2,face,depth){ var fz=face-depth;
  for(var f=1;f<=2;f++){ var y=BASE+FLOOR*f;
    B.box(x2-x1,0.24,depth,(x1+x2)/2,y-0.24,face-depth/2,'trim');
    B.rail(x1,fz,x2,fz,y,1.0); }
  B.box(x2-x1,0.24,depth,(x1+x2)/2,TOP-0.1,face-depth/2,'trim');
  for(var x=x1+0.15;x<=x2;x+=3.6){ B.box(0.22,TOP-BASE,0.22,x,BASE,fz+0.12,'trim'); B.solidCircle(x,fz+0.12,0.16); }
  B.box(0.22,TOP-BASE,0.22,x2-0.12,BASE,fz+0.12,'trim'); }
balconies(-38,-29.1,Z1,1.7); balconies(-20.9,-10.1,Z1,1.7); balconies(-1.9,2,Z1,1.7);
balconies(-29.1,-20.9,29.4,1.5); balconies(-10.1,-1.9,29.4,1.5);
B.mapRect(X1,Z1,X2,Z2,'#5c626c');

// ---------- west wing: two floors, gable roof ----------
B.box(20,FLOOR*2,15,-48,BASE,38,'facade'); B.box(20.6,BASE+0.1,15.4,-48,-0.4,38,'stone');
B.gableRoof(-48,38,20,15,BASE+FLOOR*2,4.6,0,{ov:0.6});
B.box(20,0.24,1.6,-48,BASE+FLOOR-0.24,29.7,'trim'); B.rail(-58,28.9,-38,28.9,BASE+FLOOR,1.0);
for(var wx=-57.9;wx<=-38;wx+=3.3){ B.box(0.2,FLOOR,0.2,wx,BASE,29.0,'trim'); }
B.solid(-58,30.5,-38,45.5); B.mapRect(-58,30.5,-38,45.5,'#5c626c');

// ---------- east link + restaurant (warm white, rust-red roof, umbrella patio on the lawn side) ----------
B.box(8,FLOOR*2,10,6,BASE,36,'facade'); B.gableRoof(6,36,8,10,BASE+FLOOR*2,3,Math.PI/2,{ov:0.4});
B.solid(2,31,10,41);
M.rustRoof=B.lam(0xffffff,{map:B.tex.shingle,color:0xb06a4c}); M.rustRoof.userData.tile=B.tex.shingle.tile;
var RX1=15.5, RX2=30, RZ1=21, RZ2=32;
B.box(RX2-RX1,6.6,RZ2-RZ1,(RX1+RX2)/2,0,(RZ1+RZ2)/2,'facadeLow');
B.hipRoof((RX1+RX2)/2,(RZ1+RZ2)/2,RX2-RX1,RZ2-RZ1,6.6,2.6,{ov:0.5,roof:'rustRoof'});
B.solid(RX1,RZ1,RX2,RZ2); B.mapRect(RX1,RZ1,RX2,RZ2,'#9a6450');
// its lakeside patio: tables under white market umbrellas
B.box(RX2-RX1+1,0.08,4.5,(RX1+RX2)/2,0,RZ1-2.25,'concrete');
B.walkable(RX1-0.5,RZ1-4.5,RX2+0.5,RZ1);
var umb=new THREE.ConeGeometry(1.35,0.55,8,1,true);
for(var ux=RX1+2; ux<RX2-1; ux+=3.1){ var uz=RZ1-2.2;
  B.cyl(0.42,0.42,0.74,ux,0,uz,'white',12); B.cyl(0.025,0.025,2.4,ux,0,uz,'white',6);
  B.add(umb,'tent',ux,2.45,uz,0); B.solidCircle(ux,uz,0.55);
  [0,1.57,3.14,4.71].forEach(function(a){ B.box(0.42,0.45,0.42,ux+Math.cos(a)*0.75,0,uz+Math.sin(a)*0.75,'white',a); }); }

// ---------- white Adirondack chairs (front is -z: ry = 0 faces the lake) ----------
B.adirondackGeo = B.mergeParts([
  B.bx(0.62,0.05,0.55,0,0.33,0.02,0,-0.12), B.bx(0.62,0.72,0.06,0,0.38,0.33,0,0.32),
  B.bx(0.07,0.05,0.7,-0.36,0.58,0.0), B.bx(0.07,0.05,0.7,0.36,0.58,0.0),
  B.bx(0.06,0.6,0.06,-0.36,0,-0.3), B.bx(0.06,0.6,0.06,0.36,0,-0.3), B.bx(0.06,0.42,0.06,-0.3,0,0.3), B.bx(0.06,0.42,0.06,0.3,0,0.3)
]);
B.pool('adirondack', B.adirondackGeo, M.white, {});
for(var ax=-36; ax<-8; ax+=3.4){ if(Math.abs(ax+25)<4.5) continue; var az=23.2+rnd(-0.3,0.3); B.put('adirondack',ax,B.groundAt(ax,az),az,rnd(-0.25,0.25)); B.solidCircle(ax,az,0.35); }

B.place({n:1, name:'The inn’s lake terrace', desc:'Bay Pointe Inn, looking down at the pavilion, the docks and Gun Lake', x:-6, z:26.5, r:7, at:[-6,26.4,Math.PI-0.12]});
})(window.BP);
