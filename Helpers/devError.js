const clgErrorsServer = (error) => {
  for (let index in error.errors) {
    console.log(error.errors[index].message);
  }
};

const devError = (
  error,
  response,
  message = "Backend's problem",
  status = 500
) => {
  clgErrorsServer(error);
  return response.status(status).send({ message, error });
};
module.exports = { devError, clgErrorsServer };
