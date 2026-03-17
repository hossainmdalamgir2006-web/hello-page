import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface ColumnInfo {
  table_name: string
  column_name: string
  data_type: string
  udt_name: string
  is_nullable: string
  column_default: string | null
  character_maximum_length: number | null
}

interface ConstraintInfo {
  constraint_name: string
  table_name: string
  column_name: string
  constraint_type: string
  foreign_table_name: string | null
  foreign_column_name: string | null
}

interface IndexInfo {
  tablename: string
  indexname: string
  indexdef: string
}

interface PolicyInfo {
  schemaname: string
  tablename: string
  policyname: string
  permissive: string
  roles: string[]
  cmd: string
  qual: string | null
  with_check: string | null
}

interface FunctionInfo {
  routine_name: string
  full_definition: string
}

interface TriggerInfo {
  trigger_name: string
  event_manipulation: string
  event_object_table: string
  action_statement: string
  action_timing: string
}

interface EnumInfo {
  typname: string
  enumlabel: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      const missing = [
        !supabaseUrl && 'SUPABASE_URL',
        !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY',
        !supabaseAnonKey && 'SUPABASE_ANON_KEY'
      ].filter(Boolean).join(', ')
      return new Response(
        JSON.stringify({ error: `Missing required secrets: ${missing}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No valid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    const { data: isAdmin } = await supabaseAdmin.rpc('has_admin_role', { user_uuid: userId })

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required. Your user does not have admin or manager role.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting schema export...')

    // Fetch all schema data in parallel
    const [
      { data: enumData },
      { data: columnsData },
      { data: constraintsData },
      { data: indexesData },
      { data: policiesData },
      { data: storagePoliciesData },
      { data: functionsData },
      { data: triggersData },
      bucketsResult,
    ] = await Promise.all([
      supabaseAdmin.rpc('get_enum_types'),
      supabaseAdmin.rpc('get_table_columns'),
      supabaseAdmin.rpc('get_table_constraints'),
      supabaseAdmin.rpc('get_table_indexes'),
      supabaseAdmin.rpc('get_rls_policies'),
      supabaseAdmin.rpc('get_storage_policies'),
      supabaseAdmin.rpc('get_db_functions'),
      supabaseAdmin.rpc('get_db_triggers'),
      supabaseAdmin.storage.listBuckets(),
    ])

    const enums = (enumData || []) as EnumInfo[]
    const columns = (columnsData || []) as ColumnInfo[]
    const constraints = (constraintsData || []) as ConstraintInfo[]
    const indexes = (indexesData || []) as IndexInfo[]
    const policies = (policiesData || []) as PolicyInfo[]
    const storagePolicies = (storagePoliciesData || []) as PolicyInfo[]
    const functions = (functionsData || []) as FunctionInfo[]
    const triggers = (triggersData || []) as TriggerInfo[]
    const buckets = bucketsResult.data || []

    // Generate SQL - proper serial order to avoid dependency issues
    const sqlParts: string[] = []
    const timestamp = new Date().toISOString()

    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- Database Schema Export (Full)`)
    sqlParts.push(`-- Generated: ${timestamp}`)
    sqlParts.push(`-- All statements use IF NOT EXISTS / DROP IF EXISTS`)
    sqlParts.push(`-- to prevent duplicate errors on restore.`)
    sqlParts.push(`-- ============================================\n`)

    // ===== SECTION 1: EXTENSIONS =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 1. EXTENSIONS`)
    sqlParts.push(`-- ============================================\n`)
    sqlParts.push(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
    sqlParts.push(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n`)

    // ===== SECTION 2: ENUM TYPES =====
    if (enums.length > 0) {
      sqlParts.push(`-- ============================================`)
      sqlParts.push(`-- 2. ENUM TYPES`)
      sqlParts.push(`-- ============================================\n`)
      
      const enumsByType = new Map<string, string[]>()
      for (const e of enums) {
        if (!enumsByType.has(e.typname)) {
          enumsByType.set(e.typname, [])
        }
        enumsByType.get(e.typname)!.push(e.enumlabel)
      }
      
      for (const [typeName, values] of enumsByType) {
        sqlParts.push(`DO $$ BEGIN`)
        sqlParts.push(`  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${typeName}') THEN`)
        sqlParts.push(`    CREATE TYPE public.${typeName} AS ENUM (${values.map(v => `'${v}'`).join(', ')});`)
        sqlParts.push(`  END IF;`)
        sqlParts.push(`END $$;\n`)
      }
    }

    // ===== SECTION 3: HELPER FUNCTIONS (needed before RLS policies) =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 3. HELPER FUNCTIONS (before tables & RLS)`)
    sqlParts.push(`-- ============================================\n`)

    // Output has_admin_role first since RLS policies depend on it
    const adminRoleFunc = functions.find(f => f.routine_name === 'has_admin_role')
    if (adminRoleFunc && adminRoleFunc.full_definition) {
      sqlParts.push(`${adminRoleFunc.full_definition};\n`)
    }

    // ===== SECTION 4: TABLES =====
    // Group columns by table
    const tableColumns = new Map<string, ColumnInfo[]>()
    for (const col of columns) {
      if (!tableColumns.has(col.table_name)) {
        tableColumns.set(col.table_name, [])
      }
      tableColumns.get(col.table_name)!.push(col)
    }

    // Group constraints by table
    const tableConstraints = new Map<string, ConstraintInfo[]>()
    for (const con of constraints) {
      if (!tableConstraints.has(con.table_name)) {
        tableConstraints.set(con.table_name, [])
      }
      tableConstraints.get(con.table_name)!.push(con)
    }

    // Determine table creation order based on foreign key dependencies
    const allTableNames = Array.from(tableColumns.keys())
    const fkDeps = new Map<string, Set<string>>()
    for (const t of allTableNames) fkDeps.set(t, new Set())
    
    for (const con of constraints) {
      if (con.constraint_type === 'FOREIGN KEY' && con.foreign_table_name && con.foreign_table_name !== con.table_name) {
        fkDeps.get(con.table_name)?.add(con.foreign_table_name)
      }
    }

    // Topological sort
    const sorted: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    function visit(name: string) {
      if (visited.has(name)) return
      if (visiting.has(name)) { sorted.push(name); visited.add(name); return } // circular, just push
      visiting.add(name)
      for (const dep of (fkDeps.get(name) || [])) {
        if (tableColumns.has(dep)) visit(dep)
      }
      visiting.delete(name)
      visited.add(name)
      sorted.push(name)
    }
    for (const t of allTableNames) visit(t)

    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 4. TABLES (dependency-ordered)`)
    sqlParts.push(`-- ============================================\n`)

    for (const tableName of sorted) {
      const cols = tableColumns.get(tableName)!
      sqlParts.push(`-- Table: ${tableName}`)
      sqlParts.push(`CREATE TABLE IF NOT EXISTS public.${tableName} (`)
      
      const columnDefs: string[] = []
      for (const col of cols) {
        let colDef = `  ${col.column_name} `
        
        if (col.data_type === 'ARRAY') {
          colDef += `${col.udt_name.replace('_', '')}[]`
        } else if (col.data_type === 'USER-DEFINED') {
          colDef += col.udt_name
        } else if (col.character_maximum_length) {
          colDef += `${col.data_type}(${col.character_maximum_length})`
        } else {
          colDef += col.data_type
        }
        
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL'
        }
        
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`
        }
        
        columnDefs.push(colDef)
      }

      const tableCons = tableConstraints.get(tableName) || []
      const pkConstraints = tableCons.filter(c => c.constraint_type === 'PRIMARY KEY')
      if (pkConstraints.length > 0) {
        const pkCols = pkConstraints.map(c => c.column_name)
        columnDefs.push(`  PRIMARY KEY (${pkCols.join(', ')})`)
      }

      sqlParts.push(columnDefs.join(',\n'))
      sqlParts.push(`);\n`)
    }

    // ===== SECTION 5: FOREIGN KEY CONSTRAINTS (with IF NOT EXISTS) =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 5. FOREIGN KEY CONSTRAINTS`)
    sqlParts.push(`-- ============================================\n`)

    for (const con of constraints) {
      if (con.constraint_type === 'FOREIGN KEY' && con.foreign_table_name) {
        sqlParts.push(`DO $$ BEGIN`)
        sqlParts.push(`  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${con.constraint_name}') THEN`)
        sqlParts.push(`    ALTER TABLE public.${con.table_name}`)
        sqlParts.push(`      ADD CONSTRAINT ${con.constraint_name}`)
        sqlParts.push(`      FOREIGN KEY (${con.column_name})`)
        sqlParts.push(`      REFERENCES public.${con.foreign_table_name}(${con.foreign_column_name});`)
        sqlParts.push(`  END IF;`)
        sqlParts.push(`END $$;\n`)
      }
    }

    // ===== SECTION 6: UNIQUE CONSTRAINTS (with IF NOT EXISTS) =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 6. UNIQUE CONSTRAINTS`)
    sqlParts.push(`-- ============================================\n`)

    for (const con of constraints) {
      if (con.constraint_type === 'UNIQUE') {
        sqlParts.push(`DO $$ BEGIN`)
        sqlParts.push(`  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${con.constraint_name}') THEN`)
        sqlParts.push(`    ALTER TABLE public.${con.table_name}`)
        sqlParts.push(`      ADD CONSTRAINT ${con.constraint_name} UNIQUE (${con.column_name});`)
        sqlParts.push(`  END IF;`)
        sqlParts.push(`END $$;\n`)
      }
    }

    // ===== SECTION 7: INDEXES (with IF NOT EXISTS) =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 7. INDEXES`)
    sqlParts.push(`-- ============================================\n`)

    for (const idx of indexes) {
      if (!idx.indexname.endsWith('_pkey')) {
        // Replace CREATE INDEX with CREATE INDEX IF NOT EXISTS
        // Also handle CREATE UNIQUE INDEX
        let indexDef = idx.indexdef
        if (indexDef.startsWith('CREATE UNIQUE INDEX ')) {
          indexDef = indexDef.replace('CREATE UNIQUE INDEX ', 'CREATE UNIQUE INDEX IF NOT EXISTS ')
        } else if (indexDef.startsWith('CREATE INDEX ')) {
          indexDef = indexDef.replace('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS ')
        }
        sqlParts.push(`${indexDef};`)
      }
    }
    sqlParts.push('')

    // ===== SECTION 8: ENABLE RLS =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 8. ENABLE ROW LEVEL SECURITY`)
    sqlParts.push(`-- ============================================\n`)

    // Enable RLS on ALL tables (even ones without policies currently)
    for (const tableName of sorted) {
      sqlParts.push(`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`)
    }
    sqlParts.push('')

    // ===== SECTION 9: RLS POLICIES (DROP IF EXISTS then CREATE) =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 9. RLS POLICIES`)
    sqlParts.push(`-- ============================================\n`)

    for (const policy of policies) {
      // Drop first to avoid "already exists" errors
      sqlParts.push(`DROP POLICY IF EXISTS "${policy.policyname}" ON public.${policy.tablename};`)
      const permissive = policy.permissive === 'PERMISSIVE' ? '' : 'AS RESTRICTIVE '
      sqlParts.push(`CREATE POLICY "${policy.policyname}"`)
      sqlParts.push(`  ON public.${policy.tablename}`)
      sqlParts.push(`  ${permissive}FOR ${policy.cmd}`)
      if (policy.roles && policy.roles.length > 0) {
        sqlParts.push(`  TO ${policy.roles.join(', ')}`)
      }
      if (policy.qual) {
        sqlParts.push(`  USING (${policy.qual})`)
      }
      if (policy.with_check) {
        sqlParts.push(`  WITH CHECK (${policy.with_check})`)
      }
      sqlParts.push(`;`)
      sqlParts.push('')
    }

    // ===== SECTION 10: OTHER FUNCTIONS =====
    if (functions.length > 0) {
      sqlParts.push(`-- ============================================`)
      sqlParts.push(`-- 10. DATABASE FUNCTIONS`)
      sqlParts.push(`-- ============================================\n`)

      for (const func of functions) {
        if (func.full_definition && func.routine_name !== 'has_admin_role') {
          sqlParts.push(`-- Function: ${func.routine_name}`)
          sqlParts.push(`${func.full_definition};\n`)
        }
      }
    }

    // ===== SECTION 11: TRIGGERS =====
    if (triggers.length > 0) {
      sqlParts.push(`-- ============================================`)
      sqlParts.push(`-- 11. TRIGGERS`)
      sqlParts.push(`-- ============================================\n`)

      for (const trig of triggers) {
        sqlParts.push(`DROP TRIGGER IF EXISTS ${trig.trigger_name} ON public.${trig.event_object_table};`)
        sqlParts.push(`CREATE TRIGGER ${trig.trigger_name}`)
        sqlParts.push(`  ${trig.action_timing} ${trig.event_manipulation}`)
        sqlParts.push(`  ON public.${trig.event_object_table}`)
        sqlParts.push(`  FOR EACH ROW`)
        sqlParts.push(`  ${trig.action_statement};`)
        sqlParts.push('')
      }
    }

    // ===== SECTION 12: STORAGE BUCKETS =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 12. STORAGE BUCKETS`)
    sqlParts.push(`-- ============================================\n`)

    for (const bucket of buckets) {
      sqlParts.push(`INSERT INTO storage.buckets (id, name, public)`)
      sqlParts.push(`  VALUES ('${bucket.id}', '${bucket.name}', ${bucket.public ?? false})`)
      sqlParts.push(`  ON CONFLICT (id) DO NOTHING;`)
      sqlParts.push('')
    }

    // ===== SECTION 13: STORAGE POLICIES =====
    if (storagePolicies.length > 0) {
      sqlParts.push(`-- ============================================`)
      sqlParts.push(`-- 13. STORAGE RLS POLICIES`)
      sqlParts.push(`-- ============================================\n`)

      for (const policy of storagePolicies) {
        sqlParts.push(`DROP POLICY IF EXISTS "${policy.policyname}" ON storage.${policy.tablename};`)
        const permissive = policy.permissive === 'PERMISSIVE' ? '' : 'AS RESTRICTIVE '
        sqlParts.push(`CREATE POLICY "${policy.policyname}"`)
        sqlParts.push(`  ON storage.${policy.tablename}`)
        sqlParts.push(`  ${permissive}FOR ${policy.cmd}`)
        if (policy.roles && policy.roles.length > 0) {
          sqlParts.push(`  TO ${policy.roles.join(', ')}`)
        }
        if (policy.qual) {
          sqlParts.push(`  USING (${policy.qual})`)
        }
        if (policy.with_check) {
          sqlParts.push(`  WITH CHECK (${policy.with_check})`)
        }
        sqlParts.push(`;`)
        sqlParts.push('')
      }
    }

    // ===== SECTION 14: REALTIME =====
    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- 14. REALTIME PUBLICATION`)
    sqlParts.push(`-- ============================================\n`)
    sqlParts.push(`-- Re-add tables to realtime publication (safe to re-run)`)
    sqlParts.push(`DO $$ BEGIN`)
    sqlParts.push(`  ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_conversations;`)
    sqlParts.push(`EXCEPTION WHEN duplicate_object THEN NULL;`)
    sqlParts.push(`END $$;`)
    sqlParts.push(`DO $$ BEGIN`)
    sqlParts.push(`  ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;`)
    sqlParts.push(`EXCEPTION WHEN duplicate_object THEN NULL;`)
    sqlParts.push(`END $$;`)
    sqlParts.push(`DO $$ BEGIN`)
    sqlParts.push(`  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;`)
    sqlParts.push(`EXCEPTION WHEN duplicate_object THEN NULL;`)
    sqlParts.push(`END $$;`)
    sqlParts.push(`DO $$ BEGIN`)
    sqlParts.push(`  ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_presence;`)
    sqlParts.push(`EXCEPTION WHEN duplicate_object THEN NULL;`)
    sqlParts.push(`END $$;\n`)

    sqlParts.push(`-- ============================================`)
    sqlParts.push(`-- EXPORT COMPLETE`)
    sqlParts.push(`-- ============================================`)

    const schemaSQL = sqlParts.join('\n')
    const fileSize = new Blob([schemaSQL]).size

    console.log(`Schema export completed: ${fileSize} bytes`)

    return new Response(
      JSON.stringify({
        success: true,
        schema: schemaSQL,
        file_size: fileSize,
        stats: {
          tables: tableColumns.size,
          columns: columns.length,
          constraints: constraints.length,
          indexes: indexes.length,
          policies: policies.length,
          storage_policies: storagePolicies.length,
          functions: functions.length,
          triggers: triggers.length,
          enums: new Set(enums.map(e => e.typname)).size,
          storage_buckets: buckets.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Schema export error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})