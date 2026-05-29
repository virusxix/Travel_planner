# Supabase Setup — HiddenStay AI

Project ref: `zcvazuvsxdlxrdoxtewf`

## 1. MCP (Cursor)

Config file: [`.cursor/mcp.json`](../.cursor/mcp.json)

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=zcvazuvsxdlxrdoxtewf"
    }
  }
}
```

### Enable in Cursor

1. **Restart Cursor** or reload the window after adding `mcp.json`.
2. Open **Cursor Settings → MCP** and confirm **supabase** appears.
3. On first use, Cursor will prompt you to **log in to Supabase** (OAuth) — approve access for this project.
4. In chat, you can ask the agent to run SQL, inspect tables, or manage the project via MCP tools.

If MCP does not show up, use **“Add to Cursor”** from the Supabase dashboard (Connect → MCP) or paste the same JSON into user-level MCP settings.

## 2. Agent skills (installed)

```bash
npx skills add supabase/agent-skills
```

Installed in this repo:

| Skill | Path |
|-------|------|
| Supabase | `.cursor/skills/supabase/` |
| Postgres best practices | `.cursor/skills/supabase-postgres-best-practices/` |

Skills teach the agent Supabase auth, RLS, migrations, and Postgres patterns.

## 3. Database URL (Prisma / backend)

HiddenStay uses **Prisma → PostgreSQL only** (not Supabase Auth in the app).

### Password with `@` or `!`

URL-encode special characters in `backend/.env`:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `!` | `%21` |

Example: password `oakkardb1234@!` → `oakkardb1234%40%21`

### IPv4 networks (common on Windows)

Direct host `db.*.supabase.co:5432` often **does not connect** without IPv6 or the IPv4 add-on.

Use the **Session pooler** string from the dashboard:

**Project → Connect → Session mode → URI**

Format:

```env
DATABASE_URL="postgresql://postgres.zcvazuvsxdlxrdoxtewf:YOUR_ENCODED_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?schema=public&sslmode=require"
```

Replace `REGION` with the region shown in your dashboard (e.g. `us-east-1`).

### Apply schema + seed

```powershell
cd backend
npx prisma db push
npm run db:seed
npm run dev
```

## 4. Security

- **Rotate your database password** if it was shared in chat or commits.
- Never commit `backend/.env` — use `.env.example` as a template only.
- MCP uses OAuth; keep project access limited to trusted machines.

## 5. What uses what

| Feature | Tool |
|---------|------|
| App runtime DB | `DATABASE_URL` in `backend/.env` + Prisma |
| AI schema help / SQL in Cursor | Supabase MCP |
| Supabase-specific coding patterns | Agent skills |
