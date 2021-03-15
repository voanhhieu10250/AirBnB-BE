const generateMessage = (message, response, status = 400) => {
  return response.status(status).send({ message });
};

module.exports = generateMessage;
