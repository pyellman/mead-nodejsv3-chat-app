const users = [];

// addUser
// destructure the object
const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Simple validation
  if (!username || !room) {
    return {
      error: 'Username and are room are required'
    };
  }

  // check for an existing user with the same name in the same room
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  // return with error message if there already is that user in that room
  if (existingUser) {
    return {
      error: 'Username is in use'
    };
  }

  // Validation passed, put the user in the array
  // AND return the user object
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  // could use filter(), but findIndex is a little faster here,
  // filter continues through whole array, findIndex stops when
  // a match is found
  const index = users.findIndex((user) => user.id === id); // arrow function shorthand & implicit return works here

  if (index !== -1) {
    // this is a litle complicated, normally splice() returns an array,
    // here we are only ever gettiong one item, so grab only that item,
    // the [0] element in the array
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

// addUser({
//   id: 23,
//   username: 'Peter',
//   room: 'kitchen'
// });

// addUser({
//   id: 33,
//   username: 'Leo',
//   room: 'kitchen'
// });

// addUser({
//   id: 43,
//   username: 'Taco',
//   room: 'dining room'
// });

// const user = getUser(33);
// console.log('a user: ', user);

// const userList = getUsersInRoom('bedroom');
// console.log('Users in room: ', userList);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };