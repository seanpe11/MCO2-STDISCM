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

// ==============
// Database
// ==============

// put db link here

// ==============
// Handlebars
// ==============
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

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

const update = (socket, data) => {
  socket.broadcast.emit("moved", data)
}

// main loop
var interval = setInterval(() => {
  io.emit('updated')
}, 10)

var players = []

io.on('connection', (socket) => {
  // on player join, needs index
  socket.on("join", (data) => {
    players.append(data.name)
    socket.emit('joined', {index: playerIndex - 1, nPlayers: players.length}) // return index back to player
  })

  socket.on("move", (data) => {
    update(socket, data)
    console.log(data)
  })
});

server.listen((3000 || process.env.PORT), () => {
  console.log('listening on *:3000');
});