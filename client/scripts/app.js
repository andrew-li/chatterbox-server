// YOUR CODE HERE:

var App = function() {
  //this.server = 'https://api.parse.com/1/classes/chatterbox';
  this.server = 'http://127.0.0.1:3000/classes/messages';
  this.roomList = {};
  this.friendList = [];
};

App.prototype.replaceEscapeCharacters = function(str) {
  var tempStr;
  if(str === undefined)
    tempStr = "undefined";
  else if(str === null)
    tempStr = "null";
  else
   tempStr = JSON.stringify(str);

  return tempStr.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '')
    .replace(/\'/g, '');
};


App.prototype.addRooms = function() {
  // var roomname;
  // if(roomData.roomname === undefined)
  //   roomname = "undefined";
  // else if(roomData.roomname === null)
  //   roomname = "null";
  // else
  //  roomname = replaceEscapeCharacters(JSON.stringify(roomData.roomname));

  // var room = '<div>'
  //   + roomname
  //   + JSON.stringify(roomData.text)
  //   + '</div>';

  // return room;

  for(var roomName in this.roomList)
  {
    this.addRoom(roomName);
  }
};

App.prototype.addRoom = function(roomName) {

    var tempRoomName;
    if(roomName === '')
      tempRoomName = "EmptyRoom";
    else if (roomName === "main")
      tempRoomName = "main_0";
    else
      tempRoomName = roomName;

    var room = '<div '
    + 'id="'
    + tempRoomName
    + '" class="room">'
    + tempRoomName;

    for(var i = 0; this.roomList.hasOwnProperty(roomName) && i < this.roomList[roomName].length; i++)
    {
      room += '<span class="username message"';

      if (this.friendList.indexOf(this.roomList[roomName][i].username) > -1) {
        room += ' style="font-weight:bold;"';
      }

      room += '>'
       + this.roomList[roomName][i].username
       + ': '
       + this.roomList[roomName][i].text
       + '</span>';
    }

    room += '</div>';

    $('#main').append(room);
};

App.prototype.addMessage = function(message) {
  //find roomname in dom
  //target that roomname and append the message
};

App.prototype.handleData = function(data) {

  //var results = data.results;

  // for(var i = 0; i < results.length; i++)
  // {
  //   console.log(results[i].objectId);
  //   console.log(results[i].roomname);
  // }

  // var sortedResults = _.sortBy(data.results, function(item) {
  //   return item.roomname;
  // });

  // console.log(sortedResults);


  // for(var i = 0; i < sortedResults.length; i++)
  // {
  //   $('#main').append(makeRoom(sortedResults[i]));
  // }

  this.roomList = {};

  for (var i = 0; i < data.results.length; i++) {
    var stringifiedRoomName = this.replaceEscapeCharacters(data.results[i].roomname);
    var stringifiedUserName = this.replaceEscapeCharacters(data.results[i].username);
    var stringifiedText = this.replaceEscapeCharacters(data.results[i].text);

    if (this.roomList.hasOwnProperty(stringifiedRoomName) === false) {
      this.roomList[stringifiedRoomName] = [];
    }

    this.roomList[stringifiedRoomName].push({"username" : stringifiedUserName,
                                        "text" : stringifiedText,
                                        "roomname" : stringifiedRoomName});
  };

  this.addRooms();

};

App.prototype.fetch = function() {

  var oldThis = this;
  $.ajax({
    // always use this url
    url: this.server,
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message received');

      oldThis.handleData(data);

      console.log("data");
      console.log(data);
    },
    error: function () {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receive message');
    }
  });

};

App.prototype.send = function(message) {
  $.ajax({
    // always use this url
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    //data: message,
    contentType: 'application/json',
    //contentType: 'plain/text',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

App.prototype.clearMessages = function() {
  $('.room').remove();
};

App.prototype.refresh = function() {
  this.clearMessages();
  this.fetch();

};

App.prototype.init = function() {
  this.fetch();
  //setInterval(this.refresh.bind(this), 5000);
};

var app = new App();

app.init();

$(document).ready(function() {
  $('.button-refresh').click(function(){
    app.refresh();
  });

  $('.button-submit').click(function(){
    var message = $('#submission-form').val();
    var username = $('#username-text').val();
    var roomname = $('#roomname-text').val();

    var sendObj = {};

    if(message !== undefined && message !== null && message !== '')
      sendObj["text"] = message;

    if(username !== undefined && username !== null && username !== '')
      sendObj["username"] = username;

    if(roomname !== undefined && roomname !== null && roomname !== '')
      sendObj["roomname"] = roomname;

    if (Object.keys(sendObj).length > 0)
      app.send(sendObj);

    $('#submission-form').val('');
    $('#username-text').val('');
    $('#roomname-text').val('');
    app.refresh();
  });

  $('.button-showroom').click(function(){
    var roomname = $('#showroom-form').val();

    app.clearMessages();
    $('#showroom-form').val('');
    app.addRoom(roomname);
  });

  $('.button-addfriend').click(function() {
    var friendname = $('#friend-form').val();

    app.friendList.push(friendname);
    $('#friend-form').val('');
    app.refresh();
  });

  $('.button-removefriend').click(function() {
    var friendname = $('#friend-form').val();

    var friendIndex = app.friendList.indexOf(friendname);

    if(friendIndex >= 0)
      app.friendList.splice(friendIndex, 1);

    $('friend-form').val('');
    app.refresh();
  });
});


