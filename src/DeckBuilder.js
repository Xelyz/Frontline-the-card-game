import { Component } from "react";
import { CARDS } from "./Cards";
import { withRouter } from "./RouterWrapper";
import Background from "./BackgroundWrapper";

class DeckBuilder extends Component{
    state = {
        deck: {},
        dragging: false,
        mousePosition: [0,0],
        preview: false,
        copied: false,
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
        this.copyDeck = this.copyDeck.bind(this)
    }

    preventDefault(e){
        e.preventDefault()
    }

    componentDidMount(){
        window.addEventListener('contextmenu', this.preventDefault)
    }

    componentWillUnmount(){
        window.removeEventListener('contextmenu', this.preventDefault)
    }

    allowDrag(e){
        if(e.ctrlKey){
            this.setState({preview: e.target.id})
        }else{
            this.setState({dragging: e.target.id})
            this.setState({mousePosition: [e.clientX, e.clientY]})
            document.getElementById('deckbar').addEventListener('mouseenter', this.handleDragEnter)
            document.getElementById('deckbar').addEventListener('mouseup', this.handleDrop)
            document.addEventListener('mousemove', this.handleDrag);
            window.addEventListener('mouseup', this.release)
        }
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
            <p className='h-7 text-xl w-60 text-center px-1 text-white bg-black/25 select-none cursor-default'>{card.name}</p>
        </div>)
        return (
            <div className='grid mt-5 grid-cols-4 w-full gap-y-2 overflow-y-scroll overflow-x-visible'>
                {card}
            </div>
        )
    }

    clearDeck(e){
        this.setState({deck: {}})
    }

    copyDeck(e){
        if(Object.values(this.state.deck).reduce((accumulator, currentValue) => accumulator + currentValue, 0) === 30){
            let deckInfo = ''
            for(let id in this.state.deck){
                let str = parseInt(id).toString(16)
                console.log(str)
                if(str.length<2){
                    str = '0'+str
                }
                deckInfo += str.repeat(this.state.deck[id])
            }
            if(!navigator.clipboard){
                document.execCommand('copy', false, deckInfo);
            }
            else{
                navigator.clipboard.writeText(deckInfo).then(
                function(){
                    
                })
                .catch(
                function() {
        
                });
            }
            
            this.setState({ copied: true });
            setTimeout(
                function () {
                this.setState({ copied: false });
                }.bind(this),
                1000
            );
        }else{
            document.getElementById('hint').innerHTML = 'Export deck when it contains exactly 30 cards'
            setTimeout(() => {
                document.getElementById('hint').innerHTML = 'Ctrl+Click on card to show card information'
            }, 1500);
        }
    }

    removeCardFromDeck(e){
        if(e.ctrlKey){
            this.setState({preview: e.currentTarget.id.slice(1)})
        }else{
            const id = e.currentTarget.id.slice(1)
            console.log(id)
            this.setState({
                deck: {
                    ...this.state.deck,
                    [id]: this.state.deck[id]-1
                }
            })
        }
    }

    deckBar(){
        let cardInDeck = []
        for(let id in this.state.deck){
            if(this.state.deck[id]>0){
                const card = CARDS.find(card=>card.id.toString() === id)
                const bg = {'minion': 'bg-blue-300', 'spell': 'bg-blue-500', 'trap': 'bg-sky-600'}[card.kind]
                cardInDeck.push(<div id={`d${id}`} className='h-10 m-1 border border-black flex flex-row rounded' onClick={this.removeCardFromDeck} onContextMenu={e=>e.preventDefault()}>
                    <div className='h-full aspect-square bg-black text-white text-center text-xl'>{this.state.deck[id]}</div>
                    <div className={`text-2xl ${bg} text-center flex-grow`}>{card.name}</div>
                </div>)
            }
        }

        return (
            <div id='deckbar' className='bg-amber-500/50 basis-1/5 h-full backdrop-blur-sm border-8 border-black select-none cursor-default relative flex flex-col' onMouseOut={this.handleDragOut}>
                <div className='w-full bg-white text-center text-2xl rounded'>Your deck</div>
                <div className='grow overflow-y-scroll'>{cardInDeck}</div>
                <div className='flex h-10 m-2 text-2xl justify-between'>
                    <button className='h-10 px-2 rounded bg-white hover:bg-slate-300 hover:scale-105 transition-transform' onClick={this.clearDeck}>Clear</button>
                    <button className='h-10 px-2 rounded bg-lime-400 hover:bg-lime-500 hover:scale-105 transition-transform' onClick={this.copyDeck}>{this.state.copied?'Copied!':'Export'}</button>
                    <p className='text-white'>{`${Object.values(this.state.deck).reduce((accumulator, currentValue) => accumulator + currentValue, 0)}/30`}</p>
                </div>
            </div>
        )
    }

    preview(){
        function exit(e){
            this.setState({preview: false})
        }
        const cardSelected = CARDS.find(card => card.id.toString() === this.state.preview)
        return <div id='cardPreview' className='absolute top-0 left-0 w-full h-full z-50 bg-black/40' onClick={exit.bind(this)}>
            <div className='absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2'>
                <div className='relative rounded-md bg-white shadow-lg h-[500px] w-80 my-7 box-content text-center'>
                    <div className='w-80 h-80 rounded-md bg-slate-200' style={{backgroundImage: cardSelected.img, backgroundSize: 'cover'}}/>
                    <p className='atk text-3xl' style={{color: 'cyan'}}>{cardSelected.atk}</p>
                    <p className='hp text-3xl' style={{color: 'cyan'}}>{cardSelected.hp}</p>
                    <p className='cost text-3xl' style={{color: 'violet'}}>{cardSelected.cost}</p>
                    <p className='absolute bottom-0 text-2xl font-mono w-full'>{cardSelected.kind}</p>
                    <div>
                        <p className='w-full text-3xl'>{cardSelected.name}</p>
                        <span>{cardSelected.desc}</span>
                    </div>
                </div>
            </div>
        </div>
    }

    render(){
        return (
            <>
                <div className='flex flex-row h-full'>
                    <div className='flex flex-col basis-4/5'>
                        <div className='flex text-3xl h-14 bg-white/40 backdrop-blur-sm'>
                            <button
                            className="h-14 px-4 bg-white rounded hover:bg-slate-300 hover:scale-105 transition-transform"
                            onClick={() => this.props.navigate('/')}
                            >
                                Return
                            </button>
                            <p id='hint' className='px-4'>Ctrl+Click on card to show card information</p>
                        </div>
                        {this.cardList()}
                    </div>
                    {this.deckBar()}
                </div>
                {this.state.preview?this.preview():''}
            </>
        )
    }
}

export default Background(withRouter(DeckBuilder))