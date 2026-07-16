# Digital Garden

Bachelor's thesis project — design and implementation of an **interactive digital garden** built on a knowledge graph with bidirectional links.

## Features (MVP)

- **TipTap editor** with Markdown support and `[[note title]]` link syntax
- **Automatic backlinks** — text analysis and bidirectional link creation in PostgreSQL
- **Garden View** — interactive graph with React Flow (drag, zoom, click)
- **Local Graph** — direct neighbors of each note
- **Dashboard** — garden stats, orphan seeds, recent edits
- **Path finding** — BFS algorithm and `WITH RECURSIVE` queries in PostgreSQL

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Editor | TipTap |
| Graph UI | React Flow (@xyflow/react) |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |

## Run with Docker (recommended)

```bash
# Build and run app + database
docker compose up --build

# App: http://localhost:3000
# Database: localhost:5432
```

Sample login (after seed):
- **Email:** `demo@garden.local`
- **Password:** `demo123456`

## Local Development

```bash
# Database only
docker compose up -d db

cp .env.example .env

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Database Structure (ERD)

```
User 1──N Note 1──N Link N──1 Note
```

- **User** — system users
- **Note** — seeds (notes) with graph position (`posX`, `posY`)
- **Link** — graph edges (source → target); backlinks via reverse query

## Main APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET/POST | `/api/notes` | List / create notes |
| GET/PUT/DELETE | `/api/notes/[slug]` | Note CRUD |
| GET | `/api/graph` | Full graph or path (`?from=&to=&method=bfs\|cte`) |
| GET | `/api/graph/local/[slug]` | Local graph |
| GET | `/api/dashboard` | Stats and orphan seeds |

## Wiki-style Linking

In note content, write:

```
This idea relates to [[Knowledge Management]].
```

The system matches by title or slug and creates the link and backlink.

## Scripts

```bash
npm run dev          # Development
npm run build        # Production build
npm run db:migrate   # Development migration
npm run db:seed      # Sample data
npm run db:studio    # Prisma Studio
```

## License

Educational project — bachelor's thesis
