// generator.js
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
    if(bank&&bank.length&&Math.random()>0.4)return bank[Math.floor(Math.random()*bank.length)];
    return generate(diff);
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

  return{getPuzzle,isSolved,getErrors,clone,isValid};
})();
