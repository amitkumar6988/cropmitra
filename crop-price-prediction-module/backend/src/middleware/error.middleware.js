export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(status).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
}
