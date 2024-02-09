import React, { useEffect, useState } from 'react';
import './Board.css'
import { adjacentSquares, enemyOf } from './Game';
import useSound from 'use-sound';

/**todo
 * deckbuilder
 * how to play button
 */
export function CardBoard({G, ctx, moves, playerID, events, isActive}) {
  const opponentID = enemyOf(playerID)
  const [clicked, setClicked] = useState(false)
  const [playCardSound] = useSound('/playCard.flac')

  function handleClick(id){
    if(clicked===false){
      //first click
      setClicked(id)
    }else{
      //second click
      if(clicked > 15 && id <= 15){
        moves.playCard(clicked-16, id)
        playCardSound()
        setClicked(false)
      }else if(clicked === id){
        setClicked(false)
      }else if(id<=15){
        moves.action(clicked, id)
        setClicked(false)
      }else{
        setClicked(id)
      }
    }
  }

  function greenHeroAbility(e, id){
    if(G.field[id] !== null){
      return
    }
    e.preventDefault()
    moves.setTrap(id, "Mouse Trap")
  }

  const heroAbility = (idx) => {
    return {
      green: {onContextMenu: (e)=>greenHeroAbility(e, idx)},
      blue: {},
    }
  }

  //game board
  let board = [];
  let trapNumE = 0
  for (let i = 3; i >= 0; i--) {
    let line = [];
    for (let j = 0; j < 4; j++) {
      const idx = playerID === '0' ? 4 * i + j : 4 * (3-i) + 3 - j;//calculate tile idx
      const card = G.field[idx];
      let content = <div className='cardImg'/>
      if(card){
        let style = {backgroundImage: card.img, backgroundSize: 'cover'}
        if(card.kind === 'trap' && card.pid !== playerID){
          style.visibility = 'hidden'
          // eslint-disable-next-line
          trapNumE++
        }
        content = <div style={style} className='cardImg'>
          <p className='atk text-lg' style={{color: card.kind==="trap"?'black':card.pid===playerID?'cyan':'red'}}>{card.atk}</p>
          <p className='hp text-lg' style={{color: card.kind==="trap"?'black':card.pid===playerID?'cyan':'red'}}>{card.currHp}</p>
        </div>
      }

      let border = 'border-black'
      let txt = ''
      const bgFilter = 'after:bg-white/25'
      if(G.field[idx] && G.field[idx].exhausted){
        txt = "after:bg-black/20"
      }
      if(clicked === idx){
        border = 'border-[rgb(0,255,255)]'
      }
      else if(!isActive){
      }
      else if(G.field[clicked] && G.field[clicked].pid === playerID){
        if(G.field[clicked].exhausted){
        }
        else if(adjacentSquares(clicked).includes(idx)){
          if(G.field[idx] === null || G.field[idx].kind === "trap"){
            if(!G.field[clicked].cannotMove){
              border = 'border-[rgb(0,255,0)]'
              txt = bgFilter + " after:content-['Move']"
            }
          }
          else if(G.field[idx].pid === enemyOf(playerID) && !G.field[clicked].cannotAttack){
            border = 'border-[rgb(255,0,0)]'
            txt = bgFilter + " after:content-['Attack']"
          }
          else if(G.field[idx].pid === playerID && !G.field[clicked].cannotMove && !G.field[idx].cannotMove && !G.field[idx].exhausted){
            border = 'border-[rgb(255,0,255)]'
            txt = bgFilter + " after:content-['Switch']"
          }
        }
      }
      else if(clicked>=16){
        const handCard = G.player[playerID].hand[clicked-16]
        if(handCard.kind === "minion"){
          if(adjacentSquares(idx).some((fieldIdx) => G.field[fieldIdx] && G.field[fieldIdx].pid === playerID && G.field[fieldIdx].kind !== "trap")
          && G.field[idx] === null){
            border = 'border-[rgb(0,255,0)]'
          }
        }
        else if(handCard.kind === "spell"){
          console.log(handCard.target)
          if(handCard.target === "any"){
            border = 'border-[rgb(0,255,0)]'
          }
          else if(handCard.target === "field"){
          }
          else if(G.field[idx]){
            if(handCard.target.split(' ').every((target)=>{
              if(target === "enemy"){
                return G.field[idx].pid === enemyOf(playerID)
              }else if(target === "ally"){
                return G.field[idx].pid === playerID
              }else if(target === "minion"){
                return G.field[idx].kind === "minion"
              }else if(target === "hero"){
                return G.field[idx].kind === "hero"
              }else if(target === "unit"){
                return G.field[idx].kind === "minion" || G.field[idx].kind === "hero"
              }
              return true
            })){
              border = 'border-[rgb(0,255,0)]'
            }
          }
        }
        else if(handCard.kind === "trap"){
          if(G.field[idx] === null){border = 'border-[rgb(0,255,0)]'}
        }
      }

      line.push(
        <td key={idx} onClick={()=>handleClick(idx)} 
          {...heroAbility(idx)[G.player[playerID].hero]}
          className={`border-solid border-2 bg-white/10 rounded relative transition-transform ${border} ${txt} hover:scale-[0.97] afterBg`}
        >
          {content}
        </td>
      )
    }
    board.push(<tr key={i}>{line}</tr>);
  }

  useEffect(() => {
    const turnIndicator = document.getElementById('turnIndicator')
    if(isActive){
      turnIndicator.innerHTML = 'Your Turn'
    }else{
      turnIndicator.innerHTML = 'Enemy\'s Turn'
    }
    turnIndicator.style.color = 'white'
    setTimeout(()=>{
      turnIndicator.style.color = 'transparent'
    }, 3000)
  }, [isActive])

  //end turn button
  const endTurnButton = <button id='endTurn' onClick={()=>events.endTurn()} className="bg-slate-300 rounded">{ctx.currentPlayer===playerID?"End Turn":"Enemy Turn"}</button>

  //Cards in hand display
  let cards = G.player[playerID].hand.map((content, id)=>
    <div onClick={()=>handleClick(id + 16)} className={`cardBox border-solid border-2 rounded transition-transform ${clicked===id+16?'border-[rgb(0,255,255)]':'border-black'} hover:scale-[0.97] z-[1]`}>
      <div style={{backgroundImage: content.img, backgroundSize: 'cover'}} className='cardImg'/>
      <p className='atk text-lg' style={{color: 'cyan'}}>{content.atk}</p>
      <p className='hp text-lg' style={{color: 'cyan'}}>{content.hp}</p>
      <p className='cost text-lg' style={{color: 'violet'}}>{content.cost}</p>
    </div>
  );
  const handCards = <div id='Cards' className='mt-10'>{cards}</div>

  //View of Card information when it is selected
  let cardData = <div/>
  if(clicked !== false){
    const cardSelected = clicked < 16 ? G.field[clicked] : G.player[playerID].hand[clicked-16]
    cardData = cardSelected ? <div className='absolute left-10 top-1/2 -translate-y-2/3 z-[1]'>
      <div className='relative rounded-md bg-white shadow-lg h-[500px] w-80 my-7 box-content text-center'>
        <div className='w-80 h-80 rounded-md bg-slate-200' style={{backgroundImage: cardSelected.img, backgroundSize: 'cover'}}/>
        <p className='atk text-3xl' style={{color: 'cyan'}}>{cardSelected.atk}</p>
        <p className='hp text-3xl' style={{color: 'cyan'}}>{cardSelected.hp}</p>
        <p className='cost text-3xl' style={{color: 'violet'}}>{cardSelected.cost}</p>
        <p className='absolute bottom-0 text-2xl font-mono w-full'>{cardSelected.kind}</p>
        <div className=''>
          <p className='w-full text-3xl'>{cardSelected.name}</p>
          <span>{cardSelected.desc}</span>
        </div>
      </div>
    </div> : cardData
  }

  let movePoints = [<span className='inline-block h-2'>MP:</span>]
  for(let i=0;i<G.player[playerID].movePt;i++){
    movePoints.push(<span className='inline-block rounded-full bg-lime-500 h-2 w-2 m-[2px]'></span>)
  }

  let movePointsE = [<span className='inline-block h-2'>MP:</span>]
  for(let i=0;i<G.player[opponentID].movePt;i++){
    movePointsE.push(<span className='inline-block rounded-full bg-red-500 h-2 w-2 m-[2px]'></span>)
  }

  return (
  <>
    <div className='fixed rounded-xl Bgfilter backdrop-blur-lg h-[80%] aspect-square left-1/2 -translate-x-1/2 top-[15%]'></div>
    <div id='turnIndicator' className='fixed top-[5%] left-1/2 -translate-x-1/2 text-center text-5xl font-mono duration-1000 transition-colors'></div>
    <div className='bodyPage'>
      <div className='flex flex-row ml-[110px] mt-[14%] z-[1]'>
        <table className='bg-cover border-separate border-spacing-[2px]'>
          <tbody>{board}</tbody>
        </table>
        <div className='rightBar my-auto pl-2 text-black font-semibold'>
          <div>{movePointsE}</div>
          <span>cost: {G.player[opponentID].cost}/{G.player[opponentID].maxCost}</span>
          {endTurnButton}
          <span>cost: {G.player[playerID].cost}/{G.player[playerID].maxCost}</span>
          <div>{movePoints}</div>
        </div>
      </div>
      {handCards}
      {cardData}
    </div>
  </>
  )
}