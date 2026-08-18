# task-be

Minimal NestJS backend with a `students` API backed by Prisma and PostgreSQL.

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL database available through `DATABASE_URL`

## Setup

```bash
npm install
npm run prisma:generate
```

Create a local `.env` file before starting the app:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
```

## Development Commands

```bash
npm run start:dev
npm run build
npm run test
npm run test:watch
npm run test:cov
```

## Notes

- Request payloads are validated with Nest's global `ValidationPipe`.
- The request flow is `controller -> service -> repository -> Prisma -> database`.
