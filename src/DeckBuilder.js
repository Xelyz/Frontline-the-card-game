import { Component } from "react";
import { CARDS } from "./Cards";
import { withRouter } from "./RouterWrapper";
import Background from "./BackgroundWrapper";

/**
 * String interpreter
 * Sample string:
 * "
 * hero green
 * 2x Mouse
 * 1x Boxer
 * ...
 * "
 * total card: 25
 */

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
        this.handleDragOver = this.handleDragOver.bind(this)
        this.handleDrop = this.handleDrop.bind(this)
        this.release = this.release.bind(this)
    }

    allowDrag(e){
        this.setState({dragging: e.target.id})
        this.setState({mousePosition: [e.clientX, e.clientY]})
        document.getElementById('deckbar').addEventListener('mouseover', this.handleDragOver)
        document.getElementById('deckbar').addEventListener('mouseup', this.handleDrop)
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

    handleDragOver(e){
        console.log('over')
    }

    handleDrop(e){
        const id = this.state.dragging
        console.log(id)
    }

    release(e){
        const draggedElement = document.getElementById(this.state.dragging);
        draggedElement.style.transform = ''
        draggedElement.style.zIndex = 0
        draggedElement.style.cursor = 'grab'
        this.setState({dragging: false})
        document.getElementById('deckbar').removeEventListener('mouseover', this.handleDragOver)
        document.getElementById('deckbar').removeEventListener('mouseup', this.handleDrop)
        window.removeEventListener('mouseup', this.release)
    }

    cardList(){
        const card = CARDS.map((card)=>
        <div id={card.id}
        className='relative rounded-md bg-white/40 shadow-lg h-60 w-60 box-content text-center select-none cursor-grab'
        style={{backgroundImage: card.img, backgroundSize: 'cover'}}
        onMouseDown={this.allowDrag}
        onMouseMove={this.handleDrag}>
            <p className='atk text-2xl' style={{color: 'cyan'}}>{card.atk}</p>
            <p className='hp text-2xl' style={{color: 'cyan'}}>{card.hp}</p>
            <p className='cost text-2xl' style={{color: 'violet'}}>{card.cost}</p>
            <p className='absolute -bottom-7 text-xl left-1/2 px-1 -translate-x-1/2 w-fit text-white bg-black/25'>{card.name}</p>
        </div>)
        return (
            <div className='grid grid-cols-4 h-screen w-4/5 gap-y-8 overflow-y-scroll overflow-x-visible'>
                {card}
            </div>
        )
    }

    deckBar(){
        return (
            <div id='deckbar' className='w-1/6 bg-amber-500/50 backdrop-blur-sm border-8 border-black select-none cursor-default'>
                <div className='w-full bg-white text-center text-2xl rounded'>Your deck</div>
            </div>
        )
    }

    render(){
        return (
            <div className='flex flex-row justify-between'>
                {this.cardList()}
                {this.deckBar()}
            </div>
        )
    }
}

export default Background(withRouter(DeckBuilder))