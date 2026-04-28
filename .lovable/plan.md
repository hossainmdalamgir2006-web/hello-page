# Fix Schema Export SQL Errors

## Problem

The exported `schema.sql` from **Settings → Backup → Export Full / Export Schema** contains invalid SQL that fails when run on a fresh project:

```sql
ALTER TABLE public.auto_assign_rules
  ADD CONSTRAINT auto_assign_rules_assign_to_fkey
  FOREIGN KEY (assign_to) REFERENCES public.null();
--                                  ^^^^^^^^^^^^^ syntax error
```

## Root Cause

In `supabase/functions/database-schema-export/index.ts`, the foreign key generator assumes every FK references a table in `public`. But two FKs in this DB reference `auth.users`:

| Constraint | Table | References |
|---|---|---|
| `auto_assign_rules_assign_to_fkey` | `public.auto_assign_rules` | `auth.users(id)` |
| `trash_log_performed_by_fkey` | `public.trash_log` | `auth.users(id)` |

The helper `get_table_constraints()` joins `information_schema.constraint_column_usage` without exposing the foreign **schema**, and for cross-schema FKs `foreign_table_name` comes back `NULL`. The export then writes `REFERENCES public.${null}()` → `public.null()`.

Two additional latent bugs in the same function:

1. **Triggers** — generated as `CREATE TRIGGER … BEFORE UPDATE ON tbl EXECUTE FUNCTION …` with no `FOR EACH ROW` clause (Postgres requires it).
2. **Realtime publication** — `ALTER PUBLICATION supabase_realtime ADD TABLE …` errors if the table is already a publication member. Should be guarded.

## Fix Plan

### 1. Update RPC `get_table_constraints` to return the foreign schema

Migration: add `foreign_table_schema text` to the return signature so the export knows when an FK points outside `public`.

```sql
CREATE OR REPLACE FUNCTION public.get_table_constraints()
RETURNS TABLE(
  constraint_name text, table_name text, column_name text,
  constraint_type text,
  foreign_table_schema text,
  foreign_table_name text, foreign_column_name text
) ...
  SELECT tc.constraint_name, tc.table_name, kcu.column_name,
         tc.constraint_type,
         ccu.table_schema,        -- NEW
         ccu.table_name, ccu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ...
  LEFT JOIN information_schema.constraint_column_usage ccu ...
```

### 2. Patch `database-schema-export/index.ts`

**FK section** — use `foreign_table_schema` (default `public`) and skip FKs to system schemas like `auth` (those tables don't exist on a fresh project; the auth schema is managed by Supabase, and we can't restore them). Emit a comment instead so the user knows.

```ts
const refSchema = c.foreign_table_schema || 'public';
if (!c.foreign_table_name) continue;        // skip malformed
if (refSchema !== 'public') {
  sql += `-- Skipped FK ${name}: references ${refSchema}.${c.foreign_table_name}\n\n`;
  continue;
}
sql += `... REFERENCES ${refSchema}.${info.refTable}(${info.refColumns.join(', ')});\n`;
```

**Triggers** — add `FOR EACH ROW` (the only orientation we use) and guard with `DO $$`:

```ts
sql += `CREATE TRIGGER ${t.trigger_name} ${t.action_timing} ${t.event_manipulation} `
     + `ON public.${t.event_object_table} FOR EACH ROW ${t.action_statement};\n`;
```

**Realtime publication** — wrap each ADD TABLE in a guard:

```sql
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='live_chat_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_conversations;
  END IF;
END $$;
```

### 3. Verification

After redeploying the edge function and re-exporting:

- Search the new file: `grep -n "public\.null\|public\.()" schema.sql` → must be empty.
- The two `auth.users` FKs should appear as `-- Skipped FK …` comments instead.
- Run the file against a fresh Postgres database — should complete with no syntax errors.

## Files Touched

- `supabase/migrations/<new>.sql` — update `get_table_constraints()` signature
- `supabase/functions/database-schema-export/index.ts` — FK / trigger / publication generation

## Notes

- The `auth.users` FKs are intentionally not recreated by the schema export — `auth` schema is owned and managed by Supabase. After restore on a new project, those FK constraints can be added manually if desired (Supabase's `auth.users` table will exist after Lovable Cloud is enabled).
- No data migration involved; only edge-function code + one RPC signature change.
