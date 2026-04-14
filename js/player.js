import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Audio } from './systems/audio.js';

export class Player {
  constructor(camera, domElement) {
    this.camera   = camera;
    this.controls = new PointerLockControls(camera, domElement);

    this.velocity  = new THREE.Vector3();
    this.colliders = []; // THREE.Box3[]
    this.locked    = false;

    // Head bob
    this.bobPhase    = 0;
    this.baseY       = camera.position.y;
    this._lastBobSin = 0; // para detectar pico e tocar passo
    this.surface     = 'tile'; // atualizado pelo world

    // Move flags
    this._keys = { f:false, b:false, l:false, r:false, sneak:false };

    // Interaction raycaster
    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(), new THREE.Vector3(), 0, 2.2
    );

    this._bindKeys();
  }

  _bindKeys() {
    const k = this._keys;
    document.addEventListener('keydown', e => {
      if (document.pointerLockElement === null) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    k.f     = true; break;
        case 'KeyS': case 'ArrowDown':  k.b     = true; break;
        case 'KeyA': case 'ArrowLeft':  k.l     = true; break;
        case 'KeyD': case 'ArrowRight': k.r     = true; break;
        case 'ShiftLeft':               k.sneak = true; break;
      }
    });
    document.addEventListener('keyup', e => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    k.f     = false; break;
        case 'KeyS': case 'ArrowDown':  k.b     = false; break;
        case 'KeyA': case 'ArrowLeft':  k.l     = false; break;
        case 'KeyD': case 'ArrowRight': k.r     = false; break;
        case 'ShiftLeft':               k.sneak = false; break;
      }
    });
  }

  setLocked(locked) {
    this.locked = locked;
    if (!locked) {
      // Reset movement so player doesn't drift
      Object.keys(this._keys).forEach(k => this._keys[k] = false);
      this.velocity.set(0, 0, 0);
    }
  }

  setColliders(cols) { this.colliders = cols; }

  update(delta) {
    if (!this.locked) return;

    const k     = this._keys;
    const speed = k.sneak ? 1.5 : 3.5;

    // Build movement vector in camera space
    const fw = new THREE.Vector3();
    this.controls.getDirection(fw);
    fw.y = 0; fw.normalize();
    const rt = new THREE.Vector3().crossVectors(fw, new THREE.Vector3(0, 1, 0));

    const target = new THREE.Vector3();
    if (k.f) target.addScaledVector(fw,  speed);
    if (k.b) target.addScaledVector(fw, -speed);
    if (k.r) target.addScaledVector(rt,  speed);
    if (k.l) target.addScaledVector(rt, -speed);

    // Smooth acceleration / friction
    const accel = 14;
    const fric  = 12;
    if (target.length() > 0) {
      this.velocity.lerp(target, delta * accel);
    } else {
      this.velocity.lerp(new THREE.Vector3(), delta * fric);
    }

    // Apply movement with per-axis collision
    this._moveAxis('x', this.velocity.x * delta);
    this._moveAxis('z', this.velocity.z * delta);

    // ── Head bob + footsteps ──
    const moving = k.f || k.b || k.l || k.r;
    if (moving) {
      const freq = k.sneak ? 3.8 : 7.0;
      const amp  = k.sneak ? 0.013 : 0.026;
      this.bobPhase += delta * freq;
      const s = Math.sin(this.bobPhase);
      this.camera.position.y = this.baseY + s * amp;
      // Footstep no pico positivo do sin (a cada passada)
      if (s > 0.85 && this._lastBobSin <= 0.85) {
        Audio.footstep(this.surface);
      }
      this._lastBobSin = s;
    } else {
      this.bobPhase = 0;
      this._lastBobSin = 0;
      this.camera.position.y += (this.baseY - this.camera.position.y) * Math.min(delta * 10, 1);
    }
  }

  _moveAxis(axis, disp) {
    if (Math.abs(disp) < 1e-5) return;
    const pos  = this.camera.position;
    const next = pos.clone();
    next[axis] += disp;

    const R = 0.28; // player capsule radius
    const box = new THREE.Box3(
      new THREE.Vector3(next.x - R, next.y - 1.62, next.z - R),
      new THREE.Vector3(next.x + R, next.y + 0.10, next.z + R)
    );

    for (const col of this.colliders) {
      if (box.intersectsBox(col)) {
        this.velocity[axis] = 0;
        return;
      }
    }
    pos[axis] = next[axis];
  }

  // Returns the first interactable mesh the player is looking at
  getInteractTarget(interactables) {
    this.raycaster.set(
      this.camera.position,
      new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 2).negate()
    );
    const hits = this.raycaster.intersectObjects(interactables, true);
    return hits.length > 0 ? hits[0].object : null;
  }

  setBaseY(y) {
    this.baseY = y;
    this.camera.position.y = y;
  }
}
