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

// ==============
// Database
// ==============

// put db link here

// ==============
// Handlebars
// ==============
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

//rps logic 
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
});

server.listen(port, () => {
  console.log('listening on *:' + port);
});