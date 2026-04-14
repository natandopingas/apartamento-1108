// ── ELEVADOR ──
// Interior em aço escovado, painel de botões à direita, display LED laranja.

import * as THREE from 'three';

function makeSteelTex() {
  const C = document.createElement('canvas');
  C.width = 256; C.height = 512;
  const cx = C.getContext('2d');

  // Base: aço escovado claro-acinzentado
  cx.fillStyle = '#b8bcc4';
  cx.fillRect(0, 0, 256, 512);

  // Variação procedural
  const img = cx.getImageData(0, 0, 256, 512);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() - 0.5) * 20;
    d[i] = d[i+1] = d[i+2] = Math.max(140, Math.min(210, d[i] + v));
  }
  cx.putImageData(img, 0, 0);

  // Riscos verticais de escovamento (brushed steel look)
  cx.strokeStyle = 'rgba(80,85,95,0.18)';
  cx.lineWidth   = 1;
  for (let x = 0; x < 256; x += 3) {
    cx.beginPath();
    cx.moveTo(x + Math.sin(x*0.2)*1.5, 0);
    cx.lineTo(x + Math.sin(x*0.2+1)*1.5, 512);
    cx.stroke();
  }

  // Arranhões e amassados
  cx.strokeStyle = 'rgba(60,65,75,0.25)';
  cx.lineWidth = 1;
  [[40,80,90,95],[150,200,195,210],[60,320,100,315],[200,400,230,410]].forEach(([x1,y1,x2,y2]) => {
    cx.beginPath(); cx.moveTo(x1,y1); cx.lineTo(x2,y2); cx.stroke();
  });

  // Manchas de uso
  for (let i = 0; i < 6; i++) {
    cx.fillStyle = `rgba(50,55,60,${0.05 + Math.random()*0.08})`;
    cx.beginPath();
    cx.ellipse(Math.random()*256, 200+Math.random()*200, 15+Math.random()*30, 5+Math.random()*12, 0, 0, Math.PI*2);
    cx.fill();
  }

  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeFloorTex() {
  const C = document.createElement('canvas');
  C.width = C.height = 128;
  const cx = C.getContext('2d');
  cx.fillStyle = '#141416';
  cx.fillRect(0, 0, 128, 128);
  // Grade de borracha
  cx.strokeStyle = '#1e1e22';
  cx.lineWidth = 1;
  for (let i = 0; i < 128; i += 12) {
    cx.beginPath(); cx.moveTo(i,0); cx.lineTo(i,128); cx.stroke();
    cx.beginPath(); cx.moveTo(0,i); cx.lineTo(128,i); cx.stroke();
  }
  // Pontos nas interseções
  for (let x = 0; x < 128; x += 12) for (let y = 0; y < 128; y += 12) {
    cx.fillStyle = '#252528';
    cx.beginPath(); cx.arc(x,y,2,0,Math.PI*2); cx.fill();
  }
  const t = new THREE.CanvasTexture(C);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

function makePanelTex(currentFloor) {
  const C = document.createElement('canvas');
  C.width  = 256;
  C.height = 512;
  const cx = C.getContext('2d');

  // Fundo do painel
  cx.fillStyle = '#22262e';
  cx.fillRect(0, 0, 256, 512);
  cx.fillStyle = '#1a1e26';
  cx.fillRect(6, 6, 244, 500);

  // ── Display LED (topo) ──
  cx.fillStyle = '#080604';
  cx.fillRect(16, 16, 224, 80);
  cx.fillStyle = '#0f0a04';
  cx.fillRect(20, 20, 216, 72);

  // Seta de direção
  cx.fillStyle = '#FF8800';
  cx.font = '24px monospace';
  cx.textAlign = 'left';
  cx.fillText('↑', 28, 68);

  // Número do andar
  cx.font = 'bold 42px "Press Start 2P", monospace';
  cx.fillStyle = '#FF8800';
  cx.textAlign = 'center';
  cx.fillText(String(currentFloor || 'T'), 148, 72);

  // Label andar
  cx.font = '10px "Press Start 2P", monospace';
  cx.fillStyle = '#CC5500';
  cx.textAlign = 'center';
  cx.fillText(currentFloor ? `${currentFloor} ANDAR` : 'TÉRREO', 128, 88);

  // ── Grade de botões: 3 colunas × 5 linhas = 15 botões + especiais ──
  const layout = [
    [13,14,15],[10,11,12],[7,8,9],[4,5,6],[1,2,3]
  ];
  const BTN_W = 62, BTN_H = 52, GAP = 6;
  const startX = 16, startY = 112;

  layout.forEach((row, ri) => {
    row.forEach((num, ci) => {
      const bx = startX + ci*(BTN_W+GAP);
      const by = startY + ri*(BTN_H+GAP);
      const lit = num === currentFloor;

      // Botão
      cx.fillStyle = '#1c2028';
      cx.fillRect(bx, by, BTN_W, BTN_H);
      cx.fillStyle = lit ? '#FF8800' : '#2c3040';
      cx.beginPath();
      cx.arc(bx + BTN_W/2, by + BTN_H/2, 18, 0, Math.PI*2);
      cx.fill();

      // Glow se aceso
      if (lit) {
        cx.fillStyle = 'rgba(255,136,0,0.2)';
        cx.beginPath();
        cx.arc(bx + BTN_W/2, by + BTN_H/2, 26, 0, Math.PI*2);
        cx.fill();
      }

      // Número
      cx.fillStyle = lit ? '#0a0400' : '#8a9aaa';
      cx.font = '12px "Press Start 2P", monospace';
      cx.textAlign = 'center';
      cx.fillText(String(num), bx + BTN_W/2, by + BTN_H/2 + 5);
    });
  });

  // Botões especiais P, L, C
  const specials = [['T', 16], ['L', 90], ['C', 164]];
  specials.forEach(([lbl, bx]) => {
    const by = startY + 5*(BTN_H+GAP);
    cx.fillStyle = '#1c2028';
    cx.fillRect(bx, by, BTN_W, BTN_H);
    const litL = lbl === 'L' && !currentFloor;
    cx.fillStyle = litL ? '#FF8800' : '#223040';
    cx.beginPath();
    cx.arc(bx + BTN_W/2, by + BTN_H/2, 18, 0, Math.PI*2);
    cx.fill();
    cx.fillStyle = litL ? '#0a0400' : '#6a8a9a';
    cx.font = '12px "Press Start 2P", monospace';
    cx.textAlign = 'center';
    cx.fillText(lbl, bx + BTN_W/2, by + BTN_H/2 + 5);
  });

  // Botão emergência (vermelho)
  cx.fillStyle = '#1c1014';
  cx.fillRect(16, startY + 6*(BTN_H+GAP), 224, BTN_H);
  cx.fillStyle = '#CC1818';
  cx.beginPath();
  cx.arc(128, startY + 6*(BTN_H+GAP) + BTN_H/2, 18, 0, Math.PI*2);
  cx.fill();
  cx.fillStyle = '#FF4444';
  cx.font = '8px "Press Start 2P", monospace';
  cx.textAlign = 'center';
  cx.fillText('EMER', 128, startY + 6*(BTN_H+GAP) + BTN_H/2 + 4);

  return new THREE.CanvasTexture(C);
}

export function buildElevator() {
  const group = new THREE.Group();
  const colliders = [];
  const interactables = [];

  const W = 2.0, D = 2.2, H = 2.7;

  const steelTex = makeSteelTex();
  const floorTex = makeFloorTex();

  const steelMat = new THREE.MeshLambertMaterial({ map: steelTex });
  const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });

  // Piso
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI/2;
  floor.receiveShadow = true;
  group.add(floor);

  // Teto
  const ceilMat = new THREE.MeshLambertMaterial({ color: 0x2a2e34 });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI/2;
  ceil.position.y = H;
  group.add(ceil);

  // Painel fluorescente no teto
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xFFE8B0 });
  const bulb = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.3), bulbMat);
  bulb.rotation.x = Math.PI/2;
  bulb.position.set(0, H - 0.01, 0);
  group.add(bulb);

  // Luz do teto
  const ceilLight = new THREE.PointLight(0xFFDD88, 1.2, 5, 1.5);
  ceilLight.position.set(0, H - 0.1, 0);
  ceilLight.castShadow = true;
  ceilLight.shadow.mapSize.set(512, 512);
  group.add(ceilLight);
  group.userData.ceilLight = { light: ceilLight, bulb, bulbMat };

  // ── PAREDES ──
  // Parede esquerda (aço)
  const leftW = new THREE.Mesh(new THREE.PlaneGeometry(D, H), steelMat);
  leftW.rotation.y = Math.PI/2;
  leftW.position.set(-W/2, H/2, 0);
  group.add(leftW);
  colliders.push(new THREE.Box3(new THREE.Vector3(-W/2-0.1,0,-D/2), new THREE.Vector3(-W/2+0.05,H,D/2)));

  // Parede direita — onde fica o painel de controle
  const rightW = new THREE.Mesh(new THREE.PlaneGeometry(D, H), steelMat);
  rightW.rotation.y = -Math.PI/2;
  rightW.position.set(W/2, H/2, 0);
  group.add(rightW);
  colliders.push(new THREE.Box3(new THREE.Vector3(W/2-0.05,0,-D/2), new THREE.Vector3(W/2+0.1,H,D/2)));

  // Parede de fundo (aço)
  const backW = new THREE.Mesh(new THREE.PlaneGeometry(W, H), steelMat);
  backW.position.set(0, H/2, -D/2);
  group.add(backW);
  colliders.push(new THREE.Box3(new THREE.Vector3(-W/2,0,-D/2-0.1), new THREE.Vector3(W/2,H,-D/2+0.05)));

  // Parede da porta (atrás do jogador — bloqueada por colisão quando fechada)
  const frontCollider = new THREE.Box3(
    new THREE.Vector3(-W/2,0,D/2-0.05),
    new THREE.Vector3( W/2,H,D/2+0.1)
  );
  colliders.push(frontCollider);
  group.userData.frontCollider = frontCollider;

  // ── CORRIMÃO (3 paredes) ──
  const railMat = new THREE.MeshLambertMaterial({ color: 0x4a4e58 });
  const railGeo = new THREE.CylinderGeometry(0.025, 0.025, D - 0.3, 8);

  const railL = new THREE.Mesh(railGeo, railMat);
  railL.rotation.x = Math.PI/2;
  railL.position.set(-W/2 + 0.06, 0.95, 0);
  group.add(railL);

  const railR = new THREE.Mesh(railGeo, railMat);
  railR.rotation.x = Math.PI/2;
  railR.position.set(W/2 - 0.06, 0.95, 0);
  group.add(railR);

  const railGeoB = new THREE.CylinderGeometry(0.025, 0.025, W - 0.2, 8);
  const railB = new THREE.Mesh(railGeoB, railMat);
  railB.rotation.z = Math.PI/2;
  railB.position.set(0, 0.95, -D/2 + 0.06);
  group.add(railB);

  // Suportes do corrimão
  [[-W/2+0.06,0.5,-D/4],[-W/2+0.06,0.5,D/4],
   [ W/2-0.06,0.5,-D/4],[ W/2-0.06,0.5,D/4],
   [-D/4+0.1, 0.5,-D/2+0.06],[D/4-0.1,0.5,-D/2+0.06]
  ].forEach(([x,y,z]) => {
    const sup = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.48,6), railMat);
    sup.position.set(x, y, z);
    group.add(sup);
  });

  // ── PAINEL DE CONTROLE (parede direita) ──
  const panelTex = makePanelTex(11);
  const panelMat = new THREE.MeshBasicMaterial({ map: panelTex });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 1.04), panelMat);
  panel.rotation.y = -Math.PI/2;
  panel.position.set(W/2 - 0.04, 1.32, 0.2);
  panel.userData = { type: 'elevator_panel', id: 'floor_panel', label: '[E] Painel de Andares' };
  group.add(panel);
  interactables.push(panel);
  group.userData.panelMesh = panel;
  group.userData.panelTex  = panelTex;

  // ── PORTAS (frente — abrem animando) ──
  const doorMat = new THREE.MeshLambertMaterial({ map: steelTex });

  const doorL = new THREE.Mesh(new THREE.BoxGeometry(W/2, H, 0.06), doorMat);
  doorL.position.set(-W/4, H/2, D/2);
  group.add(doorL);
  group.userData.doorL = doorL;

  const doorR = new THREE.Mesh(new THREE.BoxGeometry(W/2, H, 0.06), doorMat);
  doorR.position.set( W/4, H/2, D/2);
  group.add(doorR);
  group.userData.doorR = doorR;

  // Fresta central das portas
  const seamMat = new THREE.MeshBasicMaterial({ color: 0x06080a });
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.02, H, 0.07), seamMat);
  seam.position.set(0, H/2, D/2);
  group.add(seam);
  group.userData.doorSeam = seam;

  // ── LUZ AMBIENTE ──
  group.add(new THREE.AmbientLight(0x181c22, 0.3));

  // ── SPAWN ──
  group.userData.spawn         = new THREE.Vector3(0, 1.65, D/2 - 0.7);
  group.userData.colliders     = colliders;
  group.userData.interactables = interactables;
  group.userData.surface       = 'metal';

  return group;
}

// Anima as portas: open=true as abre, open=false as fecha
export function animateElevatorDoors(group, open, progress) {
  // progress: 0=fechado, 1=aberto
  const doorL = group.userData.doorL;
  const doorR = group.userData.doorR;
  if (!doorL || !doorR) return;
  const maxSlide = 0.85;
  doorL.position.x = -0.5 - progress * maxSlide;
  doorR.position.x =  0.5 + progress * maxSlide;
  if (group.userData.frontCollider) {
    // Remove/restaura collider da frente quando aberto
    const cols = group.userData.colliders;
    const fc   = group.userData.frontCollider;
    const idx  = cols.indexOf(fc);
    if (open && progress > 0.8 && idx !== -1) cols.splice(idx, 1);
    if (!open && progress < 0.1 && idx === -1) cols.push(fc);
  }
}

// Atualiza o display do painel com o andar atual
export function updateElevatorDisplay(group, floor) {
  const panel = group.userData.panelMesh;
  if (!panel) return;
  // Recria a textura do painel com o novo andar
  panel.material.map = makePanelTex(floor);
  panel.material.map.needsUpdate = true;
}
