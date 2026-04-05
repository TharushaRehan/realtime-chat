# realtime-chat

A private, real-time chat app with self-destructing rooms built on Next.js, Elysia, and Redis.

## What it does

This project creates temporary secure chat rooms that expire automatically after 10 minutes. Users can open a room, share the room link, and send real-time messages with minimal setup.

## Why it is useful

- Private chat rooms with automatic expiration
- Real-time messaging using Upstash Realtime and Redis
- Simple room creation flow with anonymous identity generation
- Client-side experience built with Next.js and React Query

## Key features

- Create a new secure room from the lobby
- Copy room link for other participants
- Send and receive live chat messages
- Room TTL countdown with auto-destruction
- Manual destroy button to delete room data immediately

## Getting started

### Prerequisites

- Node.js 20+ or compatible version
- A Redis-compatible backend (Upstash Redis is recommended)

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project structure

- `src/app/page.tsx` — lobby for creating secure rooms
- `src/app/room/[room_id]/page.tsx` — room UI with chat, TTL, and destroy controls
- `src/app/api/[[...slugs]]/route.ts` — Elysia API routes for room creation, message handling, TTL, and destroy actions
- `src/lib` — shared client, realtime, and Redis utilities

## Dependencies

- `next` — application framework
- `react` / `react-dom` — UI rendering
- `elysia` — server framework for API routes
- `@upstash/redis` — Redis client for persistence
- `@upstash/realtime` — real-time event streaming
- `@tanstack/react-query` — client data fetching and caching
- `nanoid` — room and message ID generation
- `zod` — request validation
- `date-fns` — date formatting

## Deployment

Build the application for production:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Support

If you need help, open an issue in this repository.

## Maintainers

Maintained by the project author.

Contributions are welcome via pull requests.
