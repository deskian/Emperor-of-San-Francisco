import React from 'react';
import PlayerView from './player_view.js';
import Players from './players.js';
import PlayerActions from './player_actions.js';
import TurnView from './turn_view.js';
import Board from './board.js';
import PregameView from './pregame_view.js';
import Monster from './monster.js';
import _ from 'lodash';
import Dices from './dices.js';
import CardsView from './cards.js';
import ResetButton from './reset_button.js';
import WebRTC from './webRTC.js';
import SimpleWebRTC from 'simplewebrtc';

const socket = io.connect();

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      victoryPoints: [0, 0, 0, 0, 0, 0],
      healthPoints: [10, 10, 10, 10, 10, 10],
      energy: [0, 0, 0, 0, 0, 0],
      currentUser: 1,
      currentTurn: 1,
      otherPlayers: [],
      currentEmperor: -1,
      cards: [],
      cardsIndividual: [[], [], [], [], [], []],
      gameStart: false,
      userMonsters: [],
      userNicknames: [],
    };
    socket.on("win", this._win);
    socket.on("lose", this._lose);    
    socket.on('getUser', this._currentUser.bind(this));
    socket.on('loadUsers', this._userConnect.bind(this));
    socket.on('updateTurn', this._updateTurn.bind(this));
    socket.on('updateVP', this._updateVP.bind(this));
    socket.on('updateHP', this._updateHP.bind(this));
    socket.on('updateEnergy', this._updateEnergy.bind(this));
    socket.on('updateEmperor', this._updateEmperor.bind(this));
    socket.on('updateCards', this._userCards.bind(this));
    socket.on('updateUserMonsters', this._updateUserMonsters.bind(this));
    socket.on('updateUserNicknames', this._updateUserNicknames.bind(this));
    socket.on('startGame', this._onGameStart.bind(this));
  }
  
  _updateUserMonsters(userMonsters) {
    this.setState({ userMonsters });
  }
  
  _win(msg) {
    alert(msg);
  }
  
  _lose(msg) {
    alert(msg);
  }

  _onGameStart(gameStart) {
    this.setState({ gameStart });
    const room = 'raa';
    const webrtc = new SimpleWebRTC({
      // the element that will hold local video
      localVideoEl: 'localVideo',
      // the element that will hold remote videos
      remoteVideosEl: 'remotes',
      autoRequestMedia: true,
      log: true,
    });
    console.log(this.state.currentUser);
    if (this.state.currentUser===0) {
      webrtc.createRoom(room, function(err, name) {
        if (!err) {
          console.log('raaaaa');
        }
      });       
    } 
    webrtc.on('readyToCall', () => {
      webrtc.joinRoom(room);
    });
  }

  _updateUserNicknames(userNicknames) {
    this.setState({ userNicknames });
  }



  _userConnect(newPlayer) {
    const otherPlayerIDs = newPlayer;
    otherPlayerIDs.splice(this.state.currentUser, 1);
    this.setState({ users: newPlayer });
    this.setState({ otherPlayers: otherPlayerIDs });
  }

  _currentUser(currentUser) {
    const { otherPlayers } = this.state;
    otherPlayers.splice(currentUser, 1);
    this.setState({ currentUser });
    this.setState({ otherPlayers });
  }

  // This update the common card pile, the 3 available card for buying
  _userCards(cardsIndividual) {
    this.setState ({ cardsIndividual });
  }

  _updateTurn(currentTurn) {
    this.setState({ currentTurn });
  }

  _updateVP(victoryPoints) {
    this.setState({ victoryPoints });
  }

  _updateHP(healthPoints) {
    this.setState({ healthPoints });
  }

  _updateEnergy(energy) {
    this.setState({ energy });
  }

  _updateEmperor(currentEmperor) {
    this.setState({ currentEmperor });
  }


  gameView(mainStyle, playerViewStyle) {
    return (
      <div style={mainStyle}>
        <Dices 
          socket={socket}
        />
        <CardsView
          socket={socket}
          currentUser={this.state.currentUser}
          currentTurn={this.state.currentTurn}
          gameStart={this.state.gameStart}
        />
        
        <Board />

        {/* Current Player View */}
        <div style={playerViewStyle}>
          <PlayerView
            key={this.state.currentUser}
            player={this.state.currentUser}
            healthPoints={this.state.healthPoints}
            victoryPoints={this.state.victoryPoints}
            energy={this.state.energy}
            cardsIndividual={this.state.cardsIndividual}
            userNicknames={this.state.userNicknames}
            userMonsters={this.state.userMonsters}
            currentTurn={this.state.currentTurn}
            currentEmperor={this.state.currentEmperor}
          />
        </div>
        <PlayerActions
          socket={socket}
          player={this.state.currentUser}
          otherPlayers={this.state.otherPlayers}
          stayOrLeave={this.state.stayOrLeave}
          currentTurn={this.state.currentTurn}
          currentEmperor={this.state.currentEmperor}
        />

        {/* Other Players View */}
        <Players
          player={this.state.currentUser}
          otherPlayers={this.state.otherPlayers}
          victoryPoints={this.state.victoryPoints}
          healthPoints={this.state.healthPoints}
          energy={this.state.energy}
          cardsIndividual={this.state.cardsIndividual}
          userNicknames={this.state.userNicknames}
          userMonsters={this.state.userMonsters}
          currentTurn={this.state.currentTurn}
          currentEmperor={this.state.currentEmperor}
        />
        <Monster         
          currentEmperor={this.state.currentEmperor}
          userMonsters={this.state.userMonsters}
          player={this.state.currentUser}
        />
        <ResetButton
          socket={socket}
        />
      </div>
    );
  }

  lobbyView() {
    return (
      <PregameView
        socket={socket}
        users={this.state.users}
        player={this.state.currentUser}
        userMonsters={this.state.userMonsters}
        userNicknames={this.state.userNicknames}
      />
    );
  }

  render() {
    const mainStyle = {
      width: 'inherit',
      height: 'inherit',
      backgroundImage: 'url(../../client/images/wood_background.jpg)',
      zIndex: -1,
      overflow: 'hidden',
    };

    const playerViewStyle = {
      display: 'inline-block',
      position: 'relative',
      margin: 0,
      padding: 0,
      top: -575,
      left: 740,
    };

    return (this.state.gameStart ? this.gameView(mainStyle, playerViewStyle) : this.lobbyView());
  }
}
