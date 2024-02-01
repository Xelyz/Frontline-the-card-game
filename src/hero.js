function heroProperty(hero){
    return {
        onOut: 'lose',
        kind: 'hero',
        ...hero
    }
}

/**the list of all heros */
export const HEROS=[
    {
        name: "Seraphina",
        atk: 0,
        hp: 15,
        color: 'green',
        desc: 'Once every turn of yours, you can right click an empty tile to set a 0/1 trap that deals 1 damage to whoever steps on it, only visible by you',
        effect: {
        },
        img: 'url(/imgPack/Seraphina.png)',
    },
    {
        name: "Riven",
        atk: 2,
        hp: 15,
        color: 'blue',
        desc: '**Permanently has 2 atk**',
        effect: {
        },
        img: 'url(/imgPack/Riven.png)',
    },
].map(heroProperty)