/* The lakeside patio off the pavilion's east end: the bar under a white peaked tent, the stone fire pit with
   Adirondack chairs, cocktail highboys for the hour after the ceremony, cornhole on the lawn, and the sparkler station. */
(function(B){
var THREE = window.THREE, M = B.mat, rnd = B.rnd;

// ---------- the bar tent ----------
(function(){ var cx=4.4, cz=4.7, W=5.2, D=4.0, H=2.45;
  [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]].forEach(function(p){ B.cyl(0.04,0.04,H,cx+p[0],0,cz+p[1],'white',8); B.solidCircle(cx+p[0],cz+p[1],0.1); });
  B.hipRoof(cx,cz,W,D,H,1.5,{ov:0.12,roof:'tent',under:'tent'});
  [[0,-D/2-0.12,W+0.24,0.03],[0,D/2+0.12,W+0.24,0.03],[-W/2-0.12,0,0.03,D+0.24],[W/2+0.12,0,0.03,D+0.24]].forEach(function(v){ B.box(v[2],0.3,v[3],cx+v[0],H-0.28,cz+v[1],'tent'); });   // valance
  // bar: white front facing the lake/pavilion side, back bar along the rear
  B.box(3.0,1.05,0.6,cx,0,cz-0.4,'trim'); B.box(3.1,0.05,0.7,cx,1.05,cz-0.4,'woodDark');
  B.sign('barFront',function(g,w,h){ g.fillStyle='#f7f6f2'; g.fillRect(0,0,w,h); g.strokeStyle='#c9a35a'; g.lineWidth=5; g.strokeRect(10,10,w-20,h-20);
      g.fillStyle='#24344f'; g.textAlign='center'; g.textBaseline='middle'; g.font=Math.round(h*0.46)+'px '+B.SCRIPT; g.fillText('Cheers',w/2,h*0.48);
      g.font='600 '+Math.round(h*0.08)+'px Avenir Next,Segoe UI,sans-serif'; g.fillStyle='#8a7340'; g.fillText('H & J · EST. 07.04.2027',w/2,h*0.83); },2.8,0.95,cx,0.53,cz-0.71,Math.PI,{glow:true});
  B.box(3.4,0.9,0.5,cx,0,cz+1.3,'linen');
  B.pool('bottle', (function(){ return B.mergeParts([B.cy(0.04,0.04,0.22,0,0,0,8), B.cy(0.015,0.035,0.08,0,0.22,0,8)]); })(), B.lam(0xffffff), {cast:false});
  var bc=[0x2f5d3a,0x6b3a1f,0xe8e4d8,0x2a4f7a,0x7a1d24,0xc9a35a,0x3a2a1c];
  for(var i=0;i<16;i++) B.put('bottle',cx-1.5+i*0.2,0.9,cz+1.35+((i%2)?0.1:-0.08),0,1,bc[i%bc.length]);
  [-0.9,0.9].forEach(function(dx){ B.cyl(0.24,0.2,0.24,cx+dx,1.05,cz-0.35,'galv',14); });   // ice tubs
  for(var j=0;j<10;j++) B.put('stem',cx-0.5+(j%5)*0.11,1.08,cz-0.25+Math.floor(j/5)*0.1,0,1);
  B.solid(cx-1.55,cz-0.75,cx+1.55,cz-0.05); B.solid(cx-1.75,cz+1.05,cx+1.75,cz+1.6);
  B.mapRect(cx-W/2,cz-D/2,cx+W/2,cz+D/2,'#fbfaf6','#c9c3b5');
  // signature drinks on an easel beside the bar
  var ex=cx+2.15, ez=cz-1.45, ery=Math.PI+0.5;
  [[-0.25],[0.25]].forEach(function(p){ B.add(new THREE.BoxGeometry(0.035,1.6,0.035),'gold',ex+p[0]*Math.cos(ery),0.8,ez-p[0]*Math.sin(ery),ery,{rx:0.1}); });
  B.sign('drinks',function(g,w,h){ g.fillStyle='#24344f'; g.fillRect(0,0,w,h); g.strokeStyle='#d6b36a'; g.lineWidth=5; g.strokeRect(12,12,w-24,h-24);
      g.textAlign='center'; g.fillStyle='#f6f1e6'; g.font=Math.round(h*0.1)+'px '+B.SCRIPT; g.fillText('Signature Drinks',w/2,h*0.17);
      g.fillStyle='#d6b36a'; g.fillRect(w/2-40,h*0.22,80,2);
      [['The Sparkler','gin · lemon · blueberry · bubbles'],['The Gun Lake Mule','vodka · ginger beer · lime'],['Lemonade on the Dock','lemon · mint · no booze']].forEach(function(d,i){
        g.fillStyle='#f6f1e6'; g.font='italic '+Math.round(h*0.065)+'px Georgia,serif'; g.fillText(d[0],w/2,h*(0.37+i*0.2));
        g.fillStyle='#9dbbdc'; g.font='600 '+Math.round(h*0.035)+'px Avenir Next,Segoe UI,sans-serif'; g.fillText(d[1].toUpperCase(),w/2,h*(0.44+i*0.2)); }); },
    0.62,0.84,ex,1.15,ez,ery,{rx:-0.1});
  B.florals(ex+0.27*Math.cos(ery),1.58,ez-0.27*Math.sin(ery),0.13,10,{shape:'ball'});
  B.stringLights([[cx-W/2,H+0.05,cz-D/2],[cx+W/2,H+0.05,cz+D/2]],{sag:0.25,spacing:0.55}); B.stringLights([[cx+W/2,H+0.05,cz-D/2],[cx-W/2,H+0.05,cz+D/2]],{sag:0.25,spacing:0.55});
  B.nightLight(cx,2.2,cz,0xffc58a,1.2,9);
  B.place({n:6, name:'The bar', desc:'Cocktail hour on the patio · The Sparkler and the Gun Lake Mule', x:cx, z:cz-1, r:3.6, at:[cx+0.4,cz-2.6,0.2]});
})();

// ---------- fire pit lounge by the water ----------
(function(){ var cx=8.4, cz=0.4;
  B.cyl(1.05,1.12,0.42,cx,0,cz,'stone',20); B.cyl(0.82,0.82,0.02,cx,0.4,cz,'black',20); B.cyl(1.1,1.1,0.06,cx,0.42,cz,'stone',20);
  for(var i=0;i<6;i++){ var a=i/6*Math.PI*2; B.box(0.55,0.09,0.09,cx+Math.cos(a)*0.18,0.43,cz+Math.sin(a)*0.18,'wood',a); }
  B.solidCircle(cx,cz,1.2); B.mapCircle(cx,cz,1.1,'#8a8278');
  [0.3,1.25,2.2,3.15,4.1,5.05].forEach(function(a){ var r=2.35, x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r*0.92; if(z<-2.0) return;
    B.put('adirondack',x,0,z,Math.atan2(Math.cos(a),Math.sin(a)),1); B.solidCircle(x,z,0.4);
    B.box(0.32,0.32,0.08,x-Math.cos(a)*0.05,0.42,z-Math.sin(a)*0.05,'blue',Math.atan2(Math.cos(a),Math.sin(a)),{rx:-0.3}); });   // dusty-blue pillows
  // flames: crossed flicker planes, only at night
  var flameTex=B.canvasTex(64,128,function(g,w,h){ var gr=g.createRadialGradient(w/2,h*0.85,2,w/2,h*0.6,h*0.55); gr.addColorStop(0,'rgba(255,240,180,1)'); gr.addColorStop(0.35,'rgba(255,160,50,0.9)'); gr.addColorStop(1,'rgba(255,60,0,0)');
    g.fillStyle=gr; g.beginPath(); g.moveTo(w/2,0); g.quadraticCurveTo(w,h*0.65,w/2,h); g.quadraticCurveTo(0,h*0.65,w/2,0); g.fill(); },{repeat:false});
  var fm=new THREE.MeshBasicMaterial({map:flameTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}), flames=new THREE.Group();
  for(var f=0;f<5;f++){ var m=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.9),fm); m.position.set(cx+rnd(-0.2,0.2),0.85,cz+rnd(-0.2,0.2)); m.rotation.y=f*0.63; flames.add(m); }
  flames.visible=false; B.scene.add(flames);
  B.glow(cx,1.0,cz,2.6,0xff8a3a,0,true);
  B.nightLight(cx,1.4,cz,0xff9a4a,2.2,11,{flicker:true});
  B.onTod(function(s){ flames.visible=s>0.15; fm.opacity=s; });
  B.onUpdate(function(dt,t){ if(!flames.visible) return; flames.children.forEach(function(m,i){ m.scale.set(1+0.2*Math.sin(t*9+i*2),1+0.3*Math.sin(t*7.3+i),1); m.position.y=0.8+0.06*Math.sin(t*11+i); }); });
  // lanterns on the seawall edge
  [[cx-2.6,-1.9],[cx+2.6,-1.9],[cx+3.2,1.9]].forEach(function(p){ B.box(0.3,0.05,0.3,p[0],0,p[1],'black'); B.box(0.24,0.42,0.24,p[0],0.05,p[1],'lampGlass'); B.cyl(0.03,0.19,0.12,p[0],0.47,p[1],'black',4);
    B.cyl(0.03,0.03,0.12,p[0],0.08,p[1],'cream',8); B.glow(p[0],0.3,p[1],0.9,0xffb35c,0.25,true); });
  B.place({n:7, name:'Fire pit lounge', desc:'Adirondacks round the fire, right on the water · lit after dark', x:cx, z:cz, r:3.8, at:[cx-0.5,3.6,Math.PI+0.15]});
})();

// ---------- cocktail highboys: white spandex, a posy and a candle each ----------
B.pool('highboy', (function(){ var pts=[]; for(var i=0;i<=12;i++){ var y=i/12*1.08, w=0.12+0.22*Math.pow(Math.abs(y-0.62)/0.62,1.6); pts.push(new THREE.Vector2(Math.min(0.37,w),y)); }   // spandex: cinched at the waist
  var g=new THREE.LatheGeometry(pts,18); var top=new THREE.CylinderGeometry(0.38,0.38,0.03,20); top.translate(0,1.09,0);
  return B.mergeParts([{geo:g,x:0,y:0,z:0},{geo:top,x:0,y:0,z:0}]); })(), M.linen, {});
[[11.2,4.6],[11.4,1.3],[2.3,-0.8],[13.6,6.8],[15.2,2.4],[15.6,-0.6],[12.3,-1.4]].forEach(function(p,i){ B.put('highboy',p[0],0,p[1],0,1);
  B.florals(p[0],1.11,p[1],0.1,7,{shape:'ball'}); B.put('votive',p[0]+0.14,1.135,p[1]+0.08,0,1); B.glow(p[0]+0.14,1.19,p[1]+0.08,0.32,0xffb35c,0.35);
  B.solidCircle(p[0],p[1],0.42); B.mapCircle(p[0],p[1],0.4,'#ffffff'); });

// ---------- cornhole on the east lawn, painted red and blue ----------
(function(){ var cbTex=function(col){ return function(g,w,h){ g.fillStyle=col; g.fillRect(0,0,w,h); g.fillStyle='#fbfaf6'; g.fillRect(0,h*0.42,w,h*0.04);
    g.beginPath(); var cx=w/2, cy=h*0.22, R=w*0.2; for(var i=0;i<10;i++){ var a=-Math.PI/2+i*Math.PI/5, r=i%2?R*0.42:R; g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); } g.fill();
    g.fillStyle='#111'; g.beginPath(); g.arc(w/2,h*0.22,w*0.12,0,7); g.fill(); }; };
  [[40.5,2.2,0,'#b4202e'],[40.5,10.4,Math.PI,'#24344f']].forEach(function(b,i){ var key='cornhole'+i;
    B.sign(key,cbTex(b[3]),0.61,1.22,b[0],0.2,b[1],b[2],{rx:-Math.PI/2+0.25});
    B.box(0.61,0.05,0.04,b[0],0.38,b[1]+(i?-0.58:0.58),'woodDark',b[2]);
    B.solid(b[0]-0.35,b[1]-0.65,b[0]+0.35,b[1]+0.65);
    for(var k=0;k<4;k++) B.box(0.15,0.04,0.15,b[0]+rnd(-0.5,0.5),0,b[1]+(i?1:-1)*rnd(0.8,1.4),k%2?'red':'navy',rnd(0,3)); }); })();

// ---------- sparkler send-off station by the pavilion's east doorway ----------
(function(){ var x=0.6, z=8.4;
  B.box(1.2,0.76,0.55,x,0,z,'linen');
  [-0.32,0.32].forEach(function(dx){ B.cyl(0.13,0.1,0.22,x+dx,0.76,z,'galv',12); for(var k=0;k<9;k++) B.add(new THREE.CylinderGeometry(0.003,0.003,0.5,3),'darkMetal',x+dx+rnd(-0.06,0.06),1.1,z+rnd(-0.06,0.06),0,{rx:rnd(-0.12,0.12),rz:rnd(-0.12,0.12)}); });
  B.sign('sparkSign',function(g,w,h){ g.fillStyle='#fbfaf6'; g.fillRect(0,0,w,h); g.strokeStyle='#b4202e'; g.lineWidth=5; g.strokeRect(10,10,w-20,h-20);
      g.textAlign='center'; g.fillStyle='#24344f'; g.font=Math.round(h*0.22)+'px '+B.SCRIPT; g.fillText('Light up the night',w/2,h*0.42);
      g.font='600 '+Math.round(h*0.075)+'px Avenir Next,Segoe UI,sans-serif'; g.fillStyle='#b4202e'; g.fillText('SPARKLER SEND-OFF AFTER THE FIREWORKS',w/2,h*0.7); },0.58,0.32,x,0.98,z+0.05,0,{rx:-0.35});
  B.solid(x-0.65,z-0.32,x+0.65,z+0.32);
  // three lit sparklers in a sand pail, fizzing after dark
  var sx=x+0.85, sz=z-0.05; B.cyl(0.11,0.09,0.2,sx,0,sz,'galv',10);
  var N=60, pos=new Float32Array(N*3), col=new Float32Array(N*3), size=new Float32Array(N), day=new Float32Array(N), life=new Float32Array(N), vel=new Float32Array(N*3);
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('gcolor',new THREE.BufferAttribute(col,3)); g.setAttribute('size',new THREE.BufferAttribute(size,1)); g.setAttribute('day',new THREE.BufferAttribute(day,1));
  var mat=B.glowMat(); B.trackGlowMat(mat); var pts=new THREE.Points(g,mat); pts.frustumCulled=false; B.scene.add(pts);
  var tips=[[sx-0.03,0.62,sz],[sx+0.04,0.66,sz+0.02],[sx,0.6,sz-0.04]];
  tips.forEach(function(tp){ B.add(new THREE.CylinderGeometry(0.003,0.003,0.45,3),'darkMetal',tp[0],tp[1]-0.22,tp[2],0); });
  B.onUpdate(function(dt,t){ if(!B.night()){ if(size[0]){ size.fill(0); g.attributes.size.needsUpdate=true; } return; }
    for(var i=0;i<N;i++){ life[i]-=dt; if(life[i]<=0){ var tp=tips[i%3]; life[i]=rnd(0.15,0.45); pos[i*3]=tp[0]; pos[i*3+1]=tp[1]; pos[i*3+2]=tp[2];
        var a=rnd(0,6.3), e=rnd(-0.5,1.2), sp=rnd(0.6,1.6); vel[i*3]=Math.cos(a)*Math.cos(e)*sp; vel[i*3+1]=Math.sin(e)*sp; vel[i*3+2]=Math.sin(a)*Math.cos(e)*sp; col[i*3]=1; col[i*3+1]=rnd(0.75,0.95); col[i*3+2]=rnd(0.4,0.7); }
      pos[i*3]+=vel[i*3]*dt; pos[i*3+1]+=vel[i*3+1]*dt; pos[i*3+2]+=vel[i*3+2]*dt; vel[i*3+1]-=3*dt; size[i]=0.06+life[i]*0.18; }
    g.attributes.position.needsUpdate=g.attributes.size.needsUpdate=g.attributes.gcolor.needsUpdate=true; });
  tips.forEach(function(tp){ B.glow(tp[0],tp[1],tp[2],0.9,0xfff0c0,0); });
})();
})(window.BP);
