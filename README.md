# Imagview

A sleek image annotation tool built with the Canvas API. Features annotation tools, zooming and panning, comments, and instant sharing capabilities.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- MinIO (for image storage)
- Docker (optional, for containerized deployment)

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/3eif/imagview.git
cd imagview
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `MINIO_ENDPOINT`: MinIO endpoint URL
- `MINIO_ACCESS_KEY`: MinIO access key (default: minioadmin)
- `MINIO_SECRET_KEY`: MinIO secret key (default: minioadmin)

4. Initialize the database:

```bash
npm run db:push
```

5. Run the development server:

```bash
npm run dev
```

## Docker Deployment

The application comes with a Docker Compose configuration that sets up:

- PostgreSQL database (port 5433)
- MinIO object storage
  - API port: 9000
  - Console port: 9001 (access the web UI at http://localhost:9001)

1. Build and run using Docker Compose:

```bash
docker-compose up -d
```

Default credentials:

- PostgreSQL:
  - User: postgres
  - Password: postgres
  - Database: imagview
  - Port: 5433
- MinIO:
  - Access Key: minioadmin
  - Secret Key: minioadmin
  - Console: http://localhost:9001
  - API Endpoint: http://localhost:9000

The application will be available at `http://localhost:3000`.
