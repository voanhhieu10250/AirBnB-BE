const generateMessage = (message, response, status = 400, insertKeys = {}) => {
  return response.status(status).send({ message, ...insertKeys });
};

module.exports = generateMessage;
