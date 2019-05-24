// A simple example of using socket.io;
// goes with count.js and count_index.html -->

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const port = process.env.PORT || 3000;

// need to explicitly createServer (express normally does
// this behind the scenes) so we can pass the server to io
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up handler for static files, served from ../public
// but use path module to build path, for portability
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));
// app.use(express.static(__dirname + '/../public'));

let count = 0;

io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  // socket.emit() only emits to the current connecton
  socket.emit('countUpdated', count);

  socket.on('increment', () => {
    count++;
    // io.emit() emits to ALL connected clients
    io.emit('countUpdated', count);
  });
});



server.listen(port, () => {
  console.log(`Chat IO Server is up on port ${port}`);
});
