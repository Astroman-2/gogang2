// ui.js — full UI orchestration
const UI = (() => {
  // ── State ────────────────────────────────────────
  let _mode='solo', _diff='easy';
  let _myPi=0, _isHost=false;
  let _roomCode=null;
  let _registeredPlayers=[];  // {name, pi, teamIdx} confirmed in room
  let _maxPlayers={solo:1,versus:4,teams:4,coop:4};

  // Player colors & class names
  const P_COLORS=['#60a5fa','#a78bfa','#4ade80','#fb923c'];
  const P_CLASSES=['p0','p1','p2','p3'];
  const TEAM_COLORS=[['#60a5fa','#2563eb'],['#a78bfa','#7c3aed']];

  // ── Stats ────────────────────────────────────────
  const Stats={
    get(){try{return JSON.parse(localStorage.getItem('sdku_stats')||'{"p":0,"w":0,"b":null}');}catch{return{p:0,w:0,b:null};}},
    save(s){localStorage.setItem('sdku_stats',JSON.stringify(s));},
    record(won,t){const s=this.get();s.p++;if(won){s.w++;if(!s.b||t<s.b)s.b=t;}this.save(s);}
  };

  // ── Screen routing ────────────────────────────────
  function _show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
  function goHome(){Realtime.disconnect();Game.stopTimer();_show('screen-home');_loadStats();}
  function _loadStats(){const s=Stats.get();document.getElementById('hs-played').textContent=s.p;document.getElementById('hs-won').textContent=s.w;document.getElementById('hs-best').textContent=s.b?Game.fmt(s.b):'--';}

  // ── LOTR dropdown ─────────────────────────────────
  function _buildSelect(id,selectedName,teamLabel){
    const sel=document.createElement('select');
    sel.className='name-select';sel.id=id;
    LOTR_NAMES.forEach(n=>{
      const o=document.createElement('option');
      o.value=n;o.textContent=n;
      if(n===selectedName)o.selected=true;
      sel.appendChild(o);
    });
    sel.addEventListener('change',()=>_validateNames());
    return sel;
  }

  function _pickDefault(used,fallback){
    return LOTR_NAMES.find(n=>!used.includes(n))||fallback||LOTR_NAMES[0];
  }

  function _validateNames(){
    const selects=[...document.querySelectorAll('.name-select')];
    const vals=selects.map(s=>s.value);
    const msgs=[...document.querySelectorAll('.conflict-msg')];
    let anyConflict=false;
    selects.forEach((s,i)=>{
      const dup=vals.filter((_,j)=>j!==i&&vals[j]===vals[i]).length>0;
      s.classList.toggle('conflict',dup);
      if(msgs[i]){msgs[i].classList.toggle('show',dup);}
      if(dup)anyConflict=true;
    });
    document.getElementById('start-btn').disabled=anyConflict||(_mode!=='solo'&&!Realtime.isConnected()&&!_isHost);
    return!anyConflict;
  }

  // ── Setup screen ──────────────────────────────────
  function goSetup(mode){
    _mode=mode;
    Realtime.disconnect();
    _registeredPlayers=[];

    document.getElementById('setup-title').textContent={
      solo:'Solo Quest',versus:'Versus Setup',teams:'Team Battle Setup',coop:'Co-op Setup'
    }[mode]||'Setup';

    // Reset diff
    document.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
    document.querySelector('.seg-btn[data-d="easy"]').classList.add('active');
    _diff='easy';

    _buildPlayersBlock(mode);

    const rb=document.getElementById('room-block');
    if(mode==='solo'){
      rb.style.display='none';
      document.getElementById('start-btn').disabled=false;
    }else{
      rb.style.display='block';
      document.getElementById('start-btn').disabled=true;
      document.getElementById('waiting-list').style.display='none';
      // Create room
      _roomCode=Realtime.generateCode();
      const disp=_roomCode.split('').join(' ');
      document.getElementById('room-code-disp').textContent=disp;
      _isHost=true;
      _setSetupDot('wait','Waiting for players…');
      _wireSetupSync();
      Realtime.host(_roomCode,_myName());
    }
    _show('screen-setup');
  }

  function _myName(){
    const s=document.getElementById('sel-p0');
    return s?s.value:'Gandalf';
  }

  function _buildPlayersBlock(mode){
    const pb=document.getElementById('players-block');
    pb.innerHTML='';

    if(mode==='solo'){
      pb.innerHTML=`
        <label class="form-label">Your hero name</label>
        <div style="position:relative"></div>`;
      const wrap=pb.querySelector('div');
      wrap.appendChild(_buildSelect('sel-p0','Gandalf','You'));
      const cm=document.createElement('div');cm.className='conflict-msg';cm.textContent='⚠️ This name is taken — choose another';wrap.appendChild(cm);
      return;
    }

    if(mode==='teams'){
      // 2 teams x 2 players
      pb.innerHTML=`
        <label class="form-label">Your name &amp; team</label>
        <div style="margin-bottom:14px">
          <div class="team-header"><span class="team-badge t1">⚔️ Team 1 — Light</span></div>
          <div id="team1-slots"></div>
        </div>
        <div>
          <div class="team-header"><span class="team-badge t2">🛡️ Team 2 — Shadow</span></div>
          <div id="team2-slots"></div>
        </div>`;
      _addPlayerSlot('team1-slots','sel-p0','Aragorn',0);
      _addPlayerSlot('team1-slots','sel-p1','Frodo',1);
      _addPlayerSlot('team2-slots','sel-p2','Sauron',2);
      _addPlayerSlot('team2-slots','sel-p3','Saruman',3);
      return;
    }

    // versus / coop: 2–4 player slots for host
    pb.innerHTML=`<label class="form-label">Player names (${mode==='versus'?'2–4':'2–4'} players)</label><div id="p-slots"></div>`;
    _addPlayerSlot('p-slots','sel-p0','Aragorn',0);
    _addPlayerSlot('p-slots','sel-p1','Legolas',1);
    // Host defaults to 2; more join via room code
  }

  function _addPlayerSlot(containerId,selId,defaultName,pi){
    const used=[];
    document.querySelectorAll('.name-select').forEach(s=>{if(s.id!==selId)used.push(s.value);});
    const name=_pickDefault(used,defaultName);
    const wrap=document.createElement('div');wrap.style.marginBottom='8px';
    const sel=_buildSelect(selId,name,`P${pi+1}`);
    const cm=document.createElement('div');cm.className='conflict-msg';cm.textContent='⚠️ Name taken — pick another';
    wrap.appendChild(sel);wrap.appendChild(cm);
    document.getElementById(containerId).appendChild(wrap);
  }

  function setDiff(btn){
    document.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');_diff=btn.dataset.d;
  }

  // ── Room joining ───────────────────────────────────
  function joinRoom(){
    const code=(document.getElementById('join-input').value||'').toUpperCase().replace(/\s/g,'').trim();
    if(code.length!==4){toast('Enter 4-letter room code','red');return;}
    _roomCode=code;_isHost=false;
    document.getElementById('room-code-disp').textContent=code.split('').join(' ');
    _setSetupDot('wait','Connecting to '+code+'…');
    _wireSetupSync();
    Realtime.join(code,_myName());
  }

  function _wireSetupSync(){
    Realtime.onStatus((s,d)=>{
      if(s==='connected'){_setSetupDot('ok',d||'Connected!');}
      else if(s==='connecting'){_setSetupDot('wait',d||'Connecting…');}
      else if(s==='error'){_setSetupDot('err',d||'Error');}
    });

    Realtime.onPeer((event,id,name)=>{
      if(event==='joined'){
        toast((name||id)+' joined the room!','green');
        _updateWaitingList();
        if(_isHost&&Realtime.getConnectedPeers().length>0){
          document.getElementById('start-btn').disabled=false;
        }
      }
      if(event==='left'){
        toast((name||id)+' left','red');
        _updateWaitingList();
      }
    });

    Realtime.onMessage(data=>{
      if(data.type==='game_start'&&!_isHost){
        _receiveGameStart(data);
      }
      if(data.type==='name_check'){
        // another player announced their name; validate conflict
        _validateNames();
      }
    });
  }

  function _updateWaitingList(){
    const peers=Realtime.getConnectedPeers();
    const wl=document.getElementById('waiting-list');
    const wp=document.getElementById('waiting-players');
    if(peers.length>0){
      wl.style.display='block';
      wp.innerHTML=peers.map((p,i)=>`
        <div class="waiting-player">
          <div class="wp-avatar" style="background:${P_COLORS[i+1]||'#555'}22;color:${P_COLORS[i+1]||'#888'}">${(p.name||'?')[0]}</div>
          <div class="wp-name">${p.name||p.id}</div>
          <div class="wp-tag">Connected</div>
        </div>`).join('');
    }else{wl.style.display='none';}
  }

  // ── Receive game start (guest) ─────────────────────
  function _receiveGameStart(data){
    _myPi=data.myPi!==undefined?data.myPi:1;
    _diff=data.diff||_diff;
    _mode=data.mode||_mode;
    const players=data.players||[{name:'Host',color:P_COLORS[0]},{name:'Guest',color:P_COLORS[1]}];
    Game.init({puzzle:data.puzzle,solution:data.solution,mode:_mode,players,diff:_diff,puzzleNum:data.puzzleNum,totalPuzzles:data.totalPuzzles});
    _wireGameSync();
    _buildGameScreen(players);
    _show('screen-game');
  }

  // ── Start game (host / solo) ───────────────────────
  function startGame(){
    if(!_validateNames())return;

    const puz=Generator.getPuzzle(_diff);
    _myPi=0;

    // Build players array from selects
    const selects=[...document.querySelectorAll('.name-select')];
    let players=selects.map((s,i)=>({
      id:'p'+i, name:s.value,
      color:P_COLORS[i]||P_COLORS[0],
      teamIdx:_mode==='teams'?Math.floor(i/2):-1
    }));

    // For multiplayer: add connected peers
    if(_mode!=='solo'){
      const peers=Realtime.getConnectedPeers();
      peers.forEach((peer,i)=>{
        const pi=players.length;
        players.push({id:peer.id,name:peer.name||('Player '+(pi+1)),color:P_COLORS[pi]||P_COLORS[0],teamIdx:_mode==='teams'?Math.floor(pi/2):-1});
      });
    }

    if(_mode==='solo')players=[players[0]];

    Game.init({puzzle:puz.board,solution:puz.solution,mode:_mode,players,diff:_diff,puzzleNum:puz.puzzleNum,totalPuzzles:puz.totalPuzzles});

    // Broadcast to guests with their player index
    if(_mode!=='solo'){
      const peers=Realtime.getConnectedPeers();
      peers.forEach((peer,i)=>{
        const guestPi=i+1;
        Realtime.send('game_start',{
          puzzle:puz.board,solution:puz.solution,diff:_diff,mode:_mode,
          puzzleNum:puz.puzzleNum,totalPuzzles:puz.totalPuzzles,
          players,myPi:guestPi
        });
      });
      _wireGameSync();
    }

    _buildGameScreen(players);
    _show('screen-game');
  }

  // ── Wire game sync callbacks ───────────────────────
  function _wireGameSync(){
    Realtime.onMessage(data=>{
      const gs=Game.get();if(!gs)return;
      if(data.type==='move'){
        const res=Game.applyRemote(data.r,data.c,data.val,data.pi);
        _renderBoard();_renderScorebar();
        if(res&&res.solved)setTimeout(_showResult,400);
      }
      if(data.type==='score_sync'&&data.scores){
        const gs=Game.get();
        data.scores.forEach((sc,i)=>{if(gs.players[i])Object.assign(gs.players[i],sc);});
        _renderScorebar();
      }
      if(data.type==='complete')setTimeout(_showResult,400);
    });
    Realtime.onStatus((s,d)=>_updateConnBar(s,d));
    Realtime.onPeer((ev,id,name)=>{
      if(ev==='left')toast((name||id)+' disconnected','red');
      if(ev==='joined')toast((name||id)+' reconnected','green');
      _updateConnBar(Realtime.getStatus(),'');
    });
  }

  // ── Build game screen ─────────────────────────────
  function _buildGameScreen(players){
    const gs=Game.get();
    document.getElementById('diff-chip').textContent=_diff.charAt(0).toUpperCase()+_diff.slice(1);
    document.getElementById('mode-chip').textContent={solo:'Solo',versus:'Versus',teams:'Teams',coop:'Co-op'}[_mode]||_mode;
    document.getElementById('hint-left').textContent=gs.players[_myPi].hints;
    document.getElementById('notes-btn').classList.remove('on');
    document.getElementById('notes-btn').textContent='✏️ Notes';

    // Puzzle banner
    document.getElementById('puzzle-num').textContent=gs.puzzleNum||1;
    document.getElementById('puzzle-total').textContent=gs.totalPuzzles||1;
    document.getElementById('puzzle-diff').textContent=_diff.charAt(0).toUpperCase()+_diff.slice(1);

    _mode==='solo'?document.getElementById('conn-bar').style.display='none':document.getElementById('conn-bar').style.display='flex';

    _renderScorebar();
    _renderBoard();
    _buildNumpad();
    _updateConnBar(Realtime.getStatus(),'');

    Game.startTimer(t=>{document.getElementById('timer-box').textContent=Game.fmt(t);});
  }

  // ── Board ─────────────────────────────────────────
  function _renderBoard(){
    const gs=Game.get();if(!gs)return;
    const grid=document.getElementById('board');
    grid.innerHTML='';
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        const div=document.createElement('div');
        div.className='cell';div.dataset.r=r;div.dataset.c=c;
        if(c===2||c===5)div.classList.add('rb');
        if(r===2||r===5)div.classList.add('bb');
        const val=gs.board[r][c],isGiven=gs.given[r][c],owner=gs.owner[r][c],ns=gs.notes[r][c];
        if(isGiven){
          div.classList.add('given');div.textContent=val;
        }else if(val!==0){
          div.classList.add(P_CLASSES[owner]||'p0');
          if(val!==gs.solution[r][c])div.classList.add('err');
          div.textContent=val;
        }else if(ns.size>0){
          const ng=document.createElement('div');ng.className='notes-grid';
          for(let n=1;n<=9;n++){const nd=document.createElement('div');nd.className='note-n'+(ns.has(n)?'':' off');nd.textContent=ns.has(n)?n:'';ng.appendChild(nd);}
          div.appendChild(ng);
        }
        const hl=Game.hlClass(r,c);if(hl)div.classList.add(hl);
        div.addEventListener('click',()=>{Game.select(r,c);_renderBoard();});
        div.addEventListener('touchend',e=>{e.preventDefault();Game.select(r,c);_renderBoard();});
        grid.appendChild(div);
      }
    }
  }

  // ── Numpad ────────────────────────────────────────
  function _buildNumpad(){
    const np=document.getElementById('numpad');np.innerHTML='';
    for(let n=1;n<=9;n++){
      const btn=document.createElement('button');btn.className='np-btn';btn.textContent=n;
      btn.addEventListener('click',()=>_place(n));np.appendChild(btn);
    }
  }
  function _hlNumpad(val){document.querySelectorAll('.np-btn').forEach((b,i)=>b.classList.toggle('hl',i+1===val));}

  // ── Place number ──────────────────────────────────
  function _place(n){
    const gs=Game.get();if(!gs||!gs.selected)return;
    const[r,c]=gs.selected;
    const res=Game.place(r,c,n,_myPi);
    if(!res.ok)return;
    _renderBoard();_renderScorebar();_hlNumpad(n);
    if(_mode!=='solo')Realtime.broadcastMove(r,c,n,_myPi,gs.players[_myPi]?.name);
    if(res.correct){
      _flashCell(r,c);
      _celebrate('✨','Correct!',gs.players[_myPi]?.name||'');
      // check line completions
      if(res.completions&&res.completions.length){
        res.completions.filter(e=>e.fresh).forEach(e=>{
          const msg=e.type==='row'?'Row complete!':e.type==='col'?'Column complete!':'Box complete!';
          setTimeout(()=>_celebrate('🎊',msg,'',2000),400);
        });
      }
    }
    if(res.solved)setTimeout(()=>{if(_mode!=='solo')Realtime.broadcastComplete(_myPi,gs.players[_myPi].score,gs.elapsed,gs.players[_myPi].name);_showResult();},400);
  }

  function doErase(){
    const gs=Game.get();if(!gs||!gs.selected)return;
    const[r,c]=gs.selected;
    if(Game.erase(r,c,_myPi)){_renderBoard();if(_mode!=='solo')Realtime.broadcastMove(r,c,0,_myPi);}
  }

  function doHint(){
    const gs=Game.get();if(!gs)return;
    const res=Game.hint(_myPi);
    if(!res){toast('No hints left! 💡','red');return;}
    document.getElementById('hint-left').textContent=gs.players[_myPi].hints;
    _renderBoard();_renderScorebar();
    if(_mode!=='solo')Realtime.broadcastMove(res.r,res.c,res.val,_myPi);
    if(res.completions&&res.completions.length)res.completions.filter(e=>e.fresh).forEach(e=>setTimeout(()=>_celebrate('🎊',e.type==='row'?'Row complete!':e.type==='col'?'Column complete!':'Box complete!','',2000),300));
    if(res.solved)setTimeout(_showResult,400);
  }

  function doCheck(){
    const gs=Game.get();if(!gs)return;
    const errs=Generator.getErrors(gs.board,gs.solution);
    if(!errs.length)toast('No errors found! ✅','green');
    else toast(`${errs.length} error${errs.length>1?'s':''} — keep trying!`,'red');
    _renderBoard();
  }

  function toggleNotes(){
    const on=Game.toggleNotes();
    const btn=document.getElementById('notes-btn');
    btn.classList.toggle('on',on);
    btn.textContent=on?'✏️ Notes ON':'✏️ Notes';
  }

  function confirmQuit(){if(confirm('Quit game?'))goHome();}
  function playAgain(){Realtime.disconnect();goSetup(_mode);}

  // ── Scorebar ─────────────────────────────────────
  function _renderScorebar(){
    const gs=Game.get();if(!gs)return;
    const bar=document.getElementById('scorebar');
    const n=gs.players.length;
    const cls=n===1?'p1':n===2?'p2':n<=4?'p4':'p4';

    if(_mode==='teams'){
      // Show two team totals + individual
      const teams=[[gs.players[0],gs.players[1]],[gs.players[2],gs.players[3]]];
      bar.innerHTML=`<div class="scorebar-grid ${cls}">
        ${gs.players.map((p,i)=>{
          const prog=Game.progress(i);
          const tc=i<2?'team1':'team2';
          return`<div class="sc-card ${tc}${i===_myPi?' active-turn':''}">
            <div class="sc-top">
              <div class="sc-avatar" style="background:${p.color}22;color:${p.color}">${(p.name||'?')[0]}</div>
              <div class="sc-name">${p.name}${i===_myPi?' ★':''}</div>
              <div class="sc-pts" style="color:${p.color}">${p.score}</div>
            </div>
            <div class="sc-meta">${p.errors} err · ${p.hints} 💡</div>
            <div class="sc-bar-wrap"><div class="sc-bar-fill" style="width:${prog}%;background:${p.color}"></div></div>
          </div>`;
        }).join('')}
      </div>`;
    }else{
      bar.innerHTML=`<div class="scorebar-grid ${cls}">
        ${gs.players.map((p,i)=>{
          const prog=Game.progress(n===1?null:i);
          return`<div class="sc-card${i===_myPi?' active-turn':''}">
            <div class="sc-top">
              <div class="sc-avatar" style="background:${p.color}22;color:${p.color}">${(p.name||'?')[0]}</div>
              <div class="sc-name">${p.name}${i===_myPi?' ★':''}</div>
              <div class="sc-pts" style="color:${p.color}">${p.score}</div>
            </div>
            <div class="sc-meta">${p.errors} err · ${p.hints} 💡</div>
            <div class="sc-bar-wrap"><div class="sc-bar-fill" style="width:${prog}%;background:${p.color}"></div></div>
          </div>`;
        }).join('')}
      </div>`;
    }
  }

  // ── Connection bar ────────────────────────────────
  function _updateConnBar(s,d){
    if(_mode==='solo'){document.getElementById('conn-bar').style.display='none';return;}
    document.getElementById('conn-bar').style.display='flex';
    const dot=document.getElementById('game-dot');
    const lbl=document.getElementById('game-conn-label');
    const det=document.getElementById('game-conn-detail');
    dot.className='sync-dot '+(s==='connected'?'ok':s==='connecting'?'wait':'err');
    lbl.textContent=s==='connected'?'Live — synced':s==='connecting'?'Connecting…':'Error';
    det.textContent=d||(Realtime.getRoomCode()?'Room: '+Realtime.getRoomCode():'');
  }

  // ── Celebration overlay ──────────────────────────
  let _celTimer=null;
  function _celebrate(emoji,msg,sub='',dur=1200){
    clearTimeout(_celTimer);
    const el=document.getElementById('celebrate');
    document.getElementById('cel-emoji').textContent=emoji;
    document.getElementById('cel-msg').textContent=msg;
    document.getElementById('cel-sub').textContent=sub;
    el.style.display='flex';
    _celTimer=setTimeout(()=>{el.style.display='none';},dur);
  }

  // ── Flash cell ───────────────────────────────────
  function _flashCell(r,c){
    const el=document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if(!el)return;el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),500);
  }

  // ── Result screen ────────────────────────────────
  function _showResult(){
    const gs=Game.get();if(!gs)return;
    Game.stopTimer();
    const solo=_mode==='solo';
    const myP=gs.players[_myPi];

    let winner=gs.players[0];
    if(_mode==='teams'){
      const t1=gs.players[0].score+(gs.players[1]?.score||0);
      const t2=(gs.players[2]?.score||0)+(gs.players[3]?.score||0);
      winner=t1>=t2?{name:'Team 1 — Light',score:t1}:{name:'Team 2 — Shadow',score:t2};
    }else{
      winner=gs.players.reduce((a,b)=>a.score>=b.score?a:b);
    }
    const won=solo||(winner===myP)||(winner.name&&winner.name.includes('Team 1')&&_myPi<2)||(winner.name&&winner.name.includes('Team 2')&&_myPi>=2);
    Stats.record(won,gs.elapsed);

    document.getElementById('result-trophy').textContent=won?'🏆':'🎯';
    document.getElementById('result-title').textContent=solo?'Quest Complete!':winner.name+' wins!';
    document.getElementById('result-sub').textContent=`Solved in ${Game.fmt(gs.elapsed)} · Puzzle ${gs.puzzleNum} of ${gs.totalPuzzles}`;

    const cards=document.getElementById('result-cards');
    if(solo){
      cards.innerHTML=`<div class="rc win solo">
        <div class="rc-name">${myP.name}</div>
        <div class="rc-pts" style="color:${myP.color}">${myP.score}</div>
        <div class="rc-detail">${myP.errors} errors · ${myP.moves} moves · ${Game.fmt(gs.elapsed)}</div>
      </div>`;
    }else if(_mode==='teams'&&gs.players.length===4){
      const t1=gs.players[0].score+(gs.players[1]?.score||0);
      const t2=(gs.players[2]?.score||0)+(gs.players[3]?.score||0);
      cards.innerHTML=`
        <div class="rc${t1>=t2?' win':''}">
          <div class="rc-name">⚔️ Team 1 — Light</div>
          <div class="rc-pts" style="color:#60a5fa">${t1}</div>
          <div class="rc-detail">${gs.players[0].name} + ${gs.players[1]?.name||'?'}</div>
        </div>
        <div class="rc${t2>t1?' win':''}">
          <div class="rc-name">🛡️ Team 2 — Shadow</div>
          <div class="rc-pts" style="color:#a78bfa">${t2}</div>
          <div class="rc-detail">${gs.players[2]?.name||'?'} + ${gs.players[3]?.name||'?'}</div>
        </div>
        ${gs.players.map(p=>`<div class="rc"><div class="rc-name">${p.name}</div><div class="rc-pts" style="color:${p.color};font-size:20px">${p.score}</div><div class="rc-detail">${p.errors} err</div></div>`).join('')}`;
    }else{
      cards.innerHTML=gs.players.map(p=>`
        <div class="rc${p===winner?' win':''}">
          <div class="rc-name">${p.name}${p===winner?' 🏆':''}</div>
          <div class="rc-pts" style="color:${p.color}">${p.score}</div>
          <div class="rc-detail">${p.errors} errors · ${p.moves} moves</div>
        </div>`).join('');
    }
    _show('screen-result');
  }

  // ── Setup dot helper ─────────────────────────────
  function _setSetupDot(cls,text){
    const d=document.getElementById('setup-dot');
    const t=document.getElementById('setup-status');
    if(d)d.className='sync-dot '+cls;
    if(t)t.textContent=text;
  }

  // ── Toast ────────────────────────────────────────
  function toast(msg,color='green'){
    let el=document.getElementById('toast');
    if(!el){el=document.createElement('div');el.id='toast';document.body.appendChild(el);}
    el.textContent=msg;
    el.style.background=color==='green'?'#14532d':'#7f1d1d';
    el.style.color=color==='green'?'#4ade80':'#f87171';
    el.style.border='1px solid '+(color==='green'?'#4ade8044':'#f8717144');
    el.style.opacity='1';
    clearTimeout(el._t);
    el._t=setTimeout(()=>el.style.opacity='0',2400);
  }

  // ── Keyboard ─────────────────────────────────────
  document.addEventListener('keydown',e=>{
    const gs=Game.get();if(!gs||!gs.selected)return;
    const n=parseInt(e.key);
    if(n>=1&&n<=9){_place(n);return;}
    if(e.key==='Backspace'||e.key==='Delete'||e.key==='0'){doErase();return;}
    const[r,c]=gs.selected;
    const m={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
    if(m[e.key]){e.preventDefault();const[dr,dc]=m[e.key];Game.select(Math.max(0,Math.min(8,r+dr)),Math.max(0,Math.min(8,c+dc)));_renderBoard();}
  });

  _loadStats();
  return{goHome,goSetup,setDiff,joinRoom,startGame,doErase,doHint,doCheck,toggleNotes,confirmQuit,playAgain};
})();
