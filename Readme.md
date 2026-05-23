# CodePad — Collaborative Code Editor

Real-time collaborative code editor with Operational Transformation (OT).
Share a room URL — start coding together instantly. No login required.

## How it works
1. Create a room → choose language
2. Share the URL with anyone
3. Both users edit simultaneously — OT resolves conflicts in real time
4. Changes sync instantly via Socket.IO

## Why OT (Operational Transformation)?
Without OT, concurrent edits cause conflicts:
- User A inserts at position 5
- User B deletes at position 3
- Without transformation → wrong positions, broken text

OT transforms each operation against concurrent operations before applying,
guaranteeing consistency across all clients — the same algorithm used by
Google Docs and Notion.

## Stack
- **NestJS** — TypeScript backend framework
- **Socket.IO** — real-time bidirectional communication
- **Operational Transformation** — conflict resolution algorithm
- **Redis** — document state storage (fast reads/writes)
- **PostgreSQL + Prisma v7** — persistent document storage
- **Next.js + CodeMirror** — collaborative editor frontend
- **Docker Compose** — local development

## Architecture
Client (CodeMirror)
↓ Socket.IO operation { type, position, char, version }
NestJS Gateway
↓ OT transform against history
Apply operation → broadcast to room
↓
Redis (document state) ← fast
PostgreSQL (persist every 10 ops) ← durable
## OT Algorithm
```typescript
// Insert vs Delete example
transform(op: Operation, against: Operation): Operation {
  if (op.type === 'insert' && against.type === 'delete') {
    if (op.position > against.position) {
      return { ...op, position: op.position - 1 };
    }
  }
  return op;
}
```

## Local Development
```bash
# Start database + Redis
docker compose up -d

# Backend
cd server && npm install
npm run start:dev

# Frontend  
cd client && npm install
npm run dev
```

## Environment Variables
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/code_notepad
REDIS_URL=redis://localhost:6379
```

## Live Demo
🌐 Frontend: [coming soon]
⚙️ Backend: [coming soon]

## Known Limitations
- Ctrl+A + Delete removes only first character (batch operations planned for v2)
- Single server instance (Redis Pub/Sub for horizontal scaling planned)

## What I Would Add Next
- Cursor position sync — see where other users are typing
- Language auto-detection
- Save/export room as file
- Redis Pub/Sub for multiple server instances

## Live Demo
🌐 Frontend: https://code-notepad.netlify.app
⚙️ Backend: https://code-notepad-production.up.railway.app