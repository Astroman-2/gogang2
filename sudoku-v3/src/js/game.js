// names.js + generator.js + game.js combined

// ── LOTR Usernames (25, alphabetical) ──────────────
const LOTR_NAMES = [
  "Aragorn","Arwen","Bilbo","Boromir","Celeborn",
  "Denethor","Eowyn","Faramir","Frodo","Galadriel",
  "Gandalf","Gimli","Glorfindel","Grima","Legolas",
  "Merry","Pippin","Radagast","Samwise","Saruman",
  "Sauron","Shadowfax","Shelob","Theoden","Treebeard"
];

// ── Sudoku Generator ───────────────────────────────
const Generator = (() => {
  function isValid(b,r,c,n){
    if(b[r].includes(n))return false;
    for(let i=0;i<9;i++)if(b[i][c]===n)return false;
    const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(b[br+i][bc+j]===n)return false;
    return true;
  }
  function findEmpty(b){for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(b[r][c]===0)return[r,c];return null}
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
  function solve(b){
    const cell=findEmpty(b);if(!cell)return true;
    const[r,c]=cell;
    for(const n of shuffle([1,2,3,4,5,6,7,8,9])){
      if(isValid(b,r,c,n)){b[r][c]=n;if(solve(b))return true;b[r][c]=0}
    }
    return false;
  }
  function countSols(b,lim=2){
    let count=0;
    function bt(){
      if(count>=lim)return;
      const cell=findEmpty(b);if(!cell){count++;return}
      const[r,c]=cell;
      for(let n=1;n<=9;n++){if(isValid(b,r,c,n)){b[r][c]=n;bt();b[r][c]=0}}
    }
    bt();return count;
  }
  const REMOVE={easy:36,medium:46,hard:53,expert:58};
  function generate(diff='easy'){
    const sol=Array.from({length:9},()=>Array(9).fill(0));
    solve(sol);
    const puzzle=sol.map(r=>[...r]);
    const cells=shuffle(Array.from({length:81},(_,i)=>[Math.floor(i/9),i%9]));
    let removed=0;const target=REMOVE[diff]||36;
    for(const[r,c]of cells){
      if(removed>=target)break;
      const bk=puzzle[r][c];puzzle[r][c]=0;
      if(countSols(puzzle.map(x=>[...x]))===1)removed++;
      else puzzle[r][c]=bk;
    }
    return{board:puzzle,solution:sol};
  }
  function getPuzzle(diff){
    const bank=PUZZLE_BANK[diff];
    if(bank&&bank.length){
      const idx=Math.floor(Math.random()*bank.length);
      return{...bank[idx],puzzleNum:idx+1,totalPuzzles:bank.length};
    }
    return{...generate(diff),puzzleNum:1,totalPuzzles:1};
  }
  function isSolved(board,sol){
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(board[r][c]!==sol[r][c])return false;
    return true;
  }
  function getErrors(board,sol){
    const e=[];
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)
      if(board[r][c]!==0&&board[r][c]!==sol[r][c])e.push([r,c]);
    return e;
  }
  function clone(b){return b.map(r=>[...r])}
  // Check completed rows / cols / boxes
  function checkCompletions(board,sol,r,c){
    const events=[];
    // row
    if(board[r].every((v,i)=>v===sol[r][i]))events.push({type:'row',index:r});
    // col
    if(board.every((row,ri)=>row[c]===sol[ri][c]))events.push({type:'col',index:c});
    // box
    const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
    let boxDone=true;
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(board[br+i][bc+j]!==sol[br+i][bc+j]){boxDone=false;break}
    if(boxDone)events.push({type:'box',br,bc});
    return events;
  }
  return{getPuzzle,isSolved,getErrors,clone,checkCompletions};
})();

// ── Game Engine ────────────────────────────────────
const Game = (() => {
  let S = null;
  function init({puzzle,solution,mode,players,diff,puzzleNum,totalPuzzles}){
    S={
      mode,diff,puzzleNum,totalPuzzles,
      puzzle:Generator.clone(puzzle),
      solution:Generator.clone(solution),
      given:puzzle.map(r=>r.map(v=>v!==0)),
      board:Generator.clone(puzzle),
      owner:Array.from({length:9},()=>Array(9).fill(-1)),
      notes:Array.from({length:9},()=>Array.from({length:9},()=>new Set())),
      players:players.map(p=>({...p,score:0,errors:0,moves:0,hints:3,done:false})),
      notesMode:false,selected:null,elapsed:0,finished:false,
      _timerRef:null,completedLines:new Set()
    };
    return S;
  }
  function startTimer(cb){
    if(!S||S._timerRef)return;
    const start=Date.now()-S.elapsed*1000;
    S._timerRef=setInterval(()=>{S.elapsed=Math.floor((Date.now()-start)/1000);cb&&cb(S.elapsed);},500);
  }
  function stopTimer(){if(!S)return;clearInterval(S._timerRef);S._timerRef=null;}
  function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}

  function place(r,c,n,pi){
    if(!S||S.given[r][c]||S.finished)return{ok:false};
    const p=S.players[pi];
    if(S.notesMode&&n!==0){
      const ns=S.notes[r][c];
      if(ns.has(n))ns.delete(n);else ns.add(n);
      return{ok:true,type:'note'};
    }
    S.notes[r][c].clear();
    if(n!==0)_clearRelatedNotes(r,c,n);
    S.board[r][c]=n;
    S.owner[r][c]=n!==0?pi:-1;
    let correct=false,wasError=false,completions=[];
    if(n!==0){
      p.moves++;
      correct=(n===S.solution[r][c]);
      if(correct){
        p.score+=S.elapsed<120?12:10;
        completions=Generator.checkCompletions(S.board,S.solution,r,c);
        completions.forEach(e=>{
          const key=e.type+':'+(e.index!==undefined?e.index:`${e.br},${e.bc}`);
          if(!S.completedLines.has(key)){S.completedLines.add(key);e.fresh=true;}
        });
      }else{wasError=true;p.errors++;p.score=Math.max(0,p.score-3);}
    }
    const solved=Generator.isSolved(S.board,S.solution);
    if(solved&&!S.finished){S.finished=true;p.done=true;p.finishTime=S.elapsed;stopTimer();}
    return{ok:true,type:'place',r,c,n,correct,wasError,solved,pi,completions};
  }
  function erase(r,c,pi){
    if(!S||S.given[r][c])return false;
    if(S.mode==='versus'&&S.owner[r][c]!==pi&&S.owner[r][c]!==-1)return false;
    S.board[r][c]=0;S.notes[r][c].clear();S.owner[r][c]=-1;return true;
  }
  function hint(pi){
    if(!S)return null;
    const p=S.players[pi];if(p.hints<=0)return null;
    const empty=[];
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!S.given[r][c]&&S.board[r][c]===0)empty.push([r,c]);
    if(!empty.length)return null;
    const[r,c]=empty[Math.floor(Math.random()*empty.length)];
    const val=S.solution[r][c];
    S.board[r][c]=val;S.owner[r][c]=pi;S.notes[r][c].clear();_clearRelatedNotes(r,c,val);
    p.hints--;p.score+=5;
    const completions=Generator.checkCompletions(S.board,S.solution,r,c);
    const solved=Generator.isSolved(S.board,S.solution);
    if(solved&&!S.finished){S.finished=true;p.done=true;p.finishTime=S.elapsed;stopTimer();}
    return{r,c,val,solved,hintsLeft:p.hints,completions};
  }
  function applyRemote(r,c,n,pi){
    if(!S)return;
    S.board[r][c]=n;S.owner[r][c]=n!==0?pi:-1;
    if(n!==0){S.notes[r][c].clear();_clearRelatedNotes(r,c,n);}
    const solved=Generator.isSolved(S.board,S.solution);
    if(solved&&!S.finished){
      S.finished=true;
      if(S.players[pi]){S.players[pi].done=true;S.players[pi].finishTime=S.elapsed;}
      stopTimer();
    }
    return{solved};
  }
  function toggleNotes(){if(!S)return false;S.notesMode=!S.notesMode;return S.notesMode;}
  function select(r,c){if(S)S.selected=[r,c];}
  function _clearRelatedNotes(r,c,n){
    for(let i=0;i<9;i++){S.notes[r][i].delete(n);S.notes[i][c].delete(n);}
    const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)S.notes[br+i][bc+j].delete(n);
  }
  function hlClass(r,c){
    if(!S||!S.selected)return'';
    const[sr,sc]=S.selected;
    if(sr===r&&sc===c)return'sel';
    const v=S.board[sr][sc];
    if(v!==0&&S.board[r][c]===v)return'hl-same';
    if(sr===r||sc===c||(Math.floor(sr/3)===Math.floor(r/3)&&Math.floor(sc/3)===Math.floor(c/3)))return'hl-rel';
    return'';
  }
  function progress(pi=null){
    if(!S)return 0;
    let total=0,filled=0;
    for(let r=0;r<9;r++)for(let c=0;c<9;c++){
      if(!S.given[r][c]){total++;if(S.board[r][c]!==0&&(pi===null||S.owner[r][c]===pi))filled++;}
    }
    return total?Math.round(filled/total*100):0;
  }
  function get(){return S;}
  return{init,startTimer,stopTimer,fmt,place,erase,hint,applyRemote,toggleNotes,select,hlClass,progress,get};
})();
