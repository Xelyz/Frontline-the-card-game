/**the list of all heros */
export const HEROS=[
    {
        name: "Seraphina",
        atk: 0,
        hp: 20,
        kind: 'hero',
        color: 'green',
        desc: 'Once every turn of yours, you can right click an empty tile to set a 0/1 trap that deals 1 damage to whoever steps on it, only visible by you',
        effect: {
            onOut: 'lose'
        },
        img: 'url(/imgPack/Seraphina.png)',
    },
    {
        name: "Riven",
        atk: 1,
        hp: 20,
        kind: 'hero',
        color: 'blue',
        desc: '**Permanently has 1 atk**',
        effect: {
            onOut: 'lose'
        },
        img: 'url(/imgPack/Riven.png)',
    },
]