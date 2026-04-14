// ── APARTAMENTO 1108 ──
// Sala/cozinha integrada: TV CRT, sofá azul, guitarras, varanda, mesa de jantar.
// Quarto: cama, guarda-roupa, janela grande, mesa/computador.
// Banheiro: box, pia, vaso, armário.

import * as THREE from 'three';

// ── TEXTURAS ──

function makeWoodFloorTex() {
  const C = document.createElement('canvas');
  C.width = 512; C.height = 128;
  const cx = C.getContext('2d');
  // Tábuas de madeira clara
  const baseColors = ['#c8a870','#c09860','#c4a268','#bc9458'];
  for (let i = 0; i < 8; i++) {
    cx.fillStyle = baseColors[i % baseColors.length];
    cx.fillRect(i * 64, 0, 62, 128);
    // Veio
    cx.strokeStyle = 'rgba(80,50,10,0.25)'; cx.lineWidth = 1;
    for (let y = 0; y < 128; y += 8) {
      cx.beginPath();
      cx.moveTo(i*64, y + Math.sin(y*0.1)*2);
      cx.lineTo(i*64+62, y + Math.sin(y*0.1+1)*2);
      cx.stroke();
    }
  }
  // Divisórias entre tábuas
  cx.fillStyle = 'rgba(60,30,5,0.35)';
  for (let i = 1; i < 8; i++) cx.fillRect(i*64-1, 0, 2, 128);
  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 2);
  return t;
}

function makeWallTex(hex) {
  const C = document.createElement('canvas');
  C.width = C.height = 256;
  const cx = C.getContext('2d');
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  cx.fillStyle = hex;
  cx.fillRect(0,0,256,256);
  const img = cx.getImageData(0,0,256,256);
  const d = img.data;
  for (let i = 0; i < d.length; i+=4) {
    const v = (Math.random()-0.5)*14;
    d[i]   = Math.max(0,Math.min(255,r+v));
    d[i+1] = Math.max(0,Math.min(255,g+v*0.9));
    d[i+2] = Math.max(0,Math.min(255,b+v*0.7));
  }
  cx.putImageData(img,0,0);
  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  return t;
}

function makeTileTex() {
  const C = document.createElement('canvas');
  C.width = C.height = 256;
  const cx = C.getContext('2d');
  cx.fillStyle = '#d0c8bc'; cx.fillRect(0,0,256,256);
  const T = 64;
  for (let tx=0;tx<4;tx++) for (let ty=0;ty<4;ty++) {
    const v = (Math.random()-0.5)*15;
    const c = 200+v|0;
    cx.fillStyle = `rgb(${c},${c-4},${c-10})`;
    cx.fillRect(tx*T+2, ty*T+2, T-4, T-4);
  }
  cx.fillStyle = '#a8a09a';
  for (let i=0;i<=4;i++) {
    cx.fillRect(i*T-1,0,2,256); cx.fillRect(0,i*T-1,256,2);
  }
  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4,4);
  return t;
}

// ── HELPER: cria uma sala (caixa) ──
function makeRoom(group, colliders, x, z, W, D, H, wallHex, floorTex, ceilHex='#2a2420') {
  const wallMat = new THREE.MeshLambertMaterial({ map: makeWallTex(wallHex) });
  const floorM  = new THREE.MeshLambertMaterial({ map: floorTex });
  const ceilM   = new THREE.MeshLambertMaterial({ color: new THREE.Color(ceilHex) });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W,D), floorM);
  floor.rotation.x = -Math.PI/2; floor.position.set(x,0,z); floor.receiveShadow = true;
  group.add(floor);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W,D), ceilM);
  ceil.rotation.x = Math.PI/2; ceil.position.set(x,H,z);
  group.add(ceil);

  // 4 paredes
  [[x,H/2,z-D/2,0],[x,H/2,z+D/2,Math.PI],
   [x-W/2,H/2,z,Math.PI/2],[x+W/2,H/2,z,-Math.PI/2]].forEach(([px,py,pz,ry],i) => {
    const ww = i<2 ? W : D;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ww,H), wallMat);
    m.position.set(px,py,pz); m.rotation.y = ry; m.receiveShadow = true;
    group.add(m);
  });

  // Colliders (paredes)
  const dx = W/2, dz = D/2;
  const pad = 0.1;
  [
    new THREE.Box3(new THREE.Vector3(x-dx-pad,0,z-dz-pad), new THREE.Vector3(x+dx+pad,H,z-dz+0.05)),
    new THREE.Box3(new THREE.Vector3(x-dx-pad,0,z+dz-0.05), new THREE.Vector3(x+dx+pad,H,z+dz+pad)),
    new THREE.Box3(new THREE.Vector3(x-dx-pad,0,z-dz), new THREE.Vector3(x-dx+0.05,H,z+dz)),
    new THREE.Box3(new THREE.Vector3(x+dx-0.05,0,z-dz), new THREE.Vector3(x+dx+pad,H,z+dz)),
  ].forEach(b => colliders.push(b));
}

export function buildApartment() {
  const group = new THREE.Group();
  const colliders = [];
  const interactables = [];

  const woodFloor = makeWoodFloorTex();
  const tileTex   = makeTileTex();

  // ── SALA (5m × 4m) ──
  const SALA_X = 0, SALA_Z = 0, SALA_W = 5.0, SALA_D = 4.0, SALA_H = 2.6;
  makeRoom(group, colliders, SALA_X, SALA_Z, SALA_W, SALA_D, SALA_H, '#7a6040', woodFloor);

  // ── TV CRT (parede do fundo, centro) ──
  {
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.55, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x2a1e0a })
    );
    stand.position.set(SALA_X, 0.275, SALA_Z - SALA_D/2 + 0.3);
    group.add(stand);

    const tvBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.60, 0.55),
      new THREE.MeshLambertMaterial({ color: 0x0e0c08 })
    );
    tvBody.position.set(SALA_X, 0.85, SALA_Z - SALA_D/2 + 0.38);
    tvBody.castShadow = true;
    group.add(tvBody);

    // Tela (emissiva azulada — estática)
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x3355aa });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.60, 0.46), screenMat);
    screen.position.set(SALA_X, 0.85, SALA_Z - SALA_D/2 + 0.66);
    screen.userData = { type: 'tv', id: 'tv', label: '[E] TV' };
    group.add(screen);
    interactables.push(screen);
    group.userData.tvScreen = screen;
    group.userData.tvMat    = screenMat;

    // Luz da TV (azul, distância curta)
    const tvLight = new THREE.PointLight(0x3355cc, 0.7, 3.5, 2.0);
    tvLight.position.set(SALA_X, 0.9, SALA_Z - SALA_D/2 + 0.8);
    group.add(tvLight);
    group.userData.tvLight = tvLight;
  }

  // ── SOFÁ AZUL ESCURO ──
  {
    const sofaM = new THREE.MeshLambertMaterial({ color: 0x1a2840 });
    const armM  = new THREE.MeshLambertMaterial({ color: 0x0e1828 });
    const seat  = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.22, 0.8), sofaM);
    seat.position.set(SALA_X + 1.4, 0.44, SALA_Z);
    group.add(seat);
    const back  = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.52, 0.18), sofaM);
    back.position.set(SALA_X + 1.4, 0.74, SALA_Z - 0.32);
    group.add(back);
    const armL  = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.50, 0.8), armM);
    armL.position.set(SALA_X + 0.5, 0.58, SALA_Z);
    group.add(armL);
    const armR  = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.50, 0.8), armM);
    armR.position.set(SALA_X + 2.3, 0.58, SALA_Z);
    group.add(armR);
    // Almofada
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.36), new THREE.MeshLambertMaterial({ color: 0xd0d4d8 }));
    pillow.position.set(SALA_X + 0.8, 0.59, SALA_Z - 0.15);
    group.add(pillow);
    // Collider sofá
    colliders.push(new THREE.Box3(
      new THREE.Vector3(SALA_X+0.4, 0, SALA_Z-0.45),
      new THREE.Vector3(SALA_X+2.45, 0.78, SALA_Z+0.45)
    ));
  }

  // ── MESA DE JANTAR (redonda, esquerda) ──
  {
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.05, 16),
      new THREE.MeshLambertMaterial({ color: 0x1e1608 })
    );
    tableTop.position.set(SALA_X - 1.5, 0.74, SALA_Z + 0.6);
    group.add(tableTop);
    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.72, 8),
      new THREE.MeshLambertMaterial({ color: 0x1a1408 })
    );
    tableLeg.position.set(SALA_X - 1.5, 0.36, SALA_Z + 0.6);
    group.add(tableLeg);
    // 3 cadeiras
    [-0.7, 0, 0.7].forEach(dz => {
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.04, 0.38),
        new THREE.MeshLambertMaterial({ color: 0x1a1208 }));
      chair.position.set(SALA_X - 2.1, 0.46, SALA_Z + 0.6 + dz);
      group.add(chair);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.04),
        new THREE.MeshLambertMaterial({ color: 0x1a1208 }));
      back.position.set(SALA_X - 2.1, 0.67, SALA_Z + 0.6 + dz - 0.18);
      group.add(back);
    });
    colliders.push(new THREE.Box3(
      new THREE.Vector3(SALA_X-2.1, 0, SALA_Z+0.0),
      new THREE.Vector3(SALA_X-0.95, 0.78, SALA_Z+1.2)
    ));
  }

  // ── GUITARRAS (parede direita) ──
  {
    // Acústica
    const g1M = new THREE.MeshLambertMaterial({ color: 0x6a3e10 });
    const g1b = new THREE.Mesh(new THREE.SphereGeometry(0.18,8,8), g1M);
    g1b.position.set(SALA_X + SALA_W/2 - 0.22, 1.4, SALA_Z - 0.4);
    g1b.scale.set(1, 1.6, 0.4);
    group.add(g1b);
    const g1n = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), new THREE.MeshLambertMaterial({color:0x4a2808}));
    g1n.position.set(SALA_X + SALA_W/2 - 0.22, 2.0, SALA_Z - 0.4);
    group.add(g1n);

    // Elétrica vermelha
    const g2M = new THREE.MeshLambertMaterial({ color: 0x880a0a });
    const g2b = new THREE.Mesh(new THREE.SphereGeometry(0.17,8,8), g2M);
    g2b.position.set(SALA_X + SALA_W/2 - 0.22, 1.4, SALA_Z + 0.4);
    g2b.scale.set(1, 1.5, 0.35);
    group.add(g2b);
    const g2n = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.05), new THREE.MeshLambertMaterial({color:0x1a1008}));
    g2n.position.set(SALA_X + SALA_W/2 - 0.22, 2.0, SALA_Z + 0.4);
    group.add(g2n);
  }

  // ── CORTINA VERDE (varanda/sacada) ──
  {
    const curtM = new THREE.MeshLambertMaterial({ color: 0x2a4a28, side: THREE.DoubleSide });
    const curtL = new THREE.Mesh(new THREE.PlaneGeometry(0.7, SALA_H - 0.1), curtM);
    curtL.position.set(SALA_X - 0.45, SALA_H/2 + 0.05, SALA_Z - SALA_D/2 + 0.02);
    group.add(curtL);
    const curtR = new THREE.Mesh(new THREE.PlaneGeometry(0.7, SALA_H - 0.1), curtM);
    curtR.position.set(SALA_X + 0.45, SALA_H/2 + 0.05, SALA_Z - SALA_D/2 + 0.02);
    group.add(curtR);
    group.userData.curtL = curtL;
    group.userData.curtR = curtR;

    // Vidro da varanda (escurecido)
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x040810, transparent: true, opacity: 0.7 });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.9, SALA_H), glassMat);
    glass.position.set(SALA_X, SALA_H/2, SALA_Z - SALA_D/2 + 0.01);
    group.add(glass);
  }

  // ── PRATELEIRAS (parede esquerda) ──
  {
    const shelfM = new THREE.MeshLambertMaterial({ color: 0x4a3010 });
    [1.4, 1.9].forEach(sy => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 0.22), shelfM);
      shelf.position.set(SALA_X - SALA_W/2 + 0.55, sy, SALA_Z - 0.8);
      group.add(shelf);
    });
    // Livros
    const bookColors = [0x3a1818, 0x1a3028, 0x2a2818, 0x3a2810, 0x182830];
    bookColors.forEach((col, i) => {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.22,0.18), new THREE.MeshLambertMaterial({color: col}));
      book.position.set(SALA_X - SALA_W/2 + 0.3 + i*0.12, 1.52, SALA_Z - 0.8);
      group.add(book);
    });
  }

  // ── ILUMINAÇÃO DA SALA ──
  {
    // Teto (fraco — a TV é a principal fonte de noite)
    const ceilL = new THREE.PointLight(0xFFE0B0, 0.6, 6, 1.5);
    ceilL.position.set(SALA_X, SALA_H - 0.1, SALA_Z);
    ceilL.castShadow = true;
    ceilL.shadow.mapSize.set(512, 512);
    group.add(ceilL);
    group.userData.salaLight = ceilL;
    // Luminária (esfera)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12,8,8), new THREE.MeshBasicMaterial({color:0xFFE8CC}));
    bulb.position.set(SALA_X, SALA_H - 0.12, SALA_Z);
    group.add(bulb);
  }

  // ── NOTA ATRÁS DA TV ──
  {
    const noteM = new THREE.MeshBasicMaterial({ color: 0xc8c090 });
    const note  = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), noteM);
    note.position.set(SALA_X + 0.45, 0.75, SALA_Z - SALA_D/2 + 0.04);
    note.userData = { type: 'note', id: 'note_behind_tv', label: '[E] Pegar bilhete' };
    group.add(note);
    interactables.push(note);
    group.userData.noteMesh = note;
  }

  // ── QUARTO (4m × 3.5m, à direita) ──
  const QX = SALA_W/2 + 3.8, QZ = -0.2, QW = 4.8, QD = 4.2, QH = 2.6;
  makeRoom(group, colliders, QX, QZ, QW, QD, QH, '#8a7854', woodFloor);

  // Cama
  {
    const bedFrameM = new THREE.MeshLambertMaterial({ color: 0x6a4a1a });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.16, 2.1), bedFrameM);
    frame.position.set(QX - 1.2, 0.08, QZ + 0.2);
    group.add(frame);
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 2.0), new THREE.MeshLambertMaterial({color:0x9ab0c8}));
    mattress.position.set(QX - 1.2, 0.30, QZ + 0.2);
    group.add(mattress);
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.6, 0.1), bedFrameM);
    headboard.position.set(QX - 1.2, 0.55, QZ + 0.2 - 1.0);
    group.add(headboard);
    // Cobertor
    const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 1.7), new THREE.MeshLambertMaterial({color:0xb4c8d8}));
    duvet.position.set(QX - 1.2, 0.43, QZ + 0.35);
    group.add(duvet);
    const bedMesh = mattress;
    bedMesh.userData = { type: 'bed', id: 'bed', label: '[E] Deitar' };
    interactables.push(bedMesh);
    colliders.push(new THREE.Box3(
      new THREE.Vector3(QX-2.05, 0, QZ-0.85),
      new THREE.Vector3(QX-0.35, 0.55, QZ+1.25)
    ));
  }

  // Janela grande
  {
    const glassM = new THREE.MeshBasicMaterial({ color: 0x0a1828, transparent:true, opacity:0.6 });
    const glass  = new THREE.Mesh(new THREE.PlaneGeometry(2.0, QH-0.3), glassM);
    glass.position.set(QX, QH/2, QZ - QD/2 + 0.02);
    group.add(glass);
    // Cortinas
    const curtM = new THREE.MeshLambertMaterial({ color: 0xd8d0b8, side:THREE.DoubleSide });
    [-0.8, 0.8].forEach(dx => {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(0.55, QH-0.2), curtM);
      c.position.set(QX+dx, QH/2, QZ - QD/2 + 0.03);
      group.add(c);
    });
  }

  // Guarda-roupa
  {
    const wardM = new THREE.MeshLambertMaterial({ color: 0x7a5a28 });
    const ward  = new THREE.Mesh(new THREE.BoxGeometry(1.4, QH-0.1, 0.6), wardM);
    ward.position.set(QX + QW/2 - 0.76, (QH-0.1)/2, QZ + 0.5);
    group.add(ward);
    ward.userData = { type: 'wardrobe', id: 'wardrobe', label: '[E] Guarda-roupa' };
    interactables.push(ward);
    colliders.push(new THREE.Box3(
      new THREE.Vector3(QX+QW/2-1.5, 0, QZ+0.2),
      new THREE.Vector3(QX+QW/2, QH, QZ+0.8)
    ));
  }

  // Mesa com computador
  {
    const deskM = new THREE.MeshLambertMaterial({ color: 0x8a6830 });
    const desk  = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.6), deskM);
    desk.position.set(QX + 0.6, 0.75, QZ + QD/2 - 0.5);
    group.add(desk);
    const monBody = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.36,0.08), new THREE.MeshLambertMaterial({color:0x0c0a08}));
    monBody.position.set(QX + 0.5, 1.13, QZ + QD/2 - 0.5);
    group.add(monBody);
    const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.44,0.30), new THREE.MeshBasicMaterial({color:0x050810}));
    monScreen.position.set(QX + 0.5, 1.13, QZ + QD/2 - 0.46);
    monScreen.userData = { type: 'computer', id: 'computer', label: '[E] Computador' };
    group.add(monScreen);
    interactables.push(monScreen);
  }

  // Mesa de cabeceira + luminária
  {
    const nsM = new THREE.MeshLambertMaterial({ color: 0x7a5a28 });
    const ns  = new THREE.Mesh(new THREE.BoxGeometry(0.45,0.50,0.40), nsM);
    ns.position.set(QX - 2.0, 0.25, QZ + 0.2);
    group.add(ns);
    // Luminária
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.32,8), new THREE.MeshLambertMaterial({color:0xb08040}));
    lampBase.position.set(QX - 2.0, 0.66, QZ + 0.2);
    group.add(lampBase);
    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.14,0.22,8), new THREE.MeshLambertMaterial({color:0xd4b070, side:THREE.DoubleSide}));
    lampShade.position.set(QX - 2.0, 0.88, QZ + 0.2);
    group.add(lampShade);
    const bedLamp = new THREE.PointLight(0xFFD080, 0.8, 2.0, 2.5);
    bedLamp.position.set(QX - 2.0, 0.95, QZ + 0.2);
    group.add(bedLamp);
    group.userData.bedLamp = bedLamp;
  }

  // Iluminação do quarto
  {
    const qLight = new THREE.PointLight(0xFFE0B0, 0.5, 6, 1.5);
    qLight.position.set(QX, QH - 0.1, QZ);
    qLight.castShadow = true;
    qLight.shadow.mapSize.set(512,512);
    group.add(qLight);
    group.userData.quartoLight = qLight;
  }

  // ── BANHEIRO (2.5m × 2m, atrás do quarto) ──
  const BX = QX + 1.5, BZ = QZ + QD/2 + 1.2, BW = 2.4, BD = 2.6, BH = 2.5;
  makeRoom(group, colliders, BX, BZ, BW, BD, BH, '#8a9a90', tileTex, '#1a2220');

  // Piso do banheiro com cerâmica
  {
    const bFloor = new THREE.Mesh(new THREE.PlaneGeometry(BW,BD), new THREE.MeshLambertMaterial({map:tileTex}));
    bFloor.rotation.x = -Math.PI/2;
    bFloor.position.set(BX,0.001,BZ);
    group.add(bFloor);
  }

  // Box (chuveiro com porta de vidro)
  {
    const showerBase = new THREE.Mesh(new THREE.BoxGeometry(1.0,0.08,0.95), new THREE.MeshLambertMaterial({color:0x7a8880}));
    showerBase.position.set(BX-0.4, 0.04, BZ-0.4);
    group.add(showerBase);
    const glassDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.0,BH-0.2), new THREE.MeshBasicMaterial({color:0x4a8888,transparent:true,opacity:0.35}));
    glassDoor.position.set(BX-0.4, BH/2, BZ+0.08);
    group.add(glassDoor);
    glassDoor.userData = { type:'shower', id:'shower', label:'[E] Chuveiro' };
    interactables.push(glassDoor);
    // Chuveiro (cabeceira)
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.04,10), new THREE.MeshLambertMaterial({color:0x5a7878}));
    head.position.set(BX-0.4, BH-0.2, BZ-0.4);
    group.add(head);
  }

  // Pia com gabinete
  {
    const sinkBase = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.84,0.44), new THREE.MeshLambertMaterial({color:0x7a8890}));
    sinkBase.position.set(BX+0.55, 0.42, BZ-0.4);
    group.add(sinkBase);
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.14,0.08,12), new THREE.MeshLambertMaterial({color:0xe0dcd8}));
    basin.position.set(BX+0.55, 0.88, BZ-0.4);
    group.add(basin);
    basin.userData = { type:'sink', id:'sink_bath', label:'[E] Pia' };
    interactables.push(basin);
    // Torneira
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.2,6), new THREE.MeshLambertMaterial({color:0x6a7880}));
    faucet.position.set(BX+0.55, 1.02, BZ-0.44);
    group.add(faucet);
    // Espelho (acima da pia)
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.55), new THREE.MeshBasicMaterial({color:0x8aa0aa}));
    mirror.position.set(BX+0.55, 1.45, BZ-BD/2+0.02);
    mirror.userData = { type:'mirror', id:'mirror', label:'[E] Espelho' };
    group.add(mirror);
    interactables.push(mirror);
  }

  // Vaso sanitário
  {
    const toiletM = new THREE.MeshLambertMaterial({ color: 0xe0dcd8 });
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.38,0.30,0.18), toiletM);
    tank.position.set(BX+0.55, 0.75, BZ+0.65);
    group.add(tank);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.16,0.38,10), toiletM);
    bowl.position.set(BX+0.55, 0.19, BZ+0.48);
    group.add(bowl);
    bowl.userData = { type:'toilet', id:'toilet', label:'[E] Vaso sanitário' };
    interactables.push(bowl);
  }

  // Toalheiro
  {
    const towelRail = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.55,6), new THREE.MeshLambertMaterial({color:0x5a7880}));
    towelRail.rotation.z = Math.PI/2;
    towelRail.position.set(BX+BW/2-0.05, 1.25, BZ-0.2);
    group.add(towelRail);
    const towel = new THREE.Mesh(new THREE.BoxGeometry(0.48,0.32,0.04), new THREE.MeshLambertMaterial({color:0x384858}));
    towel.position.set(BX+BW/2-0.06, 1.25, BZ-0.2);
    group.add(towel);
  }

  // Luz do banheiro
  {
    const bLight = new THREE.PointLight(0xCCDDDD, 0.9, 4, 2);
    bLight.position.set(BX, BH-0.1, BZ);
    group.add(bLight);
    group.userData.banheiroLight = bLight;
  }

  // ── INTERFONE (parede de entrada da sala, lado direito) ──
  {
    const entryWallZ = SALA_Z + SALA_D / 2; // parede de entrada (frente, +Z)

    // Caixa do interfone
    const iBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.26, 0.04),
      new THREE.MeshLambertMaterial({ color: 0x1a1a18 })
    );
    iBody.position.set(SALA_X + SALA_W/2 - 0.5, 1.35, entryWallZ - 0.03);
    group.add(iBody);

    // Tela pequena (emissiva verde)
    const iScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.10, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x224422 })
    );
    iScreen.position.set(SALA_X + SALA_W/2 - 0.5, 1.39, entryWallZ - 0.005);
    group.add(iScreen);

    // Botão (interagível)
    const iBtn = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.22),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })
    );
    iBtn.position.set(SALA_X + SALA_W/2 - 0.5, 1.35, entryWallZ - 0.004);
    iBtn.userData = { type: 'intercom', id: 'apt_intercom', label: '[E] Interfone' };
    group.add(iBtn);
    interactables.push(iBtn);
    group.userData.intercomBtn       = iBtn;
    group.userData.intercomScreenMat = iScreen.material; // para animar blink
  }

  // ── LUZ AMBIENTE GERAL ──
  group.add(new THREE.AmbientLight(0x2a1e10, 0.5));

  // ── SPAWN ──
  group.userData.spawn         = new THREE.Vector3(SALA_X, 1.65, SALA_Z + SALA_D/2 - 0.8);
  group.userData.colliders     = colliders;
  group.userData.interactables = interactables;
  group.userData.surface       = 'wood';

  return group;
}

