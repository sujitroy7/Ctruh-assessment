<div align="center">

# Ctruh Assessment

**A full-stack web application built for the Ctruh technical assessment.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Live Demo](https://google.com) · [Report Bug](https://github.com) · [API Health](http://localhost:8000/health)

</div>

---

## Hey, let me walk you through this

So, I got the assessment brief and instead of just slapping together something that *technically works*, I wanted to set it up the right way from the start — the kind of foundation you'd actually build on in production.

Here's what I went with:

- **Next.js 16 + React 19** on the frontend — latest and greatest, with TypeScript because, well, I sleep better at night
- **Express + TypeScript** on the backend — typed all the way down, no surprises
- **MongoDB** with Mongoose — flexible document store, great fit for the domain
- **Tailwind CSS v4** — utility-first, zero fighting the cascade
- **Docker Compose** to tie it all together — one command and you're running the full stack locally, no "works on my machine" drama

The whole repo is a monorepo with `client/` and `server/` living side by side, and a `docker-compose.yml` at the root that orchestrates everything including the database.

---

## Stack at a glance

| Layer | Tech | Port |
|-------|------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 | `3000` |
| Backend | Node.js 20, Express 4, TypeScript | `8000` |
| Database | MongoDB 7 | `27017` |

---

## Prerequisites

Before you run anything, make sure you have these installed:

- **Node.js** `v20.20.2` — use [nvm](https://github.com/nvm-sh/nvm) and run `nvm use` in the root (`.nvmrc` is already there)
- **npm** — comes with Node
- **Docker + Docker Compose** — for the containerized setup ([install Docker](https://docs.docker.com/get-docker/))
- **MongoDB** — only needed if running locally without Docker

---

## Running the project

### Option 1 — Docker (recommended, easiest)

This spins up the client, server, and MongoDB all at once. Zero configuration needed.

```bash
# Clone the repo
git clone <repo-url>
cd Ctruh-assessment

# Copy env files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Fire everything up
docker compose up --build
```

That's it. Visit [http://localhost:3000](http://localhost:3000) for the app and [http://localhost:8000/health](http://localhost:8000/health) to confirm the API is alive.

To stop:

```bash
docker compose down
```

To wipe the database volume too:

```bash
docker compose down -v
```

---

### Option 2 — Running locally (manual setup)

If you'd rather run things natively without Docker, you'll need MongoDB running locally first.

**1. Server**

```bash
cd server
cp .env.example .env        # edit MONGO_URI if your MongoDB is on a different port
npm install
npm run dev                 # starts with hot reload via tsc-watch
```

Server runs at [http://localhost:8000](http://localhost:8000).

**2. Client** (in a separate terminal)

```bash
cd client
cp .env.example .env        # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Client runs at [http://localhost:3000](http://localhost:3000).

---

## Environment variables

**`server/.env`**

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/ctruh
NODE_ENV=development
```

**`client/.env`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

When using Docker Compose, these are injected automatically — you only need to set them manually for the local setup.

---

## Project structure

```
Ctruh-assessment/
├── client/              # Next.js frontend
│   ├── app/             # App Router pages and layouts
│   ├── Dockerfile
│   └── .env.example
├── server/              # Express backend
│   ├── src/
│   │   └── index.ts     # Entry point
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml   # Orchestrates all three services
└── .nvmrc               # Node version pin (20.20.2)
```

---

## Live Demo

The app is deployed and accessible here: **[Visit Live App](https://google.com)**

---

<div align="center">

Built with focus by **Sujit Roy**

</div>
