// Request validation middleware
export const validateSignup = (req, res, next) => {
  // 1. Updated fields to match the controller
  const { username, email, password, confirmPassword } = req.body;
  const errors = [];

  // 2. Updated validation checks
  if (!username) errors.push('Username is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!confirmPassword) errors.push('Confirm password is required');

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // 3. Added password match validation
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: errors
    });
  }

  next();
};

export const validateProject = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Project name is required');
  }

  if (name && name.trim().length < 3) {
    errors.push('Project name must be at least 3 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: errors
    });
  }

  next();
};

export const validateTask = (req, res, next) => {
  const { name, project_id } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Task name is required');
  }

  if (!project_id) {
    errors.push('Project ID is required');
  }

  if (name && name.trim().length < 3) {
    errors.push('Task name must be at least 3 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: errors
    });
  }

  next();
};

export default { validateSignup, validateLogin, validateProject, validateTask };