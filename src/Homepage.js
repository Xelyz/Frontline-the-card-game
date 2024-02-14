import React, { Component } from 'react';
import './Homepage.css';
import { LobbyAPI } from './api.js';
import { withRouter } from './RouterWrapper';
import Background from './BackgroundWrapper.js';

const api = new LobbyAPI();
class HomePage extends Component {
  state = {
    loading: false,
    redirect: null,
  };

  createGame = () => {
    console.log('createGame');
    if (this.state.loading) {
      return;
    } else {
      this.setState({
        loading: true,
      });
    }
    api.createRoom(2, true).then(
      (roomID) => {
        console.log('Created room with roomID = ', roomID);
        this.setState({ loading: false });
        this.props.navigate('/lobby/' + roomID);
      },
      (err) => {
        console.log(err);
        this.setState({ loading: false });
      }
    );
  };

  joinQueue = () => {
    console.log('Joining the public queue.');
    api.listAllPublicGames().then(
      (data) => {
        const publicMatches = data.matches;
        const availablePublicMatches = [];
        for (let match of publicMatches) {
          if (match.players[1].name === undefined) {
            availablePublicMatches.push(match);
          }
        }
        if (availablePublicMatches.length === 0) {
          api.createRoom(2, false).then((matchID) => {
            console.log(
              `No players waiting in the queue. Created a public lobby (id: ${matchID}).`
            );
            this.props.navigate('/public_lobby/' + matchID);
          });
        } else {
          console.log(
            `A player is waiting for an opponent. Joining his public lobby (id: ${availablePublicMatches[0].matchID}).`
          );
          this.props.navigate('/public_lobby/' + availablePublicMatches[0].matchID);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  };

  render() {
    return (
      <>
          <p className='text-[160px] text-white bg-black/10 w-full absolute top-1/3 -translate-y-1/2 text-center' style={{fontFamily: 'Title, Arial, sans-serif'}}>FRONTLINE</p>
          <div className='text-center text-2xl mb-20 w-full fixed bottom-0 left-0 right-0'>
            <div
              className="menu-button"
              id="new-game"
              onClick={() => this.createGame()}
            >
              <span>Create Private Room</span>
            </div>
            <div
              className="menu-button"
              id="list-games"
              onClick={() => this.joinQueue()}
            >
              <span>Match!</span>
            </div>
            <div
              className="menu-button"
              id="join-game"
              onClick={() => {
                this.props.navigate('/join');
              }}
            >
              <span>Join Others</span>
            </div>
            <div
              className="menu-button"
              id="deck"
              onClick={() => {
                this.props.navigate('/deck');
              }}
            >
              <span>Deck</span>
            </div>
          </div>
      </>
    );
  }
}

export default Background(withRouter(HomePage));