// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  // Default error response
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = err.details;
  }

  if (err.code === 'PGRST301') {
    error.status = 404;
    error.message = 'Resource not found';
  }

  if (err.code === 'PGRST116') {
    error.status = 400;
    error.message = 'Invalid request data';
  }

  // Supabase auth errors
  if (err.message?.includes('Invalid login credentials')) {
    error.status = 401;
    error.message = 'Invalid email or password';
  }

  if (err.message?.includes('Email not confirmed')) {
    error.status = 401;
    error.message = 'Please verify your email address';
  }

  res.status(error.status).json({
    error: true,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
};

export default errorHandler;