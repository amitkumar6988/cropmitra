// Global Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Log error for debugging (in production, use structured logging)
  if (process.env.NODE_ENV === "development") {
    console.error("Error occurred:", {
      status,
      message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

// Async error wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
