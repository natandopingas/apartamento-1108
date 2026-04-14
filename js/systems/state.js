// ── GLOBAL STATE ──
const SAVE_KEY = 'ap1108_v2';

const defaults = {
  scene: 'corridor',
  time: { h: 16, m: 10 },
  flags: {},
  playerName: '',
};

let _s = JSON.parse(JSON.stringify(defaults));

try {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) _s = Object.assign(_s, JSON.parse(saved));
} catch(e) {}

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(_s)); } catch(e) {}
}

export const State = {
  get scene()      { return _s.scene; },
  set scene(v)     { _s.scene = v; save(); },

  getTime()        { return { ..._s.time }; },
  setTime(h, m)    { _s.time = { h: h|0, m: m|0 }; save(); },
  advanceTime(min) {
    _s.time.m += min;
    while (_s.time.m >= 60) { _s.time.m -= 60; _s.time.h++; }
    if (_s.time.h >= 24) _s.time.h -= 24;
    save();
  },

  getFlag(k)       { return _s.flags[k] !== undefined ? _s.flags[k] : false; },
  setFlag(k, v)    { _s.flags[k] = v; save(); },
  toggleFlag(k)    { _s.flags[k] = !_s.flags[k]; save(); },

  get playerName() { return _s.playerName; },
  set playerName(v){ _s.playerName = v; save(); },

  reset() {
    _s = JSON.parse(JSON.stringify(defaults));
    localStorage.removeItem(SAVE_KEY);
  },
};
