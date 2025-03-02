# MIST Hackathon Project

This project consists of a Next.js frontend client and an Express.js backend server, with PostgreSQL as the database.

## Docker Setup

The project uses Docker Compose to manage the development and production environments. The setup includes:

- **PostgreSQL** database
- **Express.js** backend server
- **Next.js** frontend client

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine
- Basic knowledge of Docker and containerization

### Configuration

1. Copy the `.env.docker` file to a new file named `.env`:

```bash
cp .env.docker .env
```

2. Edit the `.env` file with your specific configuration values, especially:
   - Database credentials
   - JWT secrets
   - Supabase configuration (if using)
   - Email service credentials (if using)

### Running the Application

1. Start all services using Docker Compose:

```bash
docker-compose up -d
```

2. To view logs from all containers:

```bash
docker-compose logs -f
```

3. To view logs from a specific service:

```bash
docker-compose logs -f [service_name]
```

Where `[service_name]` is one of:, `server`, or `client`.

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1

### Stopping the Application

```bash
docker-compose down
```

To remove volumes (this will delete all data in the database):

```bash
docker-compose down -v
```

## Development

For development, you might want to run the services separately without Docker:

### Server Setup

```bash
cd server
npm install
npm run dev
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

## Production Deployment

For production deployment, make sure to:

1. Update the `.env` file with production values
2. Configure proper secrets and environment variables
3. Set up proper networking and security rules
4. Consider using a reverse proxy like Nginx in front of your services

### Building for Production

```bash
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d
```