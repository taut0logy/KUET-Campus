const { body } = require('express-validator');

// Registration validation
const registerEmployeeValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
    
  // body('captchaToken')
  //   .notEmpty()
  //   .withMessage('CAPTCHA verification is required')

  body('employeeId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Employee ID must be 10 digits'),

  body('designation')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Designation is required')
    .isLength({ max: 50 })
    .withMessage('Designation cannot exceed 50 characters'),
];

// Student registration validation
const registerStudentValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .notEmpty()
    .withMessage('Password is required')
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name cannot exceed 255 characters'),

  // body('captchaToken')
  //   .notEmpty()
  //   .withMessage('CAPTCHA verification is required')

  body('studentId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
    .isLength({ min: 7, max: 7 })
    .withMessage('Student ID must be 7 digits'),

  body('section')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Section is required')
    .isLength({ max: 10 })
    .withMessage('Section cannot exceed 10 characters'),

  body('batch')
    .isInt()
    .toInt()
    .notEmpty()
    .withMessage('Batch is required')
    .isInt({ min: 1974, max: new Date().getFullYear() })
    .withMessage('Batch must be between 1974 and the current year'),
  
  body('departmentId')
    .isInt()
    .toInt()
    .notEmpty()
    .withMessage('Department is required')
    .isInt({ min: 1, max: 100 })
    .withMessage('Department must be between 1 and 100'),
];

// Faculty registration validation
const registerFacultyValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required'),

    body('password')
    .isLength({ min: 8, max: 128 })
    .notEmpty()
    .withMessage('Password is required')
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name cannot exceed 255 characters'),

  // body('captchaToken')
  //   .notEmpty()
  //   .withMessage('CAPTCHA verification is required')

  body('employeeId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Employee ID must be 10 digits'),

  body('status')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isLength({ max: 20 })
    .withMessage('Status cannot exceed 20 characters'),

  body('designation')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Designation is required')
    .isLength({ max: 50 })
    .withMessage('Designation cannot exceed 50 characters'),

  body('departmentId')
    .isInt()
    .toInt()
    .notEmpty()
    .withMessage('Department is required')
    .isInt({ min: 1, max: 100 })
    .withMessage('Department must be between 1 and 100'),

  body('bio')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Bio is required')
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
];

// Login validation
const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  // body('captchaToken')
  //   .notEmpty()
  //   .withMessage('CAPTCHA verification is required')
];

// Password reset request validation
const requestPasswordResetValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  // body('captchaToken')
  //   .notEmpty()
  //   .withMessage('CAPTCHA verification is required')
];

// Reset password validation
const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

module.exports = {
  registerEmployeeValidator,
  registerStudentValidator,
  registerFacultyValidator,
  loginValidator,
  requestPasswordResetValidator,
  resetPasswordValidator
}; 