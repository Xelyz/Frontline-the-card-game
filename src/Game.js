import { INVALID_MOVE } from 'boardgame.io/core'
import {CARDS, DERIVATIVE} from './Cards'
import {onPlayEffect, onOutEffect, onDamagedEffect, onAttackEffect, onDefenseEffect, onTurnBeginEffect, onEveryTurnBeginEffect, SpellEffect, onMoveEffect, onSurvivingDamageEffect, triggerEffect, onTurnEndEffect, onEveryTurnEndEffect, onRecoverEffect} from './effect'
import { HEROS } from './hero'
import { TurnOrder } from 'boardgame.io/core';

/*
todo:
deckbuilder

notes:
all trigger effects group names start with 'on'
*/

/**Utility function. Returns the enemy pid of a pid*/
export function enemyOf(pid){
    return (1-pid).toString()
}

/**Initialize the card state before it goes into the field. Returns the initialized card*/
function minionDeployInitialize({G, ctx, random, events}, card, pid, fieldIdx){
    card.pid = pid
    card.currHp = card.hp
    card.exhausted = true
    if(card.trait && card.trait.charge){
        card.exhausted = false
    }
    card.idx = fieldIdx
    let trap
    if(G.field[fieldIdx] && G.field[fieldIdx].kind === "trap"){
        trap = G.field[fieldIdx]
    }
    G.field[fieldIdx] = card
    if(trap){
        trap.trigger.split(' ').map((fn)=>triggerEffect[fn]({G, ctx, random, events}, card))
    }

    return card
}

export function dealDamage({G, ctx, random, events}, dmg, idx){
    if(G.field[idx] === null){
        return
    }
    const card = G.field[idx]
    card.currHp-=dmg
    if(dmg > 0){
        if(card.effect.onDamaged){
            card.effect.onDamaged.split(' ').map((fn)=>onDamagedEffect[fn]({G, ctx, random, events}, card))
            logMsg({G, ctx}, `${card.name} takes ${dmg} damage`)
        }
        if(card.currHp > 0 && card.effect.onSurvivingDamage){
            card.effect.onSurvivingDamage.split(' ').map((fn)=>onSurvivingDamageEffect[fn]({G, ctx, random, events}, card))
        }
    }
}

export function heal({G, ctx, random, events}, healing, idx){
    if(G.field[idx] === null){
        return
    }
    const card = G.field[idx]
    if(card.currHp+healing<card.hp){
        card.currHp+=healing
    }else{
        healing = card.hp-card.currHp
        card.currHp = card.hp
    }

    if(healing > 0){
        if(card.effect.onRecover){
            card.effect.onRecover.split(' ').map((fn)=>onRecoverEffect[fn]({G, ctx, random, events}, card))
        }
    }
}

function battle({G, ctx, random, events}, idx, enemyIdx){
    const card = G.field[idx]
    const enemy = G.field[enemyIdx]

    if(enemy === null){
        logPrivateMsg({G, ctx}, "Invalid target index: The target is null", ctx.currentPlayer)
        return
    }

    logMsg({G, ctx}, `${card.name} attacks ${enemy.name}`)

    if(card.effect.onAttack){
        card.effect.onAttack.split(' ').map((fn)=>onAttackEffect[fn]({G, ctx, random, events}, card))
    }

    if(enemy.effect.onDefense){
        enemy.effect.onDefense.split(' ').map((fn)=>onDefenseEffect[fn]({G, ctx, random, events}, enemy))
    }

    dealDamage({G, ctx, random, events}, card.atk, enemyIdx)
    dealDamage({G, ctx, random, events}, enemy.atk, idx)

    clearField({G, ctx, random, events})
    card.exhausted = true
}

export function clearField({G, ctx, random, events}){
    for(let idx in G.field){
        const card = G.field[idx]
        if(card && card.currHp <= 0){
            out({G, ctx, random, events}, idx)
        }
    }
}

export function out({G, ctx, random, events}, idx){
    const card = G.field[idx]
    if(card.effect.onOut){
        card.effect.onOut.split(' ').map((fn)=>onOutEffect[fn]({G, ctx, random, events}, card))
    }
    G.player[card.pid].graveyard.push(card.name)
    logMsg({G, ctx}, `${card.name} at (${Math.floor(idx/4)}, ${idx%4}) went to a better place`)
    G.field[idx] = null
}

/**Draw a card from the end of the deck to the end of the hand.*/
export function draw({G, ctx, random, events}, pid){
    const player = G.player[pid]
    if (player.deck.length > 0) {
        const card = player.deck.pop()
        if (player.hand.length >= G.handLimit) {
            logPrivateMsg({G, ctx}, "Your hand is full", pid);
            return;
        }
        player.hand.push(card);
        logMsg({G, ctx}, `player ${pid} draws a card`)
    } 
    else {
        logMsg({G, ctx}, `player ${pid} don't have any card left in the deck`)
        dealDamage({G, ctx, random, events}, player.punish, G.field.findIndex((card)=> card && card.kind === "hero" && card.pid === pid))
        clearField({G, ctx, random, events})
        player.punish++
    }
}

function gameInitialize({G, ctx, random, events}){
    G.turnNum = 0
    G.player[0].deck = random.Shuffle(G.player[0].deck)
    G.player[1].deck = random.Shuffle(G.player[1].deck)
    minionDeployInitialize({G, ctx, random, events}, {...HEROS.find(hero => hero.color===G.player[0].hero)}, '0', 0)
    minionDeployInitialize({G, ctx, random, events}, {...HEROS.find(hero => hero.color===G.player[1].hero)}, '1', 15)
    for(let i=0;i<3;i++){
        draw({G, ctx, random, events}, G.order[0])
    }
    for(let i=0;i<4;i++){
        draw({G, ctx, random, events}, G.order[1])
    }

    logMsg({G, ctx, random, events}, "Game initialized")
}

/**setup the game*/
function setupGame({G, random}){
    G.field = Array(16).fill(null)
    G.order = random.Shuffle(['0', '1'])
    G.gameReview = []
    G.handLimit = 10
    G.effect = {
        0:[],
        1:[]
    }
    G.player = {
        '0': {
        hand: [],
        hero: 'blue',
        deck: null,
        msg: [],
        cost: 0,
        maxCost: 0,
        graveyard: [],
        movePt: 2,
        punish: 1,
        },
        '1': {
        hand: [],
        hero: 'blue',
        deck: null,
        msg: [],
        cost: 0,
        maxCost: 0,
        graveyard: [],
        movePt: 2,
        punish: 1,
        }
    }
}

/**move a minion to one of its adjacent square
 */
function move({G, ctx, random, events}, idx, endIdx) {
    const card = G.field[idx]

    // Move the minion

    if(card.effect.onMove){
        card.effect.onMove.split(' ').map((fn)=>onMoveEffect[fn]({G, ctx, random, events}, card))
    }

    let trap
    if(G.field[endIdx] && G.field[endIdx].kind === "trap"){
        trap = G.field[endIdx]
    }

    card.idx = endIdx
    G.field[endIdx] = card;
    G.field[idx] = null;

    if(trap){
        trap.trigger.split(' ').map((fn)=>triggerEffect[fn]({G, ctx, random, events}, card))
    }

    logMsg({G, ctx}, `Minion moved from (${Math.floor(idx/4)}, ${idx%4}) to (${Math.floor(endIdx/4)}, ${endIdx%4}).`);
}

function switchPlaces({G, ctx, random, events}, idx, idx2){
    const card = G.field[idx]
    const card2 = G.field[idx2]

    card.idx = idx2
    card2.idx = idx
    G.field[idx] = card2
    G.field[idx2] = card
    
    if(card.effect.onMove){
        card.effect.onMove.split(' ').map((fn)=>onMoveEffect[fn]({G, ctx, random, events}, card))
    }
    if(card2.effect.onMove){
        card2.effect.onMove.split(' ').map((fn)=>onMoveEffect[fn]({G, ctx, random, events}, card2))
    }

    logMsg({G, ctx}, `Minion switches places between (${Math.floor(idx/4)}, ${idx%4}) and (${Math.floor(idx2/4)}, ${idx2%4}).`);
}

/**
 * summon a minion
 * @param idxRange possible tile(s). If the summon is random, it contains multiple tile indices. Otherwise it contains only one index
 */
export function summon({G, ctx, random, events}, card, idxRange, pid){
    idxRange = idxRange.filter((idx) => G.field[idx] === null || G.field[idx].kind === "trap")
    if(idxRange.length === 0){
        logPrivateMsg({G, ctx}, "Possible summoning squares are all occupied", pid)
        return
    }
    const fieldIdx = idxRange[random.Die(idxRange.length)-1]
    minionDeployInitialize({G, ctx, random, events}, card, pid, fieldIdx)
    logMsg({G, ctx}, `${card.name} summoned at (${Math.floor(fieldIdx/4)}, ${fieldIdx%4})`)
}

/**The green hero ability 
 * @param {string} trap the name of the trap */
function setTrap({G, ctx, random, events}, idx, trap){
    if(G.field[idx] !== null){
        logPrivateMsg({G, ctx}, `Position already occupied`, ctx.currentPlayer);
        return
    }
    if(G.player[ctx.currentPlayer].trap <= 0){
        logPrivateMsg({G, ctx}, `You don't have enough trap`, ctx.currentPlayer);
        return
    }
    minionDeployInitialize({G, ctx, random, events}, {...DERIVATIVE.find((card) => card.name === trap)}, ctx.currentPlayer, idx)
    G.player[ctx.currentPlayer].trap--
}

/**log messages to game review*/
export function logMsg({G, ctx}, msg){
    G.gameReview.push(msg)
}

/**log private messages to a player*/
function logPrivateMsg({G, ctx}, msg, pid){
    G.player[pid].msg.push(msg)
}

/**Utility function. Return the adjacent indices of a index*/
export function adjacentSquares(idx){
    let squares = [];
    for (const direction of [1,-1]) {
        const newIdx = idx + direction
        if (Math.floor(newIdx/4)===Math.floor(idx/4)){
            if (newIdx>=0 && newIdx<16) {
                squares.push(newIdx)
            }
        }
    }
    for (const direction of [4,-4]) {
        const newIdx = idx + direction
        if (newIdx>=0 && newIdx<16) {
            squares.push(newIdx)
        }
    }
    return squares;
}

/**Triggers when the current player plays a minion card
 * @param handIdx the index of the card in the current player's hand
 */
function playCard({G, ctx, random, events}, handIdx, fieldIdx){
    const player = G.player[ctx.currentPlayer];
    const card = player.hand[handIdx]

    if(fieldIdx>15){
        logPrivateMsg({G, ctx}, 'Field index out of range')
        return
    }
    // Check if the player has enough cost to play the card
    if(player.cost < card.cost){
        logPrivateMsg({G, ctx}, `No enough cost to play ${card.name}`, ctx.currentPlayer);
        return
    }

    if(card.kind === "minion"){
        // Check if the specified position on the field is empty
        if (G.field[fieldIdx] && G.field[fieldIdx].kind !== "trap") {
            logPrivateMsg({G, ctx}, `Position already occupied`, ctx.currentPlayer);
            return
        }

        const squareContainsAllies = squareIdx => G.field[squareIdx] !== null && G.field[squareIdx].pid === ctx.currentPlayer && G.field[squareIdx].kind !== "trap"
        
        if(!adjacentSquares(fieldIdx).some(squareContainsAllies)){
            logPrivateMsg({G, ctx}, `You must place your minion on an adjacent square of your existing hero or minion.`, ctx.currentPlayer);
            return
        }

        // Place the card on the field
        minionDeployInitialize({G, ctx, random, events}, card, ctx.currentPlayer, fieldIdx);

        if(card.effect.onPlay){
            card.effect.onPlay.split(' ').map((fn)=>onPlayEffect[fn]({G, ctx, random, events}, card))
        }
    }
    else if(card.kind === "spell"){
        const targets = card.target
        for(let target of targets.split(' ')){
            if(
            (target === "enemy" && G.field[fieldIdx].pid === enemyOf(ctx.currentPlayer))
            || (target === "ally" && G.field[fieldIdx].pid === ctx.currentPlayer)
            || (target === "minion" && G.field[fieldIdx].kind === "minion")
            || (target === "hero" && G.field[fieldIdx].kind === "hero")
            || (target === "unit" && (G.field[fieldIdx].kind === "minion" || G.field[fieldIdx].kind === "hero"))
            || target === "any"
            || target === "field"
            ){
            }else{
                return
            }
        }
        card.pid = ctx.currentPlayer
        card.spell.split(' ').map((fn)=>SpellEffect[fn]({G, ctx, random, events, card}, fieldIdx))
        if(G.invalid){
            return INVALID_MOVE
        }
    }
    else if(card.kind === "trap"){
        if (G.field[fieldIdx]) {
            logPrivateMsg({G, ctx}, `Position already occupied`, ctx.currentPlayer);
            return
        }

        minionDeployInitialize({G, ctx, random, events}, card, ctx.currentPlayer, fieldIdx);

        if(card.effect.onPlay){
            card.effect.onPlay.split(' ').map((fn)=>onPlayEffect[fn]({G, ctx, random, events}, card))
        }
    }

    player.hand.splice(handIdx, 1);

    // Deduct the cost from the player's available cost
    player.cost -= card.cost;

    logMsg({G, ctx}, `player ${ctx.currentPlayer} played ${card.name} at (${Math.floor(fieldIdx/4)}, ${fieldIdx%4})`)
}

/**Triggers in boardgame.io setup. Calls gameInitialize to setup the game */
function set({random}){
    const G = {};
    setupGame({G, random})
    return G
}

function action({G, ctx, random, events}, fromId, toId){
    const card = G.field[fromId]
    const pid = ctx.currentPlayer
    const player = G.player[pid]
    
    // Check if the player's minion is at the starting position
    if (!card || card.pid !== pid) {
        logPrivateMsg({G, ctx}, "Invalid starting position for the minion.", pid);
        return
    }

    if(card.exhausted){
        logPrivateMsg({G, ctx}, "Action failed: card is exhausted", pid)
        return
    }

    if(!adjacentSquares(fromId).includes(toId)){
        logPrivateMsg({G, ctx}, "Invalid target index: square must be adjacent", pid)
        return
    }

    if(G.field[toId] === null || G.field[toId].kind === "trap") {
        //condition check of Move
        if(card.cannotMove){
            logPrivateMsg({G, ctx}, "Move failed: minion has 'cannot move'", pid)
            return
        }

        if(player.movePt >= 1){
            player.movePt -= 1
        }else if(player.cost >= 1){
            player.cost -= 1
        }else{
            logPrivateMsg({G, ctx}, "No enough cost to move", pid)
            return
        }

        if(G.effect[ctx.currentPlayer].includes("lordOfSpikes")){
            dealDamage({G, ctx, random, events}, 2, fromId)
        }

        move({G, ctx, random, events}, fromId, toId)
    }
    else if(G.field[toId].pid === card.pid){
        //condition check of SwitchPlaces
        const card2 = G.field[toId]

        if(card2.exhausted){
            logPrivateMsg({G, ctx}, "Action failed: card is exhausted", pid)
            return
        }
        if(card.cannotMove || card2.cannotMove){
            logPrivateMsg({G, ctx}, "Move failed: minion has 'cannot move'", pid)
            return
        }

        if(player.movePt >= 2){
            player.movePt -= 2
        }else if(player.cost >= 2 - player.movePt){
            player.cost -= 2 - player.movePt
            player.movePt = 0
        }else{
            logPrivateMsg({G, ctx}, "No enough cost to move", pid)
            return
        }

        if(G.effect[ctx.currentPlayer].includes("lordOfSpikes")){
            dealDamage({G, ctx, random, events}, 2, fromId)
            dealDamage({G, ctx, random, events}, 2, toId)
        }

        switchPlaces({G, ctx, random, events}, fromId, toId)
    }
    else{
        //condition check of Battle
        if(card.cannotAttack){
            logPrivateMsg({G, ctx}, "Attack failed: minion has 'cannot attack'", ctx.currentPlayer)
            return
        }

        if(G.effect[ctx.currentPlayer].includes("lordOfSpikes")){
            dealDamage({G, ctx, random, events}, 2, fromId)
        }

        battle({G, ctx, random, events}, fromId, toId)
    }
}

function inputDeck({G, events}, deck, pid){
    try{
        if(deck.length === 60){
            const cardsId = deck.match(/.{1,2}/g)
            G.player[pid].deck = cardsId.map(str=>parseInt(str, 16)).map(id=>CARDS.find(card=>card.id===id))
            events.endTurn()
        }
    }catch{
        return
    }
}

/**The game object */
export const Cardgame = {
    name: 'Cardgame',
    
    setup: set,
    
    phases: {
        construct: {
            moves: {
                inputDeck,
            },

            start: true,

            endIf: ({G})=>{
                return G.player[0].deck !== null && G.player[1].deck !== null
            },

            next: 'play',
        },
        play: {
            onBegin: (props)=>{
                gameInitialize(props)
            },

            moves: {
                playCard,
                gameInitialize,
                action,
                setTrap,
            },
        
            turn: {
                order: TurnOrder.CUSTOM_FROM('order'),

                onBegin: ({G, ctx, random, events}) => {
                    const player = G.player[ctx.currentPlayer];
        
                    draw({G, ctx, random, events}, ctx.currentPlayer)
                    if(player.maxCost<10){
                        player.maxCost+=1
                    }
                    player.cost = player.maxCost
                    G.turnNum += 1
                    player.movePt = G.turnNum === 1 ? 1 : 2
        
                    if(player.hero === 'green'){
                        player.trap = 1
                    }
        
                    for(let card of G.field){
                        if(card){
                            if(card.pid===ctx.currentPlayer){
                                if(card.effect.onTurnBegin){
                                    card.effect.onTurnBegin.split(' ').map((fn)=>onTurnBeginEffect[fn]({G, ctx, random, events}, card))
                                }
                            }
                            if(card.effect.onEveryTurnBegin){
                                card.effect.onEveryTurnBegin.split(' ').map((fn)=>onEveryTurnBeginEffect[fn]({G, ctx, random, events}, card))
                            }
                        }
                    }
                },
        
                onEnd: ({G, ctx, random, events}) => {
                    for(let card of G.field){
                        if(card){
                            if(card.pid===ctx.currentPlayer){
                                card.exhausted = false
                                if(card.effect.onTurnEnd){
                                    card.effect.onTurnEnd.split(' ').map((fn)=>onTurnEndEffect[fn]({G, ctx, random, events}, card))
                                }
                            }
                            if(card.effect.onEveryTurnEnd){
                                card.effect.onEveryTurnEnd.split(' ').map((fn)=>onEveryTurnEndEffect[fn]({G, ctx, random, events}, card))
                            }
                        }
                    }
                    G.effect[ctx.currentPlayer]=[]
                }
            },
        }
    },
}