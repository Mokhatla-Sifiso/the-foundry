# Baseline

`0_init` is the schema as it already exists in production, captured when versioned migrations were
introduced (spec UG, decision D9). It is never executed against an existing database: mark it as
applied with `npx prisma migrate resolve --applied 0_init`. It has no `down.sql`, because reversing a
baseline would drop every table. See `docs/runbooks/prisma-migrations.md`.
