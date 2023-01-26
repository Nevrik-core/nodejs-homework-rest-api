
function HttpError(status, message, name = Error) {
  const err = new Error(message);
  err.status = status;
  err.name = name;
  return err;
};


function tryCatchWrapper(endpointFn) {
  return async (req, res, next) => {
    try {
      await endpointFn(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  HttpError,
  tryCatchWrapper
};

