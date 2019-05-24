const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

// let Heroku set the port or 3000 for locahost
const port = process.env.PORT || 3000;

// need to explicitly createServer (express normally does
// this behind the scenes) so we can pass the server to io
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Handler for static files; use path module to build path for portability
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));
// not using path module
// app.use(express.static(__dirname + '/../public'));

io.on('connection', (socket) => { // 'connection' is a built-in event
  console.log('New WebSocket connection');

  socket.on('join', (options, callback) => {
    // addUser returns EITHER the error or user object;
    // can cover both possibilities by destructuring the object.
    // spread and destruture the options object sent with join message
    const { error, user } = addUser({ id: socket.id, ...options });

    // stop function execution if there is an error and
    // send the error (from addUser function) back to client
    if (error) {
      return callback(error);
    }
    // socket.join is a server only method
    // use the room property of the user retrieved by the getUser
    socket.join(user.room);
    // io.to.emit is to everyone in a specific room
    // socket.broadcast.to().emit is like broadcast.emit,
    // but is specific to a room
    // socket.emit() only emits to the current connection, welcomes new user
    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    // broadcast.emit() emits to every client EXCEPT the connected client,
    // tells other users a new user has joined
    // socket.broadcast.emit('message', generateMessage('A new user has joined'));
    // * switch from socket.broadcast.emit to socket.broadcast.to.emit
    // for room-specific notifications
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has entered the ${user.room}`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback();

  });

  // the client sends a message and a callback
  socket.on('sendMessage', (messageText, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(messageText)) {
      return callback('WTF: profanity not allowed!');
    }
    // io.emit() emits the message to ALL connected clients in room
    // io.emit('message', generateMessage(message));
    // switch to io.to().emit for room specific functionality
    io.to(user.room).emit('message', generateMessage(user.username, messageText));

    // the callback function back to client could take some data
    // e.g., callback('Delivered');
    callback();
  });

  // callback comes from the client, along with message
  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    console.log('From index.js: coords= ', coords);
    // io.emit('message', `Location: lat=${coords.lat}, long=${coords.long}`);
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.lat},${coords.long}`));
    callback('geoack: your location has been shared');
  });

  socket.on('disconnect', () => { // 'disconnect' is another built-in event; client automatically sends when it disconnects
    const user = removeUser(socket.id);
    // only send a message if the user had succesfully joined
    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the ${user.room}`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });

});

server.listen(port, () => {
  console.log(`Chat IO Server is up on port ${port}`);
});
