/* The grounds: lawn and terrain, the seawall, paths and patio, the koi pond, trees, neighbours, and the far shore of Gun Lake.
   Layout measured off satellite imagery (0.18 m/px). Site frame: +x along the shore to the SE, -z out over the lake, seawall at z = -2.5. */
(function(B){
var THREE = window.THREE, rnd = B.rnd, LOW = B.LOW;
function smooth(t){ t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); }

// ---------- ground height ----------
// The inn sits on a terrace ~1.2 m above the lawn; a grassy bank falls between z = 21.5 and 27.
B.groundAt = function(x,z){
  if(z < -2.5) return -1.7;
  var y = 1.2*smooth((z-21.5)/5.5);
  if(z > 58) y += 6*smooth((z-58)/50);                        // wooded rise behind the inn
  return y;
};
B.SEAWALL = -2.5;

// walkable land: everything from the seawall back to the inn, between the neighbours
B.walkable(-60, -2.15, 62, 33);
B.walkable(9.5, 33, 15.5, 44);                                  // the side lawn path past the restaurant toward the lot

// ---------- terrain ----------
(function(){
  var W=280, D=166, nx=LOW?70:140, nz=83, x0=0, z0=-6.5+D/2;            // rows land exactly on z = -2.5 (2 m grid from -6.5)
  var g=new THREE.PlaneGeometry(W,D,nx,nz); g.rotateX(-Math.PI/2); g.translate(x0,0,z0);
  var p=g.attributes.position;
  for(var i=0;i<p.count;i++){ var x=p.getX(i), z=p.getZ(i); p.setY(i, B.groundAt(x, z<=-2.5+1e-3 && z>-2.5-1e-3 ? -2.4 : z)); }
  g.computeVertexNormals();
  B.add(g,'grass',0,0,0,0);
})();
B.mapRect(-62,-2.5,62,40,'#5d7f45');

// ---------- seawall boulders ----------
var rockGeo=new THREE.IcosahedronGeometry(1,0);
B.pool('rock', rockGeo, B.mat.rock, {});
for(var x=-61; x<62; x+=rnd(0.55,0.85)){
  if(x>-0.3 && x<2.3) continue;                                  // the dock gangway lands here
  B.put('rock', x, rnd(-0.55,-0.25), -2.7+rnd(-0.25,0.2), rnd(0,6), rnd(0.42,0.62), null, {sy:rnd(0.55,0.8), rx:rnd(-0.4,0.4)});
  B.put('rock', x+rnd(-0.3,0.3), rnd(-1.1,-0.8), -3.25+rnd(-0.2,0.2), rnd(0,6), rnd(0.5,0.75), null, {sy:0.7});
}

// ---------- paths and patio (poured concrete) ----------
function ribbon(pts, w, key, lift){ var step=0.8, res=[];
  for(var i=0;i<pts.length-1;i++){ var a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(L/step));
    for(var k=0;k<n;k++){ var t=k/n; res.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]); } }
  res.push(pts[pts.length-1]);
  var L=[],R=[];
  res.forEach(function(p,i){ var a=res[Math.max(0,i-1)], b=res[Math.min(res.length-1,i+1)], tx=b[0]-a[0], tz=b[1]-a[1], tl=Math.hypot(tx,tz)||1;
    var nx=-tz/tl*w/2, nz=tx/tl*w/2;
    L.push([p[0]+nx, B.groundAt(p[0]+nx,p[1]+nz)+(lift||0.035), p[1]+nz]); R.push([p[0]-nx, B.groundAt(p[0]-nx,p[1]-nz)+(lift||0.035), p[1]-nz]); });
  for(var j=0;j<res.length-1;j++) B.quad(key||'concrete', L[j], L[j+1], R[j+1], R[j]);
  B.mapLine(pts, w, '#d9d2c3');
}
B.ribbon = ribbon;
ribbon([[-57,28.3],[9,28.3]], 3.2);                                          // inn terrace promenade
ribbon([[-6,27],[-5.5,21],[-3,15.5],[0.5,11.6],[3.5,9.6]], 2.6);              // centre stairs down the bank to the pavilion
ribbon([[-36,10.1],[3.5,10.1],[9,7.2]], 2.4);                                 // walk along the pavilion's land side
ribbon([[9,7.2],[14,11.6],[47,12.8]], 2.2);                                   // past the pond to the top of the ceremony lawn
ribbon([[8.5,27.5],[11.5,21],[12.2,15],[14,11.6]], 2);                        // terrace to the lawn, beside the restaurant
ribbon([[12.5,33],[12.5,44]], 2.4);                                          // out toward the parking lot
ribbon([[-36,10.1],[-40,14],[-44,24],[-44,27]], 2);                           // west loop back up to the terrace
// the lakeside patio round the pavilion's east end, fire pit and bar
B.box(13.2,0.06,9.5, 5.4,-0.02,2.55, 'concrete');
B.walkable(-0.5,-2.45,12,7);                                                  // the patio runs right to the seawall
B.mapRect(-1.2,-2.2,12,7.3,'#d9d2c3');
// steps in the bank either side of the centre stairs (visual), stone retaining planters
for(var s=0;s<5;s++) B.box(2.9,0.06,1.0,-5.6+s*0.5,B.groundAt(-5.6,22+s*1.1),22.2+s*1.1,'concrete',0.08);
[[-13,24.2,9],[3,24.2,9],[-27,24.2,9]].forEach(function(w){ B.box(w[2],0.7,0.6,w[0],0.35,w[1],'stone'); });

// ---------- koi pond with stone edge and a little falls (photos: beside the walk down to the patio) ----------
(function(){ var cx=4, cz=16.2, r=2.7;
  var pm=new THREE.Mesh(new THREE.CircleGeometry(r,28), new THREE.MeshLambertMaterial({color:0x2c4a44,emissive:0x05100d}));
  pm.rotation.x=-Math.PI/2; pm.position.set(cx,B.groundAt(cx,cz)+0.04,cz); B.scene.add(pm); B.pondMesh=pm;
  for(var a=0;a<Math.PI*2;a+=0.32) B.put('rock', cx+Math.cos(a)*(r+0.15), B.groundAt(cx,cz)-0.05, cz+Math.sin(a)*(r+0.15)*0.95, a*3, rnd(0.32,0.5), null, {sy:0.6});
  for(var k=0;k<6;k++) B.put('rock', cx+1.2+k*0.25, B.groundAt(cx,cz)+0.1+k*0.12, cz+2.4-k*0.05, k, 0.45, null, {sy:0.7});
  B.solidCircle(cx,cz,r+0.3); B.mapCircle(cx,cz,r,'#2f5d67');
})();

// ---------- trees ----------
var trunkGeo=new THREE.CylinderGeometry(0.16,0.26,1,7); trunkGeo.translate(0,0.5,0);
var canopyGeo=new THREE.IcosahedronGeometry(1,LOW?0:1);
var pineGeo=new THREE.ConeGeometry(1,1,8); pineGeo.translate(0,0.5,0);
B.pool('trunk', trunkGeo, B.mat.bark, {});
B.pool('canopy', canopyGeo, B.lam(0xffffff), {});
B.pool('pine', pineGeo, B.lam(0xffffff), {});
var greens=[0x3f6a2e,0x4a7533,0x365e29,0x56803a,0x41692f,0x2f5426];
B.tree = function(x,z,h,o){ o=o||{}; var y=B.groundAt(x,z), r=o.r||h*0.32;
  if(o.pine){ B.put('trunk',x,y,z,0,1,null,{sx:0.9,sz:0.9,sy:h*0.35}); B.put('pine',x,y+h*0.22,z,rnd(0,6),1,0x2d4d2a,{sx:r*0.8,sz:r*0.8,sy:h*0.82}); }
  else { B.put('trunk',x,y,z,0,1,null,{sx:1+h*0.03,sz:1+h*0.03,sy:h*0.55});
    var c=greens[(Math.random()*greens.length)|0];
    B.put('canopy',x,y+h*0.66,z,rnd(0,6),1,c,{sx:r,sy:h*0.3,sz:r});
    B.put('canopy',x+r*0.45,y+h*0.52,z+rnd(-0.4,0.4)*r,rnd(0,6),1,greens[(Math.random()*greens.length)|0],{sx:r*0.7,sy:h*0.24,sz:r*0.7});
    if(!o.small) B.put('canopy',x-r*0.4,y+h*0.58,z+rnd(-0.4,0.4)*r,rnd(0,6),1,c,{sx:r*0.75,sy:h*0.26,sz:r*0.75}); }
  if(o.solid!==false && z<34) B.solidCircle(x,z,0.4);
  B.mapCircle(x,z,r*0.8,'rgba(40,70,30,.75)'); };
// feature trees inside the grounds (from the photos)
B.tree(-50,16,13); B.tree(-46,6,10); B.tree(-58,22,15,{pine:true,r:3.2}); B.tree(-31,17,9,{small:true}); B.tree(-18,18.5,8,{small:true});
B.tree(7.5,21,10); B.tree(19,13.5,7,{small:true}); B.tree(49,9,12); B.tree(52,-0.5,9); B.tree(57,14,14,{pine:true,r:3});
B.tree(-61,5,12); B.tree(30,40,13); B.tree(-8,40,12,{solid:false});
// woods behind the inn and down the shore on both sides
(function(){ var n=LOW?90:170, placed=0, tries=0;
  while(placed<n && tries<4000){ tries++; var x=rnd(-140,140), z=rnd(-1,150);
    var inGrounds = x>-60 && x<62 && z<36; var inInn = x>-62 && x<12 && z<58 && z>28; var inLot = x>8 && x<70 && z>32 && z<70;
    var nearShoreHouses = (x<-60||x>62) && z<26 && Math.random()<0.55;
    if(inGrounds||inInn||inLot||nearShoreHouses) continue;
    B.tree(x,z,rnd(9,17),{pine:Math.random()<0.18,r:rnd(2.4,4.2),solid:false}); placed++; } })();

// ---------- shrubs, hydrangeas and flower beds ----------
var shrubGeo=new THREE.IcosahedronGeometry(1,1);
B.pool('shrub', shrubGeo, B.lam(0xffffff), {});
B.pool('bloomBush', new THREE.IcosahedronGeometry(1,0), B.lam(0xffffff), {cast:false});
B.shrub = function(x,z,s,flower){ var y=B.groundAt(x,z); B.put('shrub',x,y+s*0.45,z,rnd(0,6),s,[0x3c6b2c,0x4d7c35,0x355f28][(Math.random()*3)|0],{sy:0.75});
  if(flower) for(var i=0;i<5;i++){ var a=rnd(0,6.3), r=s*rnd(0.4,0.8); B.put('bloomBush',x+Math.cos(a)*r,y+s*rnd(0.75,1.05),z+Math.sin(a)*r,rnd(0,6),s*0.24,flower); } };
// along the inn terrace (white hydrangea), the pond garden, the seawall corners
for(var hx=-55; hx<8; hx+=2.1){ if(Math.abs(hx+6)<2.5) continue; B.shrub(hx, 26.6, rnd(0.55,0.8), Math.random()<0.7?0xf6f4ec:0xd9e4f5); }
[[1,13],[7,13.2],[6.8,19],[1.2,19.5],[-1.5,16.5],[9.6,16],[-2,9.4],[-8,12],[-14,12.4],[-22,12.6],[-28,12.2],[16,9.3],[46.5,6],[46,1.5],[47,10.5]].forEach(function(p,i){
  B.shrub(p[0],p[1],rnd(0.6,1.0),[0xf3a6b8,0xf6f4ec,0x9db6e8,0xe8c25b,null][i%5]); });
for(var gx=-34; gx<-1; gx+=1.6) B.shrub(gx, 9.0, rnd(0.4,0.55), Math.random()<0.5?0xf6f4ec:null);   // low hedge along the pavilion's back walk

// ---------- lamp posts (black, lantern heads; photos: along the seawall walk) ----------
B.mat.lampGlass=B.lam(0xeee6d4,{emissive:0xffc777,emissiveIntensity:0});
B.onTod(function(s){ B.mat.lampGlass.emissiveIntensity=s*1.2; });
B.lamp = function(x,z){ var y=B.floorAt(x,z); B.cyl(0.05,0.07,2.7,x,y,z,'black',8); B.box(0.26,0.04,0.26,x,y+2.68,z,'black');
  B.box(0.2,0.32,0.2,x,y+2.72,z,'lampGlass'); B.cyl(0.02,0.19,0.2,x,y+3.04,z,'black',4);
  B.glow(x,y+2.88,z,1.5,0xffd28a,0.04,true); };
[[2.6,-1.6],[11.5,-1.6],[19,-1.7],[33,-1.7],[44,-1.7],[-36.5,-1.2],[-44,-1.7],[-52,-1.7]].forEach(function(p){ B.lamp(p[0],p[1]); });
[[-8.6,21],[0.8,12.8],[13.2,19],[22,12.3],[36,12.8],[-20,10.9],[-44.5,20]].forEach(function(p){ B.lamp(p[0],p[1]); });

// ---------- neighbours down the shore (keep the eye line honest) ----------
var sid={blue:B.lam(0x8fa8bf,{map:B.tex.siding}), white:B.lam(0xf3f1ea,{map:B.tex.siding}), gray:B.lam(0xb8b4ab,{map:B.tex.siding}), tan:B.lam(0xd8c7a4,{map:B.tex.siding})};
Object.keys(sid).forEach(function(k){ sid[k].userData.tile=B.tex.siding.tile; B.mat['sid_'+k]=sid[k]; });
B.house = function(x,z,w,d,floors,color,ry){ var h=floors*3, k='sid_'+color, y=B.groundAt(x,z)-0.2;
  B.add(new THREE.BoxGeometry(w,h,d),k,x,y+h/2,z,ry||0);
  B.gableRoof(x,z,w,d,y+h,d*0.36,ry||0,{gable:k,under:false});
  // windows: dark panes on the lake face
  for(var i=0;i<floors;i++) for(var j=-1;j<=1;j++){ var c=Math.cos(ry||0), s=Math.sin(ry||0), lx=j*w*0.28, lz=-d/2-0.03;
    B.box(1.1,1.3,0.06,x+lx*c+lz*s,y+0.9+i*3,z-lx*s+lz*c,'glass',ry||0,{cast:false}); }
  B.mapRect(x-w/2,z-d/2,x+w/2,z+d/2,'#b9b4aa'); };
B.house(-66,12,10,9,2,'gray'); B.house(-80,10,9,8,2,'blue'); B.house(-95,14,11,8,2,'white'); B.house(-110,9,8,8,1,'tan');
B.house(70,16,10,9,2,'tan'); B.house(83,13,9,10,2,'blue',0.1); B.house(97,18,12,9,2,'white',0.06); B.house(112,15,8,8,1,'gray');
// their docks
[[-72],[-88],[-103],[76],[90],[104]].forEach(function(d){ B.box(1.2,0.12,14,d[0],-0.2,-9.3,'deck'); B.box(5,0.12,1.4,d[0]+1.9,-0.2,-16,'deck'); });

// ---------- far shore of Gun Lake: wooded hills ~1.2 km across, cottages at the waterline ----------
(function(){ var segs=LOW?80:160, pos=[], col=[], idx=[], rows=4, c=new THREE.Color();
  for(var i=0;i<=segs;i++){ var th=(-108+216*i/segs)*Math.PI/180, at=Math.abs(th)*180/Math.PI;
    var R=1250-520*smooth((at-72)/36) + 140*Math.sin(th*3.1+0.6) + 60*Math.sin(th*7.3);
    var n1=Math.sin(th*11.0)*0.5+Math.sin(th*23.0+1.3)*0.3+Math.sin(th*41.0+0.4)*0.2;
    var hts=[B.WATER_Y-0.3, 4+3*Math.random(), 26+12*n1+8*Math.sin(th*4.0), 34+20*Math.sin(th*2.3+0.4)+10*n1];
    var ds=[0, 25, 120, 420];
    for(var r=0;r<rows;r++){ var d=R+ds[r]; pos.push(Math.sin(th)*d, hts[r], -2.5-Math.cos(th)*d);
      var shade=[0.62,0.9,1.0,0.8][r]*(0.85+Math.random()*0.3); c.setHex([0x6f6a52,0x355a2a,0x3a5f2e,0x45633a][r]); col.push(c.r*shade,c.g*shade,c.b*shade); } }
  for(var i2=0;i2<segs;i2++) for(var r2=0;r2<rows-1;r2++){ var a=i2*rows+r2, b=a+rows; idx.push(a,b,a+1, a+1,b,b+1); }
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
  var m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})); B.scene.add(m);
  // cottages and boat lifts along the far waterline
  B.pool('farhouse', new THREE.BoxGeometry(1,1,1), B.lam(0xffffff), {cast:false,receive:false});
  for(var k=0;k<(LOW?60:120);k++){ var t=rnd(-100,100)*Math.PI/180, at2=Math.abs(t)*180/Math.PI, R2=1250-520*smooth((at2-72)/36)+140*Math.sin(t*3.1+0.6)+60*Math.sin(t*7.3)+rnd(8,22);
    B.put('farhouse', Math.sin(t)*R2, 1.5+rnd(0,2), -2.5-Math.cos(t)*R2, -t, 1, [0xf2efe6,0xd9d4c8,0x9fb3c6,0xc9b79a,0x7f8a95][(Math.random()*5)|0], {sx:rnd(7,14),sy:rnd(4,7),sz:rnd(6,10)}); }
})();

// ---------- a few boats out on the lake ----------
B.pool('hull', new THREE.BoxGeometry(1,1,1), B.lam(0xffffff), {});
[[-120,-210,0.3],[160,-380,1.2],[40,-620,2.0],[-300,-520,0.8],[260,-180,2.4]].forEach(function(b){
  B.put('hull',b[0],B.WATER_Y+0.25,b[1],b[2],1,0xf5f5f2,{sx:2.4,sy:0.6,sz:6.5}); B.put('hull',b[0],B.WATER_Y+0.8,b[1],b[2],1,0x2c3e5a,{sx:2.2,sy:0.15,sz:3}); });

})(window.BP);
