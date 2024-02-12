## Overview
CardMonster is a turn-based strategic card game where players use a variety of cards, each with unique abilities and effects, to battle against their opponent's hero. Players must manage their resources, deploy minions, balance attack and defense and utilize strategic moves to gain victory.

## Game Components
1. **Game Board**: A 4x4 grid where players deploy cards to engage in battles (called field).
2. **Cards**: Basic resource to be able to play the game. 
	1. *Minion Cards*: Can only be placed on a tile that is adjacent to another tile containing an ally hero or minion. Minion cards have its own health points, attack power and abilities. When a minion card's health is reduced to (or below) 0, that card is removed from the field.
	2. *Trap Cards*: Can be played on any empoty tile on the board. It is not visible by the opponent. When any units(minions and heros) move to or are played at the same tile as a trap, the trap is triggered accordingly to the description(mostly dealing damage)
	3. *Spell Cards*: Can be played on any tile on the field. Trigger its effect on the selected tile. Green borders will indicate the valid tiles for casting the spell. 
3. **Heroes**: Each player has a hero character with 0 attack power, large health points, and special abilities. 
4. **Mana**: A resource used for playing cards. The gold bar represent the current and maximum mana a player currently have. The limit of max-mana is 10

## Setup
1. **Initialize Heroes**: The heroes exist on the board when the game starts. The player's hero is placed on the bottom left corner of the field and Opponent hero is on top right. 
2. **Cards**: Starting Player start the game with 4 cards in hand and the other Player starts with 5, drawn from their deck.
3. **Cost**: Players begin with 0 mana and 0 max-mana. 

### Winning the Game
The objective of this game is to reduce the opponent's hero's health points to zero. A player may win by achieving that.  

## Game Play

### Turn Structure
Each turn in Frontline is divided into several parts, in order:

1. **Turn Begins**: Player gain 1 max-mana, and their mana is filled to the same amount as max-mana. Player draw a card to hand from their deck.
2. **Action**: Here players can play cards from their hand onto the board, move cards on the board, or engage in battles with their opponent's cards. 
3. **Turn Ends**: Players end their turn. The opponent starts their turn. *Exhaustions* are removed.

### Playing Cards
- **Deploying Cards**: Players can play their card by paying the relative cost and choose a legal tile on the field. It is done by clicking the card in the hand and then clicking the tile on the field where you want to play the card

### Move & Battle (Action)
- **Move**: Players can move their owned minions or heroes to an adjacent tile by doing this: click the minion/hero that you want to move and then click the destination tile.
- **Battle**: Cards engage in battles by clicking the minion/hero as the attacker and an adjacent opponent minion/hero as the target.
- **Damage Calculation**: Damage is calculated based on the attacking and defending cards' attributes. Cards lose health points equal to the attack value of the opposing card.
- **Exhaustion**: Every time a minion card makes an action, it becomes *exhausted*, meaning that it cannot make action anymore this turn. When a minion card is played, it is initialized as *exhausted*.  