import React, { useState } from 'react';
import './Board.css'
import { enemyOf } from './Game';
import { CARDS } from './Cards';

/**todo
 * display card information
 */
export function CardBoard({G, ctx, moves, playerID, events}) {
  const opponentID = enemyOf(playerID)
  const [clicked, setClicked] = useState(false)

  function handleClick(id){
    if(clicked===false){
      //first click
      setClicked(id)
    }else{
      //second click
      if(clicked > 15 && id <= 15){
        moves.playCard(clicked-16, id)
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

  const heroAbility = {
    green: {onContextMenu: greenHeroAbility},
    blue: {},
  }

  //game board
  let board = [];
  let trapNumE = 0
  for (let i = 3; i >= 0; i--) {
    let line = [];
    for (let j = 0; j < 4; j++) {
      const id = playerID === '0' ? 4 * i + j : 4 * (3-i) + 3 - j;//calculate tile id
      const card = G.field[id];
      let content = ''
      if(card){
        let style = {backgroundImage: card.img, backgroundSize: 'cover'}
        if(card.kind === 'trap' && card.pid !== playerID){
          style.visibility = 'hidden'
          trapNumE++
        }
        content = <div style={style} className='cardImg rounded'>
          <p className='atk text-lg' style={{color: card.kind==="trap"?'black':card.pid===playerID?'cyan':'red'}}>{card.atk}</p>
          <p className='hp text-lg' style={{color: card.kind==="trap"?'black':card.pid===playerID?'cyan':'red'}}>{card.currHp}</p>
        </div>
      }
      line.push(
        <td key={id} onClick={()=>handleClick(id)} 
          {...heroAbility[G.player[playerID].hero]}
          className={`border-solid border bg-white/10 rounded transition-transform ${clicked===id?'border-[rgb(0,255,0)]':'border-neutral-600'} hover:scale-[1.03]`}
        >
          {content}
        </td>
      )
    }
    board.push(<tr key={i}>{line}</tr>);
  }

  //end turn button
  const endTurnButton = <button id='endTurn' onClick={()=>events.endTurn()} className="bg-slate-300 rounded">{ctx.currentPlayer===playerID?"Your Turn":"Op's Turn"}</button>

  //Cards in hand display
  let cards = G.player[playerID].hand.map((content, id)=>
    <div onClick={()=>handleClick(id + 16)} className={`cardBox border-solid border bg-white/10 rounded transition-transform ${clicked===id?'border-[rgb(0,255,0)]':'border-neutral-600'} hover:scale-[1.03]`}>
      <div style={{backgroundImage: content.img, backgroundSize: 'cover'}} className='cardImg rounded'/>
      <p className='atk text-lg' style={{color: 'cyan'}}>{content.atk}</p>
      <p className='hp text-lg' style={{color: 'cyan'}}>{content.hp}</p>
      <p className='cost text-lg' style={{color: 'violet'}}>{content.cost}</p>
    </div>
  );
  const handCards = <div id='Cards' className='my-7'>{cards}</div>

  //View of Card information when it is selected
  let cardData = <div className='w-80 self-stretch my-7 box-content invisible'/>
  if(clicked !== false){
    const cardSelected = clicked < 16 ? G.field[clicked] : G.player[playerID].hand[clicked-16]
    cardData = cardSelected ? <div className='relative rounded-md bg-white shadow-lg self-stretch w-80 my-7 box-content text-center'>
      <div className='w-80 h-80' style={{backgroundImage: cardSelected.img, backgroundSize: 'cover'}}/>
      <p className='atk text-3xl' style={{color: 'cyan'}}>{cardSelected.atk}</p>
      <p className='hp text-3xl' style={{color: 'cyan'}}>{cardSelected.hp}</p>
      <p className='cost text-3xl' style={{color: 'violet'}}>{cardSelected.cost}</p>
      <p className='absolute bottom-0 text-2xl font-mono w-full'>{cardSelected.kind}</p>
      <div className=''>
        <p className='w-full text-3xl'>{cardSelected.name}</p>
        <span className='my-auto'>{cardSelected.desc}</span>
      </div>
    </div> : cardData
  }

  let movePoints = [<span className='invisible inline-block h-2 w-2'></span>]
  for(let i=0;i<G.player[playerID].movePt;i++){
    movePoints.push(<span className='inline-block rounded-full bg-lime-500 h-2 w-2 m-1'></span>)
  }

  let movePointsE = [<span className='invisible inline-block h-2 w-2'></span>]
  for(let i=0;i<G.player[opponentID].movePt;i++){
    movePointsE.push(<span className='inline-block rounded-full bg-red-500 h-2 w-2 m-1'></span>)
  }

  return (
  <>
    <div className='bodyPage'>
      <table className='bg-cover my-7 ml-7 border-separate border-spacing-1'>
        <tbody>{board}</tbody>
      </table>
      <div className='rightBar my-auto ml-2'>
        <div>{movePointsE}</div>
        <span>cost: {G.player[opponentID].cost}/{G.player[opponentID].maxCost}</span>
        {endTurnButton}
        <span>cost: {G.player[playerID].cost}/{G.player[playerID].maxCost}</span>
        <div>{movePoints}</div>
      </div>
      {handCards}
      {cardData}
    </div>
  </>
  )
}