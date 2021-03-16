const devError = (error, response) => {
  return response.status(500).send({ message: "Backend's problem", error });
};

module.exports = devError;
