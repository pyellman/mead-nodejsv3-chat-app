const generateMessage = (username, messageText) => {
  return {
    username: username,
    text: messageText,
    createdAt: new Date().getTime()
  };
};

const generateLocationMessage = (username, locationUrl) => {
  return {
    username,
    locationUrl: locationUrl,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage
};