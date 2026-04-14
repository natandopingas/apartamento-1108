// ── THOUGHT BUBBLE ──
// Shows internal player thoughts (italic text, center screen, auto-fade)

const bubbleEl = document.getElementById('thought-bubble');
const textEl   = document.getElementById('thought-text');

let _timer = null;

export const Thought = {
  show(text, duration = 3200) {
    if (_timer) clearTimeout(_timer);
    textEl.textContent = '';
    bubbleEl.classList.remove('visible');

    // Small delay so fade-in triggers
    requestAnimationFrame(() => {
      textEl.textContent = text;
      bubbleEl.classList.add('visible');
      _timer = setTimeout(() => this.hide(), duration);
    });
  },

  hide() {
    bubbleEl.classList.remove('visible');
    if (_timer) { clearTimeout(_timer); _timer = null; }
  },
};
