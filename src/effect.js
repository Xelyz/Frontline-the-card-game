import { adjacentSquares, clearField, dealDamage, draw, summon, logMsg, out, enemyOf } from "./Game"
import {CARDS} from "./Cards"

export const onMoveEffect = {
    
}

export const onSurvivingDamageEffect = {

}

export const onPlayEffect = {
    /**Gain 2 hp */
    shield: ({G, ctx}, card) => {
        card.hp+=2
        card.currHp+=2
    },

    /**Deploy: summon a mouse on a random adjacent square */
    mouse: ({G, ctx, random, events}, card) => {
        summon({G, ctx, random, events}, {...CARDS.find(card => card.name === "Mouse")}, adjacentSquares(card.idx), card.pid)
    },

    /**Add an Assassinate into your hand */
    assassin: ({G, ctx}, card) => {
        const player = G.player[card.pid]
        if (player.hand.length >= G.handLimit) {
            return;
        }
        player.hand.push({...CARDS.find(card => card.name === "Assassinate")})
    },

    soulOfSouldier: ({G, ctx, events}, card) => {
        for(let idx in G.field){
            const square = G.field[idx]
            if(square && square.kind==='hero' && square.pid===card.pid){
                dealDamage({G, ctx}, 2, idx)
                clearField({G, ctx, events})
            }
        }
    }
}

export const onOutEffect = {
    /**Lose the game */
    lose: ({G, ctx, events}, hero) => {
        G.playing = false
        events.endGame({loser: hero.pid, winner: enemyOf(hero.pid)})
    },
    magicBunny: ({G, ctx}, card) => {
        draw({G, ctx}, card.pid)
    }
}

export const onDamagedEffect = {
    /**Draw a card */
    thief: ({G, ctx}, card) => {
        draw({G, ctx}, card.pid)
    }
}

export const onAttackEffect = {
    /**Gain 2 atk */
    boxer: ({G, ctx}, card)=>{
        card.atk+=2
    }
}

export const onDefenseEffect = {
    /**Gain 2 atk */
    boxer: ({G, ctx}, card)=>{
        card.atk+=2
    }
}

export const onTurnBeginEffect = {
    /**Summon one 2/1 mini goblin on a random adjacent square*/
    portal: ({G, ctx, random}, card)=>{
        summon({G, ctx, random}, {...CARDS.find(card => card.name === "Goblin")}, adjacentSquares(card.idx), card.pid)
    }
}

export const onEveryTurnBeginEffect = {
    /**Deal 1 damage to opponent's hero*/
    archerTower: ({G, ctx, events}, card)=>{
        for(let idx in G.field){
            const square = G.field[idx]
            if(square && square.kind==='hero' && square.pid===enemyOf(card.pid)){
                dealDamage({G, ctx}, 1, idx)
                clearField({G, ctx, events})
            }
        }
    }
}

export const SpellEffect = {
    /**Deal 1 damage to all characters on a square and its adjacent squares.*/
    potion: ({G, ctx, events}, targetIdx)=>{
        let targets = adjacentSquares(targetIdx)
        targets.push(targetIdx)
        targets = targets.filter(idx => G.field[idx] !== null)
        targets.map(target => dealDamage({G, ctx}, 1, target))
        clearField({G, ctx, events})
    },

    /**Destroy an enemy minion*/
    assassinate: ({G, ctx, events, card}, targetIdx)=>{
        const target = G.field[targetIdx]
        if(target && target.pid === enemyOf(card.pid) && target.kind === 'minion'){
            out({G, ctx, events}, targetIdx)
        }
        else{
            console.log("Invalid target")
            G.invalid = true
        }
    },

    /**Destroy all unmovable minions. Randomly shuffle the positions of all minions and heros on the field.*/
    tornado: ({G, ctx, random})=>{
        const indices = random.Shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])
        for(let idx in G.field){
            const card = G.field[idx]
            if(card === null){
                continue
            }
            if(card.cannotMove){
                out({G, ctx}, idx)
            }
        }
        let minionList = G.field.filter((card) => card !== null)
        let newField = Array(16).fill(null)
        for(let idx in minionList){
            const card = minionList[idx]
            newField[indices[idx]] = card
            card.idx = indices[idx]
        }
        G.field = newField
    }
}

export const triggerEffect = {
    mouseTrap: ({G, ctx, events}, card)=>{
        dealDamage({G, ctx}, 1, card.idx)
        clearField({G, ctx, events})
    }
}