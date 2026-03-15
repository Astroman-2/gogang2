// realtime.js — WebRTC P2P via PeerJS + BroadcastChannel + localStorage fallback
const Realtime = (() => {
  const PEER_LIB = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
  const PEER_CFG = window.PEER_SERVER || { host:'0.peerjs.com', port:443, secure:true, path:'/', debug:0 };

  let _peer=null, _conns=[], _roomCode=null, _myId=null, _isHost=false;
  let _transport=null, _bc=null, _pollTimer=null, _heartTimer=null;
  let _status='disconnected';
  let _onMsg=null, _onStatus=null, _onPeer=null;
  let _myName='Player';
  let _connectedPeers={};  // id -> {name}

  function onMessage(cb){_onMsg=cb;}
  function onStatus(cb){_onStatus=cb;}
  function onPeer(cb){_onPeer=cb;}
  function setName(n){_myName=n;}

  function generateCode(){
    const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({length:4},()=>A[Math.floor(Math.random()*A.length)]).join('');
  }

  function getStatus(){return _status;}
  function getRoomCode(){return _roomCode;}
  function isConnected(){return _status==='connected';}
  function getConnectedPeers(){return Object.values(_connectedPeers);}

  async function host(code,name){
    _roomCode=code; _isHost=true; _myName=name||_myName;
    _myId='sdku-'+code+'-host';
    _setStatus('connecting','Waiting for players…');
    await _loadPeer();
    _initPeer(_myId,null);
  }

  async function join(code,name){
    _roomCode=code; _isHost=false; _myName=name||_myName;
    _myId='sdku-'+code+'-g'+Math.random().toString(36).slice(2,6);
    const hostId='sdku-'+code+'-host';
    _setStatus('connecting','Connecting to room '+code+'…');
    await _loadPeer();
    _initPeer(_myId,hostId);
  }

  function disconnect(){
    send('leave',{name:_myName});
    clearInterval(_heartTimer); clearInterval(_pollTimer);
    _conns.forEach(c=>{try{c.close();}catch(_){}});
    _conns=[];
    if(_peer){try{_peer.destroy();}catch(_){}_peer=null;}
    if(_bc){try{_bc.close();}catch(_){}_bc=null;}
    _clearPollKeys();
    _connectedPeers={}; _status='disconnected'; _transport=null;
  }

  function send(type,data={}){
    _broadcast({type,...data,_from:_myId,_name:_myName,_ts:Date.now()});
  }

  function _broadcast(msg){
    if(_transport==='webrtc'){
      _conns.forEach(c=>{if(c.open)try{c.send(msg);}catch(e){_fallSend(msg);}});
    } else { _fallSend(msg); }
  }

  function _fallSend(msg){
    if(_transport==='broadcast'&&_bc){try{_bc.postMessage(msg);return;}catch(_){}}
    // localStorage: host writes to h2g, guests write to g2h_<myId>
    const key=_isHost?'sdku_'+_roomCode+'_h2g':'sdku_'+_roomCode+'_g2h_'+_myId;
    try{localStorage.setItem(key,JSON.stringify({...msg,_seq:Date.now()}));}catch(_){}
  }

  async function _loadPeer(){
    if(typeof Peer!=='undefined')return;
    return new Promise(res=>{
      const s=document.createElement('script');
      s.src=PEER_LIB; s.onload=res; s.onerror=res;
      document.head.appendChild(s);
    });
  }

  function _initPeer(myId,connectTo){
    if(typeof Peer==='undefined'){_fallbackTransport(connectTo);return;}
    try{
      _peer=new Peer(myId,PEER_CFG);
      _peer.on('open',id=>{
        _myId=id;
        // Host listens for connections
        _peer.on('connection',conn=>{_setupConn(conn);});
        // Guest connects to host
        if(connectTo){
          setTimeout(()=>{
            const c=_peer.connect(connectTo,{reliable:true,serialization:'json'});
            _setupConn(c);
          },300);
        }
      });
      _peer.on('error',err=>{
        if(err.type==='peer-unavailable')_setStatus('error','Room not found — check code');
        else _fallbackTransport(connectTo);
      });
      _peer.on('disconnected',()=>{try{_peer.reconnect();}catch(_){}});
    }catch(e){_fallbackTransport(connectTo);}
  }

  function _setupConn(conn){
    _conns.push(conn);
    _transport='webrtc';
    conn.on('open',()=>{
      _setStatus('connected','Live — WebRTC P2P');
      // announce presence
      conn.send({type:'hello',_from:_myId,_name:_myName,_ts:Date.now()});
      _startHeart();
    });
    conn.on('data',d=>_handle(d));
    conn.on('close',()=>{
      _conns=_conns.filter(c=>c!==conn);
      const id=Object.keys(_connectedPeers).find(k=>_connectedPeers[k].connId===conn.peer);
      if(id){delete _connectedPeers[id];_onPeer&&_onPeer('left',id);}
      if(_conns.length===0)_setStatus('connecting','Waiting for players…');
    });
    conn.on('error',()=>{});
  }

  function _fallbackTransport(connectTo){
    if(typeof BroadcastChannel!=='undefined'){
      _transport='broadcast';
      _bc=new BroadcastChannel('sdku_room_'+_roomCode);
      _bc.onmessage=e=>_handle(e.data);
      if(!_isHost){
        setTimeout(()=>{
          _fallSend({type:'hello',_from:_myId,_name:_myName,_ts:Date.now()});
          _setStatus('connected','Connected (same device)');
          _onPeer&&_onPeer('joined',_myId);
        },200);
      }
    }else{
      _transport='poll';
      _startPolling();
    }
    _startHeart();
  }

  let _lastSeqs={};
  function _startPolling(){
    _setStatus('connecting','Sync via fallback…');
    if(!_isHost){
      setTimeout(()=>{_fallSend({type:'hello',_from:_myId,_name:_myName});_setStatus('connected','Connected');_onPeer&&_onPeer('joined',_myId);},300);
    }
    _pollTimer=setInterval(()=>{
      // Host reads all guest keys; guests read h2g
      if(_isHost){
        Object.keys(localStorage).filter(k=>k.startsWith('sdku_'+_roomCode+'_g2h_')).forEach(key=>{
          try{
            const d=JSON.parse(localStorage.getItem(key)||'{}');
            if(!d._seq)return;
            if(!_lastSeqs[key]||d._seq>_lastSeqs[key]){_lastSeqs[key]=d._seq;if(d._from!==_myId)_handle(d);}
          }catch(_){}
        });
      }else{
        const key='sdku_'+_roomCode+'_h2g';
        try{
          const d=JSON.parse(localStorage.getItem(key)||'{}');
          if(!d._seq)return;
          if(!_lastSeqs[key]||d._seq>_lastSeqs[key]){_lastSeqs[key]=d._seq;if(d._from!==_myId)_handle(d);}
        }catch(_){}
      }
    },150);
  }

  function _clearPollKeys(){
    try{
      Object.keys(localStorage).filter(k=>k.startsWith('sdku_'+_roomCode)).forEach(k=>localStorage.removeItem(k));
    }catch(_){}
  }

  function _handle(d){
    if(!d||d._from===_myId)return;
    if(d.type==='heartbeat'){
      if(d._from&&_connectedPeers[d._from])_connectedPeers[d._from].lastSeen=Date.now();
      return;
    }
    if(d.type==='hello'){
      _connectedPeers[d._from]={name:d._name||d._from,lastSeen:Date.now(),connId:d._from};
      _setStatus('connected','Live — '+Object.keys(_connectedPeers).length+' connected');
      _onPeer&&_onPeer('joined',d._from,d._name);
      // reply
      _broadcast({type:'hello_ack',_from:_myId,_name:_myName,_ts:Date.now()});
      return;
    }
    if(d.type==='hello_ack'){
      _connectedPeers[d._from]={name:d._name||d._from,lastSeen:Date.now()};
      _setStatus('connected','Live');
      _onPeer&&_onPeer('joined',d._from,d._name);
      return;
    }
    if(d.type==='leave'){
      delete _connectedPeers[d._from];
      _onPeer&&_onPeer('left',d._from,d._name);
      return;
    }
    _onMsg&&_onMsg(d);
  }

  function _startHeart(){
    clearInterval(_heartTimer);
    _heartTimer=setInterval(()=>_broadcast({type:'heartbeat',_from:_myId,_ts:Date.now()}),4000);
  }

  function _setStatus(s,detail=''){
    _status=s;
    _onStatus&&_onStatus(s,detail);
  }

  // Game helpers
  function broadcastMove(r,c,val,pi,name){send('move',{r,c,val,pi,name});}
  function broadcastGameStart(puzzle,solution,diff,puzzleNum,totalPuzzles,players){send('game_start',{puzzle,solution,diff,puzzleNum,totalPuzzles,players});}
  function broadcastComplete(pi,score,elapsed,name){send('complete',{pi,score,elapsed,name});}
  function broadcastScore(scores){send('score_sync',{scores});}

  return{
    host,join,disconnect,send,onMessage,onStatus,onPeer,setName,
    generateCode,getStatus,getRoomCode,isConnected,getConnectedPeers,
    broadcastMove,broadcastGameStart,broadcastComplete,broadcastScore
  };
})();
