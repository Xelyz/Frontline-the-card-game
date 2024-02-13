import { Component } from "react";
import { CARDS } from "./Cards";
import { withRouter } from "./RouterWrapper";
import Background from "./BackgroundWrapper";

class DeckBuilder extends Component{
    state = {
        deck: {},
        dragging: false,
        mousePosition: [0,0],
    }

    constructor(props){
        super(props)
        this.allowDrag = this.allowDrag.bind(this)
        this.handleDrag = this.handleDrag.bind(this)
        this.handleDragEnter = this.handleDragEnter.bind(this)
        this.handleDragOut = this.handleDragOut.bind(this)
        this.handleDrop = this.handleDrop.bind(this)
        this.release = this.release.bind(this)
        this.clearDeck = this.clearDeck.bind(this)
        this.removeCardFromDeck = this.removeCardFromDeck.bind(this)
    }

    allowDrag(e){
        this.setState({dragging: e.target.id})
        this.setState({mousePosition: [e.clientX, e.clientY]})
        document.getElementById('deckbar').addEventListener('mouseenter', this.handleDragEnter)
        document.getElementById('deckbar').addEventListener('mouseup', this.handleDrop)
        document.addEventListener('mousemove', this.handleDrag);
        window.addEventListener('mouseup', this.release)
    }

    handleDrag(e) {
        if (this.state.dragging) {
            const [mouseX, mouseY] = this.state.mousePosition;
            const offsetX = e.clientX - mouseX;
            const offsetY = e.clientY - mouseY;
    
            // Update the position of the dragged element
            const draggedElement = document.getElementById(this.state.dragging);
            draggedElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            draggedElement.style.zIndex = 10
            draggedElement.style.cursor = 'grabbing'
        }
    }

    handleDragEnter(e){
        e.currentTarget.style.backgroundColor = 'rgba(180, 83, 9, 0.5)'
    }

    handleDragOut(e){
        e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.5)'
    }

    handleDrop(e){
        const id = this.state.dragging
        let num = this.state.deck[id] || 0
        if(Object.values(this.state.deck).reduce((accumulator, currentValue) => accumulator + currentValue, 0) >= 30){
            
        }
        else if(num<2){
            this.setState({
                deck: {
                    ...this.state.deck,
                    [id]: num+1
                }
            })
        }
    }

    release(e){
        const draggedElement = document.getElementById(this.state.dragging);
        draggedElement.style.transform = ''
        draggedElement.style.zIndex = 0
        draggedElement.style.cursor = 'grab'
        this.setState({dragging: false})
        document.getElementById('deckbar').removeEventListener('mouseenter', this.handleDragEnter)
        document.getElementById('deckbar').removeEventListener('mouseup', this.handleDrop)
        document.removeEventListener('mousemove', this.handleDrag);
        window.removeEventListener('mouseup', this.release)
    }

    cardList(){
        const card = CARDS.map((card)=>
        <div>
            <div id={card.id}
            className='relative rounded-md bg-white/40 shadow-lg h-60 w-60 box-content text-center select-none cursor-grab'
            style={{backgroundImage: card.img, backgroundSize: 'cover'}}
            onMouseDown={this.allowDrag}
            >
                <p className='atk text-2xl' style={{color: 'cyan'}}>{card.atk}</p>
                <p className='hp text-2xl' style={{color: 'cyan'}}>{card.hp}</p>
                <p className='cost text-2xl' style={{color: 'violet'}}>{card.cost}</p>
            </div>
            <p className='h-7 text-xl w-60 text-center px-1 text-white bg-black/25'>{card.name}</p>
        </div>)
        return (
            <div className='grid pt-20 grid-cols-4 h-screen w-full gap-y-2 overflow-y-scroll overflow-x-visible'>
                {card}
            </div>
        )
    }

    clearDeck(e){
        this.setState({deck: {}})
    }

    removeCardFromDeck(e){
        const id = e.currentTarget.id.slice(1)
        console.log(id)
        this.setState({
            deck: {
                ...this.state.deck,
                [id]: this.state.deck[id]-1
            }
        })
    }

    deckBar(){
        let cardInDeck = []
        for(let id in this.state.deck){
            if(this.state.deck[id]>0){
                const card = CARDS.find(card=>card.id == id)
                const bg = {'minion': 'bg-blue-300', 'spell': 'bg-blue-500', 'trap': 'bg-sky-600'}[card.kind]
                cardInDeck.push(<div id={`d${id}`} className='h-10 m-1 border border-black flex flex-row rounded' onClick={this.removeCardFromDeck}>
                    <div className='h-full aspect-square bg-black text-white text-center text-xl'>{this.state.deck[id]}</div>
                    <div className={`text-2xl ${bg} text-center flex-grow`}>{card.name}</div>
                </div>)
            }
        }

        return (
            <div id='deckbar' className='w-1/5 bg-amber-500/50 backdrop-blur-sm border-8 border-black select-none cursor-default relative'
            onMouseOut={this.handleDragOut}>
                <div className='w-full bg-white text-center text-2xl rounded'>Your deck</div>
                <button className='h-10 px-2 absolute bottom-1 left-1 text-2xl rounded bg-white' onClick={this.clearDeck}>Clear</button>
                <p className='absolute bottom-2 right-2 text-2xl text-white'>{`${Object.values(this.state.deck).reduce((accumulator, currentValue) => accumulator + currentValue, 0)}/30`}</p>
                {cardInDeck}
            </div>
        )
    }

    render(){
        return (
            <div className='flex flex-row'>
                {this.cardList()}
                {this.deckBar()}
            </div>
        )
    }
}

export default Background(withRouter(DeckBuilder))