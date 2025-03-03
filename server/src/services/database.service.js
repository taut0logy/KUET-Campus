const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger.util');

// Initialize Prisma client with logging during development
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Function to handle connection lifecycle
let isConnected = false;

async function connect() {
  if (isConnected) {
    return;
  }

  try {
    await prisma.$connect();
    isConnected = true;
    logger.info('Connected to database successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    // Implement retry logic if needed
    process.exit(1);
  }
}

// Handle graceful shutdown
function disconnect() {
  return prisma.$disconnect();
}

process.on('exit', () => {
  disconnect();
});

module.exports = {
  prisma,
  connect,
  disconnect,
}; 