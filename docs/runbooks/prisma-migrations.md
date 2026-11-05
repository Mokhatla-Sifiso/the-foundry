# Prisma migrations

The schema is applied with versioned migrations in `prisma/migrations` (spec UG, decision D9). Each
migration after the baseline ships a `down.sql` that reverses it.

Every command below reads the connection string from `DIRECT_URL` (or `DATABASE_URL`) in
`.env.local`, through `prisma.config.ts`. Run them from the repository root.

## One-time: adopt migrations on the existing database

The production database was created with `prisma db push`, so it already has every table in the
`0_init` baseline. Tell Prisma that, instead of running it.

1. Check for drift first. This is read-only and changes nothing:

   ```bash
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma
   ```

   The only differences listed should be the migrations that come after `0_init` (today:
   `update_subscriber`). Anything else means production has drifted from `schema.prisma`; stop
   and reconcile before going on.

2. Mark the baseline as applied:

   ```bash
   npx prisma migrate resolve --applied 0_init
   ```

3. Apply everything after it:

   ```bash
   npx prisma migrate deploy
   ```

4. Confirm there is no drift left:

   ```bash
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma
   ```

   Expected output: `No difference detected.`

## Every release after that

```bash
npx prisma migrate status   # what is pending
npx prisma migrate deploy   # apply it
```

## Reversing a migration

Run its `down.sql`, then remove its row from the migration history so Prisma will apply it again
later:

```bash
npx prisma db execute --file prisma/migrations/<name>/down.sql
npx prisma migrate resolve --rolled-back <name>
```

The baseline (`0_init`) has no `down.sql`: reversing it would drop every table.

## Adding a migration

1. Change `prisma/schema.prisma`.
2. Generate the SQL against the previous schema and review it:

   ```bash
   npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script
   ```

   (`--from-migrations` needs a shadow database; alternatively diff from a copy of the previous
   schema file with `--from-schema`.)

3. Save it as `prisma/migrations/<yyyymmddhhmmss>_<name>/migration.sql`, write the matching
   `down.sql`, and keep the change additive where you can. Never drop a column in the same migration
   that renames it.
