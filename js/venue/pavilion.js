/* The Lakefront Pavilion: a long, open-sided white pavilion on the seawall, slate roof with five lake-facing gables
   and a cupola at the east end. Round white columns, white railing on the water side, beadboard ceiling.
   Footprint x -34..-0.5, z -1.6..8.5 (33.5 x 10 m), floor 0.3 m up. Also: string-light helper used everywhere. */
(function(B){
var THREE = window.THREE, M = B.mat;
var PX1=-34, PX2=-0.5, PZ1=-1.6, PZ2=8.5, FY=0.3, EAVE=3.45;
B.PAV={x1:PX1,x2:PX2,z1:PZ1,z2:PZ2,y:FY};

// floor slab with a stone face, and the walkable floor (wins over the lawn)
B.box(PX2-PX1+0.4,FY+0.4,PZ2-PZ1+0.4,(PX1+PX2)/2,-0.4,(PZ1+PZ2)/2,'stone');
B.box(PX2-PX1+0.2,0.04,PZ2-PZ1+0.2,(PX1+PX2)/2,FY,(PZ1+PZ2)/2,'floor');
B.walkable(PX1+0.1,PZ1+0.32,PX2,PZ2+0.1,FY+0.04);
B.mapRect(PX1,PZ1,PX2,PZ2,'#efece4','#9aa3ad');

// columns: round, white, with square base and cap
var colXs=[]; for(var i=0;i<=9;i++) colXs.push(PX1+0.3+i*(PX2-PX1-0.6)/9);
function column(x,z){ B.box(0.5,0.3,0.5,x,FY,z,'trim'); B.cyl(0.17,0.2,EAVE-FY-0.55,x,FY+0.3,z,'trim',14); B.box(0.46,0.25,0.46,x,EAVE-0.25,z,'trim'); B.solidCircle(x,z,0.24); }
colXs.forEach(function(x){ column(x,PZ1+0.25); column(x,PZ2-0.25); });
column(PX1+0.3,(PZ1+PZ2)/2); column(PX2-0.3,(PZ1+PZ2)/2);
// beams and fascia round the top
B.box(PX2-PX1,0.42,0.3,(PX1+PX2)/2,EAVE-0.42,PZ1+0.25,'trim'); B.box(PX2-PX1,0.42,0.3,(PX1+PX2)/2,EAVE-0.42,PZ2-0.25,'trim');
B.box(0.3,0.42,PZ2-PZ1,PX1+0.3,EAVE-0.42,(PZ1+PZ2)/2,'trim'); B.box(0.3,0.42,PZ2-PZ1,PX2-0.3,EAVE-0.42,(PZ1+PZ2)/2,'trim');
// beadboard ceiling (faces down)
(function(){ var g=new THREE.PlaneGeometry(PX2-PX1,PZ2-PZ1); g.rotateX(Math.PI/2); B.add(g,'ceiling',(PX1+PX2)/2,EAVE-0.02,(PZ1+PZ2)/2,0,{cast:false}); })();
for(var bx=PX1+2;bx<PX2;bx+=3.72) B.box(0.16,0.2,PZ2-PZ1,bx,EAVE-0.22,(PZ1+PZ2)/2,'trim');

// railings: the whole lake side; the land side except the two doorways; the west end
var railY=FY, lakeZ=PZ1+0.25, landZ=PZ2-0.25;
for(var c=0;c<colXs.length-1;c++){ B.rail(colXs[c]+0.2,lakeZ,colXs[c+1]-0.2,lakeZ,railY,0.95); }
B.solid(PX1,lakeZ-0.06,PX2,lakeZ+0.06);
var doorsLand=[[-12,-7.9],[-4.4,-0.5]];   // the middle stays railed: the DJ backs onto it
for(var c2=0;c2<colXs.length-1;c2++){ var a=colXs[c2]+0.2, b=colXs[c2+1]-0.2, mid=(a+b)/2;
  if(doorsLand.some(function(d){ return mid>d[0]&&mid<d[1]; })) continue; B.rail(a,landZ,b,landZ,railY,0.95); B.solid(a,landZ-0.06,b,landZ+0.06); }
B.rail(PX1+0.3,lakeZ+0.2,PX1+0.3,(PZ1+PZ2)/2-0.2,railY,0.95); B.rail(PX1+0.3,(PZ1+PZ2)/2+0.2,PX1+0.3,landZ-0.2,railY,0.95);
B.solid(PX1+0.24,PZ1,PX1+0.36,PZ2);
// two steps up at each doorway and along the open east end
doorsLand.forEach(function(d){ B.box(d[1]-d[0],0.15,0.5,(d[0]+d[1])/2,0,PZ2+0.35,'concrete'); });
B.box(0.5,0.15,PZ2-PZ1,PX2+0.35,0,(PZ1+PZ2)/2,'concrete');

// roof: main ridge along the pavilion, five cross gables to the lake, cupola at the east end
var RY=EAVE;
B.gableRoof((PX1+PX2)/2,(PZ1+PZ2)/2,PX2-PX1,PZ2-PZ1,RY,2.7,0,{ov:0.6});
for(var gI=0;gI<5;gI++){ var gx=PX1+3.6+gI*((PX2-PX1-7.2)/4);
  B.gableRoof(gx,PZ1+2.3,5.6,5.4,RY,2.45,Math.PI/2,{ov:0.5,gable:'trim'});
  B.cyl(0.42,0.42,0.06,gx,RY+0.75,PZ1-0.56,'woodDark',16,{rx:Math.PI/2});   // round gable vent
}
(function(){ var cx=PX2-4.2, cz=(PZ1+PZ2)/2, y=RY+2.1;
  B.box(1.5,1.5,1.5,cx,y,cz,'trim');
  [[0,-0.76,0],[0,0.76,Math.PI],[-0.76,0,Math.PI/2],[0.76,0,-Math.PI/2]].forEach(function(f){ B.box(0.9,0.9,0.04,cx+f[0],y+0.3,cz+f[1],'glass',f[2]); });
  B.hipRoof(cx,cz,1.5,1.5,y+1.5,0.9,{ov:0.2,roof:'copper'});
  B.cyl(0.03,0.03,0.7,cx,y+2.35,cz,'black',6); B.cyl(0.12,0.12,0.08,cx,y+2.4,cz,'black',8);
})();

// ---------- string lights (catenary swags of bistro bulbs) ----------
var bulbMat=new THREE.MeshBasicMaterial({color:0xf2eadb}), wire=[];
B.pool('bulb', new THREE.SphereGeometry(0.036,7,5), bulbMat, {cast:false,receive:false});
B.onTod(function(s){ bulbMat.color.setRGB(0.95+0.05*s, 0.92-0.1*s, 0.86-0.38*s); });
B.stringLights = function(pts, o){ o=o||{}; var sag=o.sag==null?0.35:o.sag, sp=o.spacing||0.6;
  for(var i=0;i<pts.length-1;i++){ var a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]), n=Math.max(2,Math.round(L/sp));
    for(var k=0;k<=n;k++){ var t=k/n, x=a[0]+(b[0]-a[0])*t, y=a[1]+(b[1]-a[1])*t-4*sag*t*(1-t), z=a[2]+(b[2]-a[2])*t;
      if(k<n){ var t2=(k+1)/n; wire.push(x,y,z, a[0]+(b[0]-a[0])*t2, a[1]+(b[1]-a[1])*t2-4*sag*t2*(1-t2), a[2]+(b[2]-a[2])*t2); }
      if(k===n && i<pts.length-2) continue;
      B.put('bulb',x,y-0.07,z,0,1); B.glow(x,y-0.07,z,o.size||0.55,o.color==null?0xffc670:o.color,0.12,o.mirror); } } };
B.onBegin(function(){});
// along the lake eave outside, and swagged across the ceiling inside
var eaveY=RY-0.1, pts=[]; colXs.forEach(function(x){ pts.push([x,eaveY,PZ1-0.05]); });
B.stringLights(pts,{sag:0.28,mirror:true});
var inside=[]; for(var s2=0;s2<=9;s2++){ var x2=PX1+1.2+s2*(PX2-PX1-2.4)/9; inside.push([x2,RY-0.25,s2%2?PZ1+0.9:PZ2-0.9]); }
B.stringLights(inside,{sag:0.5,size:0.6});

// warm light under the roof at night (Quest budget: three lights for the whole pavilion)
B.nightLight(-27,2.7,3.5,0xffc58a,1.6,16); B.nightLight(-16.5,2.7,3.5,0xffc58a,1.6,16); B.nightLight(-6,2.7,3.5,0xffc58a,1.6,16);

// ---------- Fourth of July bunting: pleated half-fans on the lake fascia ----------
var fanTex=B.canvasTex(256,128,function(g,w,h){ g.clearRect(0,0,w,h); var cx=w/2, r=w/2-2, cols=['#b4202e','#fbfaf6','#b4202e','#fbfaf6','#b4202e'];
  for(var i=0;i<5;i++){ g.fillStyle=cols[i]; g.beginPath(); g.moveTo(cx,0); g.arc(cx,0,r*(1-i*0.17),0,Math.PI); g.closePath(); g.fill(); }
  g.fillStyle='#24344f'; g.beginPath(); g.moveTo(cx,0); g.arc(cx,0,r*0.3,0,Math.PI); g.closePath(); g.fill();
  g.fillStyle='#fff'; for(var s=0;s<5;s++){ var a=Math.PI*(0.12+s*0.19); g.beginPath(); g.arc(cx+Math.cos(a)*r*0.18,Math.sin(a)*r*0.18,3.5,0,7); g.fill(); }
  for(var p=1;p<12;p++){ var a2=Math.PI*p/12; g.strokeStyle='rgba(0,0,0,0.12)'; g.lineWidth=2; g.beginPath(); g.moveTo(cx,0); g.lineTo(cx+Math.cos(a2)*r,Math.sin(a2)*r); g.stroke(); } },{repeat:false});
M.bunting=B.lam(0xffffff,{map:fanTex,alphaTest:0.4,side:THREE.DoubleSide});
B.bunting = function(x,y,z,ry,size){ size=size||1.5; var g=new THREE.PlaneGeometry(size,size/2); B.add(g,'bunting',x,y-size/4,z,ry||0,{uv:'own',cast:false}); };
for(var f=0;f<colXs.length-1;f+=2){ B.bunting((colXs[f]+colXs[f+1])/2,EAVE-0.02,PZ1+0.07,Math.PI,1.5); }
B.bunting(-9.94,EAVE-0.02,PZ2-0.07,0,1.5); B.bunting(-2.45,EAVE-0.02,PZ2-0.07,0,1.3);
B.bunting(PX2-0.12,EAVE-0.02,(PZ1+PZ2)/2,Math.PI/2,1.6);

B.place({n:4, name:'The Lakefront Pavilion', desc:'Dinner for 150 under the gables · gold chiavari, dusty blue, hydrangea and peach roses', x:-25, z:3.5, r:8, at:[-2.2,3.2,-Math.PI/2]});
})(window.BP);
