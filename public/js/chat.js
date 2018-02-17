

window.onload = function(){
    var room = prompt('방 이름을 입력하세요');
  // Socket.io connection
  var socket = io.connect('http://localhost');
  socket.emit('join', room);

//
// socket.on('pubsub', function(msg){
//   var li= document.createElement('li');
//   li.innerHTML = JSON.stringify(msg);
//   ul.appendChild(li);

// });

  socket.on('msg', function(data){
    // Receive a message
      var output= '';

      output += '<h3>' + data.msg+ '</h3>';
      output += '<p>' + data.date+ '</p>';
  // 앞에 output을 추가.
      $('#chat1').find('#log').append(output);
      $('#content').listview('refresh');
    });

  // Send a message (메시지만)
  $('#submit').on('click', function(){
    var msg = $('#message').val();
    if(!msg) return;

//보낼 때 객체로 보내야 구분이 가능.
    socket.emit('msg', {
      msg : $('#message').val(),
      date: new Date().toUTCString()
    });

});
};
