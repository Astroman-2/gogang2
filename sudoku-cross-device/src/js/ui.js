// ui.js — Full UI + multiplayer orchestration
const UI = (() => {
  // ── App state ──────────────────────────────────
  let _mode = 'solo';
  let _diff = 'easy';
  let _myPi = 0;          // my player index
  let _isHost = false;
  let _pendingRoom = null; // room code we're joining

  // ── Local stats ────────────────────────────────
  const Stats = {
    get() { try { return JSON.parse(localStorage.getItem('sdku_stats')||'{"p":0,"w":0,"b":null}'); } catch{ return{p:0,w:0,b:null}; } },
    save(s) { localStorage.setItem('sdku_stats', JSON.stringify(s)); },
    record(won, t) { const s=this.get(); s.p++; if(won){s.w++; if(!s.b||t<s.b)s.b=t;} this.save(s); }
  };

  // ── Screens ────────────────────────────────────
  function _show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function goHome() {
    Realtime.disconnect();
    Game.stopTimer();
    _show('screen-home');
    _loadStats();
  }

  function _loadStats() {
    const s = Stats.get();
    document.getElementById('hs-played').textContent = s.p;
    document.getElementById('hs-won').textContent = s.w;
    document.getElementById('hs-best').textContent = s.b ? Game.fmt(s.b) : '--';
  }

  function goSetup(mode) {
    _mode = mode;
    Realtime.disconnect();

    document.getElementById('setup-title').textContent =
      mode === 'solo' ? 'Solo Setup' :
      mode === 'versus' ? '1v1 Live Setup' : 'Co-op Setup';

    // Reset diff
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.seg-btn[data-d="easy"]').classList.add('active');
    _diff = 'easy';

    // Name fields
    const nb = document.getElementById('name-block');
    if (mode === 'solo') {
      nb.innerHTML = `
        <label class="form-label">Your name</label>
        <input id="inp-p1" class="player-name-input" maxlength="16" value="Player 1" placeholder="Your name" />`;
    } else {
      nb.innerHTML = `
        <label class="form-label">Player names</label>
        <span class="name-label">You</span>
        <input id="inp-p1" class="player-name-input" maxlength="16" value="Player 1" />
        <span class="name-label">Opponent ${mode==='versus'?'(other device)':''}</span>
        <input id="inp-p2" class="player-name-input" maxlength="16" value="Player 2" />`;
    }

    // Room block
    const rb = document.getElementById('room-block');
    if (mode !== 'solo') {
      rb.style.display = 'block';
      const code = Realtime.generateCode();
      document.getElementById('room-code-display').textContent = code.split('').join(' ');
      _pendingRoom = code;
      _isHost = true;
      document.getElementById('join-input').value = '';
      _setSetupDot('wait', 'Waiting for opponent…');
      _enableStart(false);

      // Wire up sync status callbacks for setup screen
      Realtime.onStatus((status, detail) => {
        if (status === 'connected') {
          _setSetupDot('ok', 'Opponent connected!');
          _enableStart(true);
        } else if (status === 'connecting') {
          _setSetupDot('wait', detail || 'Connecting…');
          _enableStart(false);
        } else if (status === 'error') {
          _setSetupDot('err', detail || 'Connection error');
          _enableStart(false);
        }
      });

      Realtime.onPeer((event) => {
        if (event === 'joined') {
          _setSetupDot('ok', 'Opponent connected! Ready to start.');
          _enableStart(true);
          toast('Opponent joined!', 'green');
        }
        if (event === 'left') {
          _setSetupDot('wait', 'Opponent disconnected');
          _enableStart(false);
        }
      });

      Realtime.onMessage((data) => {
        // On setup screen the guest might receive a game_start from host
        if (data.type === 'game_start') {
          _receiveGameStart(data);
        }
      });

      // Host opens the room immediately
      Realtime.host(code);
    } else {
      rb.style.display = 'none';
      _enableStart(true);
    }

    _show('screen-setup');
  }

  function setDiff(btn) {
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _diff = btn.dataset.d;
  }

  function joinRoom() {
    const code = (document.getElementById('join-input').value || '').toUpperCase().replace(/\s/g,'').trim();
    if (code.length !== 4) { toast('Enter a 4-letter code', 'red'); return; }

    _pendingRoom = code;
    _isHost = false;

    // Update host panel display
    document.getElementById('room-code-display').textContent = code.split('').join(' ');
    _setSetupDot('wait', 'Connecting to room ' + code + '…');
    _enableStart(false);

    Realtime.onStatus((status, detail) => {
      if (status === 'connected') {
        _setSetupDot('ok', 'Connected! Waiting for host to start…');
        // Don't enable start for guest — host starts the game
      } else if (status === 'connecting') {
        _setSetupDot('wait', detail || 'Connecting…');
      } else if (status === 'error') {
        _setSetupDot('err', detail || 'Room not found');
      }
    });

    Realtime.onPeer((event) => {
      if (event === 'joined') {
        _setSetupDot('ok', 'Connected to host!');
        toast('Connected!', 'green');
      }
    });

    Realtime.onMessage((data) => {
      if (data.type === 'game_start') {
        _receiveGameStart(data);
      }
    });

    Realtime.join(code);
  }

  // ── Guest receives game_start from host ────────
  function _receiveGameStart(data) {
    _myPi = 1;
    const p1name = document.getElementById('inp-p1')?.value || 'Player 1';
    const p2name = document.getElementById('inp-p2')?.value || 'Player 2';
    _diff = data.diff || _diff;

    const players = [
      { id: 'host', name: p1name, color: '#60a5fa' },
      { id: 'guest', name: p2name, color: '#a78bfa' }
    ];
    Game.init({ puzzle: data.puzzle, solution: data.solution, mode: _mode, players, diff: _diff });

    _wireGameSync();
    _buildGameScreen();
    _show('screen-game');
  }

  // ── Start game (host / solo) ───────────────────
  function startGame() {
    const p1 = document.getElementById('inp-p1')?.value?.trim() || 'Player 1';
    const p2 = document.getElementById('inp-p2')?.value?.trim() || 'Player 2';

    const puz = Generator.getPuzzle(_diff);
    _myPi = 0;

    const players = _mode === 'solo'
      ? [{ id:'p1', name:p1, color:'#60a5fa' }]
      : [{ id:'p1', name:p1, color:'#60a5fa' }, { id:'p2', name:p2, color:'#a78bfa' }];

    Game.init({ puzzle: puz.board, solution: puz.solution, mode: _mode, players, diff: _diff });

    // Broadcast puzzle to guest before showing game
    if (_mode !== 'solo') {
      Realtime.broadcastGameStart(puz.board, puz.solution, _diff);
      _wireGameSync();
    }

    _buildGameScreen();
    _show('screen-game');
  }

  // ── Wire sync callbacks for in-game ───────────
  function _wireGameSync() {
    Realtime.onMessage((data) => {
      const gs = Game.get();
      if (!gs) return;

      if (data.type === 'move') {
        const res = Game.applyRemote(data.r, data.c, data.val, data.pi);
        _renderBoard(); _renderScorebar();
        if (res && res.solved) setTimeout(_showResult, 400);
      }

      if (data.type === 'complete') {
        setTimeout(_showResult, 400);
      }
    });

    Realtime.onStatus((status, detail) => {
      _updateConnBar(status, detail);
    });

    Realtime.onPeer((event) => {
      if (event === 'left') {
        _updateConnBar('connecting', 'Opponent disconnected');
        toast('Opponent disconnected', 'red');
      }
      if (event === 'joined') {
        _updateConnBar('connected', '');
        toast('Opponent reconnected', 'green');
      }
    });
  }

  // ── Build game UI ──────────────────────────────
  function _buildGameScreen() {
    const gs = Game.get();

    document.getElementById('diff-chip').textContent = _diff.charAt(0).toUpperCase() + _diff.slice(1);
    document.getElementById('mode-chip').textContent =
      _mode === 'solo' ? 'Solo' : _mode === 'versus' ? '1v1 Live' : 'Co-op';
    document.getElementById('hint-left').textContent = gs.players[_myPi].hints;
    document.getElementById('notes-btn').classList.remove('on');
    document.getElementById('notes-label')?.remove();

    _renderScorebar();
    _renderBoard();
    _buildNumpad();
    _updateConnBar(Realtime.getStatus(), '');

    Game.startTimer(t => {
      document.getElementById('timer-box').textContent = Game.fmt(t);
    });
  }

  // ── Board rendering ────────────────────────────
  function _renderBoard() {
    const gs = Game.get();
    if (!gs) return;
    const grid = document.getElementById('board');
    grid.innerHTML = '';

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const div = document.createElement('div');
        div.className = 'cell';
        div.dataset.r = r; div.dataset.c = c;

        if (c === 2 || c === 5) div.classList.add('rb');
        if (r === 2 || r === 5) div.classList.add('bb');

        const val = gs.board[r][c];
        const isGiven = gs.given[r][c];
        const owner = gs.owner[r][c];
        const noteSet = gs.notes[r][c];

        if (isGiven) {
          div.classList.add('given');
          div.textContent = val;
        } else if (val !== 0) {
          const correct = val === gs.solution[r][c];
          if (owner === 0) div.classList.add('p1');
          if (owner === 1) div.classList.add('p2');
          if (!correct) div.classList.add('err');
          div.textContent = val;
        } else if (noteSet.size > 0) {
          const ng = document.createElement('div');
          ng.className = 'notes-grid';
          for (let n = 1; n <= 9; n++) {
            const nd = document.createElement('div');
            nd.className = 'note-n' + (noteSet.has(n) ? '' : ' off');
            nd.textContent = noteSet.has(n) ? n : '';
            ng.appendChild(nd);
          }
          div.appendChild(ng);
        }

        const hl = Game.hlClass(r, c);
        if (hl) div.classList.add(hl);

        div.addEventListener('click', () => { Game.select(r, c); _renderBoard(); });
        div.addEventListener('touchend', (e) => { e.preventDefault(); Game.select(r, c); _renderBoard(); });

        grid.appendChild(div);
      }
    }
  }

  // ── Numpad ─────────────────────────────────────
  function _buildNumpad() {
    const np = document.getElementById('numpad');
    np.innerHTML = '';
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button');
      btn.className = 'np-btn';
      btn.textContent = n;
      btn.addEventListener('click', () => _place(n));
      np.appendChild(btn);
    }
  }

  function _hlNumpad(val) {
    document.querySelectorAll('.np-btn').forEach((b, i) => {
      b.classList.toggle('hl', i + 1 === val);
    });
  }

  // ── Actions ────────────────────────────────────
  function _place(n) {
    const gs = Game.get();
    if (!gs || !gs.selected) return;
    const [r, c] = gs.selected;

    const res = Game.place(r, c, n, _myPi);
    if (!res.ok) return;

    _renderBoard(); _renderScorebar();
    _hlNumpad(n);

    if (_mode !== 'solo' && res.type === 'place') {
      Realtime.broadcastMove(r, c, n, _myPi);
    }

    if (res.correct) _flashCell(r, c);
    if (res.solved) setTimeout(() => {
      if (_mode !== 'solo') Realtime.broadcastComplete(_myPi, gs.players[_myPi].score, gs.elapsed);
      _showResult();
    }, 350);
  }

  function doErase() {
    const gs = Game.get();
    if (!gs || !gs.selected) return;
    const [r, c] = gs.selected;
    if (Game.erase(r, c, _myPi)) {
      _renderBoard();
      if (_mode !== 'solo') Realtime.broadcastMove(r, c, 0, _myPi);
    }
  }

  function doHint() {
    const gs = Game.get();
    if (!gs) return;
    const res = Game.hint(_myPi);
    if (!res) { toast('No hints left!', 'red'); return; }
    document.getElementById('hint-left').textContent = gs.players[_myPi].hints;
    _renderBoard(); _renderScorebar();
    if (_mode !== 'solo') Realtime.broadcastMove(res.r, res.c, res.val, _myPi);
    if (res.solved) setTimeout(_showResult, 350);
  }

  function doCheck() {
    const errs = Generator.getErrors(Game.get()?.board, Game.get()?.solution);
    if (errs.length === 0) toast('No errors!', 'green');
    else toast(`${errs.length} error${errs.length>1?'s':''} found`, 'red');
    _renderBoard();
  }

  function toggleNotes() {
    const on = Game.toggleNotes();
    const btn = document.getElementById('notes-btn');
    btn.classList.toggle('on', on);
    btn.textContent = on ? '✏️ Notes ON' : '✏️ Notes';
  }

  function confirmQuit() {
    if (confirm('Quit this game?')) goHome();
  }

  function playAgain() {
    Realtime.disconnect();
    goSetup(_mode);
  }

  // ── Scorebar ───────────────────────────────────
  function _renderScorebar() {
    const gs = Game.get();
    if (!gs) return;
    const bar = document.getElementById('scorebar');

    if (gs.players.length === 1) {
      const p = gs.players[0];
      const prog = Game.progress(0);
      bar.innerHTML = `
        <div class="sc-player active-turn" style="flex-direction:row;align-items:center;gap:12px;padding:10px 14px">
          <div class="sc-avatar" style="background:${p.color}22;color:${p.color}">${p.name[0]}</div>
          <div style="flex:1">
            <div class="sc-name">${p.name}</div>
            <div class="sc-bar-wrap"><div class="sc-bar-fill" style="width:${prog}%;background:${p.color}"></div></div>
          </div>
          <div>
            <div class="sc-pts">${p.score}</div>
            <div class="sc-meta">${p.errors} err · ${p.hints} hints</div>
          </div>
        </div>`;
      return;
    }

    bar.innerHTML = gs.players.map((p, i) => {
      const prog = Game.progress(i);
      return `
        <div class="sc-player${i === _myPi ? ' active-turn' : ''}">
          <div class="sc-top">
            <div class="sc-avatar" style="background:${p.color}22;color:${p.color}">${p.name[0]}</div>
            <div class="sc-name">${p.name}${i===_myPi?' (you)':''}</div>
            <div class="sc-pts">${p.score}</div>
          </div>
          <div class="sc-meta">${p.errors} errors · ${p.hints} hints</div>
          <div class="sc-bar-wrap"><div class="sc-bar-fill" style="width:${prog}%;background:${p.color}"></div></div>
        </div>`;
    }).join('');
  }

  // ── Connection bar ─────────────────────────────
  function _updateConnBar(status, detail) {
    if (_mode === 'solo') { document.getElementById('conn-bar').style.display = 'none'; return; }
    document.getElementById('conn-bar').style.display = 'flex';
    const dot = document.getElementById('game-dot');
    const lbl = document.getElementById('game-conn-label');
    const det = document.getElementById('game-conn-detail');
    dot.className = 'sync-dot ' + (status==='connected'?'ok':status==='connecting'?'wait':'err');
    lbl.textContent = status==='connected' ? 'Live — synced' : status==='connecting' ? 'Connecting…' : 'Connection error';
    det.textContent = detail || (Realtime.getRoomCode() ? 'Room: ' + Realtime.getRoomCode() : '');
  }

  // ── Result ─────────────────────────────────────
  function _showResult() {
    const gs = Game.get();
    if (!gs) return;
    Game.stopTimer();

    const solo = _mode === 'solo';
    const myP = gs.players[_myPi];
    const winner = gs.players.reduce((a, b) => a.score >= b.score ? a : b);
    const won = solo || winner === myP;
    Stats.record(won, gs.elapsed);

    document.getElementById('result-trophy').textContent = won ? '🏆' : '🎯';
    document.getElementById('result-title').textContent = solo ? 'Puzzle Complete!' : winner.name + ' wins!';
    document.getElementById('result-sub').textContent = `Solved in ${Game.fmt(gs.elapsed)}`;

    const cards = document.getElementById('result-cards');
    if (solo) {
      cards.innerHTML = `
        <div class="rc win solo">
          <div class="rc-name">${myP.name}</div>
          <div class="rc-pts">${myP.score}</div>
          <div class="rc-detail">${myP.errors} errors · ${myP.moves} moves · ${Game.fmt(gs.elapsed)}</div>
        </div>`;
    } else {
      cards.innerHTML = gs.players.map(p => `
        <div class="rc${p===winner?' win':''}">
          <div class="rc-name">${p.name}${p===winner?' 🏆':''}</div>
          <div class="rc-pts">${p.score}</div>
          <div class="rc-detail">${p.errors} errors · ${p.moves} moves</div>
        </div>`).join('');
    }
    _show('screen-result');
  }

  // ── Setup screen helpers ───────────────────────
  function _setSetupDot(cls, text) {
    const d = document.getElementById('setup-dot');
    const t = document.getElementById('setup-status-text');
    if (d) d.className = 'sync-dot ' + cls;
    if (t) t.textContent = text;
  }

  function _enableStart(on) {
    const btn = document.getElementById('start-btn');
    if (btn) btn.disabled = !on;
  }

  // ── Cell flash ─────────────────────────────────
  function _flashCell(r, c) {
    const el = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if (!el) return;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 500);
  }

  // ── Toast ──────────────────────────────────────
  function toast(msg, color = 'green') {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.style.background = color === 'green' ? '#166534' : '#7f1d1d';
    el.style.color = color === 'green' ? '#4ade80' : '#f87171';
    el.style.border = '1px solid ' + (color === 'green' ? '#4ade80' : '#f87171') + '44';
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => el.style.opacity = '0', 2200);
  }

  // ── Keyboard ───────────────────────────────────
  document.addEventListener('keydown', (e) => {
    const gs = Game.get();
    if (!gs || !gs.selected) return;
    const n = parseInt(e.key);
    if (n >= 1 && n <= 9) { _place(n); return; }
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { doErase(); return; }
    const [r, c] = gs.selected;
    const map = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
    if (map[e.key]) {
      e.preventDefault();
      const [dr, dc] = map[e.key];
      Game.select(Math.max(0,Math.min(8,r+dr)), Math.max(0,Math.min(8,c+dc)));
      _renderBoard();
    }
  });

  // ── Init ───────────────────────────────────────
  _loadStats();

  return { goHome, goSetup, setDiff, joinRoom, startGame, doErase, doHint, doCheck, toggleNotes, confirmQuit, playAgain };
})();
