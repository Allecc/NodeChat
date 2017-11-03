
function loadData(){
  let data;
  $.ajax({
    url: '/messages',
    success: function(data){
      //append last message
      if( $('#messages').html() != "" ){
        $('#messages').append( "<li>[" + data[data.length -1].date + "] " + data[data.length -1].nick + ": " + data[data.length -1].message + "</li>");
      } else {
        // print all messages
        for(let item in data){
          $('#messages').append( "<li>[" + data[item].date + "] " + data[item].nick + ": " + data[item].message + "</li>");
        }
      }
    }
  });
};

$().ready(function(){
  loadData();

  $('form').submit(function(){
      let data = {
       "nick": $('#nick').val(),
       "date": new Date(),
       "message": $('#newMsg').val()
      }
      socket.emit('chat message', data);
      $('#newMsg').val("");
      return false;
    });

  socket.on('chat message', function(msg){
      $('#messages').append( "<li>[" + msg.date + "] " + msg.nick + ": " + msg.message + "</li>")
    });
});
