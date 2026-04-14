// ── AUDIO (Web Audio API, sem arquivos externos) ──

let _ctx = null;

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

function noise(duration, vol = 0.3, freq = null) {
  const ctx   = getCtx();
  const buf   = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data  = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const src  = ctx.createBufferSource();
  src.buffer = buf;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  if (freq) {
    const flt = ctx.createBiquadFilter();
    flt.type            = 'bandpass';
    flt.frequency.value = freq;
    flt.Q.value         = 0.8;
    src.connect(flt);
    flt.connect(gain);
  } else {
    src.connect(gain);
  }
  gain.connect(ctx.destination);
  src.start();
}

function tone(freq, duration, vol = 0.2, type = 'sine', fadeOut = true) {
  const ctx  = getCtx();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type            = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.01);
}

export const Audio = {
  resume() { if (_ctx) _ctx.resume(); },

  // ── Footstep sounds ──
  footstep(surface = 'tile') {
    if (surface === 'tile')     noise(0.05, 0.15, 900);
    else if (surface === 'wood') noise(0.06, 0.12, 500);
    else if (surface === 'metal') noise(0.04, 0.1, 1200);
  },

  // ── Door sounds ──
  doorCreak() { tone(180, 0.6, 0.15, 'sawtooth'); },
  doorSlam()  { noise(0.12, 0.4, 300); },
  doorLocked() { tone(220, 0.15, 0.2, 'square'); tone(180, 0.2, 0.15, 'square'); },

  // ── Elevator ──
  elevatorDing() {
    tone(880, 0.08, 0.3, 'sine', false);
    setTimeout(() => tone(1100, 0.12, 0.2), 80);
  },
  elevatorHum(start = true) {
    // handled separately as continuous loop
  },

  // ── Intercom ──
  intercomBuzz() { noise(0.3, 0.25, 400); },
  intercomStatic() { noise(0.8, 0.08, 3000); },

  // ── Jumpscare ──
  jumpscare() {
    noise(0.04, 0.9);
    setTimeout(() => noise(0.3, 0.5, 200), 40);
  },

  // ── Eerie ──
  eerieString() {
    tone(110, 3.0, 0.12, 'sawtooth');
    setTimeout(() => tone(116.5, 2.5, 0.08, 'sawtooth'), 500);
  },

  // ── Notification ──
  phoneBuzz() { noise(0.08, 0.2, 150); },
  phonePing()  { tone(1200, 0.06, 0.18, 'sine', false); setTimeout(()=>tone(900,0.08,0.12),70); },

  // ── Drip ──
  drip() {
    tone(600 + Math.random()*200, 0.08, 0.08, 'sine');
    setTimeout(() => tone(400, 0.04, 0.05, 'sine'), 60);
  },

  // ── Fluorescent buzz ──
  fluorescentBuzz() { noise(0.5, 0.04, 8000); },
};
