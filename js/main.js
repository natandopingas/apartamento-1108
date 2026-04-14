// ── MAIN — Apartamento 1108 ──
// Inicializa Three.js, PointerLockControls, VHS, worlds e game loop.

import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass }      from 'three/addons/postprocessing/ShaderPass.js';

import { Player }          from './player.js';
import { VHSShader }       from './systems/vhs.js';
import { State }           from './systems/state.js';
import { Audio }           from './systems/audio.js';
import { Dialogue }        from './systems/dialogue.js';
import { Thought }         from './systems/thought.js';

import { buildCorridor, updateCorridorLights } from './world/corridor.js';
import { buildLobby }      from './world/lobby.js';
import { buildElevator, animateElevatorDoors, updateElevatorDisplay } from './world/elevator.js';
import { buildApartment }  from './world/apartment.js';

import { NPC }             from './npcs/npc.js';
import { Phone }           from './systems/phone.js';
import { startNight1, onIntercomInteract, onTryToSleep, clearIntercomNotif } from './scenes/night1.js';

// ─────────────────────────────────────────────
//  RENDERER
// ─────────────────────────────────────────────

const container = document.getElementById('renderer-container');

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.outputColorSpace   = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// ─────────────────────────────────────────────
//  SCENE + CAMERA
// ─────────────────────────────────────────────

const scene  = new THREE.Scene();
scene.background = new THREE.Color(0x010301);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 50);
camera.position.set(0, 1.65, 0);

// ─────────────────────────────────────────────
//  POST-PROCESSING (VHS)
// ─────────────────────────────────────────────

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const vhsPass = new ShaderPass(VHSShader);
composer.addPass(vhsPass);

// ─────────────────────────────────────────────
//  PLAYER
// ─────────────────────────────────────────────

const player = new Player(camera, renderer.domElement);

// ─────────────────────────────────────────────
//  WORLDS
// ─────────────────────────────────────────────

const worlds = {
  corridor:  buildCorridor(),
  lobby:     buildLobby(),
  elevator:  buildElevator(),
  apartment: buildApartment(),
};

let activeWorldName  = null;
let activeWorld      = null;
let activeNPCs       = [];
let _prevWorldName   = null; // para saber de onde o jogador veio

function goToWorld(name) {
  // Fade in/out
  fadeOverlay(true, () => {
    if (activeWorld) scene.remove(activeWorld);

    _prevWorldName  = activeWorldName;
    activeWorldName = name;
    activeWorld     = worlds[name];
    activeNPCs      = [];
    scene.add(activeWorld);

    // Spawn
    const spawn = activeWorld.userData.spawn;
    if (spawn) {
      camera.position.copy(spawn);
      player.setBaseY(spawn.y);
    }

    // Colliders
    player.setColliders(activeWorld.userData.colliders || []);
    player.surface = activeWorld.userData.surface || 'tile';

    // Display do elevador: mostra o andar de origem
  if (name === 'elevator') {
    const fromFloor = _prevWorldName === 'lobby' ? 1 : 11;
    updateElevatorDisplay(activeWorld, fromFloor);
  }

  // Fog por cena
    const fogs = {
      corridor:  { color: 0x08100a, density: 0.02 },
      lobby:     { color: 0x0a140c, density: 0.015 },
      elevator:  { color: 0x0c1014, density: 0.025 },
      apartment: { color: 0x100c08, density: 0.018 },
    };
    const fog = fogs[name] || fogs.corridor;
    scene.fog = new THREE.FogExp2(fog.color, fog.density);

    // NPCs por cena
    setupNPCs(name);

    fadeOverlay(false);

    // Sons de ambiente
    Audio.resume();
  });
}

function setupNPCs(worldName) {
  if (worldName === 'lobby') {
    // Dona Maria atrás do balcão
    const maria = new NPC('dona_maria', {
      x: 0, z: -1.5, width: 0.85, height: 1.72,
      label: '[E] Falar com Dona Maria',
    });
    maria.addTo(activeWorld, camera);
    activeNPCs.push(maria);
    activeWorld.userData.interactables = activeWorld.userData.interactables || [];
    activeWorld.userData.interactables.push(maria.mesh);
  }
  if (worldName === 'corridor') {
    // Renato pode aparecer na porta 1106 (quando flag ativa)
    if (State.getFlag('renatoVisible')) {
      const renato = new NPC('renato', {
        x: -1.1 + 0.05, z: 4, width: 0.75, height: 1.75,
        label: '[E] Falar com Renato',
      });
      renato.addTo(activeWorld, camera);
      activeNPCs.push(renato);
    }
  }
}

// ─────────────────────────────────────────────
//  INTERAÇÃO (tecla E)
// ─────────────────────────────────────────────

const promptEl    = document.getElementById('interaction-prompt');
const crosshairEl = document.getElementById('crosshair');
const raycaster   = new THREE.Raycaster();
raycaster.far     = 2.4;

let hoveredObject = null;

function getInteractables() {
  if (!activeWorld) return [];
  return (activeWorld.userData.interactables || []).concat(activeNPCs.map(n => n.mesh));
}

function checkHover() {
  if (!player.locked) return;
  raycaster.set(camera.position,
    new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2).negate()
  );
  const hits = raycaster.intersectObjects(getInteractables(), true);
  if (hits.length > 0) {
    hoveredObject = hits[0].object;
    const label   = hoveredObject.userData.label || '';
    promptEl.textContent = label;
    promptEl.classList.add('visible');
    crosshairEl.classList.add('active');
  } else {
    hoveredObject = null;
    promptEl.classList.remove('visible');
    crosshairEl.classList.remove('active');
  }
}

document.addEventListener('keydown', e => {
  if (e.code !== 'KeyE') return;
  if (!player.locked || !hoveredObject) return;
  if (Dialogue.active) return;
  handleInteraction(hoveredObject);
});

// Celular — Tab ou ícone no HUD
document.addEventListener('keydown', e => {
  if (e.code === 'Tab') { e.preventDefault(); togglePhone(); }
}, true); // capture=true garante que intercepta antes do browser
const _phoneBtnEl = document.getElementById('phone-hud-btn');
if (_phoneBtnEl) _phoneBtnEl.addEventListener('click', () => togglePhone());

function handleInteraction(obj) {
  const { type, id, number } = obj.userData;

  switch (type) {
    case 'door': {
      if (number === 1108) {
        if (State.getFlag('gotKey')) {
          Audio.doorCreak();
          _openDoor(1108, () => goToWorld('apartment'));
        } else {
          Audio.doorLocked();
          Thought.show('"Preciso da chave."', 2200);
        }
      } else if (number === 1107) {
        Audio.doorLocked();
        Thought.show('"Ninguém respondeu."', 2000);
      } else if (number === 1106) {
        Audio.doorLocked();
        Thought.show('"1106. Do Renato."', 2200);
      } else {
        Audio.doorLocked();
        Thought.show('"Não é minha."', 1800);
      }
      break;
    }
    case 'intercom': {
      clearIntercomNotif();
      onIntercomInteract();
      break;
    }
    case 'elevator_call': {
      Audio.elevatorDing();
      goToWorld('elevator');
      break;
    }
    case 'elevator_panel': {
      Audio.elevatorDing();
      goToWorld('corridor');
      break;
    }
    case 'npc': {
      handleNPCTalk(id);
      break;
    }
    case 'tv': {
      Thought.show('"Só estática. Que barulho chato."', 2200);
      break;
    }
    case 'note': {
      if (!State.getFlag('sawNote')) {
        State.setFlag('sawNote', true);
        Dialogue.show({
          speaker: '[ BILHETE — atrás da TV ]',
          text:    '"não confie no porteiro da noite"',
          onDone:  () => Thought.show('"Porteiro da noite? Que porteiro da noite?"', 3000),
        });
        // Esconde o bilhete
        if (activeWorld.userData.noteMesh) {
          activeWorld.userData.noteMesh.visible = false;
        }
      } else {
        Thought.show('"O bilhete ainda tá lá."', 2000);
      }
      break;
    }
    case 'box': {
      Thought.show('"Ainda preciso desempacotar tudo isso."', 2400);
      break;
    }
    case 'bed': {
      onTryToSleep();
      break;
    }
    case 'wardrobe': {
      Thought.show('"Minha roupa ainda tá nas caixas."', 2000);
      break;
    }
    case 'computer': {
      Thought.show('"Sem internet ainda."', 1800);
      break;
    }
    case 'mirror': {
      Thought.show('"Parece que envelheço a cada mudança."', 2400);
      break;
    }
    case 'sink': {
      Thought.show('"Pia funcionando. Boa."', 1600);
      break;
    }
    case 'toilet': {
      Thought.show('"Pelo menos o banheiro tá ok."', 1600);
      break;
    }
    case 'shower': {
      Thought.show('"Um banho seria bom."', 1800);
      break;
    }
    case 'cctv': {
      Thought.show('"Tem algo estranho na tela desse monitor."', 2400);
      break;
    }
  }
}

function handleNPCTalk(id) {
  if (id === 'dona_maria') {
    if (!State.getFlag('metMaria')) {
      State.setFlag('metMaria', true);
      Dialogue.chain([
        { speaker: 'DONA MARIA', text: 'Boa tarde. Apartamento 1108?' },
        { speaker: 'DONA MARIA', text: 'Aqui está sua chave. Já pagou a taxa de condomínio?' },
        { speaker: 'DONA MARIA', text: 'Pergunto porque já venci avisar. Não pergunto duas vezes.' },
      ], () => {
        State.setFlag('gotKey', true);
        Thought.show('"Simpática a senhora."', 2200);
      });
    } else if (State.getFlag('gotKey')) {
      Dialogue.show({ speaker: 'DONA MARIA', text: 'Elevadores estão à direita. Décimo primeiro andar.' });
    }
  }
  if (id === 'renato') {
    Dialogue.chain([
      { speaker: 'RENATO', text: 'Ah, você é o novo do 1108.' },
      { speaker: 'RENATO', text: 'Legal. Bem-vindo.' },
    ]);
  }
}

// ─────────────────────────────────────────────
//  ANIMAÇÃO DE PORTA
// ─────────────────────────────────────────────

function _openDoor(number, onDone) {
  const pivots = activeWorld?.userData.doorPivots;
  if (!pivots || !pivots[number]) { if (onDone) onDone(); return; }
  const pd = pivots[number];
  if (pd.isOpen) { if (onDone) onDone(); return; }
  pd.isOpen = true;
  pd.onDone = onDone || null;
  // Remove o collider da porta (o array é mutável)
  // A parede já existe; só precisamos deixar o jogador passar após a animação.
}

// ─────────────────────────────────────────────
//  CELULAR
// ─────────────────────────────────────────────

const phoneOverlay = document.getElementById('phone-overlay');
const phoneTimeEl  = document.getElementById('phone-time');
let phoneOpen      = false;
let _phoneOpening  = false; // impede lock screen de aparecer ao abrir celular

function togglePhone() {
  phoneOpen = !phoneOpen;
  phoneOverlay.classList.toggle('visible', phoneOpen);
  if (phoneOpen) {
    _phoneOpening = true;
    document.exitPointerLock();
    Phone.open();
  } else {
    Phone.close();
    // Retoma pointer lock automaticamente ao fechar
    setTimeout(() => renderer.domElement.requestPointerLock(), 80);
  }
}

document.getElementById('phone-home-btn').addEventListener('click', () => {
  togglePhone();
});

// ─────────────────────────────────────────────
//  LOCK SCREEN
// ─────────────────────────────────────────────

const lockScreen  = document.getElementById('lock-screen');
const titleScreen = document.getElementById('title-screen');

function _startGame() {
  lockScreen.classList.add('hidden');
  player.setLocked(true);
  Audio.resume();
}

// Um único clique: título → tenta pointer lock → começa de qualquer jeito
titleScreen.addEventListener('click', () => {
  titleScreen.classList.add('hidden');
  setTimeout(() => { titleScreen.style.display = 'none'; }, 1300);

  // Tenta pointer lock; se falhar em 600ms, começa sem ele
  let started = false;
  function tryStart() {
    if (started) return;
    started = true;
    _startGame();
  }

  try {
    const req = renderer.domElement.requestPointerLock();
    if (req && typeof req.then === 'function') {
      req.then(tryStart).catch(tryStart);
    }
  } catch(e) {}

  // Fallback: se pointer lock não disparar em 600ms, começa mesmo assim
  setTimeout(tryStart, 600);
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === renderer.domElement;
  if (locked) {
    lockScreen.classList.add('hidden');
    player.setLocked(true);
    Audio.resume();
  } else {
    if (_phoneOpening) {
      // Celular abrindo — não mostra lock screen
      _phoneOpening = false;
      return;
    }
    if (player.locked) {
      player.setLocked(false);
      lockScreen.classList.remove('hidden');
    }
  }
});

// Clique no lock screen retoma o jogo
lockScreen.addEventListener('click', () => {
  if (!phoneOpen) renderer.domElement.requestPointerLock();
});

// ─────────────────────────────────────────────
//  FADE OVERLAY
// ─────────────────────────────────────────────

const fadeEl = document.getElementById('fade-overlay');
function fadeOverlay(fadeIn, callback) {
  fadeEl.style.transition = `opacity ${fadeIn ? 0.45 : 0.55}s`;
  fadeEl.style.opacity    = fadeIn ? '1' : '0';
  if (callback) {
    const delay = fadeIn ? 460 : 0;
    setTimeout(callback, delay);
  }
}

// ─────────────────────────────────────────────
//  CLOCK HUD
// ─────────────────────────────────────────────

const clockEl = document.getElementById('clock');
function updateClockDisplay() {
  const { h, m } = State.getTime();
  const str = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  clockEl.textContent = str;
  phoneTimeEl.textContent = str;
}

// ─────────────────────────────────────────────
//  RESIZE
// ─────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────
//  GAME LOOP
// ─────────────────────────────────────────────

const clock = new THREE.Clock();
let   time  = 0;

let   elevDoorProgress = 0;
let   elevDoorTarget   = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  time += delta;

  // Player movement
  player.update(delta);

  // NPCs (lookAt camera)
  activeNPCs.forEach(npc => npc.update());

  // Hover check
  checkHover();

  // Corridor lights flicker
  if (activeWorldName === 'corridor') {
    updateCorridorLights(activeWorld, time);

    // Animação de abertura de portas
    const pivots = activeWorld.userData.doorPivots;
    if (pivots) {
      for (const pd of Object.values(pivots)) {
        if (!pd.isOpen || pd.progress >= 1) continue;
        pd.progress = Math.min(1, pd.progress + delta * 2.2);
        // ease-out suave
        const t = 1 - Math.pow(1 - pd.progress, 3);
        pd.pivot.rotation.y = pd.openDir * t;
        if (pd.progress >= 1 && pd.onDone) {
          const cb = pd.onDone;
          pd.onDone = null;
          cb();
        }
      }
    }
  }

  // Elevator doors
  if (activeWorldName === 'elevator') {
    elevDoorProgress += (elevDoorTarget - elevDoorProgress) * Math.min(delta * 3, 1);
    animateElevatorDoors(activeWorld, elevDoorTarget > 0.5, elevDoorProgress);
    // TV static flicker on panel
    const ceilLightData = activeWorld.userData.ceilLight;
    if (ceilLightData) {
      const fl = 0.95 + Math.sin(time * 60) * 0.05;
      ceilLightData.light.intensity = 1.2 * fl;
    }
  }

  // Apartment: TV static canvas animation (a cada 4 frames)
  if (activeWorldName === 'apartment' && activeWorld.userData.tvStaticCtx) {
    if (Math.floor(time * 60) % 4 === 0) {
      const ctx = activeWorld.userData.tvStaticCtx;
      const W = 64, H = 48;
      const img = ctx.createImageData(W, H);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255 | 0;
        img.data[i] = img.data[i+1] = img.data[i+2] = v;
        img.data[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      activeWorld.userData.tvStaticTex.needsUpdate = true;
    }
  }

  // Intercom blink quando chamando
  if (activeWorldName === 'apartment' && activeWorld.userData.intercomScreenMat) {
    const ringing = State.getFlag('intercomRinging');
    const mat = activeWorld.userData.intercomScreenMat;
    if (ringing) {
      // Pisca entre verde e branco a ~1Hz
      const on = Math.sin(time * Math.PI * 2) > 0;
      mat.color.setHex(on ? 0x55ff55 : 0x112211);
    } else {
      mat.color.setHex(0x224422); // idle
    }
  }

  // Curtains sway
  if (activeWorldName === 'apartment' && activeWorld.userData.curtL) {
    const sway = Math.sin(time * 0.5) * 0.015;
    activeWorld.userData.curtL.rotation.z =  sway;
    activeWorld.userData.curtR.rotation.z = -sway;
  }

  // VHS shader
  vhsPass.uniforms.time.value    = time;
  vhsPass.uniforms.tension.value = State.getFlag('tension') ? 1.0 : 0.0;

  // Clock display
  updateClockDisplay();

  // Phone: checa unlocks a cada ~2s
  if (Math.floor(time * 0.5) !== Math.floor((time - delta) * 0.5)) {
    Phone.tick();
  }

  composer.render();
}

// ─────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────

// Mundo inicial — pode ser sobrescrito por ?mundo= na URL
const _validWorlds = ['corridor', 'lobby', 'elevator', 'apartment'];
const _urlMundo = new URLSearchParams(window.location.search).get('mundo');
const _startWorld = _validWorlds.includes(_urlMundo) ? _urlMundo : 'corridor';

goToWorld(_startWorld);
animate();
startNight1();

// Exporta para uso externo (scripts de roteiro)
window.Game = {
  goToWorld,
  player,
  State,
  Dialogue,
  Thought,
  Audio,
  fadeOverlay,
  setElevatorDoors: (open) => { elevDoorTarget = open ? 1 : 0; },
  get activeWorldName() { return activeWorldName; },
};
