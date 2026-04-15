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

function makeSalaFloorTex() {
  const C = document.createElement('canvas');
  C.width = 512; C.height = 256;
  const cx = C.getContext('2d');
  const PLANK_H = 32; // altura de cada tábua em px (~0.3m)
  const numPlanks = C.height / PLANK_H; // 8 tábuas
  const baseColors = ['#3D2B1F','#3A2820','#412E22','#382719','#3E2C20'];
  for (let p = 0; p < numPlanks; p++) {
    const col = baseColors[p % baseColors.length];
    cx.fillStyle = col;
    cx.fillRect(0, p * PLANK_H, C.width, PLANK_H - 1);
    // Veios sutis ao longo de cada tábua
    cx.strokeStyle = 'rgba(20,10,5,0.18)';
    cx.lineWidth = 1;
    for (let v = 0; v < 6; v++) {
      const yv = p * PLANK_H + 4 + v * 4;
      cx.beginPath();
      cx.moveTo(0, yv + Math.sin(v) * 1.5);
      cx.lineTo(C.width, yv + Math.sin(v + 2) * 1.5);
      cx.stroke();
    }
    // Rejunte entre tábuas
    cx.fillStyle = '#2A1D14';
    cx.fillRect(0, p * PLANK_H + PLANK_H - 1, C.width, 1);
  }
  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  t.rotation = Math.PI / 2;   // tábuas apontam para a cortina (eixo Z)
  t.center.set(0.5, 0.5);
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

  const woodFloor   = makeWoodFloorTex();
  const salaFloor   = makeSalaFloorTex();
  const tileTex     = makeTileTex();

  // ── SALA (5m × 4m) ──
  const SALA_X = 0, SALA_Z = 0, SALA_W = 5.0, SALA_D = 4.0, SALA_H = 2.6;
  makeRoom(group, colliders, SALA_X, SALA_Z, SALA_W, SALA_D, SALA_H, '#C4874A', salaFloor, '#1A1410');

  // ── TV PLANA (parede BC — esquerda, perto do fundo) ──
  {
    const TV_X = SALA_X - SALA_W/2;   // x = -2.5 (parede BC)
    const TV_Z = SALA_Z - 0.8;        // recentrada p/ TV mais larga não clipar fundo
    const TV_H = 1.35;                // centro da TV
    const TV_W = 2.0, TV_HH = 1.20;  // tela dobrada (mesma espessura)

    // ── Rack ──
    const rackMat = new THREE.MeshLambertMaterial({ color: 0x2a1e0a });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 0.38), rackMat);
    rack.position.set(TV_X + 0.19, 0.225, TV_Z);
    rack.rotation.y = Math.PI / 2;
    group.add(rack);

    // ── Painel (espessura mantida, tela maior) ──
    const panelMat = new THREE.MeshLambertMaterial({ color: 0x0A0A0A });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(TV_W, TV_HH, 0.045), panelMat);
    panel.position.set(TV_X + 0.023, TV_H, TV_Z);
    panel.rotation.y = Math.PI / 2;
    group.add(panel);

    // Moldura
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(TV_W - 0.16, TV_HH - 0.12, 0.005), frameMat);
    frame.position.set(TV_X + 0.047, TV_H, TV_Z);
    frame.rotation.y = Math.PI / 2;
    group.add(frame);

    // Tela — canvas animado
    const tvCanvas = document.createElement('canvas');
    tvCanvas.width = 64; tvCanvas.height = 48;
    const tvCtx = tvCanvas.getContext('2d');
    const tvTex = new THREE.CanvasTexture(tvCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: tvTex });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(TV_W - 0.20, TV_HH - 0.16), screenMat);
    screen.position.set(TV_X + 0.050, TV_H, TV_Z);
    screen.rotation.y = Math.PI / 2;
    screen.userData = { type: 'tv', id: 'tv', label: '[E] TV' };
    group.add(screen);
    interactables.push(screen);
    group.userData.tvScreen    = screen;
    group.userData.tvStaticCtx = tvCtx;
    group.userData.tvStaticTex = tvTex;

    // ── Dois tripés (um em cada lateral) ──
    const tripodMat = new THREE.MeshLambertMaterial({ color: 0x1C1C1C });
    const TV_BOT  = TV_H - TV_HH / 2;  // y da base da TV = 0.75
    const RACK_TOP = 0.45;

    function addLeg(x1, y1, z1, x2, y2, z2) {
      const dx = x2-x1, dy = y2-y1, dz = z2-z1;
      const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 5), tripodMat);
      cyl.position.set((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);
      cyl.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(dx/len, dy/len, dz/len)
      );
      group.add(cyl);
    }

    [-0.88, 0.88].forEach(side => {
      const tx = TV_X + 0.023;
      const tz = TV_Z + side;
      // 3 pernas: uma para frente (interior da sala) e duas em diagonal lateral
      addLeg(tx, TV_BOT, tz,  tx + 0.32, RACK_TOP, tz);
      addLeg(tx, TV_BOT, tz,  tx + 0.08, RACK_TOP, tz - 0.20);
      addLeg(tx, TV_BOT, tz,  tx + 0.08, RACK_TOP, tz + 0.20);
    });

    // Luz da TV
    const tvLight = new THREE.PointLight(0xE8E8FF, 1.2, 5, 2.0);
    tvLight.position.set(TV_X + 1.0, TV_H, TV_Z);
    group.add(tvLight);
    group.userData.tvLight = tvLight;
  }

  // ── SOFÁ AZUL MARINHO ──
  {
    const sofaM = new THREE.MeshLambertMaterial({ color: 0xC4A882 }); // bege

    // Canto superior direito: encosto na parede AD (x=+2.5), braço na parede AB (z=-2.0)
    const SX = SALA_X + 2.05, SZ = SALA_Z - 0.8;

    const sofaG = new THREE.Group();
    sofaG.position.set(SX, 0, SZ);
    sofaG.rotation.y = -Math.PI / 2;

    // Assento: 2.1 x 0.45 x 0.9 — fundo no chão (y=0)
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 0.9), sofaM);
    seat.position.set(0, 0.225, 0);
    sofaG.add(seat);

    // Encosto: 2.1 x 0.6 x 0.15, atrás do assento, levemente inclinado
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.6, 0.15), sofaM);
    back.position.set(0, 0.45 + 0.3, -0.375);
    back.rotation.x = -0.1;
    sofaG.add(back);

    // Braço esquerdo: 0.15 x 0.55 x 0.9
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.55, 0.9), sofaM);
    armL.position.set(-1.125, 0.275, 0);
    sofaG.add(armL);

    // Braço direito
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.55, 0.9), sofaM);
    armR.position.set(1.125, 0.275, 0);
    sofaG.add(armR);

    // Almofadas (esferas achatadas)
    [-0.5, 0.5].forEach(ox => {
      const pillow = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 10, 8),
        new THREE.MeshLambertMaterial({ color: 0xB09870 })
      );
      pillow.scale.set(1, 0.4, 0.85);
      pillow.position.set(ox, 0.45 + 0.09, -0.05);
      sofaG.add(pillow);
    });

    group.add(sofaG);

    // Collider — cobre o footprint real do sofá no canto direito/fundo
    colliders.push(new THREE.Box3(
      new THREE.Vector3(1.6, 0, -2.0),
      new THREE.Vector3(2.5, 1.0, 0.4)
    ));
  }

  // ── MESA DE JANTAR (redonda, esquerda) ──
  {
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.05, 16),
      new THREE.MeshLambertMaterial({ color: 0x1e1608 })
    );
    tableTop.position.set(SALA_X - 1.95, 0.74, SALA_Z + 1.45);
    group.add(tableTop);
    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.72, 8),
      new THREE.MeshLambertMaterial({ color: 0x1a1408 })
    );
    tableLeg.position.set(SALA_X - 1.95, 0.36, SALA_Z + 1.45);
    group.add(tableLeg);
    // 3 cadeiras iguais — lado direito da mesa, voltadas para ela (-X)
    const chairMat = new THREE.MeshLambertMaterial({ color: 0x1a1208 });
    function makeChairAt(wx, wz, ry) {
      const cg = new THREE.Group();
      // Assento
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.40), chairMat);
      seat.position.set(0, 0.46, 0);
      cg.add(seat);
      // Encosto
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.04), chairMat);
      back.position.set(0, 0.67, -0.18);
      cg.add(back);
      // 4 pernas
      [[-0.17, -0.16], [0.17, -0.16], [-0.17, 0.16], [0.17, 0.16]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 5), chairMat);
        leg.position.set(lx, 0.22, lz);
        cg.add(leg);
      });
      cg.position.set(wx, 0, wz);
      cg.rotation.y = ry;
      group.add(cg);
    }
    const CX = SALA_X - 1.0;
    const FACE = -Math.PI / 2; // voltadas para -X (em direção à mesa)
    makeChairAt(CX, SALA_Z + 1.05, FACE);
    makeChairAt(CX, SALA_Z + 1.45, FACE);
    makeChairAt(CX, SALA_Z + 1.80, FACE);
    colliders.push(new THREE.Box3(
      new THREE.Vector3(SALA_X-2.5, 0, SALA_Z+0.85),
      new THREE.Vector3(SALA_X-1.3, 0.78, SALA_Z+2.0)
    ));
  }

  // ── GUITARRAS 3D ──
  {
    // Materiais compartilhados
    const pegMat   = new THREE.MeshLambertMaterial({ color: 0xB8A060 });
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xD0C898 });
    const metalMat  = new THREE.MeshLambertMaterial({ color: 0xA0A0A0 });

    // ── Violão acústico ──
    function makeAcoustic() {
      const g = new THREE.Group();
      const bodyMat  = new THREE.MeshLambertMaterial({ color: 0x7B3A10 }); // mogno escuro
      const topMat   = new THREE.MeshLambertMaterial({ color: 0xC8943C }); // tampo claro
      const neckMat  = new THREE.MeshLambertMaterial({ color: 0x3A1A06 }); // escuro
      const holeMat  = new THREE.MeshBasicMaterial({ color: 0x050202 });

      // Tampo frontal (CylinderGeometry rotacionado → disco no plano XY)
      // Lower bout
      const lbTop = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.012, 8), topMat);
      lbTop.rotation.x = Math.PI / 2;
      lbTop.position.set(0, -0.08, 0.038);
      g.add(lbTop);

      // Upper bout
      const ubTop = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.128, 0.012, 8), topMat);
      ubTop.rotation.x = Math.PI / 2;
      ubTop.position.set(0, 0.24, 0.038);
      g.add(ubTop);

      // Corpo traseiro lower bout
      const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.075, 8), bodyMat);
      lb.rotation.x = Math.PI / 2;
      lb.position.set(0, -0.08, 0);
      g.add(lb);

      // Corpo traseiro upper bout
      const ub = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.128, 0.075, 8), bodyMat);
      ub.rotation.x = Math.PI / 2;
      ub.position.set(0, 0.24, 0);
      g.add(ub);

      // Cintura (preenchimento entre os bouts)
      const waist = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.20, 0.075), bodyMat);
      waist.position.set(0, 0.08, 0);
      g.add(waist);
      const waistTop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.20, 0.012), topMat);
      waistTop.position.set(0, 0.08, 0.038);
      g.add(waistTop);

      // Boca (sound hole)
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.058, 8), holeMat);
      hole.position.set(0, 0.10, 0.046);
      g.add(hole);

      // Pestana/aro lateral
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.58, 0.075), bodyMat);
      rim.position.set(-0.19, 0.08, 0);
      g.add(rim);
      const rim2 = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.58, 0.075), bodyMat);
      rim2.position.set(0.19, 0.08, 0);
      g.add(rim2);

      // Escala/braço
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.50, 0.030), neckMat);
      neck.position.set(0, 0.62, 0.010);
      g.add(neck);

      // Fretboard (frente do braço)
      const fb = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.48, 0.010), neckMat);
      fb.position.set(0, 0.62, 0.028);
      g.add(fb);

      // Cabeça
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.115, 0.025), neckMat);
      head.position.set(0, 0.91, 0.008);
      g.add(head);

      // Tarraxas (3 por lado)
      for (let i = 0; i < 3; i++) {
        const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.028, 4), pegMat);
        pl.rotation.z = Math.PI / 2;
        pl.position.set(-0.054, 0.862 + i * 0.036, 0.008);
        g.add(pl);
        const pr = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.028, 4), pegMat);
        pr.rotation.z = Math.PI / 2;
        pr.position.set(0.054, 0.862 + i * 0.036, 0.008);
        g.add(pr);
      }

      // Cavalete
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.090, 0.022, 0.018), neckMat);
      bridge.position.set(0, -0.18, 0.043);
      g.add(bridge);

      // Cordas (6)
      for (let i = 0; i < 6; i++) {
        const sx = (i - 2.5) * 0.010;
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.92, 0.0015), stringMat);
        s.position.set(sx, 0.33, 0.046);
        g.add(s);
      }

      // Gancho de parede
      const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.055, 4), metalMat);
      hook.rotation.z = Math.PI / 2;
      hook.position.set(0, 0.97, -0.02);
      g.add(hook);

      return g;
    }

    // ── Guitarra elétrica (Stratocaster) ──
    function makeElectric() {
      const g = new THREE.Group();
      const bodyMat     = new THREE.MeshLambertMaterial({ color: 0xB5251A }); // vermelho sunburst
      const bodyEdgeMat = new THREE.MeshLambertMaterial({ color: 0x7A1510 }); // borda escura
      const pickguardMat= new THREE.MeshLambertMaterial({ color: 0xDDDDD5 }); // branco pérola
      const neckMat     = new THREE.MeshLambertMaterial({ color: 0xD4A84B }); // maple
      const fbMat       = new THREE.MeshLambertMaterial({ color: 0x1C0C04 }); // rosewood
      const pickupMat   = new THREE.MeshLambertMaterial({ color: 0x111111 });

      // Corpo principal
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.340, 0.420, 0.058), bodyMat);
      body.position.set(0, -0.06, 0);
      g.add(body);

      // Borda escura (outline)
      const bodyEdge = new THREE.Mesh(new THREE.BoxGeometry(0.345, 0.425, 0.055), bodyEdgeMat);
      bodyEdge.position.set(0, -0.06, -0.002);
      g.add(bodyEdge);

      // Chifre superior (Strat)
      const hornU = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.190, 0.058), bodyMat);
      hornU.position.set(-0.195, 0.225, 0);
      g.add(hornU);
      // Ponta arredondada do chifre superior
      const hornUTip = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.058, 6), bodyMat);
      hornUTip.rotation.x = Math.PI / 2;
      hornUTip.position.set(-0.214, 0.308, 0);
      g.add(hornUTip);

      // Chifre inferior (menor)
      const hornL = new THREE.Mesh(new THREE.BoxGeometry(0.070, 0.115, 0.058), bodyMat);
      hornL.position.set(-0.180, -0.238, 0);
      g.add(hornL);
      const hornLTip = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.058, 6), bodyMat);
      hornLTip.rotation.x = Math.PI / 2;
      hornLTip.position.set(-0.196, -0.290, 0);
      g.add(hornLTip);

      // Pickguard
      const pg = new THREE.Mesh(new THREE.PlaneGeometry(0.190, 0.360), pickguardMat);
      pg.position.set(-0.025, -0.01, 0.030);
      g.add(pg);

      // 3 captadores
      for (let i = 0; i < 3; i++) {
        const pu = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.038, 0.018), pickupMat);
        pu.position.set(-0.025, 0.115 - i * 0.135, 0.040);
        g.add(pu);
        // Ímãs (6 pontinhos)
        for (let p = 0; p < 6; p++) {
          const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.010, 4), metalMat);
          pin.rotation.x = Math.PI / 2;
          pin.position.set(-0.025 + (p - 2.5) * 0.016, 0.115 - i * 0.135, 0.050);
          g.add(pin);
        }
      }

      // Braço (neck)
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.510, 0.030), neckMat);
      neck.position.set(0, 0.485, 0.010);
      g.add(neck);

      // Fretboard
      const fb = new THREE.Mesh(new THREE.BoxGeometry(0.049, 0.490, 0.010), fbMat);
      fb.position.set(0, 0.485, 0.028);
      g.add(fb);

      // Trastes (marcações aproximadas)
      for (let i = 0; i < 8; i++) {
        const fret = new THREE.Mesh(new THREE.BoxGeometry(0.049, 0.003, 0.003), metalMat);
        fret.position.set(0, 0.245 + i * 0.060, 0.033);
        g.add(fret);
      }

      // Cabeça Strat (assimétrica)
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.060, 0.165, 0.022), neckMat);
      head.position.set(-0.008, 0.810, 0.008);
      g.add(head);

      // Tarraxas (6 em linha)
      for (let i = 0; i < 6; i++) {
        const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.026, 4), pegMat);
        peg.rotation.z = Math.PI / 2;
        peg.position.set(-0.052, 0.738 + i * 0.024, 0.008);
        g.add(peg);
      }

      // Ponte (tremolo)
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.042, 0.022), metalMat);
      bridge.position.set(0, -0.175, 0.040);
      g.add(bridge);

      // Sela de saída (output jack) - detalhe lateral
      const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.020, 4), metalMat);
      jack.position.set(0.175, -0.12, 0);
      g.add(jack);

      // Cordas (6)
      for (let i = 0; i < 6; i++) {
        const sx = (i - 2.5) * 0.009;
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.870, 0.0015), stringMat);
        s.position.set(sx, 0.325, 0.042);
        g.add(s);
      }

      // Gancho de parede
      const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.055, 4), metalMat);
      hook.rotation.z = Math.PI / 2;
      hook.position.set(0, 0.985, -0.018);
      g.add(hook);

      return g;
    }

    const WALL_X = SALA_X + SALA_W / 2 - 0.07;

    // Violão (esquerda, levemente inclinado)
    const acoustic = makeAcoustic();
    acoustic.position.set(WALL_X, 1.62, SALA_Z + 0.15);
    acoustic.rotation.y = -Math.PI / 2;
    acoustic.rotation.z = 0.06;
    group.add(acoustic);

    // Elétrica (acima do braço esquerdo do sofá)
    const electric = makeElectric();
    electric.position.set(WALL_X, 1.62, SALA_Z + 0.75);
    electric.rotation.y = -Math.PI / 2;
    electric.rotation.z = -0.06;
    group.add(electric);
  }

  // ── SACADA: VIDRO + CORTINA + VARÃO + LUZES DA CIDADE ──
  {
    const wallZ = SALA_Z - SALA_D/2;

    // Porta de vidro (MeshPhysicalMaterial, noite escura)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0A0F1A,
      transparent: true,
      opacity: 0.15,
      roughness: 0.05,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.8, SALA_H), glassMat);
    glass.position.set(SALA_X, SALA_H/2, wallZ + 0.01);
    group.add(glass);

    // Luzes da cidade (atrás do vidro, muito fracas, azuladas)
    [
      { x: SALA_X - 0.6, c: 0x1a3a6a, i: 0.07 },
      { x: SALA_X + 0.5, c: 0x0a2050, i: 0.05 },
      { x: SALA_X,       c: 0x2a4a8a, i: 0.06 },
    ].forEach(({ x, c, i }) => {
      const pl = new THREE.PointLight(c, i, 4, 2);
      pl.position.set(x, SALA_H * 0.5, wallZ - 1.5);
      group.add(pl);
    });

    // Varão da cortina
    const rodMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.0, 8), rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(SALA_X, SALA_H - 0.12, wallZ + 0.06);
    group.add(rod);

    // Cortina com deslocamento de vértices (dobras de tecido)
    const curtGeo = new THREE.PlaneGeometry(1.8, 2.2, 8, 20);
    const pos = curtGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, pos.getZ(i) + Math.sin(x * 3.8) * 0.055);
    }
    pos.needsUpdate = true;
    curtGeo.computeVertexNormals();

    const curtMat = new THREE.MeshLambertMaterial({ color: 0x2D4A2D, side: THREE.DoubleSide });
    const curt = new THREE.Mesh(curtGeo, curtMat);
    curt.position.set(SALA_X, SALA_H/2 - 0.1, wallZ + 0.07);
    group.add(curt);
  }

  // ── PRATELEIRAS (parede BC — esquerda) ──
  {
    const shelfM = new THREE.MeshLambertMaterial({ color: 0x4a3010 });
    const SHELF_X = SALA_X - SALA_W/2 + 0.11; // encostadas na parede BC
    // Prateleiras 1 e 2: acima da TV (z = -1.5)
    [1.4, 1.9].forEach(sy => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 0.22), shelfM);
      shelf.position.set(SHELF_X, sy, SALA_Z - 1.5);
      shelf.rotation.y = Math.PI / 2;
      group.add(shelf);
    });
    // Prateleira 3: acima da mesa redonda (z = +1.45)
    const shelf3 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 0.22), shelfM);
    shelf3.position.set(SHELF_X, 1.4, SALA_Z + 1.45);
    shelf3.rotation.y = Math.PI / 2;
    group.add(shelf3);
    // Livros na prateleira 1 (acima da TV)
    const bookColors = [0x3a1818, 0x1a3028, 0x2a2818, 0x3a2810, 0x182830];
    bookColors.forEach((col, i) => {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.18), new THREE.MeshLambertMaterial({ color: col }));
      book.position.set(SHELF_X, 1.52, SALA_Z - 1.5 + (i - 2) * 0.12);
      book.rotation.y = Math.PI / 2;
      group.add(book);
    });
  }

  // ── ILUMINAÇÃO DA SALA ──
  {
    // Teto — fraco, TV domina
    const ceilL = new THREE.PointLight(0xFFE0B0, 0.15, 6, 2.0);
    ceilL.position.set(SALA_X, SALA_H - 0.1, SALA_Z);
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
    note.position.set(SALA_X - SALA_W/2 + 0.04, 0.75, SALA_Z - 1.5 + 0.45);
    note.rotation.y = Math.PI / 2;
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
  group.add(new THREE.AmbientLight(0xffffff, 1.2));

  // ── SPAWN ──
  group.userData.spawn         = new THREE.Vector3(SALA_X, 1.65, SALA_Z + SALA_D/2 - 0.8);
  group.userData.colliders     = colliders;
  group.userData.interactables = interactables;
  group.userData.surface       = 'wood';

  return group;
}

