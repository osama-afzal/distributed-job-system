# Distributed Job System

A distributed asynchronous job processing system built with NestJS, RabbitMQ, PostgreSQL, Redis, and Prisma.

This project simulates a production-style backend architecture for handling asynchronous workloads using queue-based processing. It supports multiple job types with isolated RabbitMQ queues, retry handling, JWT authentication, user-scoped job ownership, and persistent job lifecycle tracking.

The project explores backend architecture concepts such as workload partitioning, distributed processing, failure recovery, queue orchestration, and scalable worker design.

## Features

- JWT authentication and protected routes
- User-scoped job ownership and authorization
- RabbitMQ-based asynchronous job processing
- Separate queues for different workload types
- Retry and failure handling with persistent state tracking
- Multiple simulated workload processors:
  - Report generation
  - Email delivery
  - Analytics aggregation
- Prisma ORM integration with PostgreSQL
- DTO validation using class-validator
- Structured logging with NestJS Logger
- Dockerized infrastructure services
- Dead-letter queue handling for permanently failed jobs
- API rate limiting using NestJS Throttler

## Architecture Overview

The system follows a queue-driven asynchronous processing architecture:

```text
Client
  ↓
NestJS API
  ↓
PostgreSQL (persistent job storage)
  ↓
RabbitMQ Queues
    ├── report_jobs
    ├── email_jobs
    └── analytics_jobs
  ↓
Job Workers / Processors
```

Jobs are persisted to PostgreSQL before being published to RabbitMQ, enabling retries, lifecycle tracking, and failure recovery without losing state.

Redis is currently included as infrastructure groundwork for future caching, rate limiting, and distributed coordination features.

The system separates HTTP API responsibilities from asynchronous worker processing, allowing independent scaling of API and worker processes.

## Job Types

| Job Type | Queue | Characteristics |
|---|---|---|
| Report | `report_jobs` | Medium-duration report generation workloads |
| Email | `email_jobs` | Fast delivery-oriented notification jobs |
| Analytics | `analytics_jobs` | Long-running aggregation and processing workloads |

## API Endpoints

### Register

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

### Create Job

```http
POST /jobs/create
Authorization: Bearer <token>
```

### Get User Jobs

```http
GET /jobs
Authorization: Bearer <token>
```

## Retry Handling

Failed jobs are retried automatically until the configured retry limit is reached.

The system tracks:
- Retry counts
- Failure states
- Processing status
- Completion timestamps
- Error messages

Jobs that exceed retry thresholds are automatically moved into dead-letter queues for later inspection and replay.

## Tech Stack

- NestJS
- TypeScript
- RabbitMQ
- PostgreSQL
- Prisma ORM
- Redis
- Docker Compose
- JWT Authentication
- Passport.js

## Future Improvements

- Scheduled recovery for failed jobs
- Dedicated worker services
- Metrics and monitoring dashboards
- Full containerization of the NestJS application
- Integration and end-to-end testing

## Setup

Clone the repository:

```bash
git clone https://github.com/osama-afzal/distributed-job-system.git
cd distributed-job-system
```

Start infrastructure services:

```bash
docker compose up -d
```

Install dependencies:

```bash
npm install
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the application:

```bash
npm run start:dev
```