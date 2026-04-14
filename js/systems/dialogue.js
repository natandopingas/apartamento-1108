// ── DIALOGUE SYSTEM ──
// Shows NPC dialogue or narration at the bottom of screen.
// While active: player can look around but cannot move.

const boxEl      = document.getElementById('dialogue-box');
const speakerEl  = document.getElementById('dialogue-speaker');
const textEl     = document.getElementById('dialogue-text');
const choicesEl  = document.getElementById('dialogue-choices');

let _active   = false;
let _typeTimer = null;
let _onClose  = null;

export const Dialogue = {
  get active() { return _active; },

  // Show a single line. opts: { speaker, text, onDone }
  show(opts) {
    _active = true;
    speakerEl.textContent = opts.speaker || '';
    textEl.textContent    = '';
    choicesEl.innerHTML   = '';
    boxEl.classList.add('visible');

    _typeText(opts.text || '', () => {
      _onClose = () => {
        this.hide();
        if (opts.onDone) opts.onDone();
      };
      // Click anywhere on box to advance
      boxEl.addEventListener('click', _onClose, { once: true });
    });
  },

  // Show a sequence. lines = [{ speaker, text }], onDone called at end.
  chain(lines, onDone) {
    const run = (i) => {
      if (i >= lines.length) {
        this.hide();
        if (onDone) onDone();
        return;
      }
      this.show({ ...lines[i], onDone: () => run(i + 1) });
    };
    run(0);
  },

  // Show choices. opts: { speaker, text, choices: [{ label, onSelect }] }
  choose(opts) {
    _active = true;
    speakerEl.textContent = opts.speaker || '';
    textEl.textContent    = '';
    choicesEl.innerHTML   = '';
    boxEl.classList.add('visible');

    _typeText(opts.text || '', () => {
      (opts.choices || []).forEach((ch, i) => {
        const btn = document.createElement('button');
        btn.className   = 'choice-btn';
        btn.textContent = `${i + 1}.  ${ch.label}`;
        btn.onclick = () => {
          this.hide();
          const fn = ch.cb || ch.onSelect;
          if (fn) fn();
        };
        choicesEl.appendChild(btn);
      });
    });
  },

  hide() {
    _active = false;
    boxEl.classList.remove('visible');
    if (_typeTimer) { clearTimeout(_typeTimer); _typeTimer = null; }
    speakerEl.textContent = '';
    textEl.textContent    = '';
    choicesEl.innerHTML   = '';
    _onClose = null;
  },
};

function _typeText(text, onDone, speed = 28) {
  let i = 0;
  function tick() {
    textEl.textContent = text.slice(0, ++i);
    if (i < text.length) {
      _typeTimer = setTimeout(tick, 1000 / speed);
    } else {
      _typeTimer = null;
      if (onDone) onDone();
    }
  }
  tick();
}
