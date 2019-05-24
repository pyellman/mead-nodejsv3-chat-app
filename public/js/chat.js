const socket = io();

// Elements; get the form and the elements it contains;
// $ is convention for DOM elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
// use option ignoreQueryPrefix to get rid of leading ?
// Qs is provided by the .js file sourced in chat.html;
// Qs returns an object, destructure it
// location is provided by the browser/window
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// NOTE: autscrolling only works if you are already scrolled to the bottome
const autoScroll = () => {
  // Get the most recent message element (use $ convention to indicate it's an element)
  const $newMessage = $messages.lastElementChild;
  // console.log('height:', $newMessage.offsetHeight);

  // Compute the height of the new message, account for margins and stuff
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height (of window)
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;
  console.log(scrollOffset);

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }

};

socket.on('message', (message) => {
  console.log('From chat.js: ', message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm:ss a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', (locationMessage) => {
  console.log(locationMessage);
  const html = Mustache.render(locationMessageTemplate, {
    username: locationMessage.username,
    locationUrl: locationMessage.locationUrl,
    createdAt: moment(locationMessage.createdAt).format('h:mm:ss a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

// destructure the object sent with the roomData message
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });

  // insert the html template just compiled into the sidebar div
  document.querySelector('#sidebar').innerHTML = html;

});


$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // disable form while message is being sent
  $messageFormButton.setAttribute('disabled', 'disabled');

  // const message = document.querySelector('input').value;
  // let's instead select the message field by it's name attribute
  // inside a form, using the (e) event object representing the form
  const messageText = e.target.elements.message.value;

  socket.emit('sendMessage', messageText, (error) => {
    // re-enable the message form button once message sent,
    // clear and focus input
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message sent');
    // console.log('The', message);
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser');
  }

  // disable send location button while the location is actually being fetched
  $sendLocationButton.setAttribute('disabled', 'disabled');

  // navigator.geolocation is async, but doesn't support promises?
  navigator.geolocation.getCurrentPosition((position) => {
    const coords = {
      lat: position.coords.latitude,
      long: position.coords.longitude
    };

    socket.emit('sendLocation', coords, (geoack) => {
      // re-enable the send location button
      $sendLocationButton.removeAttribute('disabled');
      console.log('console text: ', geoack);
    });

  });
});

// emit the username and room from login qs and send back to server
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});