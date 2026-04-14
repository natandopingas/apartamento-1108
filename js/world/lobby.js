// ── LOBBY / PORTARIA ──
// Hall de entrada: Dona Maria, elevadores, planta, balcão, CCTV.

import * as THREE from 'three';

function makeWallTex(r, g, b) {
  const C = document.createElement('canvas');
  C.width = C.height = 256;
  const cx = C.getContext('2d');
  cx.fillStyle = `rgb(${r},${g},${b})`;
  cx.fillRect(0, 0, 256, 256);
  // Manchas
  for (let i = 0; i < 8; i++) {
    cx.fillStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.12})`;
    cx.beginPath();
    cx.ellipse(Math.random()*256, Math.random()*256, 20+Math.random()*40, 15+Math.random()*30, 0, 0, Math.PI*2);
    cx.fill();
  }
  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  return t;
}

function makeFloorTex() {
  const C = document.createElement('canvas');
  C.width = C.height = 256;
  const cx = C.getContext('2d');
  // Cerâmica escura
  cx.fillStyle = '#151e15';
  cx.fillRect(0, 0, 256, 256);
  const TILE = 64;
  for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) {
    cx.fillStyle = (tx+ty)%2===0 ? '#181e18' : '#1a221a';
    cx.fillRect(tx*TILE+2, ty*TILE+2, TILE-4, TILE-4);
  }
  cx.strokeStyle = '#0c140c'; cx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    cx.beginPath(); cx.moveTo(i*TILE, 0); cx.lineTo(i*TILE, 256); cx.stroke();
    cx.beginPath(); cx.moveTo(0, i*TILE); cx.lineTo(256, i*TILE); cx.stroke();
  }
  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 5);
  return t;
}

export function buildLobby() {
  const group = new THREE.Group();
  const colliders = [];
  const interactables = [];

  const W = 10, D = 8, H = 3.2;

  const wallTex  = makeWallTex(42, 58, 44);   // verde-acinzentado
  const floorTex = makeFloorTex();
  const wallMat  = new THREE.MeshLambertMaterial({ map: wallTex });
  const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });
  const ceilMat  = new THREE.MeshLambertMaterial({ color: 0x141e14 });

  // Piso
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true;
  group.add(floor);

  // Teto
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, 0);
  group.add(ceil);

  // Paredes
  const walls = [
    { p: [0, H/2, -D/2], ry: 0,          s: [W, H] },
    { p: [0, H/2,  D/2], ry: Math.PI,    s: [W, H] },
    { p: [-W/2, H/2, 0], ry: Math.PI/2,  s: [D, H] },
    { p: [ W/2, H/2, 0], ry: -Math.PI/2, s: [D, H] },
  ];
  walls.forEach(({ p, ry, s }) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(...s), wallMat);
    m.position.set(...p); m.rotation.y = ry; m.receiveShadow = true;
    group.add(m);
  });

  // Colliders de parede
  colliders.push(new THREE.Box3(new THREE.Vector3(-W/2-0.1,0,-D/2-0.1), new THREE.Vector3(W/2+0.1, H, -D/2+0.05)));
  colliders.push(new THREE.Box3(new THREE.Vector3(-W/2-0.1,0, D/2-0.05), new THREE.Vector3(W/2+0.1, H,  D/2+0.1)));
  colliders.push(new THREE.Box3(new THREE.Vector3(-W/2-0.1,0,-D/2), new THREE.Vector3(-W/2+0.05, H, D/2)));
  colliders.push(new THREE.Box3(new THREE.Vector3( W/2-0.05,0,-D/2), new THREE.Vector3( W/2+0.1, H, D/2)));

  // ── BALCÃO DA DONA MARIA ──
  const deskMat = new THREE.MeshLambertMaterial({ color: 0x4a2e10 });
  // Peça frontal
  const deskF = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.05, 0.55), deskMat);
  deskF.position.set(0, 0.525, -1.0);
  deskF.castShadow = true;
  group.add(deskF);
  // Peça lateral (L)
  const deskS = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.05, 2.0), deskMat);
  deskS.position.set(1.9, 0.525, -0.05);
  group.add(deskS);
  // Tampa
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.06, 2.6), new THREE.MeshLambertMaterial({color:0x5a3814}));
  deskTop.position.set(0, 1.08, -0.2);
  group.add(deskTop);
  colliders.push(new THREE.Box3(new THREE.Vector3(-2,-0,D/2-3.2), new THREE.Vector3(2.3, 1.1, D/2-1)));

  // Monitor CCTV (antigo, pequeno)
  const monMat = new THREE.MeshLambertMaterial({ color: 0x0a0a08 });
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.28), monMat);
  monitor.position.set(-0.8, 1.32, -1.1);
  group.add(monitor);
  // Tela (emissiva, imagem estática)
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x152815 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.28), screenMat);
  screen.position.set(-0.8, 1.32, -0.97);
  screen.userData = { type: 'cctv', id: 'cctv_monitor', label: '[E] Monitor' };
  group.add(screen);
  interactables.push(screen);

  // Telefone
  const phoneMat = new THREE.MeshLambertMaterial({ color: 0x1a1410 });
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.18), phoneMat);
  phone.position.set(0.5, 1.12, -1.05);
  group.add(phone);

  // ── PLANTA (ficus grande) ──
  const plantStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 1.2, 6),
    new THREE.MeshLambertMaterial({ color: 0x3a2008 })
  );
  plantStem.position.set(-3.2, 0.6, -2.0);
  group.add(plantStem);
  // Folhas (esferas verdes)
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x1a3814 });
  [[-3.2,1.6,-2],[-3.5,1.3,-2.1],[-2.9,1.4,-1.8],[-3.3,1.8,-1.9],[-3.1,1.5,-2.3]].forEach(([x,y,z]) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), leafMat);
    leaf.position.set(x, y, z);
    group.add(leaf);
  });
  // Vaso
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.16, 0.30, 8),
    new THREE.MeshLambertMaterial({ color: 0x4a3018 })
  );
  pot.position.set(-3.2, 0.15, -2.0);
  group.add(pot);

  // ── CAIXAS DE CORREIO (parede esquerda) ──
  const mailMat = new THREE.MeshLambertMaterial({ color: 0x2a2e2a });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.22, 0.12), mailMat);
      box.position.set(-W/2 + 0.1, 1.4 + row * 0.24, -D/2 + 1.0 + col * 0.35);
      group.add(box);
    }
  }

  // ── ELEVADORES (parede direita) ──
  const elevMat = new THREE.MeshLambertMaterial({ color: 0x2e3238 });
  const elevDoorMat = new THREE.MeshLambertMaterial({ color: 0x3a3e44 });
  [-1.2, 1.2].forEach((zOffset, i) => {
    // Caixa do elevador
    const elev = new THREE.Mesh(new THREE.BoxGeometry(0.12, H, 1.6), elevMat);
    elev.position.set(W/2 - 0.06, H/2, zOffset);
    group.add(elev);
    // Portas
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), elevDoorMat);
    door.position.set(W/2 - 0.13, 1.1, zOffset);
    door.rotation.y = -Math.PI/2;
    door.userData = { type: 'elevator_call', id: `elevator_${i}`, label: '[E] Chamar Elevador' };
    group.add(door);
    interactables.push(door);

    // Display LED
    const dispC = document.createElement('canvas');
    dispC.width = 128; dispC.height = 64;
    const dcx = dispC.getContext('2d');
    dcx.fillStyle = '#0a0600';
    dcx.fillRect(0, 0, 128, 64);
    dcx.fillStyle = '#FF8800';
    dcx.font = 'bold 28px "Press Start 2P", monospace';
    dcx.textAlign = 'center';
    dcx.fillText('1', 64, 40);
    dcx.font = '10px "Press Start 2P", monospace';
    dcx.fillText('ANDAR', 64, 58);
    const dispTex = new THREE.CanvasTexture(dispC);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.13), new THREE.MeshBasicMaterial({ map: dispTex }));
    disp.position.set(W/2 - 0.12, 2.6, zOffset);
    disp.rotation.y = -Math.PI/2;
    group.add(disp);
  });

  // ── RELÓGIO DE PAREDE ──
  const clockC = document.createElement('canvas');
  clockC.width = clockC.height = 128;
  const ckcx = clockC.getContext('2d');
  ckcx.fillStyle = '#f0e8d0';
  ckcx.beginPath(); ckcx.arc(64,64,60,0,Math.PI*2); ckcx.fill();
  ckcx.strokeStyle = '#2a1e0a'; ckcx.lineWidth = 3;
  ckcx.beginPath(); ckcx.arc(64,64,60,0,Math.PI*2); ckcx.stroke();
  // Marcações
  for (let h = 0; h < 12; h++) {
    const a = h/12 * Math.PI*2 - Math.PI/2;
    ckcx.fillStyle = '#2a1e0a';
    ckcx.beginPath();
    ckcx.arc(64+Math.cos(a)*50, 64+Math.sin(a)*50, 3, 0, Math.PI*2);
    ckcx.fill();
  }
  const clockTex = new THREE.CanvasTexture(clockC);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), new THREE.MeshBasicMaterial({ map: clockTex }));
  clock.position.set(0, H - 0.5, -D/2 + 0.02);
  group.add(clock);

  // ── ILUMINAÇÃO ──
  // Luz geral fria (fluorescente esverdeada)
  const ambient = new THREE.AmbientLight(0x2a4a2a, 1.0);
  group.add(ambient);

  // Luzes rebaixadas no teto
  const ceilLightPos = [[-2,H-0.1,-1],[2,H-0.1,-1],[-2,H-0.1,2],[2,H-0.1,2],[0,H-0.1,0]];
  ceilLightPos.forEach(([x,y,z]) => {
    const pl = new THREE.PointLight(0xCCDDCC, 2.5, 10, 1.0);
    pl.position.set(x, y, z);
    group.add(pl);
    const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.15,8), new THREE.MeshBasicMaterial({color:0x8aaa8a, side:THREE.DoubleSide}));
    bulb.rotation.x = Math.PI/2; bulb.position.set(x, H-0.01, z);
    group.add(bulb);
  });

  // Luminária quente do balcão
  const deskLight = new THREE.PointLight(0xFFE0B0, 0.9, 2.5, 2);
  deskLight.position.set(-0.5, 1.5, -1.2);
  group.add(deskLight);

  // ── SPAWN ──
  group.userData.spawn         = new THREE.Vector3(0, 1.65, 2.8);
  group.userData.colliders     = colliders;
  group.userData.interactables = interactables;
  group.userData.surface       = 'stone';

  return group;
}
