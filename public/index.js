var socket = io();
var mice = {};
var mouseDown = false;
var myColor = getRandomColor();

//----------------------------------------------------------

newExcitingAlerts = (function () {
  var oldTitle = document.title;
  var msg = "User Connected!";
  var timeoutId;
  var blink = function() { document.title = document.title == msg ? ' ' : msg; };
  var clear = function() {
    clearInterval(timeoutId);
    document.title = oldTitle;
    window.onmousemove = null;
    timeoutId = null;
  };
  return function () {
    if (!timeoutId) {   
      timeoutId = setInterval(blink, 1000);
      window.onmousemove = clear;
    }
  };
}());

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function addChatMessage(msg) {
  $('#chat-room').prepend('<li style="border-left:1px">' + msg + '</li><hr style="margin:3px;margin-left:0px"></hr>');
}

function addNewPointToScreen(x, y, color){
  $("body").append(
    $('<div class="point"></div>')
        .css('position', 'absolute')
        .css('top', y + 'px')
        .css('left', x + 'px')
        .css('width', 10)
        .css('height', 10)
        .css('background-color', color)
  );
}

function sendMessage(){
  var msg = $('#chat-input').val();
  if(msg == '/new-color'){
    myColor = getRandomColor();
  }
  else{
    socket.emit('chat-message', msg);
  }
  $('#chat-input').val("");
}

//---------------------------------------------------------------

$("document").ready(function(e){
  $("#erase").click(function(){
    socket.emit('clear-page');
  });
  $("body").mouseup(function(e){
    mouseDown = false;
  });
  $("#canvas").mousemove(function(e) {
    if(mouseDown) {
      socket.emit('point', {x: e.pageX, y: e.pageY, color: myColor});
    }
  });
  $("body").mousedown(function(e) {
    mouseDown = true;
  });
  $('#chat-input').on('keypress', function (event) {
    if(event.which === 13){
      sendMessage();
    }
  });
  $("#message-button").click(function(e) {
    sendMessage();
  });
});
//--------------------------------------------------------

socket.on('page-load', function(data){
  var points = data.points;
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    addNewPointToScreen(p.x, p.y, p.color);
  }
  var messages = data.messages;
  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    addChatMessage(message);
  }
});

socket.on('new-chat-message', function(msg){
  addChatMessage(msg);
});

socket.on('new-point', function(data){
  var x = data.x;
  var y = data.y;
  var color = data.color;
  addNewPointToScreen(x, y, color);
});

socket.on('erase', function() {
  $(".point").remove();
});

socket.on('erase-chat', function() {
  $('#chat-room').empty();
});

socket.on('connected-users', function(count) {
  $('#userCount').text(count);
});

