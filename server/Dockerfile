FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install Prisma CLI as a development dependency - needed for migrations
RUN npm install prisma --save-dev

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Capture all build arguments dynamically
# Use a shell script to write all build arguments to .env
RUN echo "Dynamically writing all build arguments to .env file..." && \
    for var in $(printenv | grep '^ARG_' | cut -d= -f1); do \
      arg_name="${var#ARG_}"; \
      arg_value="${!var}"; \
      if [ -n "$arg_value" ]; then \
        echo "$arg_name=$arg_value" >> .env; \
      fi; \
    done

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]