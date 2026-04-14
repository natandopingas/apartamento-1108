// ── CORREDOR DO 11º ANDAR ──
// Baseado nas imagens de referência: corredor estreito verde-acinzentado,
// piso quadriculado escuro, portas marrom com números âmbar, luz pendente quente.

import * as THREE from 'three';

// ─────────────────────────────────────────────
//  TEXTURE GENERATORS
// ─────────────────────────────────────────────

function makeWallTex() {
  const C = document.createElement('canvas');
  C.width = C.height = 512;
  const cx = C.getContext('2d');

  // Base: verde-acinzentado envelhecido
  cx.fillStyle = '#2e3a2c';
  cx.fillRect(0, 0, 512, 512);

  // Variação procedural de pixel
  const imgData = cx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() - 0.5) * 18;
    d[i]   = Math.max(0, Math.min(255, d[i]   + v));
    d[i+1] = Math.max(0, Math.min(255, d[i+1] + v * 0.8));
    d[i+2] = Math.max(0, Math.min(255, d[i+2] + v * 0.6));
  }
  cx.putImageData(imgData, 0, 0);

  // Manchas de umidade (blobs escuros)
  const stains = [
    [60,  80, 55, 160], [300, 30, 40, 110], [430, 200, 35, 90],
    [120, 320, 60, 140], [360, 380, 45, 120], [200, 150, 30, 80],
    [470, 50,  25, 70],  [50, 430, 40, 100],
  ];
  stains.forEach(([x, y, rx, ry]) => {
    cx.fillStyle = `rgba(8,16,9,${0.35 + Math.random() * 0.35})`;
    cx.beginPath();
    cx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    cx.fill();
  });

  // Escorrimentos verticais (water runs)
  for (let i = 0; i < 14; i++) {
    const x   = Math.random() * 512;
    const y0  = Math.random() * 200;
    const len = 40 + Math.random() * 120;
    const w   = 1 + Math.random() * 2;
    cx.fillStyle = `rgba(6,14,7,${0.25 + Math.random() * 0.3})`;
    cx.fillRect(x, y0, w, len);
  }

  // Rachaduras
  cx.strokeStyle = 'rgba(4,10,5,0.6)';
  cx.lineWidth   = 1;
  for (let i = 0; i < 6; i++) {
    const x1 = Math.random() * 512, y1 = Math.random() * 512;
    cx.beginPath();
    cx.moveTo(x1, y1);
    cx.lineTo(x1 + (Math.random() - 0.5) * 50, y1 + (Math.random() - 0.5) * 50);
    cx.stroke();
  }

  // Rodapé (faixa mais escura na base da textura)
  cx.fillStyle = 'rgba(0,0,0,0.25)';
  cx.fillRect(0, 420, 512, 92);

  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeFloorTex() {
  const C = document.createElement('canvas');
  C.width = C.height = 256;
  const cx = C.getContext('2d');

  const TILE   = 64; // 4x4 tiles in 256px canvas
  const colA   = '#1c2a1a'; // verde escuro tile A
  const colB   = '#202e1e'; // verde escuro tile B (levemente diferente)
  const grout  = '#0e1a0c'; // rejunte

  // Fundo (rejunte)
  cx.fillStyle = grout;
  cx.fillRect(0, 0, 256, 256);

  // Tiles
  for (let ty = 0; ty < 4; ty++) {
    for (let tx = 0; tx < 4; tx++) {
      const x = tx * TILE + 2;
      const y = ty * TILE + 2;
      cx.fillStyle = (tx + ty) % 2 === 0 ? colA : colB;
      cx.fillRect(x, y, TILE - 4, TILE - 4);

      // Variação sutil no tile
      const imgD = cx.getImageData(x, y, TILE - 4, TILE - 4);
      const d = imgD.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() - 0.5) * 10;
        d[i]   = Math.max(0, Math.min(255, d[i]   + v));
        d[i+1] = Math.max(0, Math.min(255, d[i+1] + v));
        d[i+2] = Math.max(0, Math.min(255, d[i+2] + v * 0.5));
      }
      cx.putImageData(imgD, x, y);
    }
  }

  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeCeilTex() {
  const C = document.createElement('canvas');
  C.width = C.height = 256;
  const cx = C.getContext('2d');
  cx.fillStyle = '#1a2218';
  cx.fillRect(0, 0, 256, 256);
  // Grime spots
  for (let i = 0; i < 20; i++) {
    cx.fillStyle = `rgba(5,10,5,${0.15 + Math.random() * 0.25})`;
    cx.beginPath();
    cx.ellipse(
      Math.random() * 256, Math.random() * 256,
      5 + Math.random() * 18, 5 + Math.random() * 18,
      0, 0, Math.PI * 2
    );
    cx.fill();
  }
  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeDoorTex(number) {
  const C = document.createElement('canvas');
  C.width  = 256;
  C.height = 512;
  const cx = C.getContext('2d');

  // Madeira escura base
  cx.fillStyle = '#2c1e0c';
  cx.fillRect(0, 0, 256, 512);

  // Veios de madeira
  cx.strokeStyle = 'rgba(12,8,2,0.45)';
  cx.lineWidth   = 1;
  for (let x = 0; x < 256; x += 5) {
    cx.beginPath();
    cx.moveTo(x + Math.sin(x * 0.08) * 3, 0);
    cx.lineTo(x + Math.sin(x * 0.08 + 2) * 3, 512);
    cx.stroke();
  }

  // Moldura da porta (borda levemente mais clara)
  cx.strokeStyle = 'rgba(70,45,14,0.5)';
  cx.lineWidth   = 4;
  cx.strokeRect(4, 4, 248, 504);

  // Painel superior
  cx.fillStyle = 'rgba(0,0,0,0.22)';
  cx.fillRect(22, 28, 212, 170);
  cx.strokeStyle = 'rgba(55,35,10,0.55)';
  cx.lineWidth   = 2;
  cx.strokeRect(22, 28, 212, 170);

  // Painel inferior
  cx.fillStyle   = 'rgba(0,0,0,0.18)';
  cx.fillRect(22, 220, 212, 270);
  cx.strokeStyle = 'rgba(55,35,10,0.5)';
  cx.strokeRect(22, 220, 212, 270);

  // Maçaneta (dourada)
  cx.fillStyle = '#8a6520';
  cx.fillRect(188, 250, 14, 38);
  cx.fillStyle = '#a07828';
  cx.fillRect(190, 252, 10, 34);
  cx.beginPath();
  cx.arc(195, 248, 7, 0, Math.PI * 2);
  cx.fillStyle = '#8a6520';
  cx.fill();

  // Olho mágico
  cx.fillStyle = '#1a1006';
  cx.beginPath();
  cx.arc(128, 100, 7, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = 'rgba(80,60,20,0.4)';
  cx.beginPath();
  cx.arc(128, 100, 5, 0, Math.PI * 2);
  cx.fill();

  // Placa do número (fundo escuro)
  cx.fillStyle = '#140e04';
  cx.fillRect(78, 14, 100, 26);
  cx.strokeStyle = '#2a1e08';
  cx.lineWidth = 1;
  cx.strokeRect(78, 14, 100, 26);

  // Número (âmbar)
  cx.fillStyle = '#E8A020';
  cx.font      = 'bold 18px "Press Start 2P", monospace';
  cx.textAlign = 'center';
  cx.fillText(String(number), 128, 34);

  return new THREE.CanvasTexture(C);
}

function makeCardboardTex() {
  const C = document.createElement('canvas');
  C.width = C.height = 128;
  const cx = C.getContext('2d');
  cx.fillStyle = '#8a6e38';
  cx.fillRect(0, 0, 128, 128);
  // Texture lines
  cx.strokeStyle = 'rgba(50,30,8,0.35)';
  cx.lineWidth = 1;
  for (let y = 0; y < 128; y += 6) {
    cx.beginPath(); cx.moveTo(0, y); cx.lineTo(128, y); cx.stroke();
  }
  // Tape line
  cx.fillStyle = 'rgba(180,150,90,0.4)';
  cx.fillRect(0, 60, 128, 8);
  return new THREE.CanvasTexture(C);
}

// ─────────────────────────────────────────────
//  BUILD CORRIDOR
// ─────────────────────────────────────────────

export function buildCorridor() {
  const group    = new THREE.Group();
  const colliders    = []; // THREE.Box3[]
  const interactables = []; // THREE.Mesh[] for raycasting

  const L  = 24;   // comprimento total (m)
  const W  = 2.2;  // largura
  const H  = 2.7;  // altura
  const HL = L / 2;

  // ── Texturas ──
  const wallTex  = makeWallTex();
  const floorTex = makeFloorTex();
  const ceilTex  = makeCeilTex();

  // repeat de acordo com dimensões reais
  wallTex.repeat.set(L / 3, H / 1.5);
  floorTex.repeat.set(W / 0.6, L / 0.6); // tile ~60cm
  ceilTex.repeat.set(4, L / 3);

  const wallMat  = new THREE.MeshLambertMaterial({ map: wallTex });
  const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });
  const ceilMat  = new THREE.MeshLambertMaterial({ map: ceilTex });

  // ── PISO ──
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // ── TETO ──
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, L), ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = H;
  group.add(ceil);

  // ── PAREDES ──
  function addWall(px, py, pz, rotY, ww, wh, tex) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshLambertMaterial({ map: tex }));
    m.position.set(px, py, pz);
    m.rotation.y = rotY;
    m.receiveShadow = true;
    group.add(m);
  }

  // Parede esquerda
  addWall(-W/2, H/2, 0,  Math.PI/2, L, H, wallTex);
  colliders.push(new THREE.Box3(
    new THREE.Vector3(-W/2 - 0.15, 0, -HL),
    new THREE.Vector3(-W/2 + 0.05, H, HL)
  ));

  // Parede direita
  addWall( W/2, H/2, 0, -Math.PI/2, L, H, wallTex);
  colliders.push(new THREE.Box3(
    new THREE.Vector3(W/2 - 0.05, 0, -HL),
    new THREE.Vector3(W/2 + 0.15, H, HL)
  ));

  // Parede do fundo (elevador)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
  backWall.position.set(0, H/2, HL);
  backWall.rotation.y = Math.PI;
  group.add(backWall);
  colliders.push(new THREE.Box3(
    new THREE.Vector3(-W/2, 0, HL - 0.05),
    new THREE.Vector3( W/2, H, HL + 0.15)
  ));

  // Parede da frente (fim do corredor)
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
  frontWall.position.set(0, H/2, -HL);
  group.add(frontWall);
  colliders.push(new THREE.Box3(
    new THREE.Vector3(-W/2, 0, -HL - 0.15),
    new THREE.Vector3( W/2, H, -HL + 0.05)
  ));

  // Rodapé
  const baseMatL = new THREE.MeshLambertMaterial({ color: 0x151e14 });
  const baseGeo  = new THREE.BoxGeometry(0.04, 0.13, L);
  const baseL = new THREE.Mesh(baseGeo, baseMatL);
  baseL.position.set(-W/2 + 0.02, 0.065, 0);
  group.add(baseL);
  const baseR = new THREE.Mesh(baseGeo, baseMatL);
  baseR.position.set( W/2 - 0.02, 0.065, 0);
  group.add(baseR);

  // ── PORTAS ──
  // Esquerda:  1108, 1106, 1104, 1102, 1100  (z = 8, 4, 0, -4, -8)
  // Direita:   1107, 1105, 1103, 1101, 1099  (z = 8, 4, 0, -4, -8)
  const DOOR_W   = 0.92;
  const DOOR_H   = 2.12;
  const DOOR_D   = 0.06;
  const DOOR_Z   = [8, 4, 0, -4, -8];
  const NUMS_L   = [1108, 1106, 1104, 1102, 1100];
  const NUMS_R   = [1107, 1105, 1103, 1101, 1099];

  const frameMat  = new THREE.MeshLambertMaterial({ color: 0x1e1208 });
  const doorPivots = {}; // número → { pivot, openDir, progress, isOpen, onDone }

  function addDoor(num, side, z) {
    const xPos    = side === 'L' ? -W/2 : W/2;
    const rotY    = side === 'L' ?  Math.PI/2 : -Math.PI/2;
    // Porta abre "para dentro" (sentido que afasta do corredor)
    const openDir = side === 'L' ?  Math.PI/2 : -Math.PI/2;

    const doorG = new THREE.Group();
    doorG.rotation.y = rotY;
    doorG.position.set(xPos, 0, z);

    // ── Pivot da dobradiça ──
    // Posicionado na borda da porta (lado -DOOR_W/2 em espaço local)
    const pivotG = new THREE.Group();
    pivotG.position.set(-DOOR_W / 2, 0, 0);

    // Painel da porta: offset +DOOR_W/2 para que gire em torno da dobradiça
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W, DOOR_H, DOOR_D),
      new THREE.MeshLambertMaterial({ map: makeDoorTex(num) })
    );
    doorMesh.position.set(DOOR_W / 2, DOOR_H / 2, 0);
    doorMesh.castShadow = true;
    doorMesh.userData   = { type: 'door', number: num, id: `door_${num}`, label: `[E] Porta ${num}` };
    pivotG.add(doorMesh);
    doorG.add(pivotG);
    interactables.push(doorMesh);

    // Moldura (frame) — fica fixa no doorG, não gira com a porta
    const fw = 0.07, fh = DOOR_H + 0.1, fd = DOOR_D + 0.04;
    [-DOOR_W/2 - fw/2, DOOR_W/2 + fw/2].forEach(fx => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), frameMat);
      s.position.set(fx, DOOR_H/2, 0);
      doorG.add(s);
    });
    const top = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + fw*2, fw, fd), frameMat);
    top.position.set(0, DOOR_H + fw/2, 0);
    doorG.add(top);

    group.add(doorG);

    // Collider da porta fechada
    colliders.push(new THREE.Box3(
      new THREE.Vector3(xPos - (side==='L'?0.1:DOOR_W), 0, z - DOOR_W/2),
      new THREE.Vector3(xPos + (side==='L'?DOOR_W:0.1), DOOR_H, z + DOOR_W/2)
    ));

    doorPivots[num] = { pivot: pivotG, openDir, progress: 0, isOpen: false, onDone: null };
  }

  DOOR_Z.forEach((z, i) => {
    addDoor(NUMS_L[i], 'L', z);
    addDoor(NUMS_R[i], 'R', z);
  });

  // ── LUZES DO TETO ──
  // 4 pendentes ao longo do corredor
  const LIGHT_Z = [9, 3, -3, -9];
  const lightRefs = [];
  const flickerIdx = 2; // terceiro pisca

  LIGHT_Z.forEach((z, i) => {
    // Suporte/cúpula
    const cupMat  = new THREE.MeshLambertMaterial({ color: 0x2a2218 });
    const cup     = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6, 0, Math.PI*2, 0, Math.PI/2), cupMat);
    cup.rotation.x = Math.PI;
    cup.position.set(0, H - 0.04, z);
    group.add(cup);

    // Cordão
    const cordGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.22, 4);
    const cord    = new THREE.Mesh(cordGeo, new THREE.MeshBasicMaterial({ color: 0x111111 }));
    cord.position.set(0, H - 0.13, z);
    group.add(cord);

    // Bulbo (emissivo, para parecer aceso)
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xFFE8CC });
    const bulb    = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), bulbMat);
    bulb.position.set(0, H - 0.26, z);
    group.add(bulb);

    // PointLight
    const pl = new THREE.PointLight(0xFFE4A0, 2.2, 10, 1.5);
    pl.position.set(0, H - 0.28, z);
    pl.castShadow = (i === 0);
    if (pl.castShadow) {
      pl.shadow.mapSize.set(512, 512);
      pl.shadow.camera.near = 0.1;
      pl.shadow.camera.far  = 8;
    }
    group.add(pl);

    lightRefs.push({ light: pl, bulb, bulbMat, flicker: i === flickerIdx });
  });

  // ── LUZ AMBIENTE ──
  group.add(new THREE.AmbientLight(0x1a2e1a, 0.45));

  // ── EXTINTOR (parede esquerda, perto da porta 1108) ──
  {
    const extGrp = new THREE.Group();
    const redM   = new THREE.MeshLambertMaterial({ color: 0x8a1010 });
    const capM   = new THREE.MeshLambertMaterial({ color: 0x6a0808 });
    const metM   = new THREE.MeshLambertMaterial({ color: 0x2a2820 });

    // Corpo
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.40, 10), redM);
    body.position.y = 0.20;
    extGrp.add(body);

    // Tampa
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.065, 0.09, 10), capM);
    cap.position.y = 0.445;
    extGrp.add(cap);

    // Manômetro
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.015, 8), metM);
    gauge.rotation.z = Math.PI/2;
    gauge.position.set(0.07, 0.35, 0);
    extGrp.add(gauge);

    // Mangueira
    const hoseGeo = new THREE.TorusGeometry(0.06, 0.012, 6, 12, Math.PI);
    const hose    = new THREE.Mesh(hoseGeo, metM);
    hose.rotation.x = Math.PI/2;
    hose.position.set(0.08, 0.12, 0);
    extGrp.add(hose);

    // Suporte na parede
    const brkt = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.05), metM);
    brkt.position.set(0, 0.30, 0.09);
    extGrp.add(brkt);

    extGrp.position.set(-W/2 + 0.10, 0, DOOR_Z[0] + 1.8);
    group.add(extGrp);
  }

  // ── CAIXAS DE MUDANÇA (perto da porta 1108) ──
  {
    const cbMat = new THREE.MeshLambertMaterial({ map: makeCardboardTex() });
    const boxes = [
      { p: [-0.42, 0.22,  DOOR_Z[0] + 0.35], s: [0.48, 0.44, 0.42] },
      { p: [-0.30, 0.62,  DOOR_Z[0] + 0.42], s: [0.38, 0.32, 0.36] },
      { p: [-0.55, 0.22,  DOOR_Z[0] - 0.10], s: [0.42, 0.44, 0.46] },
      { p: [-0.24, 0.22,  DOOR_Z[0] + 0.65], s: [0.36, 0.38, 0.32] },
    ];
    boxes.forEach(b => {
      const bx = new THREE.Mesh(new THREE.BoxGeometry(...b.s), cbMat);
      bx.position.set(...b.p);
      bx.rotation.y = (Math.random() - 0.5) * 0.3;
      bx.castShadow = true;
      bx.receiveShadow = true;
      bx.userData = { type: 'box', id: 'moving_boxes', label: '[E] Caixas de mudança' };
      group.add(bx);
      interactables.push(bx);
    });
  }

  // ── SAÍDA / SINAL ──
  {
    // Pequena placa "SAÍDA" no fundo
    const signMat = new THREE.MeshBasicMaterial({ color: 0x008800, side: THREE.DoubleSide });
    const sign    = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.10), signMat);
    sign.position.set(0, H - 0.2, -HL + 0.02);
    group.add(sign);
  }

  // ── METADATA ──
  group.userData.spawn        = new THREE.Vector3(0, 1.65, HL - 0.8); // começa perto do elevador
  group.userData.colliders    = colliders;
  group.userData.interactables= interactables;
  group.userData.lightRefs    = lightRefs;
  group.userData.doorPivots   = doorPivots;
  group.userData.surface      = 'tile';

  return group;
}

// Chamado a cada frame pelo main.js para animar as luzes
export function updateCorridorLights(group, time) {
  const refs = group.userData.lightRefs;
  if (!refs) return;
  refs.forEach(({ light, bulb, bulbMat, flicker }) => {
    if (flicker) {
      // Flicker: normalmente acesa, pisca ocasionalmente
      const t      = time * 8;
      const on     = (Math.sin(t) > -0.92) && (Math.random() > 0.02);
      const intens = on ? 1.4 : (Math.random() * 0.3);
      light.intensity       = intens;
      bulbMat.color.setHex(on ? 0xFFE8CC : 0x221e0a);
    }
  });
}
