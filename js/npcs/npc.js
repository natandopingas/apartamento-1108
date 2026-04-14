// ── NPC BILLBOARD SPRITES ──
// Cada NPC é um PlaneGeometry vertical que sempre encara o jogador (lookAt).
// A textura é gerada via canvas, fiel às imagens de referência.

import * as THREE from 'three';

// ── GERADOR DE TEXTURAS NPC ──

function makeNPCCanvas(drawFn, w = 256, h = 512) {
  const C  = document.createElement('canvas');
  C.width  = w;
  C.height = h;
  const cx = C.getContext('2d');
  drawFn(cx, w, h);
  return C;
}

// Dona Maria — uniforme azul escuro, óculos, crachá, cabelo cacheado
function drawDonaMaria(cx, W, H) {
  // Corpo / uniforme azul escuro
  cx.fillStyle = '#1a2848';
  cx.fillRect(W*0.18, H*0.4, W*0.64, H*0.55);
  // Pescoço
  cx.fillStyle = '#c89870';
  cx.fillRect(W*0.4, H*0.3, W*0.2, H*0.12);
  // Cabeça
  cx.fillStyle = '#c89870';
  cx.beginPath();
  cx.ellipse(W/2, H*0.26, W*0.18, H*0.14, 0, 0, Math.PI*2);
  cx.fill();
  // Cabelo cacheado (escuro, volumoso)
  cx.fillStyle = '#1a0e0e';
  cx.beginPath();
  cx.ellipse(W/2, H*0.21, W*0.22, H*0.16, 0, 0, Math.PI*2);
  cx.fill();
  // Cachos laterais
  cx.beginPath(); cx.ellipse(W*0.3, H*0.25, W*0.07, H*0.08, -0.3, 0, Math.PI*2); cx.fill();
  cx.beginPath(); cx.ellipse(W*0.7, H*0.25, W*0.07, H*0.08,  0.3, 0, Math.PI*2); cx.fill();
  // Óculos
  cx.strokeStyle = '#2a1a08'; cx.lineWidth = 3;
  cx.strokeRect(W*0.34, H*0.255, W*0.14, H*0.07);
  cx.strokeRect(W*0.52, H*0.255, W*0.14, H*0.07);
  cx.beginPath(); cx.moveTo(W*0.48, H*0.285); cx.lineTo(W*0.52, H*0.285); cx.stroke();
  // Olhos
  cx.fillStyle = '#0a0a0a';
  cx.fillRect(W*0.37, H*0.268, W*0.07, H*0.04);
  cx.fillRect(W*0.55, H*0.268, W*0.07, H*0.04);
  // Expressão séria — boca fina
  cx.strokeStyle = '#a06050'; cx.lineWidth = 2;
  cx.beginPath(); cx.moveTo(W*0.42, H*0.31); cx.lineTo(W*0.58, H*0.31); cx.stroke();
  // Crachá
  cx.fillStyle = '#cc1818';
  cx.fillRect(W*0.38, H*0.52, W*0.24, H*0.08);
  cx.fillStyle = '#fff';
  cx.font = '8px "Press Start 2P", monospace';
  cx.textAlign = 'center';
  cx.fillText('Res', W/2, H*0.555);
  cx.fillText('Nobre', W/2, H*0.575);
  // Chaves na mão
  cx.fillStyle = '#aa8030';
  cx.fillRect(W*0.3, H*0.88, W*0.08, H*0.03);
  cx.beginPath();
  cx.arc(W*0.31, H*0.87, W*0.03, 0, Math.PI*2);
  cx.strokeStyle = '#aa8030'; cx.lineWidth = 3; cx.stroke();
}

// João — porteiro grande, braços cruzados, expressão raivosa
function drawJoao(cx, W, H) {
  // Corpo largo
  cx.fillStyle = '#1a2848';
  cx.fillRect(W*0.10, H*0.38, W*0.80, H*0.58);
  // Braços cruzados
  cx.fillStyle = '#1a2848';
  cx.fillRect(W*0.06, H*0.42, W*0.32, H*0.20);
  cx.fillRect(W*0.62, H*0.42, W*0.32, H*0.20);
  // Pescoço
  cx.fillStyle = '#6a4830';
  cx.fillRect(W*0.38, H*0.3, W*0.24, H*0.1);
  // Cabeça
  cx.fillStyle = '#6a4830';
  cx.beginPath();
  cx.ellipse(W/2, H*0.25, W*0.22, H*0.16, 0, 0, Math.PI*2);
  cx.fill();
  // Cabelo branco (raspado)
  cx.fillStyle = '#d8d8d8';
  cx.beginPath();
  cx.ellipse(W/2, H*0.19, W*0.22, H*0.08, 0, 0, Math.PI*2);
  cx.fill();
  // Sobrancelhas pesadas (franzidas)
  cx.strokeStyle = '#1a0a04'; cx.lineWidth = 4;
  cx.beginPath(); cx.moveTo(W*0.32, H*0.228); cx.lineTo(W*0.46, H*0.238); cx.stroke();
  cx.beginPath(); cx.moveTo(W*0.54, H*0.238); cx.lineTo(W*0.68, H*0.228); cx.stroke();
  // Olhos (duros)
  cx.fillStyle = '#1a0a04';
  cx.fillRect(W*0.34, H*0.245, W*0.11, H*0.04);
  cx.fillRect(W*0.55, H*0.245, W*0.11, H*0.04);
  // Barba
  cx.fillStyle = '#444440';
  cx.beginPath();
  cx.ellipse(W/2, H*0.31, W*0.15, H*0.06, 0, 0, Math.PI);
  cx.fill();
  // Boca (fechada, dura)
  cx.strokeStyle = '#3a1a0a'; cx.lineWidth = 2;
  cx.beginPath(); cx.moveTo(W*0.40, H*0.30); cx.lineTo(W*0.60, H*0.30); cx.stroke();
  // Crachá
  cx.fillStyle = '#cc1818';
  cx.fillRect(W*0.38, H*0.50, W*0.24, H*0.08);
  cx.fillStyle = '#fff'; cx.font = '8px monospace'; cx.textAlign = 'center';
  cx.fillText('Res', W/2, H*0.535); cx.fillText('Nobre', W/2, H*0.555);
}

// Joaquim — porteiro idoso, óculos redondos, expressão triste/assustada
function drawJoaquim(cx, W, H) {
  cx.fillStyle = '#1a2848';
  cx.fillRect(W*0.20, H*0.40, W*0.60, H*0.56);
  cx.fillStyle = '#c8a080';
  cx.fillRect(W*0.40, H*0.32, W*0.20, H*0.1);
  // Cabeça (mais fina, idoso)
  cx.fillStyle = '#c8a080';
  cx.beginPath();
  cx.ellipse(W/2, H*0.26, W*0.16, H*0.14, 0, 0, Math.PI*2);
  cx.fill();
  // Cabelo branco fino
  cx.fillStyle = '#e0ddd8';
  cx.beginPath();
  cx.ellipse(W/2, H*0.2, W*0.17, H*0.07, 0, 0, Math.PI*2);
  cx.fill();
  // Óculos redondos
  cx.strokeStyle = '#1a1208'; cx.lineWidth = 3;
  cx.beginPath(); cx.arc(W*0.42, H*0.265, W*0.07, 0, Math.PI*2); cx.stroke();
  cx.beginPath(); cx.arc(W*0.58, H*0.265, W*0.07, 0, Math.PI*2); cx.stroke();
  cx.beginPath(); cx.moveTo(W*0.49, H*0.265); cx.lineTo(W*0.51, H*0.265); cx.stroke();
  // Olhos preocupados (azulados, olhando para cima)
  cx.fillStyle = '#6080a0';
  cx.beginPath(); cx.arc(W*0.42, H*0.26, W*0.04, 0, Math.PI*2); cx.fill();
  cx.beginPath(); cx.arc(W*0.58, H*0.26, W*0.04, 0, Math.PI*2); cx.fill();
  // Barba branca
  cx.fillStyle = '#d8d4cc';
  cx.beginPath();
  cx.ellipse(W/2, H*0.31, W*0.12, H*0.05, 0, 0, Math.PI);
  cx.fill();
  // Boca levemente aberta (preocupado)
  cx.strokeStyle = '#a06040'; cx.lineWidth = 2;
  cx.beginPath(); cx.moveTo(W*0.43, H*0.308); cx.quadraticCurveTo(W/2, H*0.32, W*0.57, H*0.308); cx.stroke();
  // Crachá
  cx.fillStyle = '#cc1818';
  cx.fillRect(W*0.38, H*0.52, W*0.24, H*0.08);
  cx.fillStyle = '#fff'; cx.font = '8px monospace'; cx.textAlign = 'center';
  cx.fillText('Res', W/2, H*0.555); cx.fillText('Nobre', W/2, H*0.575);
  // Chaves
  cx.fillStyle = '#aa8030';
  cx.fillRect(W*0.42, H*0.86, W*0.08, H*0.03);
  cx.beginPath(); cx.arc(W*0.44, H*0.86, W*0.025, 0, Math.PI*2);
  cx.strokeStyle = '#aa8030'; cx.lineWidth = 2.5; cx.stroke();
}

// Renato (vizinho 1106) — jovem, camiseta listrada, olheiras
function drawRenato(cx, W, H) {
  // Calça preta
  cx.fillStyle = '#1a1820';
  cx.fillRect(W*0.22, H*0.6, W*0.56, H*0.4);
  // Camiseta listrada preta e branca
  const stripeH = H * 0.04;
  for (let s = 0; s < 12; s++) {
    cx.fillStyle = s%2===0 ? '#e8e8e8' : '#141418';
    cx.fillRect(W*0.15, H*0.38+s*stripeH, W*0.70, stripeH);
  }
  // Clip para não passar da roupa
  cx.fillStyle = '#141418';
  cx.fillRect(0, H*0.38, W*0.15, H*0.36);
  cx.fillRect(W*0.85, H*0.38, W*0.15, H*0.36);
  // Pescoço
  cx.fillStyle = '#b08060';
  cx.fillRect(W*0.41, H*0.33, W*0.18, H*0.07);
  // Cabeça
  cx.fillStyle = '#b08060';
  cx.beginPath();
  cx.ellipse(W/2, H*0.26, W*0.16, H*0.13, 0, 0, Math.PI*2);
  cx.fill();
  // Cabelo escuro (bagunçado)
  cx.fillStyle = '#0e0a08';
  cx.beginPath();
  cx.ellipse(W/2, H*0.21, W*0.18, H*0.10, 0, 0, Math.PI*2);
  cx.fill();
  // Olheiras pesadas
  cx.fillStyle = '#3a2818';
  cx.fillRect(W*0.34, H*0.253, W*0.12, H*0.025);
  cx.fillRect(W*0.54, H*0.253, W*0.12, H*0.025);
  // Olhos vazios
  cx.fillStyle = '#1a1208';
  cx.fillRect(W*0.36, H*0.262, W*0.09, H*0.030);
  cx.fillRect(W*0.55, H*0.262, W*0.09, H*0.030);
  // Expressão plana
  cx.strokeStyle = '#704030'; cx.lineWidth = 1.5;
  cx.beginPath(); cx.moveTo(W*0.41, H*0.30); cx.lineTo(W*0.59, H*0.30); cx.stroke();
  // Tênis preto
  cx.fillStyle = '#0e0c0e';
  cx.fillRect(W*0.22, H*0.95, W*0.24, H*0.05);
  cx.fillRect(W*0.54, H*0.95, W*0.24, H*0.05);
}

// Síndico Edílson — gordo, sorriso sinistro, pasta + chaves
function drawEdilson(cx, W, H) {
  // Corpo largo
  cx.fillStyle = '#1a2848';
  cx.fillRect(W*0.08, H*0.38, W*0.84, H*0.58);
  cx.fillStyle = '#c8a068';
  cx.fillRect(W*0.36, H*0.30, W*0.28, H*0.1);
  // Cabeça (redonda, mais larga)
  cx.fillStyle = '#c8a068';
  cx.beginPath();
  cx.ellipse(W/2, H*0.24, W*0.24, H*0.16, 0, 0, Math.PI*2);
  cx.fill();
  // Cabelo castanho escuro
  cx.fillStyle = '#3a2010';
  cx.beginPath();
  cx.ellipse(W/2, H*0.19, W*0.24, H*0.09, 0, 0, Math.PI*2);
  cx.fill();
  // Sobrancelhas semi-baixas (jeito de safado)
  cx.fillStyle = '#2a1808';
  cx.fillRect(W*0.32, H*0.225, W*0.14, H*0.022);
  cx.fillRect(W*0.54, H*0.225, W*0.14, H*0.022);
  // Olhos semicerrados
  cx.fillStyle = '#1a0c04';
  cx.fillRect(W*0.34, H*0.245, W*0.12, H*0.030);
  cx.fillRect(W*0.54, H*0.245, W*0.12, H*0.030);
  // Sorriso largo (sinistro)
  cx.strokeStyle = '#804030'; cx.lineWidth = 2.5;
  cx.beginPath();
  cx.moveTo(W*0.38, H*0.295);
  cx.quadraticCurveTo(W/2, H*0.325, W*0.62, H*0.295);
  cx.stroke();
  cx.fillStyle = '#2a0a0a';
  cx.fillRect(W*0.40, H*0.296, W*0.20, H*0.02);
  // Crachá
  cx.fillStyle = '#cc1818';
  cx.fillRect(W*0.38, H*0.50, W*0.28, H*0.08);
  cx.fillStyle = '#fff'; cx.font = '7px monospace'; cx.textAlign = 'center';
  cx.fillText('Síndico', W/2, H*0.535); cx.fillText('Nobre', W/2, H*0.556);
  // Pasta azul
  cx.fillStyle = '#1a2850';
  cx.fillRect(W*0.14, H*0.55, W*0.32, H*0.26);
  cx.fillStyle = '#2a3870'; cx.fillRect(W*0.16,H*0.57,W*0.28,H*0.22);
  // Chaves
  cx.fillStyle = '#aa8030';
  cx.fillRect(W*0.52, H*0.78, W*0.08, H*0.04);
}

// Mapeia nome → função de desenho
const DRAW_FUNCS = {
  'dona_maria': drawDonaMaria,
  'joao':       drawJoao,
  'joaquim':    drawJoaquim,
  'renato':     drawRenato,
  'edilson':    drawEdilson,
};

// ── CLASSE NPC ──

export class NPC {
  constructor(name, opts = {}) {
    const fn = DRAW_FUNCS[name];
    if (!fn) throw new Error(`NPC desconhecido: ${name}`);

    const canvas = makeNPCCanvas(fn, 256, 512);
    const tex    = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;

    const mat  = new THREE.MeshBasicMaterial({
      map:         tex,
      transparent: true,
      alphaTest:   0.05,
      depthWrite:  false,
    });
    const geo  = new THREE.PlaneGeometry(opts.width || 0.9, opts.height || 1.85);
    this.mesh  = new THREE.Mesh(geo, mat);
    this.mesh.position.set(
      opts.x || 0,
      (opts.height || 1.85) / 2 + 0.05,
      opts.z || 0
    );
    this.mesh.userData = {
      type:  'npc',
      id:    name,
      label: opts.label || `[E] Falar com ${name}`,
    };

    this.name    = name;
    this._camera = null;
  }

  // Adiciona ao grupo e registra a câmera para lookAt
  addTo(group, camera) {
    group.add(this.mesh);
    this._camera = camera;
    return this;
  }

  // Chama a cada frame para o sprite encarar o jogador
  update() {
    if (!this._camera) return;
    const pos = this._camera.position.clone();
    pos.y     = this.mesh.position.y; // só gira no eixo Y
    this.mesh.lookAt(pos);
  }
}
