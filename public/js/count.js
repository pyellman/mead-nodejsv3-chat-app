// A simple example of using socket.io;
// goes with count.html.js and count_server.js

const socket = io();

socket.on('countUpdated', (count) => {
  console.log('the count has been updated', count);
});

document.querySelector('#increment').addEventListener('click', () => {
  console.log('Button clicked');
  socket.emit('increment');
});
