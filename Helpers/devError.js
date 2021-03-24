const devError = (
  error,
  response,
  message = "Backend's problem",
  status = 500
) => {
  console.log(error);
  return response.status(status).send({ message, error });
};

const clgErrorsServer = (error) => {
  for (let index in error.errors) {
    console.log(error.errors[index].message);
  }
};

module.exports = { devError, clgErrorsServer };
