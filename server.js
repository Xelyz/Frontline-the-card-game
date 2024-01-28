import { Server, Origins } from 'boardgame.io/server';
import { Cardgame } from './src/Game.js';

const server = Server({ games: [Cardgame], origins:['https://frontline-the-card-game.pages.dev', '*', Origins.LOCALHOST]});
const PORT = process.env.PORT || 8000;

server.run(PORT);
