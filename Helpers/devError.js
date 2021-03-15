const devError = (error, response) => {
  console.log(error);
  return response.status(500).send({ message: "Backend's problem", error });
};

module.exports = devError;
