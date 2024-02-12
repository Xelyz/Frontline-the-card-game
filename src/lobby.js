import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import './lobby.css';
import { LobbyAPI } from './api.js';
import { Cardgame } from './Game.js';
import { CardBoard } from './Board.js';
import { withRouter } from './RouterWrapper';
import Background from './BackgroundWrapper.js';
import { address } from './config.js';

const api = new LobbyAPI();

const Game = Client({
  game: Cardgame,
  board: CardBoard,
  numPlayers: 2,
  multiplayer: SocketIO({ server: address }),
  seed: 114,
  debug: false,
});

class Lobby extends Component {
  state = {};
  constructor(props) {
    super(props);
    console.log('construct');
    this.state.id = this.props.params.id;
    this.state.joined = [];
    this.state.myID = null;
    this.state.userAuthToken = null;
  }
  componentDidMount() {
    this.checkRoomStateAndJoin();
    this.interval = setInterval(this.checkRoomState, 1000);
    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }
  cleanup() {
    console.log('cleaning up');
    api.leaveRoom(this.state.id, this.state.myID, this.state.userAuthToken);
    clearInterval(this.interval);
  }
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.cleanup.bind(this));
  }

  joinRoom = (player_no) => {
    const username = 'Player ' + player_no;
    if (this.state.id) {
      api.joinRoom(this.state.id, username, player_no).then(
        (authToken) => {
          console.log('Joined the room. Your id is: ', player_no);
          console.log(this.state);
          this.setState({ myID: player_no, userAuthToken: authToken });
        },
        (error) => {
          console.log(error);
        }
      );
    }
  };
  checkRoomStateAndJoin = () => {
    console.log('Checking room state.');
    if (this.state.id) {
      api.whosInRoom(this.state.id).then(
        (players) => {
          const joinedPlayers = players.filter((p) => p.name);
          this.setState({
            joined: joinedPlayers,
          });
          const myPlayerNum = joinedPlayers.length;
          this.joinRoom(myPlayerNum);
        },
        (error) => {
          console.log('Room does not exist.');
          this.setState({
            id: null,
          });
        }
      );
    }
  };
  checkRoomState = () => {
    if (this.state.id) {
      api.whosInRoom(this.state.id).then(
        (players) => {
          const joinedPlayers = players.filter((p) => p.name);
          this.setState({ 
            joined: joinedPlayers,
          });
        },
        (error) => {
          console.log('Room does not exist.');
          this.setState({
            id: null,
          });
        }
      );
    }
  };
  getPlayerItem = (player) => {
    if (player) {
      if (player.id === this.state.myID) {
        return (
          <div>
            <div className="player-item">
              <span>You [connected]</span>
              <div className="player-ready"></div>
            </div>
          </div>
        );
      } else {
        return (
          <div>
            <div className="player-item">
              {player.name}
              <div className="player-ready"></div>
            </div>
          </div>
        );
      }
    } else {
      return (
        <div>
          <div id="bars1">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      );
    }
  };
  copyToClipboard = () => {
    if(!navigator.clipboard){
      document.execCommand('copy', false, this.gameLinkBox.innerText);
    }
    else{
      navigator.clipboard.writeText(this.gameLinkBox.innerText).then(
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
  };
  gameExistsView = () => {
    const players = [0, 1];
    return (
      <div className='text-white'>
        <div className="game-link">
          <span>
            {this.props.isPublic ? 'Public lobby' : 'Private lobby'}
          </span>
          <br />
          {this.props.isPublic?'Waiting for others to join':<><div
            className="game-link-box text-black"
            ref={(gameLinkBox) => (this.gameLinkBox = gameLinkBox)}
          >
            {`${address}/lobby/${this.state.id}`}
          </div>
          <div className="menu-button small" onClick={this.copyToClipboard}>
            {this.state.copied ? 'Copied!' : ' Copy '}
          </div></>}
        </div>
        {this.state.joined.length}{' '}
        <span>
          Out of the 2 required players are in the{' '}
          {this.props.isPublic ? 'public' : 'private'} lobby
        </span>
        <div className="game-code">{this.state.id}</div>:
        <div className="player-list">
          {players.map((p) => {
            const joinedPlayer = this.state.joined[p];
            return this.getPlayerItem(joinedPlayer);
          })}
        </div>
      </div>
    );
  };
  gameNotFoundView = () => {
    return (
      <>
        <div>
          <span>Error 404. Lobby with this game code not found.</span>
          <br />
          <Link to="/">
            <span>Go back and create a new lobby.</span>
          </Link>
        </div>
      </>
    );
  };
  getGameClient = () => {
    return (
      <Game
        matchID={this.state.id}
        players={this.state.joined}
        playerID={String(this.state.myID)}
        credentials={this.state.userAuthToken}
      />
    );
  };
  render() {
    let view
    if (this.state.joined.length === 2) {
      view = this.getGameClient();
    }
    else{
      view = this.state.id ? this.gameExistsView() : this.gameNotFoundView()
    }
    return <>
      <audio loop autoPlay> 
        <source src={`${address}/EradicationCatastrophe.mp3`} type="audio/mpeg"/>
      </audio>
      {view}
    </>
  }
}

export default Background(withRouter(Lobby));