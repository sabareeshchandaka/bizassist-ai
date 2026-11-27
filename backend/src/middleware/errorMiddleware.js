
export const notFoundMiddleware = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
};

export const errorMiddleware = (error, req, res, next) => {
  console.error("[SERVER ERROR]", {
    message: error.message,
    method: req.method,
    path: req.originalUrl,
    stack:
      process.env.NODE_ENV === "development"
        ? error.stack
        : undefined,
  });

  if (res.headersSent) {
    return next(error);
  }

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  const message =
    statusCode >= 500 &&
    process.env.NODE_ENV === "production"
      ? "An unexpected server error occurred."
      : error.message || "Something went wrong.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
