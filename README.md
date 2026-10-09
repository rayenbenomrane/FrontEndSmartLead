# Smart Lead Management — Frontend (Next.js 14, App Router)

```bash
npm install
cp .env.example .env.local     # API_URL=http://localhost:3001 (the NestJS backend)
npm run dev                    # http://localhost:3000
```

The browser never sees the JWT: login/register route handlers store it in an httpOnly cookie, and all
data calls go through `/api/proxy/*`, which attaches the token server-side and forwards to the backend
(only `businesses/**` and `users/me` are allowed).

## Screens

| Route | What |
|---|---|
| `/` | My businesses — create |
| `/business/[id]` | Overview: KPIs + pipeline per status |
| `/business/[id]/prospects` | Prospect list: search, status filter, sort, pagination, add / edit / delete, inline status change |
| `/business/[id]/prospects/[prospectId]` | Prospect detail + interactions (email / meeting / note) add / edit / delete |
| `/business/[id]/team` | Members: add by email, change role, remove / leave |
| `/business/[id]/settings` | Edit business (ADMIN+), delete business (OWNER) |
| `/profile` | Edit name, email, password |
