import { adjacentSquares, clearField, dealDamage, draw, summon, out, enemyOf } from "./Game"
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
    assassin: ({G}, card) => {
        const player = G.player[card.pid]
        if (player.hand.length >= G.handLimit) {
            return;
        }
        player.hand.push({...CARDS.find(card => card.name === "Assassinate")})
    },

    soulOfSoldier: ({G, ctx, random, events}, card) => {
        for(let idx in G.field){
            const square = G.field[idx]
            if(square && square.kind==='hero' && square.pid===card.pid){
                dealDamage({G, ctx, random, events}, 2, idx)
                clearField({G, ctx, random, events})
            }
        }
    }
}

export const onOutEffect = {
    /**Lose the game */
    lose: ({G, events}, hero) => {
        G.playing = false
        events.endGame({loser: hero.pid, winner: enemyOf(hero.pid)})
    },
    magicBunny: ({G, ctx, random, events}, card) => {
        draw({G, ctx, random, events}, card.pid)
    }
}

export const onDamagedEffect = {
    /**Draw a card */
    thief: ({G, ctx, random, events}, card) => {
        draw({G, ctx, random, events}, card.pid)
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
    portal: ({G, ctx, random, events}, card)=>{
        summon({G, ctx, random, events}, {...CARDS.find(card => card.name === "Goblin")}, adjacentSquares(card.idx), card.pid)
    }
}

export const onEveryTurnBeginEffect = {
    /**Deal 1 damage to opponent's hero*/
    archerTower: ({G, ctx, random, events}, card)=>{
        for(let idx in G.field){
            const square = G.field[idx]
            if(square && square.kind==='hero' && square.pid===enemyOf(card.pid)){
                dealDamage({G, ctx, random, events}, 1, idx)
                clearField({G, ctx, random, events})
            }
        }
    }
}

export const onTurnEndEffect = {

}

export const onEveryTurnEndEffect = {

}

export const SpellEffect = {
    /**Deal 1 damage to all characters on a square and its adjacent squares.*/
    potion: ({G, ctx, random, events}, targetIdx)=>{
        let targets = adjacentSquares(targetIdx)
        targets.push(targetIdx)
        targets = targets.filter(idx => G.field[idx] !== null)
        targets.map(target => dealDamage({G, ctx, random, events}, 1, target))
        clearField({G, ctx, random, events})
    },

    /**Destroy an enemy minion*/
    assassinate: ({G, ctx, random, events, card}, targetIdx)=>{
        const target = G.field[targetIdx]
        if(target && target.pid === enemyOf(card.pid) && target.kind === 'minion'){
            out({G, ctx, random, events}, targetIdx)
        }
        else{
            console.log("Invalid target")
            G.invalid = true
        }
    },

    /**Destroy all unmovable minions. Randomly shuffle the positions of all minions and heros on the field.*/
    tornado: ({G, ctx, random, events})=>{
        const indices = random.Shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])
        for(let idx in G.field){
            const card = G.field[idx]
            if(card === null){
                continue
            }
            if(card.cannotMove){
                out({G, ctx, random, events}, idx)
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
    },

    stab: ({G, ctx, random, events}, targetIdx)=>{
        dealDamage({G, ctx, random, events}, 2, targetIdx)
        clearField({G, ctx, random, events})
    },

    rollingRock: ({G, ctx, random, events}, targetIdx)=>{
        [0,1,2,3].forEach(value=>dealDamage({G, ctx, random, events}, 2, value*4+targetIdx%4))
        clearField({G, ctx, random, events})
    },

    wrathOfFire: ({G, ctx, random, events}, targetIdx)=>{
        [0,1,2,3].forEach(value=>dealDamage({G, ctx, random, events}, 3, value+targetIdx-targetIdx%4))
        clearField({G, ctx, random, events})
    },

    uplift: ({G, ctx, random, events, card}) => {
        for(let idx in G.field){
            if(G.field[idx] && G.field[idx].pid === card.pid && G.field[idx].kind === "minion"){
                G.field[idx].atk+=1
                G.field[idx].hp+=1
                G.field[idx].currHp+=1
            }
        }
    }
}

export const triggerEffect = {
    mouseTrap: ({G, ctx, random, events}, card)=>{
        dealDamage({G, ctx, random, events}, 1, card.idx)
        clearField({G, ctx, random, events})
    }
}