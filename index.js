// ==============
// Dependencies
// ==============
const express = require('express');
const hbs = require('handlebars');
const exphbs = require('express-handlebars');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = (process.env.PORT || 3000)
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

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on("move", (data) => {
    console.log(data)
    socket.broadcast.emit("moved", data)
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
                    3 = both lose (both players were idle / didnt choose a move)
			*/
			
            if(playerOneChoice === playerTwoChoice){
                // Case 1a = BOTH Players are Idle, so they both lose
                if(playerOneChoice == "idle") {
                    let win_code = 3;
                    io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
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
				console.log("player 1 wins");
				let win_code = 1;
                io.to(roomId).emit("show-results", {playerOneChoice, playerTwoChoice, win_code});
            }
            // Case 3 = Player 1 Loses, Player 2 Wins
            else if(moves[playerTwoChoice] === playerOneChoice){
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
            }

            choices[roomId] = ["", ""];
        }
    });
});

server.listen(port, () => {
  console.log('listening on *:' + port);
});