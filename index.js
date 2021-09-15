// ==============
// Dependencies
// ==============
const express = require('express');
const hbs = require('handlebars');
const exphbs = require('express-handlebars');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server, Namespace } = require("socket.io");
const io = new Server(server);
const {userConnected, connectedUsers, initializeChoices, moves, makeMove, choices} = require("./public/js/rpsUsers");
const {createRoom, joinRoom, exitRoom, rooms} = require("./public/js/rpsRoom");
const Game = require('./game.js')
const PORT = (process.env.PORT || 3000)
const path = require("path");
// ==============
// Database
// ==============

// put db link here

// ==============
// Handlebars
// ==============
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

//rps logic
app.use(express.static(path.join(__dirname, "public")));

app.engine('hbs', exphbs({
  extname: 'hbs',
  //defaultview: 'main',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',
  handlebars: allowInsecurePrototypeAccess(hbs),
  helpers: 
  {
      formatDate: function(datetime) 
      {
          if (datetime !== null) {
              format = "MMMM DD YYYY";
              return moment(datetime).format(format);
          }
          else {
              return "";
          }
      },

      formatPrice: function(num)
      {
          return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      }
  }
}))

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

// ==============
// Routes
// ==============

app.use('/', require('./routes/sample'));



// players contains x, y, walking, and name
var game = new Game.RPSBR()

// main loop
var interval = setInterval(() => {
    if (game.active){
        game.checkRange()
        if (game.fighters.length > 0){
            game.fighters.forEach((fight) => {
                if (fight.started === false) {
                    // console.log("PASOK")
                    startFight(fight)
                }
            })
        }
        game.checkOutOfBounds()
        // game.checkMoved()
        if (game.checkWinner()){
            var winner = game.checkWinner()
            io.emit('ended', winner)
        }
    }
    io.emit('updated', game.updateTick())
    // console.log(game.updateTick())
}, 50)

var mapInterval = setInterval(() => {
  if (game.active){
    game.shrinkMap()
  }
}, 3000)

function startFight(fight){
    // console.log(roomId)
    
    //this is player 1
    // userConnected(socket.client.id);
    // createRoom(roomId, p1.socketID);
    // socket.emit("room-created", roomId);
    // socket.emit("player-1-connected");
    // socket.join(roomId);
    createRoom(fight.roomId)
    
    io.to(fight.p1.socketID).emit('plz_join', {roomId:fight.roomId, pId: 1})
    io.to(fight.p2.socketID).emit('plz_join', {roomId:fight.roomId, pId: 2})
    //signal that game is ready
}

io.on('connection', (socket) => {
  // on player join, needs index
    socket.on("join", (name) => {
        // const foundPlayer = game.findPlayer(name)
        // if (foundPlayer){
        //     io.to(socket.id).emit('joined', foundPlayer)
        // } else {
        //     const addResult = game.add(name)
        //     io.to(socket.id).emit('joined', addResult)
        // }
        if (!game.active){
            const addResult = game.add(name, socket.id)
            if (addResult === false){
                io.to(socket.id).emit('name_exists')
            }
            io.to(socket.id).emit('joined', addResult)
        } else {
            io.to(socket.id).emit('game_in_progress')
        }
        
    })

    // player move, takes index of player, direction, and new x y
    socket.on("move", (data) => {
        var {index, held_direction, x, y} = data
        game.playerMove(index, held_direction, x, y)
    })

    socket.on("reset", () => {
        game = new Game.RPSBR()
        io.emit('resetted')
    })

    socket.on("start", () => {
        if (!game.active && game.players.length >= 5){
            game.start()
            io.emit('server_place_client', game.players)
        } else {
            io.emit('not_enough_players', game.players.length)
        }
        
    })
  
	// socket.on("create-room", (roomId) => {
	//   if(rooms[roomId]){
    //         const error = "This room already exists";
    //         socket.emit("display-error", error);
    //     }else{
    //         userConnected(socket.client.id);
    //         createRoom(roomId, socket.client.id);
    //         socket.emit("room-created", roomId);
    //         socket.emit("player-1-connected");
    //         socket.join(roomId);
    //     }
	// })
	// socket.on("join-room", roomId => {
    //     if(!rooms[roomId]){
    //         const error = "This room doen't exist";
    //         socket.emit("display-error", error);
    //     }else{
    //         userConnected(socket.client.id);
    //         joinRoom(roomId, socket.client.id);
    //         socket.join(roomId);

    //         socket.emit("room-joined", roomId);
            
    //     }
	
    // })

    socket.on('joining', (roomId, pos) => {
        socket.join(roomId)
        joinRoom(roomId, socket.id, pos)
        const fightIndex = game.fighters.map((obj) => { return obj.roomId }).indexOf(roomId)
        userConnected(socket.id)

        if (rooms[roomId].length === 2){
            console.log("all")
            socket.emit("all_players_connected");
            socket.broadcast.to(roomId).emit("all_players_connected");
            game.fighters[fightIndex].started = true
            initializeChoices(roomId);
        }
    })

	//derived from codingexpert1999 RPS game
	socket.on("make-move", ({playerId, my_choice, roomId}) => {
        makeMove(roomId, playerId, my_choice);

		console.log(roomId + " " + playerId + " " + my_choice)
        console.log(choices[roomId])
        if(choices[roomId][0] !== "" && choices[roomId][1] !== ""){
            let playerOneChoice = choices[roomId][0];
            let playerTwoChoice = choices[roomId][1];
			console.log("Room ID: " + roomId);
			console.log("Player 1 Choice: " + playerOneChoice);
			console.log("Player 2 Choice: " + playerTwoChoice);
			/*
				win codes (when emitting):
					0 = draw
					1 = player 1 wins
					2 = player 2 wins
                    3 = both lose (both players were idle / didnt choose a move)
			*/
			
            if(playerOneChoice == playerTwoChoice){
                // Case 1a = BOTH Players are Idle, so they both lose
                if(playerOneChoice == "idle") {
                    let win_code = 3;
                    io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
                    game.endFight( {p1: rooms[roomId][0], p2: rooms[roomId][1]} , win_code)
                }
                // Case 1b = DRAW (players did the same move)
                else {
                    let win_code = 0;
                    io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
                }
            }
            // Case 2 = Player 1 Wins, Player 2 Loses
            else if(moves[playerOneChoice] === playerTwoChoice){
                let enemyChoice = "";

                if(playerId === 1){
                    enemyChoice = playerTwoChoice;
                }else{
                    enemyChoice = playerOneChoice;
                }
				// console.log("player 1 wins");
				let win_code = 1;
                io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
                game.endFight( {p1: rooms[roomId][0], p2: rooms[roomId][1]} , win_code)
            }
            // Case 3 = Player 1 Loses, Player 2 Wins
            else if(moves[playerTwoChoice] === playerOneChoice){
                let enemyChoice = "";

                if(playerId === 1){
                    enemyChoice = playerTwoChoice;
                }else{
                    enemyChoice = playerOneChoice;
                }
				// console.log("player 2 wins");
				let win_code = 2;
                io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
                game.endFight( {p1: rooms[roomId][0], p2: rooms[roomId][1]} , win_code)
            }
            // Case 4 = Player 1 is IDLE, Player 2 Wins
            else if(moves[playerOneChoice] == "idle" && moves[playerTwoChoice] != "idle"){
                let enemyChoice = "";

                if(playerId === 1){
                    enemyChoice = playerTwoChoice;
                }else{
                    enemyChoice = playerOneChoice;
                }
				console.log("player 2 wins");
				let win_code = 2;
                io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
                game.endFight( {p1: rooms[roomId][0], p2: rooms[roomId][1]} , win_code)
            }
            // Case 5 = Player 1 Wins, Player 2 is IDLE
            else if(moves[playerTwoChoice] == "idle" && moves[playerOneChoice] != "idle"){
                let enemyChoice = "";

                if(playerId === 1){
                    enemyChoice = playerTwoChoice;
                }else{
                    enemyChoice = playerOneChoice;
                }
				console.log("player 1 wins");
				let win_code = 1;
                io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
                game.endFight( {p1: rooms[roomId][0], p2: rooms[roomId][1]} , win_code)
            }

            choices[roomId] = ["", ""];
        }
    });

    // socket.on('disconnect', () => {
    //     game.disconnected(socket.id)
    //     io.emit('player_disconnect', game.players)
    // })
});

server.listen((PORT), () => {
  console.log('listening on *:3000');
});