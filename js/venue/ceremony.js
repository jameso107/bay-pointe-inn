/* The ceremony on the lakefront lawn: Bay Pointe's white arbor at the water's edge, dressed in blue hydrangea, peach roses
   and white chiffon; a white aisle runner with petals; 162 white garden chairs (9 rows of 9 a side) facing the lake.
   Also the shared flower helpers (B.florals) used by the reception. */
(function(B){
var THREE = window.THREE, M = B.mat, rnd = B.rnd;
var AX=27, ARCH_Z=0.5, ROW0=3.1, ROWS=9, PER=9, PITCH=0.55, ROWP=0.95, AISLE=1.8;
B.CER={x:AX, archZ:ARCH_Z};

// ---------- flowers: one instanced pool each for blooms and leaves ----------
var bloomGeo=new THREE.IcosahedronGeometry(1,B.LOW?0:1), leafGeo=new THREE.OctahedronGeometry(1,0);
(function(){ var p=bloomGeo.attributes.position, n=bloomGeo.attributes.normal, v=new THREE.Vector3();   // round normals: soft petals, not facets
  for(var i=0;i<p.count;i++){ v.fromBufferAttribute(p,i).normalize(); n.setXYZ(i,v.x,v.y,v.z); } n.needsUpdate=true; })();
// a grayscale floret texture, tinted per bloom by the instance colour, so a ball reads as a head of tiny petals
var floretTex=B.canvasTex(256,256,function(g,w,h){ g.fillStyle='#e9e9e9'; g.fillRect(0,0,w,h);
  for(var i=0;i<230;i++){ var x=Math.random()*w, y=Math.random()*h, r=B.rnd(7,12), a0=Math.random()*6.3;
    for(var p=0;p<4;p++){ var a=a0+p*Math.PI/2, px=x+Math.cos(a)*r*0.55, py=y+Math.sin(a)*r*0.55;
      var gr=g.createRadialGradient(px,py,0,px,py,r*0.6); gr.addColorStop(0,'#ffffff'); gr.addColorStop(0.75,'#f2f2f2'); gr.addColorStop(1,'rgba(150,150,150,0.9)');
      g.fillStyle=gr; g.beginPath(); g.arc(px,py,r*0.55,0,7); g.fill(); }
    g.fillStyle='rgba(120,120,120,0.8)'; g.beginPath(); g.arc(x,y,1.6,0,7); g.fill(); } });
B.pool('bloom', bloomGeo, B.lam(0xffffff,{map:floretTex}), {cast:false});
B.pool('leaf', leafGeo, B.lam(0xffffff), {cast:false});
var PAL={
  hydrangea:[0x8da7da,0x9db4e4,0x7b95cc,0xa9bde8,0xb4c3ea],
  peach:[0xf3b08c,0xf7c3a2,0xee9f7d,0xf9d2b8],
  white:[0xf8f6ef,0xf2efe6,0xfbfaf6],
  blush:[0xf2c9c2,0xeeb8b5],
  green:[0x5d7f4b,0x6f8f5c,0x8ea898,0x4c6e3f,0x9bb3a5]
};
B.PAL=PAL;
function pick(a){ return a[(Math.random()*a.length)|0]; }
// shape: 'mound' (half dome), 'ball' (full sphere), 'spray' (stretched along sx/sz). Mix is weights for hydrangea/peach/white/blush.
B.florals = function(x,y,z,r,n,o){ o=o||{}; if(B.LOW) n=Math.max(3,Math.round(n*0.62)); var mix=o.mix||[0.45,0.3,0.2,0.05], shape=o.shape||'mound', sx=o.sx||1, sy=o.sy||1, sz=o.sz||1;
  var sc=o.scale||Math.max(0.42,Math.min(1,r/0.4));   // small posies get smaller blooms
  for(var i=0;i<n;i++){ var u=Math.random(), th=Math.random()*Math.PI*2, ph, rr;
    if(shape==='ball'){ ph=Math.acos(2*Math.random()-1); rr=r*Math.cbrt(0.55+0.45*Math.random()); }
    else { ph=Math.acos(Math.random()*0.95); rr=r*(0.65+0.35*Math.random()); }
    var dx=Math.sin(ph)*Math.cos(th)*rr*sx, dy=Math.cos(ph)*rr*sy, dz=Math.sin(ph)*Math.sin(th)*rr*sz;
    var w=Math.random(), k=w<mix[0]?'hydrangea':w<mix[0]+mix[1]?'peach':w<mix[0]+mix[1]+mix[2]?'white':'blush';
    var s=(k==='hydrangea'?rnd(0.085,0.13):rnd(0.05,0.075))*sc;
    B.put('bloom',x+dx,y+dy,z+dz,rnd(0,6),s,pick(PAL[k]),{rx:rnd(0,6)}); }
  var nl=Math.round(n*(o.leaves==null?0.8:o.leaves)*(B.LOW?0.6:1));
  for(var j=0;j<nl;j++){ var th2=Math.random()*Math.PI*2, ph2=Math.acos(Math.random()*(shape==='ball'?2:1.0)-(shape==='ball'?1:0)), r2=r*rnd(0.8,1.18);
    B.put('leaf',x+Math.sin(ph2)*Math.cos(th2)*r2*sx,y+Math.cos(ph2)*r2*sy*0.9,z+Math.sin(ph2)*Math.sin(th2)*r2*sz,th2,1,pick(PAL.green),{sx:rnd(0.09,0.15)*sc,sy:0.022*Math.max(0.6,sc),sz:rnd(0.03,0.05)*sc,rx:rnd(-0.6,0.6),rz:rnd(-0.6,0.6)}); } };
// a trailing garland of florals along a polyline
B.garland = function(pts,density,r,o){ for(var i=0;i<pts.length-1;i++){ var a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]), n=Math.ceil(L*density);
  for(var k=0;k<n;k++){ var t=(k+Math.random())/n; B.florals(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,r,4,Object.assign({shape:'ball',leaves:1.2},o||{})); } } };

// ---------- the arbor ----------
(function(){ var x=AX, z=ARCH_Z, W=2.3, D=0.75, H=2.55;
  [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]].forEach(function(p){ B.box(0.13,H,0.13,x+p[0],0,z+p[1],'white'); B.solidCircle(x+p[0],z+p[1],0.12); });
  [-D/2,D/2].forEach(function(dz){ B.box(W+0.9,0.2,0.09,x,H,z+dz,'white'); });
  for(var s=-1.3;s<=1.31;s+=0.32) B.box(0.07,0.09,D+0.5,x+s,H+0.2,z,'white');
  // chiffon drapes: long sheer panels gathered at the posts
  var sheer=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:0.55,side:THREE.DoubleSide,depthWrite:false});
  [-1,1].forEach(function(sd){ var g=new THREE.PlaneGeometry(0.9,H+0.1,8,10), p=g.attributes.position;
    for(var i=0;i<p.count;i++){ var px=p.getX(i), py=p.getY(i), k=(py+H/2)/H; p.setZ(i,Math.sin(px*9)*0.05*(0.3+k)); p.setX(i,px*(0.35+0.65*k*k)); }
    g.computeVertexNormals(); var m=new THREE.Mesh(g,sheer); m.position.set(x+sd*(W/2+0.05),H/2+0.05,z-D/2-0.06); m.rotation.y=sd*0.12; m.renderOrder=3; B.scene.add(m); });
  // asymmetrical florals: a big cluster high on the left, cascading down the post; a smaller one low right
  B.florals(x-W/2+0.25,H+0.12,z-0.1,0.55,70,{shape:'ball',sx:1.3,sz:0.9,mix:[0.45,0.32,0.18,0.05]});
  B.garland([[x-W/2-0.05,H-0.1,z-D/2-0.1],[x-W/2-0.05,1.3,z-D/2-0.1],[x-W/2+0.1,0.7,z-D/2-0.1]],7,0.18);
  B.garland([[x-W/2+0.4,H+0.15,z],[x+0.3,H+0.25,z]],5,0.2);
  B.florals(x+W/2-0.1,1.05,z-D/2-0.05,0.38,32,{shape:'ball',sx:1.0,sy:1.3});
  // ground arrangements at the posts and gold urns flanking the front of the aisle
  B.florals(x-W/2,0.05,z-0.05,0.5,36,{}); B.florals(x+W/2,0.05,z-0.05,0.42,26,{});
  [-1,1].forEach(function(sd){ var ux=x+sd*1.7, uz=ROW0-1.15;
    B.cyl(0.12,0.17,0.9,ux,0,uz,'gold',12); B.cyl(0.26,0.14,0.28,ux,0.9,uz,'gold',14);
    B.florals(ux,1.16,uz,0.42,40,{shape:'ball',sy:0.85}); B.solidCircle(ux,uz,0.3); });
  B.mapRect(x-W/2,z-D/2,x+W/2,z+D/2,'#ffffff');
})();

// ---------- aisle runner and petals ----------
B.box(1.2,0.012,12.2-ARCH_Z-1.1,AX,0.005,(ARCH_Z+1.1+12.2)/2,'linen',0,{cast:false});
B.pool('petal', new THREE.CircleGeometry(1,5), new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide}), {cast:false});
for(var pi=0;pi<220;pi++){ var pz=rnd(ARCH_Z+1.2,12), edge=Math.random()<0.7?(Math.random()<0.5?-1:1)*rnd(0.3,0.62):rnd(-0.6,0.6);
  B.put('petal',AX+edge,0.025,pz,rnd(0,6),rnd(0.025,0.04),pick(PAL.peach.concat(PAL.white,PAL.blush)),{rx:-Math.PI/2}); }

// ---------- white garden chairs ----------
var chairGeo=B.mergeParts([
  B.bx(0.44,0.035,0.42,0,0.44,0),                                                     // seat
  B.bx(0.035,0.9,0.035,-0.2,0,0.19,0,-0.06), B.bx(0.035,0.9,0.035,0.2,0,0.19,0,-0.06),  // back legs/posts
  B.bx(0.035,0.45,0.035,-0.2,0,-0.19), B.bx(0.035,0.45,0.035,0.2,0,-0.19),              // front legs
  B.bx(0.42,0.06,0.025,0,0.62,0.205), B.bx(0.42,0.06,0.025,0,0.72,0.215), B.bx(0.42,0.07,0.025,0,0.82,0.225),
  B.bx(0.4,0.025,0.025,0,0.18,-0.19), B.bx(0.4,0.025,0.025,0,0.18,0.19)
]);
B.chairGeo=chairGeo;
B.pool('gardenChair', chairGeo, M.white, {});
for(var r=0;r<ROWS;r++){ var cz=ROW0+r*ROWP;
  for(var c=0;c<PER;c++){ var off=AISLE/2+0.27+c*PITCH;
    B.put('gardenChair',AX-off,0,cz,rnd(-0.03,0.03)); B.put('gardenChair',AX+off,0,cz,rnd(-0.03,0.03)); } }   // chairs face -z: the lake
var bx1=AX+AISLE/2, bx2=AX+AISLE/2+0.27+(PER-1)*PITCH+0.25, bz1=ROW0-0.25, bz2=ROW0+(ROWS-1)*ROWP+0.25;
B.solid(bx1+0.05,bz1,bx2,bz2); B.solid(2*AX-bx2,bz1,2*AX-bx1-0.05,bz2);
B.mapRect(bx1,bz1,bx2,bz2,'#f6f4ee'); B.mapRect(2*AX-bx2,bz1,2*AX-bx1,bz2,'#f6f4ee');

// aisle markers: a posy and a lantern on every other row's aisle-side chairs
B.pool('lanternGlass', new THREE.CylinderGeometry(0.1,0.1,0.34,8), new THREE.MeshLambertMaterial({color:0xe9f1f4,transparent:true,opacity:0.45,depthWrite:false}), {cast:false});
for(var r2=0;r2<ROWS;r2+=2){ var mz=ROW0+r2*ROWP; [-1,1].forEach(function(sd){ var mx=AX+sd*(AISLE/2+0.05);
  B.florals(mx,0.55,mz+0.18,0.13,7,{shape:'ball',sx:0.8});
  B.put('lanternGlass',mx+sd*-0.02,0.17,mz-0.32,0,1); B.cyl(0.11,0.11,0.03,mx,0,mz-0.32,'gold',8); B.cyl(0.03,0.03,0.08,mx,0.03,mz-0.32,'cream',6);
  B.glow(mx,0.16,mz-0.32,0.5,0xffb35c,0.35); }); }

// "Reserved" cards on the front row
var resTex=B.canvasTex(256,96,function(g,w,h){ g.fillStyle='#fbfaf6'; g.fillRect(0,0,w,h); g.strokeStyle='#c9a35a'; g.lineWidth=4; g.strokeRect(6,6,w-12,h-12);
  g.fillStyle='#24344f'; g.font='italic 40px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('Reserved',w/2,h/2+2); },{repeat:false});
M.reserved=B.lam(0xffffff,{map:resTex});
[-1,1].forEach(function(sd){ for(var c=0;c<3;c++){ var x=AX+sd*(AISLE/2+0.27+c*PITCH); B.add(new THREE.PlaneGeometry(0.3,0.11),'reserved',x,0.8,ROW0+0.25,0,{uv:'own',rx:-0.25}); } });

// ---------- welcome sign on a gold easel, where the walk from the patio reaches the lawn ----------
B.sign = function(key, texDraw, w, h, x, y, z, ry, o){ o=o||{}; var tex=B.canvasTex(Math.round(w*400),Math.round(h*400),texDraw,{repeat:false});
  M[key]=B.lam(0xffffff,{map:tex,emissive:o.glow?0xffffff:0x000000,emissiveMap:o.glow?tex:null,emissiveIntensity:o.glow?0.35:0});
  B.add(new THREE.PlaneGeometry(w,h),key,x,y,z,ry||0,{uv:'own',rx:o.rx||0}); return M[key]; };
var script="'Snell Roundhand','Apple Chancery','Zapfino','Brush Script MT',cursive";
B.SCRIPT=script;
(function(){ var x=16.4, z=9.2, ry=-Math.PI/2+0.5, c=Math.cos(ry), s=Math.sin(ry);
  [[-0.32,0],[0.32,0]].forEach(function(p){ B.add(new THREE.BoxGeometry(0.04,1.9,0.04),'gold',x+p[0]*c,0.95,z-p[0]*s,ry,{rx:-0.12}); });
  B.add(new THREE.BoxGeometry(0.04,1.8,0.04),'gold',x+0.22*s,0.9,z+0.22*c,ry,{rx:0.25});
  B.box(0.9,0.04,0.08,x,0.62,z,'gold',ry);
  B.box(0.8,1.06,0.03,x-0.03*s,0.62,z-0.03*c,'trim',ry,{rx:-0.12});
  B.sign('welcome',function(g,w,h){ g.fillStyle='#fbfaf6'; g.fillRect(0,0,w,h); g.strokeStyle='#c9a35a'; g.lineWidth=6; g.strokeRect(16,16,w-32,h-32);
      g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#5a6b80'; g.font='600 24px Avenir Next,Segoe UI,sans-serif'; g.fillText('WELCOME TO THE WEDDING OF',w/2,h*0.2);
      g.fillStyle='#24344f'; g.font='118px '+script; g.fillText('H & J',w/2,h*0.43);
      g.fillStyle='#c9a35a'; g.fillRect(w/2-50,h*0.6,100,3);
      g.fillStyle='#24344f'; g.font='italic 32px Georgia,serif'; g.fillText('the Fourth of July, 2027',w/2,h*0.7); g.font='600 21px Avenir Next,Segoe UI,sans-serif'; g.fillStyle='#5a6b80'; g.fillText('BAY POINTE INN · GUN LAKE',w/2,h*0.8);
      B.florals && 0; },
    0.74,1.0, x-0.06*s,1.15,z-0.06*c, ry, {rx:-0.12});
  B.florals(x-0.36*c-0.07*s,1.62,z+0.36*s-0.07*c,0.2,20,{shape:'ball',sx:1.4}); B.florals(x+0.3*c-0.07*s,0.66,z-0.3*s-0.07*c,0.13,9,{shape:'ball'});
  B.solidCircle(x,z,0.45);
})();
// a table of paper fans for a July afternoon (with a few tiny flags tucked in)
(function(){ var x=17.6, z=11.2;
  B.cyl(0.45,0.45,0.74,x,0,z,'linen',16); B.cyl(0.18,0.15,0.16,x,0.74,z,'wood',10);
  for(var i=0;i<9;i++){ var a=i/9*Math.PI*2; B.box(0.16,0.2,0.01,x+Math.cos(a)*0.08,0.82,z+Math.sin(a)*0.08,'white',a,{rx:0.4}); }
  [0,2.1,4.2].forEach(function(a){ B.cyl(0.004,0.004,0.32,x+Math.cos(a)*0.05,0.82,z+Math.sin(a)*0.05,'gold',3); B.box(0.11,0.07,0.004,x+Math.cos(a)*0.05+0.055,1.06,z+Math.sin(a)*0.05,'red',0); });
  B.solidCircle(x,z,0.5); })();

B.place({n:2, name:'Ceremony lawn', desc:'162 garden chairs, the aisle runner, and Gun Lake behind the arbor', x:AX, z:9, r:7, at:[AX,13.2,Math.PI]});
B.place({n:3, name:'The arbor', desc:'Where you’ll stand · blue hydrangea, peach roses, white chiffon', x:AX, z:1.6, r:3.2, at:[AX,1.7,0]});
})(window.BP);
