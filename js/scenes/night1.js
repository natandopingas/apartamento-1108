// ── NOITE 1 — Script de roteiro ──
//
// Distinção de responsabilidade:
//   MUNDO (timer automático): sons, notificações, pensamentos de ambiente, barulhos.
//   JOGADOR (ação): responder o interfone (E), abrir porta (E), dormir (E na cama).
//
// A progressão da história nunca avança por timer — só pelo jogador.

import { State }    from '../systems/state.js';
import { Dialogue } from '../systems/dialogue.js';
import { Thought }  from '../systems/thought.js';
import { Audio }    from '../systems/audio.js';

function G() { return window.Game; }

// ─────────────────────────────────────────────
//  INÍCIO
// ─────────────────────────────────────────────

export function startNight1() {
  State.reset();
  State.setTime(18, 30);

  // ── Corredor: pensamentos de chegada (mundo, uma vez) ──
  _watchWorld('corridor', () => {
    Thought.show('"Décimo primeiro andar. Apartamento 1108."', 3200);
    setTimeout(() => Thought.show('"Devia ter pedido ajuda pra subir essas caixas."', 3000), 4500);
  }, { once: true });

  // ── Lobby: atualiza hora ──
  _watchWorld('lobby', () => {
    if (!State.getFlag('_enteredLobby')) {
      State.setFlag('_enteredLobby', true);
      State.advanceTime(5);
    }
  }, { once: true });

  // ── Chave pega → pensamento automático (mundo reage ao evento) ──
  _watchFlag('gotKey', () => {
    State.advanceTime(3);
    Thought.show('"Chave na mão. Décimo primeiro."', 2400);
  });

  // ── Primeira entrada no apartamento → pensamentos de chegada ──
  _watchWorld('apartment', () => {
    if (State.getFlag('_enteredApt')) return;
    State.setFlag('_enteredApt', true);
    State.setTime(19, 15);
    setTimeout(() => Thought.show('"Aqui é. Apartamento 1108."', 2800), 700);
    setTimeout(() => Thought.show('"Menor do que parecia no anúncio."', 2800), 4500);
  }, { repeat: true }); // repeat pois o jogador pode sair e voltar

  // ── Depois de ler o bilhete: mundo arma o evento do interfone ──
  _watchFlag('sawNote', () => {
    State.advanceTime(5);
    State.setTime(19, 45);
    State.setFlag('tension', true);

    // Mundo: interfone toca automaticamente ~25s depois (tempo diegético: ~20min)
    setTimeout(() => {
      if (!State.getFlag('intercomDone')) {
        State.setTime(20, 12);
        State.setFlag('intercomRinging', true);
        Audio.intercomBuzz();
        _hudNotif('[ INTERFONE ]'); // indicador visual no HUD
      }
    }, 25000);
  });

  // ── Depois do interfone resolvido: barulho no teto começa (mundo, timer) ──
  _watchFlag('intercomDone', () => {
    State.setFlag('renatoVisible', true);
    State.advanceTime(15);
    State.setTime(22, 10);

    // Mundo: ruído começa após ~30s, enquanto o jogador está no apto
    setTimeout(() => {
      State.setFlag('ceilingNoiseActive', true);
      // Pensamentos ambiente disparados pelo mundo (não bloqueantes)
      _whenInWorld('apartment', () => {
        Audio.drip();
        Thought.show('"Que barulho é esse no teto?"', 2800);
        setTimeout(() => { Audio.drip(); Audio.drip(); }, 4500);
        setTimeout(() => Thought.show('"Parece arrastar. No andar de cima."', 3000), 5000);
        setTimeout(() => Audio.eerieString(), 9000);
        setTimeout(() => Thought.show('"Não tem andar de cima. Esse é o último."', 3200), 10000);
      });
    }, 30000);
  });
}

// ─────────────────────────────────────────────
//  INTERFONE — resposta do jogador (E no device)
// ─────────────────────────────────────────────

export function onIntercomInteract() {
  if (!State.getFlag('intercomRinging')) {
    // Interfone ainda não tocou
    Thought.show('"Ninguém chamou."', 1800);
    return;
  }
  if (State.getFlag('intercomDone')) {
    Thought.show('"Silêncio no interfone."', 1800);
    return;
  }

  // Para o blink
  State.setFlag('intercomRinging', false);

  Dialogue.chain([
    { speaker: '[ INTERFONE ]', text: '...' },
    { speaker: '[ INTERFONE ]', text: 'Boa noite. Tem uma entrega pra o 1108.' },
    { speaker: '[ INTERFONE ]', text: 'Deixo aqui embaixo ou o senhor desce?' },
  ], () => {
    Dialogue.choose({
      speaker: 'VOCÊ',
      text: 'O que fazer?',
      choices: [
        { label: 'Descer buscar',       cb: _respostaDescer  },
        { label: 'Pode deixar embaixo', cb: _respostaIgnorar },
      ],
    });
  });
}

// ─────────────────────────────────────────────
//  OPÇÃO A — jogador decide descer
// ─────────────────────────────────────────────

function _respostaDescer() {
  State.advanceTime(3);
  State.setFlag('deliveryPending', true);
  Thought.show('"Vou lá buscar."', 1800);

  // Mundo aguarda: quando o jogador chegar ao lobby com deliveryPending
  _watchWorld('lobby', () => {
    if (!State.getFlag('deliveryPending') || State.getFlag('_deliveryReceived')) return;
    State.setFlag('_deliveryReceived', true);
    State.setFlag('deliveryPending', false);
    _cenaEntregador();
  }, { repeat: true });
}

// ─────────────────────────────────────────────
//  OPÇÃO B — jogador ignora
// ─────────────────────────────────────────────

function _respostaIgnorar() {
  State.advanceTime(2);
  Thought.show('"Provavelmente propaganda. Esquece."', 2400);
  setTimeout(() => {
    State.setFlag('intercomDone', true);
  }, 3000);
}

// ─────────────────────────────────────────────
//  CENA DO ENTREGADOR (quando jogador chega ao lobby)
// ─────────────────────────────────────────────

function _cenaEntregador() {
  State.setTime(20, 25);
  Thought.show('"Pizza. Quem pediu pizza?"', 2400);

  setTimeout(() => {
    Dialogue.chain([
      { speaker: 'ENTREGADOR', text: 'Já tava pago. Sem gorjeta.' },
      { speaker: 'ENTREGADOR', text: 'O cara que pediu mandou um recado.' },
      { speaker: 'ENTREGADOR', text: '"Bem-vindo ao 1108."' },
    ], () => {
      State.setFlag('tension', true);
      State.setFlag('intercomDone', true);
      Thought.show('"Como alguém sabia que eu ia me mudar hoje?"', 3400);
    });
  }, 3200);
}

// ─────────────────────────────────────────────
//  TENTAR DORMIR — ação do jogador (E na cama)
// ─────────────────────────────────────────────

export function onTryToSleep() {
  if (!State.getFlag('intercomDone')) {
    Thought.show('"Ainda não é hora de dormir."', 2000);
    return;
  }
  if (State.getFlag('night1Done')) {
    Thought.show('"Já passei a noite em branco."', 2000);
    return;
  }

  State.setTime(23, 40);
  State.setFlag('tension', true);
  Thought.show('"Finalmente. Preciso descansar."', 2400);

  // Mundo: barulho no teto se ainda não foi ativado (jogador foi direto pra cama)
  if (!State.getFlag('ceilingNoiseActive')) {
    State.setFlag('ceilingNoiseActive', true);
    setTimeout(() => Thought.show('"Que barulho é esse no teto?"', 2800), 3000);
    setTimeout(() => Thought.show('"Parece arrastar. No andar de cima."', 3000), 7000);
    setTimeout(() => Thought.show('"Não tem andar de cima. Esse é o último."', 3200), 11500);
    setTimeout(() => _cenaVizinho(), 15000);
  } else {
    // Ruído já havia começado
    setTimeout(() => _cenaVizinho(), 4000);
  }
}

// ─────────────────────────────────────────────
//  CENA DA BATIDA (mundo dispara após o jogador tentar dormir)
// ─────────────────────────────────────────────

function _cenaVizinho() {
  _glitchMoment();

  setTimeout(() => {
    Thought.show('"Alguém bateu na porta."', 2600);

    setTimeout(() => {
      Dialogue.chain([
        { speaker: '[ VEM DE FORA ]', text: '...' },
        { speaker: '[ VEM DE FORA ]', text: '1  1  0  8.' },
      ], () => {
        State.setFlag('tension', true);
        Thought.show('"O número do apartamento. Em voz alta."', 3000);
        setTimeout(() => Thought.show('"Não vou abrir."', 2200), 3500);
        setTimeout(() => _fimNoite1(), 7000);
      });
    }, 2000);
  }, 700);
}

// ─────────────────────────────────────────────
//  FIM DA NOITE 1
// ─────────────────────────────────────────────

function _fimNoite1() {
  State.setFlag('night1Done', true);
  State.setTime(0, 30);
  setTimeout(() => Thought.show('"Passos se afastando."', 2400), 500);
  setTimeout(() => Thought.show('"Bom. Foi embora."', 2000), 3500);
  setTimeout(() => Thought.show('"Preciso dormir. Amanhã vejo isso."', 2800), 6500);
  setTimeout(() => {
    G().fadeOverlay(true, () => _showEndCard('NOITE 1', 'O apartamento guarda mais do que caixas.'));
  }, 10500);
}

function _showEndCard(title, subtitle) {
  const overlay = document.getElementById('fade-overlay');
  overlay.innerHTML = `
    <div style="
      position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
      text-align:center; color:#4a6a4a; font-family:'Courier New',monospace;
    ">
      <div style="font-size:11px; letter-spacing:8px; margin-bottom:18px; opacity:0.6">${title}</div>
      <div style="font-size:14px; letter-spacing:1px;">${subtitle}</div>
    </div>
  `;
  document.addEventListener('keydown', _onEndCard, { once: true });
  document.addEventListener('click',   _onEndCard, { once: true });
}

function _onEndCard() {
  document.getElementById('fade-overlay').innerHTML = '';
  G().fadeOverlay(false);
}

// ─────────────────────────────────────────────
//  UTILITÁRIOS
// ─────────────────────────────────────────────

// Observa flag → dispara callback uma vez quando ficar truthy
function _watchFlag(flag, callback) {
  const id = setInterval(() => {
    if (State.getFlag(flag)) { clearInterval(id); callback(); }
  }, 400);
}

// Observa troca de world. opts: { once, repeat }
function _watchWorld(name, callback, opts = {}) {
  let lastSeen = null;
  const id = setInterval(() => {
    const cur = window.Game?.activeWorldName;
    if (cur === name && cur !== lastSeen) {
      lastSeen = cur;
      if (opts.once) clearInterval(id);
      setTimeout(callback, 600);
    } else if (cur !== name) {
      lastSeen = cur;
    }
  }, 300);
}

// Executa callback na próxima vez que o jogador estiver em `name` (uma vez)
function _whenInWorld(name, callback) {
  _watchWorld(name, callback, { once: true });
}

// Notificação discreta no HUD (não bloqueia nada)
function _hudNotif(text) {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'bottom:88px', 'left:50%', 'transform:translateX(-50%)',
    'background:rgba(0,0,0,0.80)', 'color:#88CC88',
    'font-family:"Press Start 2P",monospace', 'font-size:7px',
    'letter-spacing:2px', 'padding:7px 16px', 'border:1px solid #2a4a2a',
    'opacity:0', 'transition:opacity 0.4s', 'z-index:25', 'pointer-events:none',
  ].join(';');
  el.textContent = text;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  // Fica visível até o jogador responder (ou 60s)
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }, 60000);
  // Guarda ref para remover quando o jogador responder
  window._intercomNotifEl = el;
}

// Remove a notificação do interfone (chamado quando jogador responde)
export function clearIntercomNotif() {
  if (window._intercomNotifEl) {
    window._intercomNotifEl.style.opacity = '0';
    setTimeout(() => window._intercomNotifEl?.remove(), 500);
    window._intercomNotifEl = null;
  }
}

// Flash VHS rápido
function _glitchMoment() {
  Audio.jumpscare();
  const overlay = document.getElementById('fade-overlay');
  overlay.style.transition = 'opacity 0.08s';
  overlay.style.opacity = '0.6';
  setTimeout(() => { overlay.style.opacity = '0'; overlay.style.transition = ''; }, 380);
}
