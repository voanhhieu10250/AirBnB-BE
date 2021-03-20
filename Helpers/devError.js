const devError = (
  error,
  response,
  message = "Backend's problem",
  status = 500
) => {
  console.log(error);
  return response.status(status).send({ message, error });
};

module.exports = devError;
