/* The reception in the Lakefront Pavilion, dressed from the couple's table photo: white linens, gold chiavari chairs,
   dusty-blue napkins, gold-rimmed chargers, gold-wrapped favours, and alternating tall and low centrepieces of blue hydrangea and peach roses.
   18 rounds (153 seats) either side of a white dance floor; the sweetheart table in front of the lake; DJ booth on the land side;
   the cake by the water; gifts and the seating chart by the east entrance. */
(function(B){
var THREE = window.THREE, M = B.mat, rnd = B.rnd, P = B.PAV, FY = P.y+0.04, TOP = FY+0.76;
var CX = -17.2;   // the room's centre line (sweetheart table, dance floor, DJ)

// ---------- pools for table settings ----------
B.pool('tablecloth', (function(){ var g=new THREE.CylinderGeometry(0.8,0.86,0.76,28,1,false); g.translate(0,0.38,0); return g; })(), M.linen, {});
var chiavari=B.mergeParts([
  B.bx(0.4,0.035,0.38,0,0.45,0),
  B.bx(0.026,0.45,0.026,-0.18,0,-0.17), B.bx(0.026,0.45,0.026,0.18,0,-0.17),
  B.bx(0.028,0.94,0.028,-0.18,0,0.17,0,-0.1), B.bx(0.028,0.94,0.028,0.18,0,0.17,0,-0.1),
  B.bx(0.38,0.03,0.025,0,0.62,0.205,0,-0.1), B.bx(0.38,0.03,0.025,0,0.74,0.218,0,-0.1), B.bx(0.38,0.05,0.025,0,0.86,0.23,0,-0.1),
  B.bx(0.014,0.24,0.014,-0.06,0.62,0.21,0,-0.1), B.bx(0.014,0.24,0.014,0.06,0.62,0.21,0,-0.1),
  B.bx(0.36,0.018,0.018,0,0.2,-0.17), B.bx(0.36,0.018,0.018,0,0.2,0.17), B.bx(0.018,0.018,0.34,-0.18,0.2,0), B.bx(0.018,0.018,0.34,0.18,0.2,0)
]);
B.pool('chiavari', chiavari, M.gold, {});
B.pool('cushion', new THREE.BoxGeometry(0.38,0.05,0.36), M.cushion, {cast:false});
B.pool('charger', (function(){ var g=new THREE.CircleGeometry(0.165,14); g.rotateX(-Math.PI/2); return g; })(), B.lam(0xd9b56c,{emissive:0x2a1d05}), {cast:false});
B.pool('plate', (function(){ var g=new THREE.CircleGeometry(0.125,14); g.rotateX(-Math.PI/2); return g; })(), B.lam(0xfbfbf8), {cast:false});
B.pool('napkin', new THREE.BoxGeometry(0.11,0.025,0.21), M.blue, {cast:false});
B.pool('favor', new THREE.IcosahedronGeometry(0.022,0), B.lam(0xd8b25d,{emissive:0x3a2a08}), {cast:false});
B.pool('glassware', new THREE.CylinderGeometry(0.035,0.028,0.13,7,1,true), new THREE.MeshLambertMaterial({color:0xeaf3f6,transparent:true,opacity:0.4,depthWrite:false}), {cast:false});
B.pool('stem', (function(){ return B.mergeParts([{geo:new THREE.CylinderGeometry(0.04,0.012,0.09,7,1,true),x:0,y:0.145,z:0}, {geo:new THREE.CylinderGeometry(0.004,0.004,0.1,3,1,true),x:0,y:0.05,z:0}, {geo:new THREE.CircleGeometry(0.03,7).rotateX(-Math.PI/2),x:0,y:0.002,z:0}]); })(),
  new THREE.MeshLambertMaterial({color:0xeef6f8,transparent:true,opacity:0.42,depthWrite:false}), {cast:false});
B.pool('votive', new THREE.CylinderGeometry(0.03,0.03,0.07,8), B.lam(0xd9b56c,{emissive:0x3a2608}), {cast:false});
B.pool('card', new THREE.BoxGeometry(0.07,0.04,0.004), B.lam(0xfbfaf6), {cast:false});

// table-number cards from one atlas texture (one draw call for all 18)
var NT=18, numTex=B.canvasTex(1024,1024,function(g,w,h){ g.fillStyle='#fbfaf6'; g.fillRect(0,0,w,h);
  for(var i=0;i<NT;i++){ var cx=(i%5)*204, cy=Math.floor(i/5)*256; g.strokeStyle='#c9a35a'; g.lineWidth=5; g.strokeRect(cx+14,cy+14,176,228);
    g.fillStyle='#5a6b80'; g.font='600 22px Avenir Next,Segoe UI,sans-serif'; g.textAlign='center'; g.fillText('TABLE',cx+102,cy+80);
    g.fillStyle='#24344f'; g.font='88px '+B.SCRIPT; g.fillText(String(i+1),cx+102,cy+175); } },{repeat:false});
M.tableNum=B.lam(0xffffff,{map:numTex,side:THREE.DoubleSide});
function numberCard(i,x,y,z,ry){ var g=new THREE.PlaneGeometry(0.13,0.165), uv=g.attributes.uv, cx=(i%5)*204/1024, cy=Math.floor(i/5)*256/1024;
  for(var k=0;k<uv.count;k++) uv.setXY(k, cx+uv.getX(k)*204/1024, 1-(cy+(1-uv.getY(k))*256/1024));
  B.add(g,'tableNum',x,y,z,ry,{uv:'own',cast:false}); B.add(g.clone(),'tableNum',x,y,z,ry+Math.PI,{uv:'own',cast:false});
  B.cyl(0.004,0.004,0.12,x,TOP,z,'gold',4); B.box(0.06,0.01,0.04,x,TOP,z,'gold',ry); }

// ---------- one round table, fully set ----------
function table(n,x,z,seats,tall){
  B.put('tablecloth',x,FY,z,0,1);
  for(var s=0;s<seats;s++){ var a=s/seats*Math.PI*2+0.2, cx=x+Math.cos(a)*1.08, cz=z+Math.sin(a)*1.08, face=Math.atan2(Math.cos(a),Math.sin(a))+rnd(-0.06,0.06);
    B.put('chiavari',cx,FY,cz,face,1); B.put('cushion',cx,FY+0.49,cz,face,1);
    var px=x+Math.cos(a)*0.6, pz=z+Math.sin(a)*0.6;
    B.put('charger',px,TOP+0.006,pz,0,1); B.put('plate',px,TOP+0.018,pz,0,1);
    B.put('napkin',px,TOP+0.035,pz,-a+Math.PI/2+0.35,1,null,{rz:0.12});
    B.put('favor',px+Math.cos(a+0.9)*0.05,TOP+0.06,pz+Math.sin(a+0.9)*0.05,0,1);
    var gx=x+Math.cos(a-0.32)*0.6, gz=z+Math.sin(a-0.32)*0.6; B.put('glassware',gx,TOP+0.065,gz,0,1);
    var wx=x+Math.cos(a-0.25)*0.5, wz=z+Math.sin(a-0.25)*0.5; B.put('stem',wx,TOP,wz,0,1);
    B.put('card',x+Math.cos(a)*0.46,TOP+0.02,z+Math.sin(a)*0.46,-a+Math.PI/2,1); }
  if(tall){ B.cyl(0.07,0.11,0.03,x,TOP,z,'gold',12); B.cyl(0.018,0.018,0.92,x,TOP,z,'gold',8); B.cyl(0.13,0.05,0.12,x,TOP+0.92,z,'gold',12);
    B.florals(x,TOP+1.16,z,0.34,46,{shape:'ball',sy:0.85,mix:[0.5,0.28,0.18,0.04]});
    B.garland([[x-0.3,TOP+0.95,z],[x-0.45,TOP+0.7,z+0.05]],8,0.08);   // trailing greenery
    B.florals(x,TOP,z,0.15,8,{scale:0.8}); }
  else { B.cyl(0.12,0.07,0.1,x,TOP,z,'gold',12); B.florals(x,TOP+0.1,z,0.26,30,{sx:1.25,sz:1.25,sy:0.85}); }
  [0.7,2.8,4.9].forEach(function(a){ var vx=x+Math.cos(a)*0.33, vz=z+Math.sin(a)*0.33; B.put('votive',vx,TOP+0.035,vz,0,1); B.glow(vx,TOP+0.08,vz,0.32,0xffb35c,0.4); });
  numberCard(n-1, x+0.2, TOP+0.12, z-0.22, rnd(0,6));
  B.solidCircle(x,z,1.12); B.mapCircle(x,z,1.25,'#f6f2e8');
}
var t=1, rowsZ=[0.15,3.5,6.85];
[-32.1,-28.75,-25.4,-22.05].forEach(function(x,ci){ rowsZ.forEach(function(z,ri){ table(t,x,z,(t%2)?9:8,(ci+ri)%2===0); t++; }); });
[-12.35,-9.0].forEach(function(x,ci){ rowsZ.forEach(function(z,ri){ table(t,x,z,(t%2)?9:8,(ci+ri)%2===1); t++; }); });

// ---------- dance floor (white panels, a navy-and-gold monogram) ----------
(function(){ var x1=CX-3.0, x2=CX+3.0, z1=1.05, z2=6.45, W=x2-x1, D=z2-z1;
  var tex=B.canvasTex(1024,Math.round(1024*D/W),function(g,w,h){ g.fillStyle='#f7f6f2'; g.fillRect(0,0,w,h);
    var cell=w/W*1.0; g.strokeStyle='rgba(0,0,0,0.09)'; g.lineWidth=2; for(var x=0;x<=w;x+=cell){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } for(var y=0;y<=h;y+=cell){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
    g.strokeStyle='#c9a35a'; g.lineWidth=7; g.beginPath(); g.arc(w/2,h/2,h*0.27,0,7); g.stroke(); g.lineWidth=2; g.beginPath(); g.arc(w/2,h/2,h*0.3,0,7); g.stroke();
    g.fillStyle='#24344f'; g.textAlign='center'; g.textBaseline='middle'; g.font=Math.round(h*0.25)+'px '+B.SCRIPT; g.fillText('H & J',w/2,h/2-h*0.02);
    g.font='600 '+Math.round(h*0.035)+'px Avenir Next,Segoe UI,sans-serif'; g.fillStyle='#8a7340'; g.fillText('07 · 04 · 2027',w/2,h/2+h*0.17); },{repeat:false});
  M.dance=B.lam(0xe9e7e1,{map:tex}); var g=new THREE.PlaneGeometry(W,D); g.rotateX(-Math.PI/2);
  B.add(g,'dance',CX,FY+0.032,(z1+z2)/2,Math.PI,{uv:'own'}); B.box(W+0.06,0.025,D+0.06,CX,FY,(z1+z2)/2,'trim',0,{cast:false});
  B.mapRect(x1,z1,x2,z2,'#ffffff','#c9a35a');
  // uplight washes on the columns either side (night)
  [[-19.08,-1.35],[-15.42,-1.35],[-19.08,8.25],[-15.42,8.25],[-22.73,8.25],[-11.77,8.25]].forEach(function(c,i){ B.glow(c[0],FY+0.6,c[1],2.4,i%2?0x7f9cff:0xffa27a,0); });
})();

// ---------- sweetheart table with the lake behind it ----------
(function(){ var x=CX, z=-0.35;
  B.box(1.7,0.76,0.8,x,FY,z,'linen'); B.box(1.75,0.03,0.85,x,FY+0.74,z,'linen');
  [-0.38,0.38].forEach(function(dx){ B.put('chiavari',x+dx,FY,z-0.62,Math.PI,1); B.put('cushion',x+dx,FY+0.49,z-0.62,Math.PI,1);
    B.put('charger',x+dx,TOP+0.016,z-0.12,0,1); B.put('plate',x+dx,TOP+0.028,z-0.12,0,1); B.put('napkin',x+dx,TOP+0.045,z-0.12,0.35,1,null,{rz:0.12});
    B.put('stem',x+dx+0.16,TOP,z+0.08,0,1); B.put('stem',x+dx+0.24,TOP,z+0.02,0,1); });
  B.garland([[x-0.95,TOP+0.02,z+0.38],[x-0.4,TOP-0.25,z+0.44],[x,TOP-0.05,z+0.42],[x+0.45,TOP-0.3,z+0.44],[x+0.95,TOP+0.02,z+0.38]],9,0.13);   // swagged front garland
  B.florals(x-0.9,TOP-0.05,z+0.3,0.28,30,{shape:'ball'}); B.florals(x+0.85,TOP-0.1,z+0.3,0.2,18,{shape:'ball'});
  for(var c=-0.6;c<=0.61;c+=0.3){ B.put('votive',x+c,TOP+0.035,z+0.22,0,1); B.glow(x+c,TOP+0.08,z+0.22,0.32,0xffb35c,0.4); }
  // gold acrylic "H & J" on the front of the table
  B.sign('sweetSign',function(g,w,h){ g.clearRect(0,0,w,h); g.fillStyle='#d6b36a'; g.textAlign='center'; g.textBaseline='middle'; g.font=Math.round(h*0.7)+'px '+B.SCRIPT; g.fillText('H & J',w/2,h/2); },
    0.8,0.26,x,FY+0.45,z+0.43,0,{glow:true});
  M.sweetSign.transparent=true; M.sweetSign.alphaTest=0.3;
  // tall floral pillars either side
  [-1.35,1.35].forEach(function(dx){ var px=x+dx; B.cyl(0.16,0.2,0.05,px,FY,z,'gold',14); B.cyl(0.035,0.035,1.45,px,FY,z,'gold',8); B.cyl(0.18,0.08,0.14,px,FY+1.45,z,'gold',12);
    B.florals(px,FY+1.75,z,0.42,52,{shape:'ball',sy:1.15}); B.garland([[px,FY+1.5,z+0.1],[px+0.05,FY+0.6,z+0.15]],7,0.12); B.solidCircle(px,z,0.3); });
  B.solid(x-0.9,z-1.0,x+0.9,z+0.45); B.mapRect(x-0.85,z-0.4,x+0.85,z+0.4,'#ffffff');
  // greenery and blooms hung along the beam above
  B.garland([[x-3,3.0,P.z1+0.3],[x-1.5,2.75,P.z1+0.3],[x,2.95,P.z1+0.3],[x+1.5,2.75,P.z1+0.3],[x+3,3.0,P.z1+0.3]],6,0.12,{mix:[0.3,0.2,0.4,0.1],leaves:2});
})();

// ---------- DJ booth (land side, facing the floor) ----------
(function(){ var x=CX, z=7.55;
  B.box(2.0,1.05,0.6,x,FY,z,'trim');
  B.sign('djFront',function(g,w,h){ var gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#f7f6f2'); gr.addColorStop(1,'#e9eef6'); g.fillStyle=gr; g.fillRect(0,0,w,h);
      g.fillStyle='#24344f'; g.textAlign='center'; g.textBaseline='middle'; g.font=Math.round(h*0.5)+'px '+B.SCRIPT; g.fillText('H & J',w/2,h*0.46);
      g.font='600 '+Math.round(h*0.09)+'px Avenir Next,Segoe UI,sans-serif'; g.fillStyle='#8a7340'; g.fillText('JULY 4 · 2027',w/2,h*0.82); },
    1.9,0.95,x,FY+0.53,z-0.31,Math.PI,{glow:true});
  B.box(0.8,0.04,0.5,x,FY+1.05,z,'black'); B.box(0.34,0.24,0.02,x+0.25,FY+1.09,z+0.05,'darkMetal',Math.PI,{rx:-0.35}); B.box(0.5,0.05,0.3,x-0.2,FY+1.09,z,'darkMetal');
  [-1.6,1.6].forEach(function(dx){ var sx=x+dx; B.cyl(0.015,0.015,1.4,sx,FY,z-0.05,'black',5);
    [[0.28,0],[-0.14,0.24],[-0.14,-0.24]].forEach(function(l){ B.add(new THREE.CylinderGeometry(0.012,0.012,0.75,4),'black',sx+l[0]*0.9,FY+0.33,z-0.05+l[1]*0.9,0,{rz:-l[0]*1.4,rx:l[1]*1.4}); });
    B.box(0.42,0.68,0.36,sx,FY+1.4,z-0.05,'black',Math.PI); B.cyl(0.13,0.13,0.02,sx,FY+1.6,z-0.24,'darkMetal',14,{rx:Math.PI/2});
    B.glow(sx,FY+2.2,z-0.2,0.5,dx<0?0x7f9cff:0xffa27a,0); });
  B.solid(x-1.9,z-0.35,x+1.9,z+0.4); B.mapRect(x-1,z-0.3,x+1,z+0.3,'#24344f');
  B.nightLight(x-2.5,2.4,5.6,0x8aa4ff,1.1,9); B.nightLight(x+2.5,2.4,5.6,0xffa27a,1.0,9);
})();

// ---------- the cake by the water ----------
(function(){ var x=-5.6, z=0.25;
  B.cyl(0.62,0.66,0.76,x,FY,z,'linen',24);
  B.cyl(0.04,0.06,0.12,x,TOP,z,'gold',10); B.cyl(0.24,0.24,0.02,x,TOP+0.12,z,'gold',20);
  var y=TOP+0.14; [[0.19,0.15],[0.145,0.14],[0.1,0.13]].forEach(function(tier){ B.cyl(tier[0],tier[0],tier[1],x,y,z,'white',24); y+=tier[1]; });
  B.florals(x+0.06,y,z,0.09,12,{shape:'ball'}); B.garland([[x+0.1,y-0.02,z-0.08],[x+0.17,TOP+0.42,z-0.12],[x+0.2,TOP+0.25,z-0.08]],14,0.05);
  B.box(0.3,0.008,0.03,x-0.3,TOP,z+0.25,'metal',0.4); B.put('votive',x-0.35,TOP+0.035,z-0.2,0,1); B.put('votive',x+0.38,TOP+0.035,z+0.15,0,1);
  B.glow(x-0.35,TOP+0.08,z-0.2,0.3,0xffb35c,0.4); B.glow(x+0.38,TOP+0.08,z+0.15,0.3,0xffb35c,0.4);
  B.solidCircle(x,z,0.72); B.mapCircle(x,z,0.65,'#ffffff');
})();

// ---------- gifts and cards, and the seating chart by the east entrance ----------
(function(){ var x=-5.6, z=6.95;
  B.box(1.8,0.76,0.75,x,FY,z,'linen');
  B.box(0.32,0.32,0.32,x-0.45,TOP,z,'white'); B.box(0.34,0.05,0.34,x-0.45,TOP+0.32,z,'gold'); B.box(0.12,0.01,0.004,x-0.45,TOP+0.24,z-0.162,'black');
  [[0.15,0.22,0.2,'blue'],[0.45,0.16,0.28,'white'],[0.7,0.3,0.24,'gold'],[0.35,0.12,0.18,'navy']].forEach(function(gf,i){ B.box(gf[1],gf[2]*0.8,gf[1],x+gf[0],TOP+(i===3?0.13:0),z+(i%2?0.12:-0.1),gf[3],i*0.4); });
  B.solid(x-0.95,z-0.42,x+0.95,z+0.42);
  var sx=-2.75, sz=4.9, ry=Math.PI/2;
  [[-0.5],[0.5]].forEach(function(p){ B.add(new THREE.BoxGeometry(0.04,2.0,0.04),'gold',sx,FY+1.0,sz+p[0],ry,{rx:0}); });
  B.sign('chart',function(g,w,h){ g.fillStyle='#fbfaf6'; g.fillRect(0,0,w,h); g.strokeStyle='#c9a35a'; g.lineWidth=6; g.strokeRect(14,14,w-28,h-28);
      g.textAlign='center'; g.fillStyle='#24344f'; g.font=Math.round(h*0.085)+'px '+B.SCRIPT; g.fillText('Find your seat',w/2,h*0.12);
      g.font='600 '+Math.round(h*0.022)+'px Avenir Next,Segoe UI,sans-serif'; g.fillStyle='#5a6b80'; g.fillText('PLEASE JOIN US FOR DINNER IN THE LAKEFRONT PAVILION',w/2,h*0.165);
      for(var i=0;i<18;i++){ var c=i%6, r=Math.floor(i/6), cx=w*(0.1+c*0.16), cy=h*(0.24+r*0.25);
        g.fillStyle='#24344f'; g.font='italic '+Math.round(h*0.03)+'px Georgia,serif'; g.fillText('Table '+(i+1),cx+w*0.06,cy);
        g.fillStyle='rgba(36,52,79,0.22)'; for(var l=0;l<8;l++) g.fillRect(cx+w*0.015,cy+h*0.022+l*h*0.022,w*0.09,h*0.006); } },
    0.95,1.25,sx,FY+1.3,sz,ry,{});
  B.florals(sx+0.02,FY+1.95,sz-0.42,0.16,14,{shape:'ball',sz:1.4}); B.solidCircle(sx,sz,0.55);
})();

B.place({n:5, name:'Dance floor & sweetheart table', desc:'The sweetheart table with the lake behind it · first dance on the monogram', x:CX, z:3.5, r:4.5, at:[CX,6.3,Math.PI]});
})(window.BP);
