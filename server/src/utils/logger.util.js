const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logging
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transport for file logging
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
  }),
  
  // All logs file
  new winston.transports.File({ 
    filename: path.join(__dirname, '../../logs/all.log') 
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create a stream object for morgan http logger to use
const stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = {
  logger,
  stream
};