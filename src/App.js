import { Client } from 'boardgame.io/react';
import { CardBoard } from './Board';
import { Cardgame } from './Game';
import { Local } from 'boardgame.io/multiplayer';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Homepage';
import JoinPage from './Joinpage';
import Lobby from './lobby';
import { Component } from 'react';
import DeckBuilder from './DeckBuilder';

const Game = Client({
  game: Cardgame,
  board: CardBoard,
  seed: 114514,
  numPlayers: 2,
  multiplayer: Local(),
});

class App extends Component{
  // (new URLSearchParams(window.location.search)).get('playerID');

  render(){ return <BrowserRouter>
      <Routes>
        <Route
          path="/"
          exact
          element={<HomePage/>}
        />
        <Route
          path="/join"
          exact
          element={<JoinPage/>}
        />
        <Route
          path="/deck"
          exact
          element={<DeckBuilder/>}
        />
        <Route path="/demo" exact element={<><Game playerID="0" demo="true"/><Game playerID="1" demo="true"/></>}/>
        <Route path="/lobby/:id" element={<Lobby/>}/>
        <Route
          path="/public_lobby/:id"
          element={<Lobby isPublic={true} />}
        />
        <Route
          path="*"
          element={<HomePage/>}
        />
      </Routes>
    </BrowserRouter>
  }
}

export default App;