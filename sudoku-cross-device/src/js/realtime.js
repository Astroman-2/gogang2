// realtime.js
// ─────────────────────────────────────────────────────────────────────────────
// Cross-device real-time sync via THREE transport layers (auto-selected):
//
//  1. PeerJS  (WebRTC P2P) — fastest, no server cost, works cross-device
//  2. BroadcastChannel     — same-device multi-tab (instant fallback)
//  3. localStorage polling — last-resort fallback for older environments
//
// PeerJS uses the free public PeerJS cloud server for signaling.
// Once peers connect, all game data travels P2P (no relay server needed).
//
// TO USE YOUR OWN SERVER: set window.PEER_SERVER config below.
// ─────────────────────────────────────────────────────────────────────────────

const Realtime = (() => {
  // ── Config ─────────────────────────────────────
  const PEER_CFG = window.PEER_SERVER || {
    host: '0.peerjs.com',
    port: 443,
    secure: true,
    path: '/',
    debug: 0
  };
  const PEER_LIB = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';

  // ── State ──────────────────────────────────────
  let _peer = null;       // PeerJS instance
  let _conn = null;       // active DataConnection
  let _roomCode = null;
  let _myId = null;
  let _isHost = false;
  let _transport = null;  // 'webrtc' | 'broadcast' | 'poll'
  let _bc = null;         // BroadcastChannel
  let _pollTimer = null;
  let _heartbeatTimer = null;
  let _peerLoaded = false;
  let _status = 'disconnected'; // disconnected | connecting | connected | error

  // ── Callbacks ──────────────────────────────────
  let _onMsg = null;
  let _onStatus = null;  // (status, detail) => void
  let _onPeer = null;    // (joined|left) => void

  // ── Public API ─────────────────────────────────
  function onMessage(cb) { _onMsg = cb; }
  function onStatus(cb)  { _onStatus = cb; }
  function onPeer(cb)    { _onPeer = cb; }

  function generateCode() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({length:4}, () => A[Math.floor(Math.random()*A.length)]).join('');
  }

  function getStatus()    { return _status; }
  function getRoomCode()  { return _roomCode; }
  function isConnected()  { return _status === 'connected'; }

  // ── Connect as host ────────────────────────────
  async function host(code) {
    _roomCode = code;
    _isHost = true;
    _myId = 'sudoku-' + code + '-host';
    _setStatus('connecting', 'Waiting for opponent…');
    await _loadPeer();
    _initPeer(_myId);
  }

  // ── Connect as guest ───────────────────────────
  async function join(code) {
    _roomCode = code;
    _isHost = false;
    _myId = 'sudoku-' + code + '-guest-' + Math.random().toString(36).slice(2,6);
    const hostId = 'sudoku-' + code + '-host';
    _setStatus('connecting', 'Connecting to room ' + code + '…');
    await _loadPeer();
    _initPeer(_myId, hostId);
  }

  // ── Disconnect ─────────────────────────────────
  function disconnect() {
    _send({ type: 'leave' });
    clearInterval(_heartbeatTimer);
    clearInterval(_pollTimer);
    if (_conn) { try { _conn.close(); } catch(_){} _conn = null; }
    if (_peer) { try { _peer.destroy(); } catch(_){} _peer = null; }
    if (_bc)   { try { _bc.close(); }    catch(_){} _bc = null; }
    _clearPollKeys();
    _status = 'disconnected';
    _transport = null;
  }

  // ── Send a message ─────────────────────────────
  function send(type, data = {}) {
    _send({ type, ...data, _from: _myId, _ts: Date.now() });
  }

  function _send(msg) {
    if (_transport === 'webrtc' && _conn && _conn.open) {
      try { _conn.send(msg); return; } catch(e) { _fallbackSend(msg); }
    } else {
      _fallbackSend(msg);
    }
  }

  function _fallbackSend(msg) {
    if (_transport === 'broadcast' && _bc) {
      try { _bc.postMessage(msg); return; } catch(_) {}
    }
    // localStorage poll
    const key = 'sdku_' + _roomCode + '_' + (_isHost ? 'h2g' : 'g2h');
    try { localStorage.setItem(key, JSON.stringify({ ...msg, _seq: Date.now() })); } catch(_) {}
  }

  // ── PeerJS setup ───────────────────────────────
  async function _loadPeer() {
    if (typeof Peer !== 'undefined') { _peerLoaded = true; return; }
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = PEER_LIB;
      s.onload = () => { _peerLoaded = true; res(); };
      s.onerror = () => { _peerLoaded = false; res(); }; // continue without it
      document.head.appendChild(s);
    });
  }

  function _initPeer(myId, connectToId = null) {
    if (!_peerLoaded || typeof Peer === 'undefined') {
      _fallbackTransport(connectToId);
      return;
    }

    try {
      _peer = new Peer(myId, PEER_CFG);

      _peer.on('open', (id) => {
        _myId = id;
        if (connectToId) {
          // Guest: connect to host
          setTimeout(() => {
            const conn = _peer.connect(connectToId, { reliable: true, serialization: 'json' });
            _setupConn(conn);
          }, 300);
        }
        // Host: listen for incoming
        _peer.on('connection', (conn) => {
          _setupConn(conn);
        });
      });

      _peer.on('error', (err) => {
        console.warn('PeerJS error:', err.type, err.message);
        if (err.type === 'peer-unavailable') {
          _setStatus('error', 'Room not found — check the code');
        } else {
          _fallbackTransport(connectToId);
        }
      });

      _peer.on('disconnected', () => {
        _peer.reconnect();
      });

    } catch(e) {
      _fallbackTransport(connectToId);
    }
  }

  function _setupConn(conn) {
    _conn = conn;
    _transport = 'webrtc';

    conn.on('open', () => {
      _setStatus('connected', 'Connected via WebRTC');
      _onPeer && _onPeer('joined');
      _startHeartbeat();
      // Host sends greeting
      if (_isHost) _send({ type: 'hello', role: 'host', _from: _myId });
    });

    conn.on('data', (data) => {
      if (!data || data._from === _myId) return;
      if (data.type === 'heartbeat') return;
      if (data.type === 'leave') { _onPeer && _onPeer('left'); _setStatus('connecting', 'Opponent disconnected'); return; }
      if (data.type === 'hello') { if (!_isHost) _send({ type: 'hello', role: 'guest', _from: _myId }); }
      _onMsg && _onMsg(data);
    });

    conn.on('close', () => {
      _onPeer && _onPeer('left');
      _setStatus('connecting', 'Reconnecting…');
    });

    conn.on('error', (e) => {
      console.warn('conn error', e);
    });
  }

  // ── Fallback: BroadcastChannel or localStorage poll ──
  function _fallbackTransport(connectToId) {
    if (typeof BroadcastChannel !== 'undefined') {
      _transport = 'broadcast';
      _bc = new BroadcastChannel('sdku_room_' + _roomCode);
      _bc.onmessage = (e) => {
        const d = e.data;
        if (!d || d._from === _myId) return;
        if (d.type === 'leave') { _onPeer && _onPeer('left'); return; }
        if (d.type === 'hello') { _onPeer && _onPeer('joined'); _setStatus('connected', 'Connected (same device)'); if (!_isHost) _send({type:'hello',_from:_myId}); }
        else _onMsg && _onMsg(d);
      };
      _setStatus('connecting', 'Waiting (same-device mode)…');
      if (!_isHost) {
        _send({ type: 'hello', _from: _myId });
        _setStatus('connected', 'Connected (same device)');
        _onPeer && _onPeer('joined');
      }
    } else {
      _transport = 'poll';
      _startPolling();
    }
    _startHeartbeat();
  }

  // ── localStorage polling ────────────────────────
  let _lastSeq = { h2g: 0, g2h: 0 };

  function _startPolling() {
    _setStatus('connecting', 'Using fallback sync…');
    if (!_isHost) {
      // Guest: announce
      setTimeout(() => {
        _fallbackSend({ type: 'hello', _from: _myId });
        _setStatus('connected', 'Connected (poll)');
        _onPeer && _onPeer('joined');
      }, 200);
    }
    _pollTimer = setInterval(() => {
      const key = 'sdku_' + _roomCode + '_' + (_isHost ? 'g2h' : 'h2g');
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const d = JSON.parse(raw);
        if (!d || d._from === _myId || d._seq <= _lastSeq[_isHost?'g2h':'h2g']) return;
        _lastSeq[_isHost?'g2h':'h2g'] = d._seq;
        if (d.type === 'hello' && _isHost) {
          _onPeer && _onPeer('joined');
          _setStatus('connected', 'Opponent connected (poll)');
        } else if (d.type !== 'heartbeat' && d.type !== 'leave') {
          _onMsg && _onMsg(d);
        }
      } catch(_) {}
    }, 150);
  }

  function _clearPollKeys() {
    try {
      localStorage.removeItem('sdku_' + _roomCode + '_h2g');
      localStorage.removeItem('sdku_' + _roomCode + '_g2h');
    } catch(_) {}
  }

  // ── Heartbeat ───────────────────────────────────
  function _startHeartbeat() {
    _heartbeatTimer = setInterval(() => {
      _send({ type: 'heartbeat', _from: _myId });
    }, 4000);
  }

  // ── Status helper ───────────────────────────────
  function _setStatus(s, detail = '') {
    _status = s;
    _onStatus && _onStatus(s, detail);
  }

  // Game-specific helpers
  function broadcastMove(r, c, val, pi) { send('move', { r, c, val, pi }); }
  function broadcastGameStart(puzzle, solution, diff) { send('game_start', { puzzle, solution, diff }); }
  function broadcastComplete(pi, score, elapsed) { send('complete', { pi, score, elapsed }); }

  return {
    host, join, disconnect, send, onMessage, onStatus, onPeer,
    generateCode, getStatus, getRoomCode, isConnected,
    broadcastMove, broadcastGameStart, broadcastComplete
  };
})();
