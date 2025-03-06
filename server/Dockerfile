FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN apk add --no-cache openssl
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
# Create a .env file from build arguments
ARG NODE_ENV
ARG PORT
ARG CLIENT_URL
ARG DATABASE_URL
ARG DIRECT_URL
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_KEY
ARG JWT_SECRET
ARG JWT_EXPIRES_IN
ARG JWT_REFRESH_SECRET
ARG JWT_REFRESH_EXPIRES_IN
ARG JWT_VERIFICATION_SECRET
ARG JWT_VERIFICATION_EXPIRES_IN
ARG EMAIL_HOST
ARG EMAIL_PORT
ARG EMAIL_USER
ARG EMAIL_PASS
ARG EMAIL_FROM
ARG RATE_LIMIT_WINDOW_MS
ARG RATE_LIMIT_MAX
ARG HCAPTCHA_SECRET_KEY

# Write build arguments to .env file
RUN echo "NODE_ENV=${NODE_ENV}" > .env && \
    echo "PORT=${PORT}" >> .env && \
    echo "CLIENT_URL=${CLIENT_URL}" >> .env && \
    echo "DATABASE_URL=${DATABASE_URL}" >> .env && \
    echo "DIRECT_URL=${DIRECT_URL}" >> .env && \
    echo "SUPABASE_URL=${SUPABASE_URL}" >> .env && \
    echo "SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}" >> .env && \
    echo "SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}" >> .env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> .env && \
    echo "JWT_EXPIRES_IN=${JWT_EXPIRES_IN}" >> .env && \
    echo "JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}" >> .env && \
    echo "JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN}" >> .env && \
    echo "JWT_VERIFICATION_SECRET=${JWT_VERIFICATION_SECRET}" >> .env && \
    echo "JWT_VERIFICATION_EXPIRES_IN=${JWT_VERIFICATION_EXPIRES_IN}" >> .env && \
    echo "EMAIL_HOST=${EMAIL_HOST}" >> .env && \
    echo "EMAIL_PORT=${EMAIL_PORT}" >> .env && \
    echo "EMAIL_USER=${EMAIL_USER}" >> .env && \
    echo "EMAIL_PASS=${EMAIL_PASS}" >> .env && \
    echo "EMAIL_FROM=${EMAIL_FROM}" >> .env && \
    echo "RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS}" >> .env && \
    echo "RATE_LIMIT_MAX=${RATE_LIMIT_MAX}" >> .env && \
    echo "HCAPTCHA_SECRET_KEY=${HCAPTCHA_SECRET_KEY}" >> .env

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