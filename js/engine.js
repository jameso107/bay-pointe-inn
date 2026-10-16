/* Bay Pointe Inn: wedding walkthrough engine (Three.js r128 + WebXR).
   Units are meters, in a site frame squared to the Gun Lake shoreline (measured off satellite imagery):
   +x runs along the shore to the southeast, -z points straight out over the lake (bearing ~34°, NE), +z runs inland to the inn.
   The seawall is at z = -2.5. Content scripts in js/venue/ build the site through window.BP, then index.html calls BP.run(). */
(function(){
'use strict';
var THREE = window.THREE;
var B = window.BP = {};
if (!THREE){ B.failed = true; return; }

// ---------- constants ----------
var EYE = B.EYE = 1.62, PR = 0.28;
B.WATER_Y = -0.75;
B.LAKE_BEARING = 34;   // compass bearing of -z (straight out over the lake)
var QUEST = B.QUEST = /OculusBrowser|Quest/i.test(navigator.userAgent);
var LOW = B.LOW = QUEST || /[?&]low\b/.test(location.search);
B.budget = {lights:12, calls:220};

var canvas = document.getElementById('three');
var renderer = B.renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, LOW?1:2));
renderer.xr.enabled = true;
renderer.shadowMap.enabled = !LOW;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
var scene = B.scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xc9d6df, 180, 2600);
var camera = B.camera = new THREE.PerspectiveCamera(70, 1, 0.08, 6000);
camera.rotation.order = 'YXZ';
var rig = B.rig = new THREE.Group(); rig.add(camera); scene.add(rig);

// ---------- lights (5 pm, July 4: sun ~45° up at bearing ~260°, behind the inn) ----------
function bearingDir(bearing, elev){   // compass bearing + elevation -> site-frame unit vector
  var a = (bearing - B.LAKE_BEARING) * Math.PI/180, e = elev*Math.PI/180;
  return new THREE.Vector3(Math.sin(a)*Math.cos(e), Math.sin(e), -Math.cos(a)*Math.cos(e));
}
B.bearingDir = bearingDir;
var SUN_DAY = bearingDir(260, 44), SUN_NIGHT = bearingDir(305, -9), MOON = bearingDir(150, 22);
var sun = B.sun = new THREE.DirectionalLight(0xfff1dc, 1.05);
sun.position.copy(SUN_DAY).multiplyScalar(120); sun.target.position.set(0,0,0);
scene.add(sun); scene.add(sun.target);
if (renderer.shadowMap.enabled){
  sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
  var sc = sun.shadow.camera; sc.left=-70; sc.right=70; sc.top=60; sc.bottom=-60; sc.near=10; sc.far=320;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
}
var hemi = B.hemi = new THREE.HemisphereLight(0xcfe3ff, 0x8f8775, 0.62); scene.add(hemi);
var amb = new THREE.AmbientLight(0xffffff, 0.08); scene.add(amb);
var lightCount = 3;

// ---------- procedural textures ----------
function canvasTex(w,h,draw,o){ o=o||{}; var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  var t=new THREE.CanvasTexture(c); if(o.repeat!==false){ t.wrapS=t.wrapT=THREE.RepeatWrapping; } t.anisotropy=LOW?2:8; t.userData={canvas:c}; return t; }
B.canvasTex = canvasTex;
function rnd(a,b){ return a+Math.random()*(b-a); }
B.rnd = rnd;
function speckle(g,w,h,n,dark,light,sz){ for(var i=0;i<n;i++){ g.fillStyle=Math.random()<0.5?'rgba(0,0,0,'+rnd(0,dark)+')':'rgba(255,255,255,'+rnd(0,light)+')'; var s=sz||2; g.fillRect(Math.random()*w,Math.random()*h,s,s); } }
B.speckle = speckle;
B.tex = {
  grass: canvasTex(512,512,function(g,w,h){ g.fillStyle='#5f8a3a'; g.fillRect(0,0,w,h);
    for(var i=0;i<4;i++){ g.fillStyle=i%2?'rgba(255,255,210,0.07)':'rgba(0,30,0,0.06)'; g.fillRect(i*w/4,0,w/4,h); }   // mower stripes
    for(var k=0;k<26000;k++){ var v=Math.random(); g.fillStyle=v<0.5?'rgba(30,60,10,'+rnd(0.1,0.35)+')':'rgba(170,200,90,'+rnd(0.05,0.25)+')'; g.fillRect(Math.random()*w,Math.random()*h,1,rnd(2,5)); } }),
  concrete: canvasTex(256,256,function(g,w,h){ g.fillStyle='#d2ccc0'; g.fillRect(0,0,w,h); speckle(g,w,h,9000,0.10,0.10,2);
    g.fillStyle='rgba(0,0,0,0.18)'; g.fillRect(0,0,w,2); g.fillRect(0,0,2,h); }),
  siding: canvasTex(256,256,function(g,w,h){ g.fillStyle='#e3d5bb'; g.fillRect(0,0,w,h);
    for(var y=0;y<h;y+=16){ var gr=g.createLinearGradient(0,y,0,y+16); gr.addColorStop(0,'rgba(0,0,0,0.13)'); gr.addColorStop(0.18,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(255,255,255,0.06)'); g.fillStyle=gr; g.fillRect(0,y,w,16); }
    speckle(g,w,h,1500,0.04,0.04,2); }),
  shingle: canvasTex(256,256,function(g,w,h){ g.fillStyle='#4f565f'; g.fillRect(0,0,w,h);
    for(var y=0;y<h;y+=21){ g.fillStyle='rgba(0,0,0,0.28)'; g.fillRect(0,y,w,2); var off=(y/21%2)*20;
      for(var x=off;x<w;x+=40){ g.fillStyle='rgba(0,0,0,0.18)'; g.fillRect(x,y,2,21); g.fillStyle='rgba(255,255,255,'+rnd(0,0.05)+')'; g.fillRect(x+2,y+2,38,19); } }
    speckle(g,w,h,5000,0.12,0.05,2); }),
  deck: canvasTex(256,256,function(g,w,h){ g.fillStyle='#e6e3dc'; g.fillRect(0,0,w,h);
    for(var x=0;x<w;x+=32){ g.fillStyle='rgba(0,0,0,0.16)'; g.fillRect(x,0,3,h); } speckle(g,w,h,2500,0.05,0.05,2); }),
  stone: canvasTex(256,256,function(g,w,h){ g.fillStyle='#8a8278'; g.fillRect(0,0,w,h);
    var y=0; while(y<h){ var rh=rnd(24,40), x=-rnd(0,40); while(x<w){ var rw=rnd(36,80), c=(110+Math.random()*60)|0;
      g.fillStyle='rgb('+c+','+((c*0.95)|0)+','+((c*0.88)|0)+')'; g.fillRect(x+2,y+2,rw-4,rh-4); x+=rw; } y+=rh; }
    speckle(g,w,h,4000,0.12,0.08,2); }),
  floor: canvasTex(256,256,function(g,w,h){ g.fillStyle='#bdb5a8'; g.fillRect(0,0,w,h); speckle(g,w,h,8000,0.07,0.06,2);
    g.fillStyle='rgba(0,0,0,0.12)'; g.fillRect(0,0,w,2); g.fillRect(0,0,2,h); }),
  beadboard: canvasTex(128,128,function(g,w,h){ g.fillStyle='#f4f2ec'; g.fillRect(0,0,w,h); for(var x=0;x<w;x+=16){ g.fillStyle='rgba(0,0,0,0.07)'; g.fillRect(x,0,2,h); } })
};
// tile sizes (meters per texture repeat) used for world-space UVs in the static batches
B.tex.grass.tile=[9,9]; B.tex.concrete.tile=[1.6,1.6]; B.tex.siding.tile=[2.4,2.4]; B.tex.shingle.tile=[2.2,2.2];
B.tex.deck.tile=[1.2,1.2]; B.tex.stone.tile=[1.6,1.6]; B.tex.floor.tile=[2.4,2.4]; B.tex.beadboard.tile=[1.2,1.2];

// ---------- materials ----------
function lam(color,o){ o=o||{}; o.color=color; return new THREE.MeshLambertMaterial(o); }
B.lam = lam;
B.basic = function(color,o){ o=o||{}; o.color=color; return new THREE.MeshBasicMaterial(o); };
var M = B.mat = {
  grass: lam(0xffffff,{map:B.tex.grass}), concrete: lam(0xffffff,{map:B.tex.concrete}), siding: lam(0xffffff,{map:B.tex.siding}),
  roof: lam(0xffffff,{map:B.tex.shingle}), deck: lam(0xffffff,{map:B.tex.deck}), stone: lam(0xffffff,{map:B.tex.stone}),
  floor: lam(0xffffff,{map:B.tex.floor}), ceiling: lam(0xffffff,{map:B.tex.beadboard,emissive:0x3c3a35}),
  trim: lam(0xf7f6f1), white: lam(0xfbfbf8), linen: lam(0xf6f3ec), gold: lam(0xb8975a,{emissive:0x1a1206}),
  blue: lam(0x8fb1d6), navy: lam(0x24344f), red: lam(0xb4202e), wood: lam(0x6b4a2f), woodDark: lam(0x3a2a1c), black: lam(0x18181a),
  metal: lam(0x8b9097), darkMetal: lam(0x3c3f44), glass: lam(0x3b4d5c,{emissive:0x0}), copper: lam(0xc4876a), rock: lam(0x8c8378),
  bark: lam(0x4d3b2c), leaf: lam(0x3f6b2c), hedge: lam(0x3d5e2a), cream: lam(0xece2cf), sand: lam(0xb9a78a),
  tent: lam(0xfbfaf6,{side:THREE.DoubleSide,emissive:0x5e5b55}),   // sunlit fabric glows through cushion: lam(0xf2efe6), galv: lam(0xa9adb1)
};
M.grass.userData.tile=B.tex.grass.tile; M.concrete.userData.tile=B.tex.concrete.tile; M.siding.userData.tile=B.tex.siding.tile;
M.roof.userData.tile=B.tex.shingle.tile; M.deck.userData.tile=B.tex.deck.tile; M.stone.userData.tile=B.tex.stone.tile;
M.floor.userData.tile=B.tex.floor.tile; M.ceiling.userData.tile=B.tex.beadboard.tile;

// ---------- static batches: everything that never moves is merged into one mesh per material ----------
var batches = {};
function batch(key){ var m=M[key]; if(!m) throw new Error('BP: no material '+key);
  return batches[key] || (batches[key]={key:key, mat:m, pos:[], nrm:[], uv:[], cast:true, receive:true}); }
var _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3(1,1,1);
function xform(x,y,z,ry,rx,rz,sx,sy,sz){ _e.set(rx||0,ry||0,rz||0,'YXZ'); _q.setFromEuler(_e); _v.set(x||0,y||0,z||0); _s.set(sx||1,sy||1,sz||1); return _m4.compose(_v,_q,_s); }
B.xform = xform;
// add a geometry (any Three BufferGeometry) to a material batch. opts.uv='own' keeps the geometry's own UVs (signs, decals)
B.add = function(geo, key, x,y,z, ry, o){ o=o||{}; var b=batch(key);
  var g=(geo.index?geo.toNonIndexed():geo.clone()); g.applyMatrix4(o.matrix||xform(x,y,z,ry,o.rx,o.rz,o.sx,o.sy,o.sz));
  if(!g.attributes.normal) g.computeVertexNormals();
  var p=g.attributes.position.array, n=g.attributes.normal.array, u=g.attributes.uv?g.attributes.uv.array:null;
  for(var i=0;i<p.length;i++){ b.pos.push(p[i]); b.nrm.push(n[i]); }
  for(var j=0;j<p.length/3;j++){ if(o.uv==='own' && u){ b.uv.push(u[j*2],u[j*2+1]); } else b.uv.push(NaN,NaN); }   // NaN: world-space UVs at finalize
  if(o.cast===false) b.cast=false; return b; };
B.box = function(w,h,d,x,y,z,key,ry,o){ return B.add(new THREE.BoxGeometry(w,h,d), key, x,y+h/2,z, ry, o); };   // y is the BOTTOM of the box
B.cyl = function(rt,rb,h,x,y,z,key,seg,o){ return B.add(new THREE.CylinderGeometry(rt,rb,h,seg||12), key, x,y+h/2,z, 0, o); };
// raw triangles in world space: verts = [ax,ay,az, bx,by,bz, cx,cy,cz, ...]; flat normals
var _a=new THREE.Vector3(), _b=new THREE.Vector3(), _c=new THREE.Vector3();
B.tris = function(key, v){ var b=batch(key);
  for(var i=0;i<v.length;i+=9){ _a.set(v[i],v[i+1],v[i+2]); _b.set(v[i+3],v[i+4],v[i+5]); _c.set(v[i+6],v[i+7],v[i+8]);
    _b.sub(_a); _c.sub(_a); _b.cross(_c).normalize();
    for(var k=0;k<9;k++) b.pos.push(v[i+k]);
    for(var r=0;r<3;r++){ b.nrm.push(_b.x,_b.y,_b.z); b.uv.push(NaN,NaN); } } };
B.quad = function(key,a,b,c,d){ B.tris(key,[a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2], a[0],a[1],a[2],c[0],c[1],c[2],d[0],d[1],d[2]]); };
// a gable roof: ridge along the local x axis (length L), span W, eave height y0, rise h, overhang ov; rotated ry about (x,z)
B.gableRoof = function(x,z,L,W,y0,h,ry,o){ o=o||{}; var ov=o.ov==null?0.4:o.ov, c=Math.cos(ry||0), s=Math.sin(ry||0);
  function P(lx,ly,lz){ return [x+lx*c+lz*s, ly, z-lx*s+lz*c]; }
  var hl=L/2+ov, hw=W/2+ov, drop=h*ov/(W/2);
  var e1=P(-hl,y0-drop,hw), e2=P(hl,y0-drop,hw), r1=P(-hl,y0+h,0), r2=P(hl,y0+h,0), e3=P(hl,y0-drop,-hw), e4=P(-hl,y0-drop,-hw);
  B.quad(o.roof||'roof', e1,e2,r2,r1); B.quad(o.roof||'roof', e3,e4,r1,r2);
  var thick=0.12; B.quad(o.roof||'roof', P(-hl,y0-drop-thick,hw),P(hl,y0-drop-thick,hw),e2,e1); B.quad(o.roof||'roof', P(hl,y0-drop-thick,-hw),P(-hl,y0-drop-thick,-hw),e4,e3);
  if(o.ends!==false){ var g=o.gable||'siding';   // triangular gable ends
    B.tris(g,[].concat(P(-L/2,y0,W/2),P(-L/2,y0+h*(1-0.0),0),P(-L/2,y0,-W/2)));
    B.tris(g,[].concat(P(L/2,y0,-W/2),P(L/2,y0+h,0),P(L/2,y0,W/2)));
  }
  if(o.under!==false){ var u=o.under||'trim', d=function(p){ return [p[0],p[1]-0.06,p[2]]; };   // undersides, seen from inside an open pavilion
    B.quad(u,d(r1),d(r2),d(e2),d(e1)); B.quad(u,d(r2),d(r1),d(e4),d(e3)); }
};
// hip roof over a w x d rectangle centred at (x,z): eave height y0, rise h, ridge along the longer side
B.hipRoof = function(x,z,w,d,y0,h,o){ o=o||{}; var ov=o.ov==null?0.5:o.ov, k=o.roof||'roof';
  var hw=w/2+ov, hd=d/2+ov, r=Math.min(hw,hd), drop=h*ov/r, y=y0-drop, top=y0+h;
  if(hw>=hd){ var rx=hw-hd;
    B.quad(k,[x-hw,y,z+hd],[x+hw,y,z+hd],[x+rx,top,z],[x-rx,top,z]); B.quad(k,[x+hw,y,z-hd],[x-hw,y,z-hd],[x-rx,top,z],[x+rx,top,z]);
    B.tris(k,[x-hw,y,z-hd, x-hw,y,z+hd, x-rx,top,z,  x+hw,y,z+hd, x+hw,y,z-hd, x+rx,top,z]);
  } else { var rz=hd-hw;
    B.quad(k,[x+hw,y,z+hd],[x+hw,y,z-hd],[x,top,z-rz],[x,top,z+rz]); B.quad(k,[x-hw,y,z-hd],[x-hw,y,z+hd],[x,top,z+rz],[x,top,z-rz]);
    B.tris(k,[x-hw,y,z+hd, x+hw,y,z+hd, x,top,z+rz,  x+hw,y,z-hd, x-hw,y,z-hd, x,top,z-rz]); }
  B.quad(o.under||'trim',[x-hw,y,z-hd],[x+hw,y,z-hd],[x+hw,y,z+hd],[x-hw,y,z+hd]);
};
function finalizeBatches(){
  Object.keys(batches).forEach(function(k){ var b=batches[k]; if(!b.pos.length) return;
    var tile=(b.mat.userData&&b.mat.userData.tile)||[1,1], off=(b.mat.userData&&b.mat.userData.off)||[0,0], p=b.pos, n=b.nrm, uv=b.uv;
    for(var t=0;t<p.length/9;t++){   // world-space planar UVs, per triangle by dominant normal axis
      var i=t*9; if(!isNaN(uv[t*6])) continue;
      var nx=Math.abs(n[i])+Math.abs(n[i+3])+Math.abs(n[i+6]), ny=Math.abs(n[i+1])+Math.abs(n[i+4])+Math.abs(n[i+7]), nz=Math.abs(n[i+2])+Math.abs(n[i+5])+Math.abs(n[i+8]);
      for(var v=0;v<3;v++){ var px=p[i+v*3],py=p[i+v*3+1],pz=p[i+v*3+2], u,w;
        if(ny>=nx&&ny>=nz){ u=px; w=-pz; } else if(nx>=nz){ u=pz*(n[i]>0?-1:1); w=py; } else { u=px*(n[i+2]>0?1:-1); w=py; }
        uv[t*6+v*2]=(u-off[0])/tile[0]; uv[t*6+v*2+1]=(w-off[1])/tile[1]; } }
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.computeBoundingSphere();
    var mesh=new THREE.Mesh(g,b.mat); mesh.castShadow=b.cast; mesh.receiveShadow=b.receive; mesh.matrixAutoUpdate=false; scene.add(mesh); b.mesh=mesh;
  });
}

// ---------- instance pools: many copies of one shape (chairs, blooms, trees) = one draw call ----------
var pools = {};
B.pool = function(name, geo, mat, o){ o=o||{}; return pools[name] || (pools[name]={geo:geo, mat:mat, items:[], o:o}); };
B.put = function(name, x,y,z, ry, s, color, o){ var p=pools[name]; o=o||{};
  p.items.push({x:x,y:y,z:z,ry:ry||0,rx:o.rx||0,rz:o.rz||0,sx:(o.sx||1)*(s||1),sy:(o.sy||1)*(s||1),sz:(o.sz||1)*(s||1),color:color}); };
function finalizePools(){
  Object.keys(pools).forEach(function(k){ var p=pools[k]; if(!p.items.length) return;
    var im=new THREE.InstancedMesh(p.geo,p.mat,p.items.length), col=new THREE.Color(), hasCol=p.items.some(function(it){ return it.color!=null; });
    p.items.forEach(function(it,i){ im.setMatrixAt(i, xform(it.x,it.y,it.z,it.ry,it.rx,it.rz,it.sx,it.sy,it.sz));
      if(hasCol){ col.set(it.color==null?0xffffff:it.color); im.setColorAt(i,col); } });
    im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true;
    im.castShadow=p.o.cast!==false; im.receiveShadow=p.o.receive!==false; im.frustumCulled=false;
    scene.add(im); p.mesh=im; });
}
// merge a list of {geo, x,y,z, ry, rx, rz} parts into one geometry (for instancing compound shapes like chairs)
B.mergeParts = function(parts){ var pos=[],nrm=[],uv=[];
  parts.forEach(function(pt){ var g=(pt.geo.index?pt.geo.toNonIndexed():pt.geo.clone()); g.applyMatrix4(xform(pt.x,pt.y,pt.z,pt.ry,pt.rx,pt.rz,pt.sx,pt.sy,pt.sz));
    var p=g.attributes.position.array,n=g.attributes.normal.array,u=g.attributes.uv?g.attributes.uv.array:null;
    for(var i=0;i<p.length;i++){ pos.push(p[i]); nrm.push(n[i]); } for(var j=0;j<p.length/3;j++){ uv.push(u?u[j*2]:0,u?u[j*2+1]:0); } });
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); return g; };
B.bx = function(w,h,d,x,y,z,ry,rx,rz){ return {geo:new THREE.BoxGeometry(w,h,d),x:x,y:y+h/2,z:z,ry:ry,rx:rx,rz:rz}; };   // part helpers (y = bottom)
B.cy = function(rt,rb,h,x,y,z,seg,rx,rz){ return {geo:new THREE.CylinderGeometry(rt,rb,h,seg||8),x:x,y:y+h/2,z:z,rx:rx,rz:rz}; };

// ---------- glows: additive points that light up at night (bulbs, candles, lanterns, flames) ----------
var glowData={pos:[],col:[],size:[],day:[]};
// size = world diameter of the halo (m); day = how much shows at 5 pm (0..1)
B.glow = function(x,y,z,size,color,day,mirror){ var c=new THREE.Color(color==null?0xffc46b:color);
  glowData.pos.push(x,y,z); glowData.col.push(c.r,c.g,c.b); glowData.size.push(size); glowData.day.push(day||0);
  if(mirror){ glowData.pos.push(x,2*B.WATER_Y-y,z); glowData.col.push(c.r*0.45,c.g*0.45,c.b*0.45); glowData.size.push(size*1.4); glowData.day.push(0); } };
B.glowMat = function(){ return new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  uniforms:{uScale:{value:600}, uNight:{value:0}},
  vertexShader:'attribute float size; attribute vec3 gcolor; attribute float day; uniform float uScale; uniform float uNight; varying vec3 vC; varying float vA;'+
    'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=min(256.0,size*uScale/max(0.1,-mv.z));'+
    ' vC=gcolor; vA=mix(day,1.0,uNight); }',
  fragmentShader:'varying vec3 vC; varying float vA; void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d)*2.0; if(r>1.0) discard;'+
    ' float a=pow(1.0-r,2.2)*0.85+smoothstep(0.22,0.0,r)*0.9; gl_FragColor=vec4(vC*a*vA,1.0); }' }); };
var glowPoints=null, glowMats=[];
function finalizeGlows(){ if(!glowData.size.length) return;
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(glowData.pos,3));
  g.setAttribute('gcolor',new THREE.Float32BufferAttribute(glowData.col,3)); g.setAttribute('size',new THREE.Float32BufferAttribute(glowData.size,1)); g.setAttribute('day',new THREE.Float32BufferAttribute(glowData.day,1));
  var m=B.glowMat(); glowMats.push(m); glowPoints=new THREE.Points(g,m); glowPoints.frustumCulled=false; glowPoints.renderOrder=5; scene.add(glowPoints); }
B.trackGlowMat = function(m){ glowMats.push(m); };

// ---------- dynamic lights (night only; keep under budget for Quest) ----------
var nightLights=[];
B.nightLight = function(x,y,z,color,intensity,dist,o){ o=o||{}; var l=new THREE.PointLight(color,0,dist||14,2); l.position.set(x,y,z); scene.add(l);
  nightLights.push({l:l,i:intensity,flicker:o.flicker,day:o.day||0}); lightCount++; return l; };

// ---------- sky, stars, fog ----------
var skyU={top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunDir:{value:SUN_DAY.clone()},sunCol:{value:new THREE.Color(0xfff2d6)},sunDisc:{value:1},glowAmt:{value:0.35},stars:{value:0}};
var sky=new THREE.Mesh(new THREE.SphereGeometry(4500,32,16), new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:skyU,
  vertexShader:'varying vec3 vD; void main(){ vD=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position=p.xyww; }',
  fragmentShader:'uniform vec3 top,hor,sunDir,sunCol; uniform float sunDisc,glowAmt; varying vec3 vD;'+
    'void main(){ vec3 d=normalize(vD); float h=clamp(d.y,0.0,1.0); vec3 c=mix(hor,top,pow(h,0.45));'+
    ' float s=max(dot(d,normalize(sunDir)),0.0); c+=sunCol*(smoothstep(0.9993,0.9997,s)*sunDisc*2.0+pow(s,10.0)*glowAmt+pow(s,64.0)*glowAmt*0.6);'+
    ' c=mix(c,hor*0.92,smoothstep(0.0,-0.08,d.y)); gl_FragColor=vec4(c,1.0); }'}));
sky.renderOrder=-10; sky.frustumCulled=false; scene.add(sky);
var stars=(function(){ var n=LOW?700:1400, p=[]; for(var i=0;i<n;i++){ var u=Math.random(), th=Math.random()*Math.PI*2, y=0.04+u*0.96, r=Math.sqrt(1-y*y);
    p.push(Math.cos(th)*r*4000, y*4000, Math.sin(th)*r*4000); }
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  var m=new THREE.PointsMaterial({color:0xdfe6ff,size:LOW?2.2:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false});
  var s=new THREE.Points(g,m); s.frustumCulled=false; s.renderOrder=-9; scene.add(s); return s; })();

// ---------- the lake ----------
var waterU={t:{value:0},deep:{value:new THREE.Color()},shallow:{value:new THREE.Color()},skyT:{value:new THREE.Color()},skyH:{value:new THREE.Color()},
  sunDir:{value:SUN_DAY.clone()},sunCol:{value:new THREE.Color(0xfff0d0)},sunAmt:{value:1},camPos:{value:new THREE.Vector3()},
  fogC:{value:new THREE.Color()},fogN:{value:180},fogF:{value:2600},flashC:{value:new THREE.Color(0,0,0)},flashP:{value:new THREE.Vector3(0,100,-260)},shore:{value:-2.5}};
B.waterU = waterU;
var water=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000,1,1), new THREE.ShaderMaterial({uniforms:waterU,
  vertexShader:'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
  fragmentShader:[
    'uniform float t,sunAmt,fogN,fogF,shore; uniform vec3 deep,shallow,skyT,skyH,sunDir,sunCol,camPos,fogC,flashC,flashP; varying vec3 vW;',
    'void W(inout vec2 g, vec2 p, vec2 d, float f, float a, float s){ d=normalize(d); g+=d*cos(dot(p,d)*f+t*s)*a*f; }',
    'void main(){ vec3 V=camPos-vW; float dist=length(V); V/=dist; vec2 p=vW.xz; vec2 g=vec2(0.0);',
    ' W(g,p,vec2(1.0,0.35),0.42,0.06,1.2); W(g,p,vec2(-0.45,1.0),0.83,0.035,1.6); W(g,p,vec2(0.7,-0.8),1.7,0.016,2.2);',
    ' W(g,p,vec2(-1.0,-0.25),3.3,0.008,3.0); W(g,p,vec2(0.25,1.0),6.1,0.004,4.1); W(g,p,vec2(0.9,0.6),11.0,0.0022,5.3);',
    ' vec3 n=normalize(vec3(-g.x,1.0,-g.y)); n=normalize(mix(n,vec3(0.0,1.0,0.0),smoothstep(40.0,1400.0,dist)*0.8));',
    ' float fres=0.03+0.97*pow(1.0-max(dot(n,V),0.0),5.0); vec3 R=reflect(-V,n);',
    ' vec3 refl=mix(skyH,skyT,clamp(R.y*1.6,0.0,1.0));',
    ' float off=shore-vW.z; vec3 base=mix(shallow,deep,smoothstep(1.0,40.0,off));',
    ' vec3 c=mix(base,refl,fres*0.9);',
    ' float sp=pow(max(dot(R,normalize(sunDir)),0.0),180.0)*sunAmt; c+=sunCol*sp*3.0;',
    ' vec3 fl=flashP-vW; float fd=length(fl); c+=flashC*(0.35*fres+0.12)*pow(max(dot(R,fl/fd),0.0),6.0)*2.5;',
    ' c=mix(c,fogC,smoothstep(fogN,fogF,dist)); gl_FragColor=vec4(c,1.0); }'].join('\n')}));
water.rotation.x=-Math.PI/2; water.position.set(0,B.WATER_Y,-2000); water.renderOrder=-5; scene.add(water);
B.water = water;

// ---------- time of day: 0 = 5:00 pm (default), 1 = 10:00 pm with fireworks ----------
var C=function(h){ return new THREE.Color(h); };
var TOD={
  day:  {top:C(0x5f93d1),hor:C(0xcfdce6),fog:C(0xc9d6df),sun:1.05,sunC:C(0xfff1dc),hemi:0.62,hemiSky:C(0xcfe3ff),hemiGnd:C(0x8f8775),amb:0.08,
         deep:C(0x2d5566),shallow:C(0x4f6e55),wSkyT:C(0x7aa3cf),wSkyH:C(0xd6e1e8),fogN:180,fogF:2600,glow:0.35,disc:1,stars:0,winEm:0},
  night:{top:C(0x030814),hor:C(0x1f2c4a),fog:C(0x111a2e),sun:0.2,sunC:C(0x8fa4d6),hemi:0.26,hemiSky:C(0x3b4a78),hemiGnd:C(0x14140f),amb:0.05,
         deep:C(0x050b14),shallow:C(0x0a1410),wSkyT:C(0x060c1a),wSkyH:C(0x1b2742),fogN:120,fogF:2200,glow:0.25,disc:0,stars:1,winEm:1}
};
var tod={v:0,target:0}, _tc=new THREE.Color(), todFns=[];
B.onTod = function(fn){ todFns.push(fn); };
B.night = function(){ return tod.target>0.5; };
B.setNight = function(on){ tod.target=on?1:0; document.body.classList.toggle('night',!!on); var el=document.getElementById('todbtn'); if(el) el.textContent=on?'10:00 pm · fireworks':'5:00 pm · golden afternoon'; };
B.toggleNight = function(){ B.setNight(!B.night()); return B.night(); };
function applyTod(v){
  var a=TOD.day, b=TOD.night, s=v*v*(3-2*v);
  function lc(k){ return _tc.copy(a[k]).lerp(b[k],s); }
  function ln(k){ return a[k]+(b[k]-a[k])*s; }
  skyU.top.value.copy(lc('top')); skyU.hor.value.copy(lc('hor')); skyU.glowAmt.value=ln('glow'); skyU.sunDisc.value=ln('disc');
  skyU.sunDir.value.copy(SUN_DAY).lerp(SUN_NIGHT,s).normalize(); skyU.sunCol.value.set(0xfff2d6).lerp(C(0xff7a3c),s);
  scene.fog.color.copy(lc('fog')); scene.fog.near=ln('fogN'); scene.fog.far=ln('fogF');
  sun.intensity=ln('sun'); sun.color.copy(lc('sunC')); sun.position.copy(SUN_DAY).lerp(MOON,s).normalize().multiplyScalar(120);
  hemi.intensity=ln('hemi'); hemi.color.copy(lc('hemiSky')); hemi.groundColor.copy(lc('hemiGnd')); amb.intensity=ln('amb');
  waterU.deep.value.copy(lc('deep')); waterU.shallow.value.copy(lc('shallow')); waterU.skyT.value.copy(lc('wSkyT')); waterU.skyH.value.copy(lc('wSkyH'));
  waterU.sunDir.value.copy(skyU.sunDir.value); waterU.sunAmt.value=1-s; waterU.fogC.value.copy(scene.fog.color); waterU.fogN.value=scene.fog.near; waterU.fogF.value=scene.fog.far;
  waterU.sunCol.value.copy(lc('sunC'));
  stars.material.opacity=s*0.9;
  glowMats.forEach(function(m){ m.uniforms.uNight.value=s; });
  nightLights.forEach(function(n){ n.l.intensity=n.i*(n.day+(1-n.day)*s); });
  todFns.forEach(function(f){ f(s); });
}

// ---------- ground, walkable areas, collision ----------
B.groundAt = function(){ return 0; };   // site.js replaces this
var walk=[], boxes=[], circles=[];
B.walkable = function(x1,z1,x2,z2,y){ walk.push({x1:Math.min(x1,x2),z1:Math.min(z1,z2),x2:Math.max(x1,x2),z2:Math.max(z1,z2),y:y}); };
B.solid = function(x1,z1,x2,z2){ boxes.push({x1:Math.min(x1,x2),z1:Math.min(z1,z2),x2:Math.max(x1,x2),z2:Math.max(z1,z2)}); };
B.solidCircle = function(x,z,r){ circles.push({x:x,z:z,r:r}); };
function inWalk(x,z){ for(var i=walk.length-1;i>=0;i--){   // later areas (pavilion floor, docks) win over the lawn
  var w=walk[i]; if(x>=w.x1&&x<=w.x2&&z>=w.z1&&z<=w.z2) return w; } return null; }
function blocked(x,z){ if(!inWalk(x,z)) return true;
  for(var i=0;i<boxes.length;i++){ var b=boxes[i]; if(x>b.x1-PR&&x<b.x2+PR&&z>b.z1-PR&&z<b.z2+PR) return true; } return false; }
B.blocked = blocked;
B.floorAt = function(x,z){ var w=inWalk(x,z); return (w && w.y!=null)?w.y:B.groundAt(x,z); };
var pos=B.pos=new THREE.Vector3(-6,0,26.2), yaw=Math.PI, pitch=-0.06, camY=null;
function moveBy(dx,dz){
  if(!blocked(pos.x+dx,pos.z)) pos.x+=dx;
  if(!blocked(pos.x,pos.z+dz)) pos.z+=dz;
  for(var i=0;i<circles.length;i++){ var c=circles[i], ox=pos.x-c.x, oz=pos.z-c.z, d=Math.sqrt(ox*ox+oz*oz), r=c.r+PR;
    if(d<r && d>1e-5){ var nx=c.x+ox/d*r, nz=c.z+oz/d*r; if(!blocked(nx,nz)){ pos.x=nx; pos.z=nz; } } }
}

// ---------- places: named spots shown on the HUD and reachable with number keys / B button ----------
var places=B.places=[];
B.place = function(o){ places.push(o); return o; };   // {n,name,desc,x,z,r, at:[x,z,yaw]}
B.jump = function(n){ var p=places.filter(function(q){ return q.n===n; })[0]; if(!p||!p.at) return; pos.x=p.at[0]; pos.z=p.at[1]; yaw=p.at[2]; pitch=-0.04; camY=null; xr.init=false; B.flash(p.name); };
var jumpIdx=0;

// ---------- map (canvas minimap; also the VR wrist map) ----------
var mapItems=[];
B.mapRect = function(x1,z1,x2,z2,fill,stroke){ mapItems.push({t:'r',x1:x1,z1:z1,x2:x2,z2:z2,f:fill,s:stroke}); };
B.mapCircle = function(x,z,r,fill){ mapItems.push({t:'c',x:x,z:z,r:r,f:fill}); };
B.mapLine = function(pts,w,color){ mapItems.push({t:'l',p:pts,w:w,s:color}); };
var MB={x1:-62,x2:62,z1:-24,z2:40};
var mm=document.getElementById('minimap'), mg=mm?mm.getContext('2d'):null, mmBase=document.createElement('canvas'), MX, MZ;
function buildMap(){ if(!mm) return; mmBase.width=mm.width; mmBase.height=mm.height;
  var s=Math.min(mm.width/(MB.x2-MB.x1),mm.height/(MB.z2-MB.z1)), ox=(mm.width-(MB.x2-MB.x1)*s)/2, oz=(mm.height-(MB.z2-MB.z1)*s)/2;
  MX=function(x){ return (x-MB.x1)*s+ox; }; MZ=function(z){ return (z-MB.z1)*s+oz; }; B.mapScale=s;
  var g=mmBase.getContext('2d'); g.fillStyle='#5d7f45'; g.fillRect(0,0,mm.width,mm.height);
  g.fillStyle='#2e5869'; g.fillRect(0,0,mm.width,MZ(-2.5));
  mapItems.forEach(function(it){
    if(it.t==='r'){ g.fillStyle=it.f; g.fillRect(MX(it.x1),MZ(it.z1),(it.x2-it.x1)*s,(it.z2-it.z1)*s); if(it.s){ g.strokeStyle=it.s; g.lineWidth=1; g.strokeRect(MX(it.x1),MZ(it.z1),(it.x2-it.x1)*s,(it.z2-it.z1)*s); } }
    else if(it.t==='c'){ g.fillStyle=it.f; g.beginPath(); g.arc(MX(it.x),MZ(it.z),Math.max(1,it.r*s),0,7); g.fill(); }
    else if(it.t==='l'){ g.strokeStyle=it.s; g.lineWidth=it.w*s; g.lineCap='round'; g.lineJoin='round'; g.beginPath(); it.p.forEach(function(q,i){ i?g.lineTo(MX(q[0]),MZ(q[1])):g.moveTo(MX(q[0]),MZ(q[1])); }); g.stroke(); } });
  var k=mm.width/232;   // the canvas is drawn at 2x for crisp text
  places.forEach(function(p){ g.fillStyle='rgba(20,24,36,.8)'; g.beginPath(); g.arc(MX(p.x),MZ(p.z),6*k,0,7); g.fill();
    g.fillStyle='#f3d9a4'; g.font='bold '+(9*k)+'px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(p.n),MX(p.x),MZ(p.z)+0.5); });
  // compass: true north is LAKE_BEARING degrees counter-clockwise of map-up
  var a=-B.LAKE_BEARING*Math.PI/180, cx=mm.width-16*k, cy=mm.height-18*k; g.save(); g.translate(cx,cy); g.rotate(a); g.scale(k,k);
  g.fillStyle='#f3d9a4'; g.beginPath(); g.moveTo(0,-9); g.lineTo(4,4); g.lineTo(0,1); g.lineTo(-4,4); g.closePath(); g.fill();
  g.font='bold 8px sans-serif'; g.textAlign='center'; g.fillText('N',0,-12); g.restore();
  g.fillStyle='rgba(255,255,255,.75)'; g.font='italic '+(10*k)+'px Georgia,serif'; g.textAlign='left'; g.fillText('Gun Lake',6*k,13*k);
}
function drawMap(){ if(!mg) return; mg.clearRect(0,0,mm.width,mm.height); mg.drawImage(mmBase,0,0);
  mg.save(); mg.translate(MX(pos.x),MZ(pos.z)); mg.rotate(-yaw); mg.scale(mm.width/232,mm.width/232);
  mg.fillStyle='#ff5a4e'; mg.strokeStyle='#fff'; mg.lineWidth=1; mg.beginPath(); mg.moveTo(0,7); mg.lineTo(-4.5,-4); mg.lineTo(4.5,-4); mg.closePath(); mg.fill(); mg.stroke(); mg.restore(); }

// ---------- HUD ----------
var placeEl=document.getElementById('place'), flashEl=document.getElementById('flash'), flashT=0, curPlace=null;
B.flash = function(text,sec){ if(flashEl){ flashEl.textContent=text; flashEl.style.opacity=1; } flashT=sec||2.2; hudState.flash=text; };
var hudState={place:null,flash:''};

// ---------- sound (WebAudio, synthesized: lake lapping, birds by day, crickets by night, fireworks) ----------
var AC=null, master=null, muted=false; B.audio=function(){ return AC; }; B.master=function(){ return master; };
function startAudio(){ if(AC) return; try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  master=AC.createGain(); master.gain.value=0.9; master.connect(AC.destination);
  var len=AC.sampleRate*4, buf=AC.createBuffer(1,len,AC.sampleRate), d=buf.getChannelData(0), last=0;
  for(var i=0;i<len;i++){ last=last*0.97+(Math.random()*2-1)*0.03; d[i]=last*3; }
  B.noiseBuf=buf;
  var src=AC.createBufferSource(); src.buffer=buf; src.loop=true; var lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=520;
  var g=AC.createGain(); g.gain.value=0.16; var lfo=AC.createOscillator(); lfo.frequency.value=0.18; var lg=AC.createGain(); lg.gain.value=0.07; lfo.connect(lg); lg.connect(g.gain);
  src.connect(lp); lp.connect(g); g.connect(master); src.start(); lfo.start();
  audioFns.forEach(function(f){ f(AC,master); });
}
var audioFns=[]; B.onAudio=function(f){ audioFns.push(f); if(AC) f(AC,master); };
B.toggleMute=function(){ muted=!muted; if(master) master.gain.value=muted?0:0.9; return !muted; };

// ---------- drone view (Tab): a slow orbit above the venue, like the aerial photos ----------
var drone={on:false,ang:-0.35,el:0.62,dist:95,cx:-2,cz:6};
var droneCam=new THREE.PerspectiveCamera(50,1,1,6000);
function toggleDrone(){ if(renderer.xr.isPresenting) return; drone.on=!drone.on; document.body.classList.toggle('drone',drone.on); }
B.toggleDrone=toggleDrone;

// ---------- controls: keyboard + mouse, touch (left thumb walks, right drags look) ----------
var keys={}, dragging=false, lastX=0, lastY=0, locked=false, started=false, showHelp=true;
function onLook(dx,dy){ if(drone.on){ drone.ang-=dx*0.004; drone.el=Math.max(0.15,Math.min(1.35,drone.el+dy*0.003)); return; }
  yaw-=dx*0.0023; pitch-=dy*0.0021; pitch=Math.max(-1.35,Math.min(1.35,pitch)); }
canvas.addEventListener('mousedown',function(e){ dragging=true; lastX=e.clientX; lastY=e.clientY; });
window.addEventListener('mouseup',function(){ dragging=false; });
window.addEventListener('mousemove',function(e){ if(locked) onLook(e.movementX||0,e.movementY||0); else if(dragging){ onLook(e.clientX-lastX,e.clientY-lastY); lastX=e.clientX; lastY=e.clientY; } });
canvas.addEventListener('wheel',function(e){ if(drone.on){ drone.dist=Math.max(25,Math.min(260,drone.dist*(1+e.deltaY*0.001))); e.preventDefault(); } },{passive:false});
document.addEventListener('pointerlockchange',function(){ locked=(document.pointerLockElement===canvas); });
window.addEventListener('keydown',function(e){ if(!started) return;
  keys[e.code]=true;
  if(e.code==='Tab'){ e.preventDefault(); toggleDrone(); }
  if(e.code==='KeyT'||e.code==='KeyN'){ B.flash(B.toggleNight()?'10:00 pm · fireworks over Gun Lake':'5:00 pm · July 4'); }
  if(e.code==='KeyH'){ showHelp=!showHelp; document.getElementById('help').style.display=showHelp?'block':'none'; }
  if(e.code==='KeyM'){ B.flash(B.toggleMute()?'Sound on':'Sound off'); }
  if(e.code==='KeyF' && B.finale){ B.finale(); }
  var dg=/^Digit([1-9])$/.exec(e.code); if(dg){ if(drone.on) toggleDrone(); B.jump(+dg[1]); }
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].indexOf(e.code)>=0) e.preventDefault();
});
window.addEventListener('keyup',function(e){ keys[e.code]=false; });
window.addEventListener('blur',function(){ keys={}; });
var touch={stick:null,look:null,mx:0,my:0}, stickEl=document.getElementById('stick'), knobEl=document.getElementById('knob');
canvas.addEventListener('touchstart',function(e){ if(!started) return; for(var i=0;i<e.changedTouches.length;i++){ var t=e.changedTouches[i];
    if(t.clientX<window.innerWidth*0.42 && !touch.stick){ touch.stick={id:t.identifier,x:t.clientX,y:t.clientY}; if(stickEl){ stickEl.style.display='block'; stickEl.style.left=(t.clientX-50)+'px'; stickEl.style.top=(t.clientY-50)+'px'; knobEl.style.transform='translate(0,0)'; } }
    else if(!touch.look) touch.look={id:t.identifier,x:t.clientX,y:t.clientY}; } e.preventDefault(); },{passive:false});
canvas.addEventListener('touchmove',function(e){ for(var i=0;i<e.changedTouches.length;i++){ var t=e.changedTouches[i];
    if(touch.stick && t.identifier===touch.stick.id){ var dx=t.clientX-touch.stick.x, dy=t.clientY-touch.stick.y, d=Math.hypot(dx,dy), k=d>45?45/d:1;
      touch.mx=dx*k/45; touch.my=dy*k/45; if(knobEl) knobEl.style.transform='translate('+(dx*k)+'px,'+(dy*k)+'px)'; }
    else if(touch.look && t.identifier===touch.look.id){ onLook((t.clientX-touch.look.x)*1.5,(t.clientY-touch.look.y)*1.5); touch.look.x=t.clientX; touch.look.y=t.clientY; } } e.preventDefault(); },{passive:false});
function touchEnd(e){ for(var i=0;i<e.changedTouches.length;i++){ var t=e.changedTouches[i];
    if(touch.stick && t.identifier===touch.stick.id){ touch.stick=null; touch.mx=touch.my=0; if(stickEl) stickEl.style.display='none'; }
    if(touch.look && t.identifier===touch.look.id) touch.look=null; } }
canvas.addEventListener('touchend',touchEnd); canvas.addEventListener('touchcancel',touchEnd);

// ---------- WebXR (Meta Quest) ----------
// left stick: walk (head-relative) · right stick ←/→: snap turn 30° · A: 5 pm / 10 pm · B: jump to the next spot · X: wrist map · Y: sound
var xr=B.xrState={init:false,turnArmed:true,prev:{},fw:new THREE.Vector3(),lift:0,maps:0};
var hudC=document.createElement('canvas'); hudC.width=1024; hudC.height=200;
var hudTex=new THREE.CanvasTexture(hudC), hudKey=null;
var hud=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.176), new THREE.MeshBasicMaterial({map:hudTex,transparent:true,depthTest:false,depthWrite:false,fog:false}));
hud.position.set(0,-0.36,-1.2); hud.renderOrder=999; hud.visible=false; camera.add(hud);
function drawHud(){ var g=hudC.getContext('2d'); g.clearRect(0,0,hudC.width,hudC.height); g.textAlign='center'; g.textBaseline='middle';
  var p=hudState.place, f=flashT>0?hudState.flash:'';
  if(p){ g.fillStyle='rgba(16,20,30,0.72)'; g.fillRect(60,8,904,f?110:184);
    g.fillStyle='#f3d9a4'; g.font='bold 44px Georgia,serif'; g.fillText(p.n+'  ·  '+p.name,512,52);
    if(!f){ g.fillStyle='#e9e4d8'; g.font='28px Avenir Next,Segoe UI,sans-serif'; g.fillText(p.desc.length>64?p.desc.slice(0,62)+'…':p.desc,512,128); } }
  if(f){ g.fillStyle='rgba(16,20,30,0.78)'; g.fillRect(160,126,704,64); g.fillStyle='#ffffff'; g.font='italic 34px Georgia,serif'; g.fillText(f,512,158); }
  hudTex.needsUpdate=true; }
var wristTex=mm?new THREE.CanvasTexture(mm):null, wrist=new THREE.Group();
if(wristTex){ var wb=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.165),new THREE.MeshBasicMaterial({color:0x0c0e14,fog:false})); wrist.add(wb);
  var wf=new THREE.Mesh(new THREE.PlaneGeometry(0.19,0.155),new THREE.MeshBasicMaterial({map:wristTex,fog:false})); wf.position.z=0.002; wrist.add(wf);
  wrist.position.set(0,0.04,0.1); wrist.rotation.x=-Math.PI/2+0.6; }
(function(){ var cm=lam(0x2a2a30,{emissive:0x101016}), rayGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-0.25)]);
  for(var ci=0;ci<2;ci++){ var grip=renderer.xr.getControllerGrip(ci);
    var body=new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.024,0.11,10),cm); body.rotation.x=Math.PI/2; grip.add(body);
    grip.addEventListener('connected',function(e){ if(e.data&&e.data.handedness==='left') this.add(wrist); });
    grip.addEventListener('disconnected',function(){ if(wrist.parent===this) this.remove(wrist); });
    rig.add(grip); var ray=renderer.xr.getController(ci); ray.add(new THREE.Line(rayGeo,new THREE.LineBasicMaterial({color:0xf3d9a4,transparent:true,opacity:0.5}))); rig.add(ray); } })();
function xrPad(){ var s=renderer.xr.getSession(), o={mx:0,my:0,turn:0,a:false,b:false,x:false,y:false}; if(!s) return o;
  for(var i=0;i<s.inputSources.length;i++){ var src=s.inputSources[i], gp=src.gamepad; if(!gp) continue;
    var ax=gp.axes.length>=4?gp.axes[2]:(gp.axes[0]||0), ay=gp.axes.length>=4?gp.axes[3]:(gp.axes[1]||0);
    var bt=function(k){ return !!(gp.buttons[k]&&gp.buttons[k].pressed); };
    if(src.handedness==='left'){ o.mx=ax; o.my=ay; o.x=bt(4); o.y=bt(5); } else { o.turn=ax; o.a=bt(4)||bt(0); o.b=bt(5); } }
  return o; }
function xrStep(dt){
  renderer.xr.getCamera(camera);
  var hl=camera.position, a=rig.rotation.y, c=Math.cos(a), s=Math.sin(a);
  if(!xr.init){ xr.fw.set(0,0,-1).applyQuaternion(camera.quaternion);
    rig.rotation.y=a=(yaw+Math.PI)-Math.atan2(-xr.fw.x,-xr.fw.z); c=Math.cos(a); s=Math.sin(a);
    xr.lift=Math.max(0,1.58-hl.y); xr.init=true; }
  else { pos.x=rig.position.x+hl.x*c+hl.z*s; pos.z=rig.position.z-hl.x*s+hl.z*c; }
  var p=xrPad(), dz=0.18;
  xr.fw.set(0,0,-1).applyQuaternion(camera.quaternion);
  var fx=xr.fw.x*c+xr.fw.z*s, fz=-xr.fw.x*s+xr.fw.z*c, fl=Math.hypot(fx,fz)||1; fx/=fl; fz/=fl;
  var mf=Math.abs(p.my)>dz?-p.my:0, ms=Math.abs(p.mx)>dz?p.mx:0, sp=2.2;
  moveBy((fx*mf - fz*ms)*sp*dt, (fz*mf + fx*ms)*sp*dt);
  if(xr.turnArmed && Math.abs(p.turn)>0.7){ rig.rotation.y=a=a-Math.sign(p.turn)*Math.PI/6; c=Math.cos(a); s=Math.sin(a); xr.turnArmed=false; }
  else if(Math.abs(p.turn)<0.35) xr.turnArmed=true;
  rig.position.x=pos.x-(hl.x*c+hl.z*s); rig.position.z=pos.z-(-hl.x*s+hl.z*c);
  var gy=B.floorAt(pos.x,pos.z); camY=camY==null?gy:camY+(gy-camY)*Math.min(1,dt*6); rig.position.y=camY+xr.lift;
  yaw=Math.atan2(fx,fz);
  if(p.a && !xr.prev.a) B.flash(B.toggleNight()?'10:00 pm · fireworks':'5:00 pm · July 4');
  if(p.b && !xr.prev.b){ jumpIdx=jumpIdx%places.length+1; B.jump(jumpIdx); }
  if(p.x && !xr.prev.x) wrist.visible=!wrist.visible;
  if(p.y && !xr.prev.y) B.flash(B.toggleMute()?'Sound on':'Sound off');
  xr.prev=p;
}
function enterVR(){ if(!navigator.xr || renderer.xr.isPresenting) return;
  navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']}).then(function(session){ return renderer.xr.setSession(session); })
    .catch(function(err){ B.flash('Could not start VR: '+(err&&err.message||err),5); }); }
B.enterVR=enterVR;
renderer.xr.addEventListener('sessionstart',function(){ xr.init=false; hudKey=null; hud.visible=true; if(drone.on) toggleDrone();
  var bl=renderer.xr.getSession().renderState.baseLayer; if(bl && 'fixedFoveation' in bl) bl.fixedFoveation=1;
  document.getElementById('vrbtn').style.display='none'; });
renderer.xr.addEventListener('sessionend',function(){ hud.visible=false; rig.position.set(0,0,0); rig.rotation.set(0,0,0); pitch=0; camY=null;
  document.getElementById('vrbtn').style.display=started&&xr.supported?'block':'none'; });

// ---------- start ----------
function begin(){ if(started) return; started=true; document.getElementById('overlay').style.display='none'; document.body.classList.add('started');
  startAudio(); if(xr.supported) document.getElementById('vrbtn').style.display='block'; beginFns.forEach(function(f){ f(); }); }
var beginFns=[]; B.onBegin=function(f){ beginFns.push(f); };
B.begin=begin; B.started=function(){ return started; };

function resize(){ if(renderer.xr.isPresenting) return; var w=window.innerWidth,h=window.innerHeight; renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix(); droneCam.aspect=w/h; droneCam.updateProjectionMatrix(); }

// ---------- main loop ----------
var clock=new THREE.Clock(), updaters=[], _f=new THREE.Vector3(), _u=new THREE.Vector3();
B.onUpdate=function(f){ updaters.push(f); };
function tick(){
  var dt=Math.min(clock.getDelta(),0.05), t=clock.elapsedTime;
  if(B.fixedDt){ dt=B.fixedDt; t=B.fixedT=(B.fixedT||0)+dt; }
  B.t=t;
  if(tod.v!==tod.target){ var step=dt/2.2; tod.v=tod.target>tod.v?Math.min(tod.target,tod.v+step):Math.max(tod.target,tod.v-step); applyTod(tod.v); }
  var view=camera;
  if(renderer.xr.isPresenting){ xrStep(dt); }
  else if(drone.on){ if(!dragging && !locked) drone.ang+=dt*0.035;
    var r=drone.dist; droneCam.position.set(drone.cx+Math.sin(drone.ang)*Math.cos(drone.el)*r, Math.sin(drone.el)*r, drone.cz+Math.cos(drone.ang)*Math.cos(drone.el)*r*-1);
    droneCam.lookAt(drone.cx,0,drone.cz); view=droneCam; }
  else if(started){
    var f=(keys['KeyW']||keys['ArrowUp']?1:0)-(keys['KeyS']||keys['ArrowDown']?1:0)-touch.my;
    var s=(keys['KeyD']?1:0)-(keys['KeyA']?1:0)+touch.mx;
    if(keys['KeyQ']||keys['ArrowLeft']) yaw+=1.9*dt;
    if(keys['KeyE']||keys['ArrowRight']) yaw-=1.9*dt;
    var sp=(keys['ShiftLeft']||keys['ShiftRight'])?5.2:2.6, fx=Math.sin(yaw), fz=Math.cos(yaw);
    moveBy((fx*f - fz*s)*sp*dt, (fz*f + fx*s)*sp*dt);
  }
  if(!renderer.xr.isPresenting){ var gy=B.floorAt(pos.x,pos.z); camY=camY==null?gy:camY+(gy-camY)*Math.min(1,dt*7);
    camera.position.set(pos.x,camY+EYE,pos.z); camera.rotation.set(pitch,yaw+Math.PI,0); }
  for(var u=0;u<updaters.length;u++) updaters[u](dt,t);
  waterU.t.value=t; camera.getWorldPosition(waterU.camPos.value); if(view===droneCam) waterU.camPos.value.copy(droneCam.position);
  // glow point scale: pixels per meter at distance 1, for whichever camera draws this frame
  var ph=renderer.xr.isPresenting?(renderer.xr.getCamera(camera).cameras[0]||camera).projectionMatrix.elements[5]*(renderer.xr.getSession().renderState.baseLayer.framebufferHeight||1800)/2
                                  :view.projectionMatrix.elements[5]*renderer.domElement.height/2;
  glowMats.forEach(function(m){ m.uniforms.uScale.value=ph; });
  B.pxScale=ph;
  nightLights.forEach(function(n){ if(n.flicker && n.l.intensity>0) n.l.intensity=n.i*tod.v*(0.82+0.18*Math.sin(t*13+n.l.position.x)*Math.sin(t*7.3)); });
  // place labels
  var best=null, bd=1e9; places.forEach(function(p){ var d=Math.hypot(pos.x-p.x,pos.z-p.z); if(d<(p.r||6) && d<bd){ bd=d; best=p; } });
  if(best!==curPlace){ curPlace=best; hudState.place=best; if(placeEl) placeEl.innerHTML=best?'<span class="n">'+best.n+'</span><span class="name">'+best.name+'</span><div class="desc">'+best.desc+'</div>':''; }
  if(flashT>0){ flashT-=dt; if(flashT<=0 && flashEl) flashEl.style.opacity=0; }
  if(renderer.xr.isPresenting){ var key=(curPlace?curPlace.n:'')+'|'+(flashT>0?hudState.flash:''); if(key!==hudKey){ hudKey=key; drawHud(); }
    if(wristTex && wrist.visible && (xr.maps++%6===0)) wristTex.needsUpdate=true; }
  if(AC && started){ try{ var L=AC.listener; camera.getWorldPosition(_u); camera.getWorldDirection(_f);
    if(L.positionX){ L.positionX.value=_u.x; L.positionY.value=_u.y; L.positionZ.value=_u.z; L.forwardX.value=_f.x; L.forwardY.value=_f.y; L.forwardZ.value=_f.z; L.upX.value=0; L.upY.value=1; L.upZ.value=0; }
    else { L.setPosition(_u.x,_u.y,_u.z); L.setOrientation(_f.x,_f.y,_f.z,0,1,0); } }catch(e){} }
  drawMap();
  renderer.render(scene,view);
}

// ---------- run (after the venue scripts have built everything) ----------
B.run=function(){
  finalizeBatches(); finalizePools(); finalizeGlows(); applyTod(0); buildMap();
  window.addEventListener('resize',resize); resize();
  document.querySelectorAll('#overlay .go:not(.vr)').forEach(function(b){ b.addEventListener('click',function(){ begin(); if(!('ontouchstart' in window)){ try{ canvas.requestPointerLock&&canvas.requestPointerLock(); }catch(e){} } }); });
  canvas.addEventListener('click',function(){ if(started && !drone.on && !('ontouchstart' in window)){ try{ canvas.requestPointerLock&&canvas.requestPointerLock(); }catch(e){} } });
  var tb=document.getElementById('todbtn'); if(tb) tb.addEventListener('click',function(e){ e.stopPropagation(); B.toggleNight(); });
  var db=document.getElementById('dronebtn'); if(db) db.addEventListener('click',function(e){ e.stopPropagation(); toggleDrone(); });
  if(navigator.xr && navigator.xr.isSessionSupported){
    navigator.xr.isSessionSupported('immersive-vr').then(function(ok){ if(!ok) return; xr.supported=true;
      document.querySelectorAll('#overlay .go.vr').forEach(function(b){ b.style.display='inline-block'; b.addEventListener('click',function(){ begin(); enterVR(); }); });
      document.getElementById('vrbtn').addEventListener('click',enterVR); if(started) document.getElementById('vrbtn').style.display='block'; }).catch(function(){});
  }
  if(/[?&]night\b/.test(location.search)){ B.setNight(true); tod.v=1; applyTod(1); }
  if(lightCount>B.budget.lights) console.warn('Bay Pointe: '+lightCount+' dynamic lights (Quest budget '+B.budget.lights+')');
  renderer.setAnimationLoop(tick);
  if(/[?&]debug\b/.test(location.search)){
    window.BAY={B:B,THREE:THREE,scene:scene,camera:camera,renderer:renderer,pos:pos,places:places,
      look:function(y,p){ yaw=y; pitch=p||0; }, go:function(x,z,y){ pos.x=x; pos.z=z; if(y!=null) yaw=y; camY=null; },
      begin:begin, step:function(dt){ B.fixedDt=dt||1/30; tick(); }, drone:toggleDrone, droneSet:function(o){ Object.assign(drone,o); },
      calls:function(){ return renderer.info.render.calls; }, tris:function(){ return renderer.info.render.triangles; }, lights:function(){ return lightCount; },
      state:function(){ return {x:+pos.x.toFixed(2),z:+pos.z.toFixed(2),yaw:+yaw.toFixed(3),y:camY,night:tod.v,xr:renderer.xr.isPresenting}; }};
  }
};
})();
