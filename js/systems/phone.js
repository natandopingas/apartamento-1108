// ── PHONE APP ──
// Gerencia o conteúdo da tela do celular: home, mensagens, notas.

import { State } from './state.js';
import { Audio } from './audio.js';

const screenEl = document.getElementById('phone-screen');

// ─────────────────────────────────────────────
//  MENSAGENS (por contato)
// ─────────────────────────────────────────────

// Cada thread: array de { from:'them'|'me', text, time }
// 'unlocked' controla se aparece no app
const THREADS = {
  mae: {
    name: 'Mãe 💙',
    messages: [
      { from:'them', text:'Chegou bem no novo apartamento?', time:'17:04' },
      { from:'them', text:'Me liga quando puder! Quero saber como é o lugar 🙂', time:'17:05' },
      { from:'me',   text:'Cheguei sim. Tô organizando ainda. Te ligo depois', time:'17:48' },
      { from:'them', text:'Tudo bem? Já é tarde', time:'21:30', flag:'intercomDone' },
    ],
    unlocked: true,
  },
  daniel: {
    name: 'Daniel',
    messages: [
      { from:'them', text:'ei chegou na mudança?', time:'16:55' },
      { from:'them', text:'me fala se precisar de uma mão pra desmontar moveis', time:'16:56' },
      { from:'me',   text:'cheguei sim, mas foi tranquilo. valeu mesmo assim', time:'17:50' },
      { from:'them', text:'beleza. nova fase hein', time:'17:52' },
    ],
    unlocked: true,
  },
  desconhecido: {
    name: '+55 (11) 9????-????',
    messages: [
      { from:'them', text:'bem-vindo.', time:'20:14', flag:'intercomDone' },
    ],
    unlocked: false, // aparece só após intercomDone
    unlockFlag: 'intercomDone',
    notification: true, // dispara notificação quando unlocked
  },
};

// ─────────────────────────────────────────────
//  ESTADO INTERNO
// ─────────────────────────────────────────────

let _view = 'home'; // 'home' | 'messages' | 'thread:{id}'
let _notifQueue = [];

// ─────────────────────────────────────────────
//  API PÚBLICA
// ─────────────────────────────────────────────

export const Phone = {
  open() {
    _checkUnlocks();
    _render();
  },
  close() {
    _view = 'home';
    screenEl.innerHTML = '';
  },
  // Verifica se há novas notificações (chamado periodicamente)
  tick() {
    _checkUnlocks();
  },
};

// ─────────────────────────────────────────────
//  UNLOCK DE MENSAGENS
// ─────────────────────────────────────────────

let _notified = {};

function _checkUnlocks() {
  for (const [id, thread] of Object.entries(THREADS)) {
    if (!thread.unlocked && thread.unlockFlag && State.getFlag(thread.unlockFlag)) {
      thread.unlocked = true;
      if (thread.notification && !_notified[id]) {
        _notified[id] = true;
        _pushHUDNotif(thread.name, thread.messages.find(m => m.flag)?.text || '...');
        Audio.phonePing();
      }
    }
  }
}

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────

function _render() {
  screenEl.innerHTML = '';
  if (_view === 'home')         _renderHome();
  else if (_view === 'messages') _renderMessageList();
  else if (_view.startsWith('thread:')) _renderThread(_view.slice(7));
}

function _renderHome() {
  screenEl.style.background = '#08080f';
  screenEl.style.padding = '16px 12px';

  // Horário grande no topo
  const { h, m } = State.getTime();
  const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  const timeDiv = _el('div', {
    style: 'font-size:36px;color:#ddd;text-align:center;margin:8px 0 4px;letter-spacing:2px;font-family:"Press Start 2P",monospace',
    text: timeStr,
  });
  screenEl.appendChild(timeDiv);

  const dateDiv = _el('div', {
    style: 'font-size:6px;color:#555;text-align:center;margin-bottom:20px;font-family:"Press Start 2P",monospace;letter-spacing:1px',
    text: 'DOM, 13 ABR 2025',
  });
  screenEl.appendChild(dateDiv);

  // Grade de apps
  const grid = _el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 8px' });

  const apps = [
    { icon: '💬', label: 'Mensagens', badge: _unreadCount(), action: () => { _view='messages'; _render(); } },
    { icon: '📷', label: 'Câmera',    badge: 0,               action: () => _noApp() },
    { icon: '🗺️', label: 'Mapas',     badge: 0,               action: () => _noApp() },
    { icon: '⚙️',  label: 'Config',   badge: 0,               action: () => _noApp() },
  ];

  apps.forEach(app => {
    const tile = _el('div', {
      style: [
        'background:#101018', 'border-radius:12px', 'padding:14px 8px 10px',
        'text-align:center', 'cursor:pointer', 'position:relative',
        'transition:background 0.15s',
      ].join(';'),
    });
    tile.addEventListener('mouseenter', () => tile.style.background = '#1a1a28');
    tile.addEventListener('mouseleave', () => tile.style.background = '#101018');
    tile.addEventListener('click', app.action);

    tile.appendChild(_el('div', { style:'font-size:26px;margin-bottom:6px', text: app.icon }));
    tile.appendChild(_el('div', { style:'font-size:6px;color:#888;font-family:"Press Start 2P",monospace', text: app.label }));

    if (app.badge > 0) {
      const badge = _el('div', {
        style: 'position:absolute;top:8px;right:8px;background:#cc2222;color:#fff;font-size:6px;border-radius:50%;width:14px;height:14px;display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P",monospace',
        text: String(app.badge),
      });
      tile.appendChild(badge);
    }
    grid.appendChild(tile);
  });

  screenEl.appendChild(grid);
}

function _renderMessageList() {
  screenEl.style.background = '#0a0a12';
  screenEl.style.padding = '0';

  // Header
  const hdr = _el('div', {
    style: 'background:#111120;padding:10px 14px;font-size:8px;color:#ccc;font-family:"Press Start 2P",monospace;display:flex;align-items:center;gap:10px',
  });
  const back = _el('span', { style:'cursor:pointer;color:#4488ff', text:'‹ Voltar' });
  back.addEventListener('click', () => { _view='home'; _render(); });
  hdr.appendChild(back);
  hdr.appendChild(_el('span', { text:'Mensagens' }));
  screenEl.appendChild(hdr);

  // Lista de threads
  for (const [id, thread] of Object.entries(THREADS)) {
    if (!thread.unlocked) continue;

    // Última mensagem visível
    const visibleMsgs = thread.messages.filter(m => !m.flag || State.getFlag(m.flag));
    if (visibleMsgs.length === 0) continue;
    const last = visibleMsgs[visibleMsgs.length - 1];

    const row = _el('div', {
      style: [
        'display:flex', 'align-items:center', 'gap:12px', 'padding:12px 14px',
        'border-bottom:1px solid #1a1a28', 'cursor:pointer', 'background:#0a0a12',
      ].join(';'),
    });
    row.addEventListener('mouseenter', () => row.style.background = '#141422');
    row.addEventListener('mouseleave', () => row.style.background = '#0a0a12');
    row.addEventListener('click', () => { _view=`thread:${id}`; _render(); });

    // Avatar
    const av = _el('div', {
      style: 'width:38px;height:38px;border-radius:50%;background:#222238;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px',
      text: thread.name[0],
    });
    row.appendChild(av);

    const info = _el('div', { style:'flex:1;min-width:0' });
    info.appendChild(_el('div', {
      style: 'font-size:7px;color:#ddd;font-family:"Press Start 2P",monospace;margin-bottom:4px',
      text: thread.name,
    }));
    info.appendChild(_el('div', {
      style: 'font-size:10px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:Georgia,serif',
      text: last.text,
    }));
    row.appendChild(info);

    row.appendChild(_el('div', {
      style: 'font-size:6px;color:#444;font-family:"Press Start 2P",monospace;flex-shrink:0',
      text: last.time,
    }));

    screenEl.appendChild(row);
  }
}

function _renderThread(id) {
  const thread = THREADS[id];
  if (!thread) { _view='messages'; _render(); return; }

  screenEl.style.background = '#09090f';
  screenEl.style.padding = '0';
  screenEl.style.display = 'flex';
  screenEl.style.flexDirection = 'column';

  // Header
  const hdr = _el('div', {
    style: 'background:#111120;padding:10px 14px;font-size:7px;color:#ccc;font-family:"Press Start 2P",monospace;display:flex;align-items:center;gap:10px;flex-shrink:0',
  });
  const back = _el('span', { style:'cursor:pointer;color:#4488ff', text:'‹' });
  back.addEventListener('click', () => { _view='messages'; _render(); });
  hdr.appendChild(back);
  hdr.appendChild(_el('span', { text: thread.name }));
  screenEl.appendChild(hdr);

  // Mensagens
  const msgs = _el('div', { style:'flex:1;overflow-y:auto;padding:12px 10px;display:flex;flex-direction:column;gap:8px' });

  thread.messages.forEach(msg => {
    if (msg.flag && !State.getFlag(msg.flag)) return; // ainda não desbloqueada

    const isMe = msg.from === 'me';
    const bubble = _el('div', {
      style: [
        'max-width:80%', 'padding:8px 12px', 'border-radius:12px',
        `align-self:${isMe ? 'flex-end' : 'flex-start'}`,
        `background:${isMe ? '#1a3a6a' : '#1e1e2e'}`,
        'font-family:Georgia,serif', 'font-size:12px', 'color:#ddd',
        'line-height:1.5',
      ].join(';'),
      text: msg.text,
    });

    const timeLabel = _el('div', {
      style: `font-size:6px;color:#555;font-family:"Press Start 2P",monospace;margin-top:4px;text-align:${isMe?'right':'left'}`,
      text: msg.time,
    });

    const wrap = _el('div', { style:`display:flex;flex-direction:column;align-items:${isMe?'flex-end':'flex-start'}` });
    wrap.appendChild(bubble);
    wrap.appendChild(timeLabel);
    msgs.appendChild(wrap);
  });

  screenEl.appendChild(msgs);
  // Scroll pro final
  requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function _unreadCount() {
  let count = 0;
  for (const [id, thread] of Object.entries(THREADS)) {
    if (!thread.unlocked && thread.unlockFlag && State.getFlag(thread.unlockFlag)) count++;
  }
  return count;
}

function _noApp() {
  const msg = _el('div', {
    style: 'text-align:center;color:#444;font-size:7px;font-family:"Press Start 2P",monospace;padding:40px 20px',
    text: 'sem sinal',
  });
  screenEl.appendChild(msg);
}

function _el(tag, { style='', text='', ...attrs } = {}) {
  const el = document.createElement(tag);
  if (style) el.style.cssText = style;
  if (text)  el.textContent   = text;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

// Notificação discreta no HUD quando chega mensagem
function _pushHUDNotif(from, preview) {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'top:18px', 'left:50%', 'transform:translateX(-50%)',
    'background:rgba(8,8,18,0.92)', 'color:#ccc',
    'font-family:"Press Start 2P",monospace', 'font-size:6px', 'letter-spacing:1px',
    'padding:8px 16px 9px', 'border:1px solid #1a1a3a', 'border-radius:6px',
    'opacity:0', 'transition:opacity 0.35s', 'z-index:35', 'pointer-events:none',
    'max-width:280px', 'text-align:center',
  ].join(';');
  el.innerHTML = `<span style="color:#4488ff">💬 ${from}</span><br><span style="color:#888;font-size:9px;font-family:Georgia,serif">${preview}</span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 5000);
}
