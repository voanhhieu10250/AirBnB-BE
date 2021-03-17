const devError = (
  error,
  response,
  message = "Backend's problem",
  status = 500
) => {
  return response.status(status).send({ message, error });
};

module.exports = devError;
