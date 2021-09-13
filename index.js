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
const {userConnected, connectedUsers, initializeChoices, moves, makeMove, choices} = require("./public/js/rpsUsers");
const {createRoom, joinRoom, exitRoom, rooms} = require("./public/js/rpsRoom");

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
        game.checkOutOfBounds()
        game.checkWinner()
    }
    io.emit('updated', game.updateTick())
    // console.log(game.updateTick())
}, 10)

var mapInterval = setInterval(() => {
  if (game.active){
    game.shrinkMap()
  }
}, 3000)


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
            const addResult = game.add(name)
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
        game.start()
        io.emit('server_place_client', game.players)
    })
  
	socket.on("create-room", (roomId) => {
	  if(rooms[roomId]){
            const error = "This room already exists";
            socket.emit("display-error", error);
        }else{
            userConnected(socket.client.id);
            createRoom(roomId, socket.client.id);
            socket.emit("room-created", roomId);
            socket.emit("player-1-connected");
            socket.join(roomId);
        }
	})
	socket.on("join-room", roomId => {
        if(!rooms[roomId]){
            const error = "This room doen't exist";
            socket.emit("display-error", error);
        }else{
            userConnected(socket.client.id);
            joinRoom(roomId, socket.client.id);
            socket.join(roomId);

            socket.emit("room-joined", roomId);
            socket.emit("all_players_connected");
            socket.broadcast.to(roomId).emit("all_players_connected");
            initializeChoices(roomId);
        }
	
    })
	//derived from codingexpert1999 RPS game
	socket.on("make-move", ({playerId, my_choice, roomId}) => {
        makeMove(roomId, playerId, my_choice);
		console.log(roomId + " " + playerId + " " + my_choice)
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
			*/
			
            if(playerOneChoice === playerTwoChoice){
                let win_code = 0;
                io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
                
            }else if(moves[playerOneChoice] === playerTwoChoice){
                let enemyChoice = "";

                if(playerId === 1){
                    enemyChoice = playerTwoChoice;
                }else{
                    enemyChoice = playerOneChoice;
                }
				console.log("player 1 wins");
				let win_code = 1;
                io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
            }else{
                let enemyChoice = "";

                if(playerId === 1){
                    enemyChoice = playerTwoChoice;
                }else{
                    enemyChoice = playerOneChoice;
                }
				console.log("player 2 wins");
				let win_code = 2;
                io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
            }

            choices[roomId] = ["", ""];
        }
    });
});

server.listen((PORT), () => {
  console.log('listening on *:3000');
});