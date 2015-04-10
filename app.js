var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var allPoints = [];
var chatMessages = [];
var connectedUsers = 0;


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  connectedUsers = connectedUsers + 1;

  socket.emit('page-load', {points:allPoints, messages:chatMessages});

  io.emit('connected-users', connectedUsers);

  socket.on('point', function(data){
    io.emit('new-point', data);
    allPoints.push(data);
  });

  socket.on('clear-page', function(){
    io.emit('erase');
    allPoints = [];
  });
  socket.on('chat-message', function(msg){
    if(msg == '/erase'){
      io.emit('erase-chat');
      chatMessages = [];
    }
    else{
      io.emit('new-chat-message', msg);
      chatMessages.push(msg);
    }
  });
  socket.on('disconnect', function(){
    connectedUsers = connectedUsers - 1;
    io.emit('connected-users', connectedUsers);
  });
});


http.listen(8080, function(){
  console.log('listening on *:8080');
});
