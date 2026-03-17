import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Tables in dependency order (parents first, children later)
const RESTORABLE_TABLES = [
  'categories',
  'brands',
  'products',
  'product_variants',
  'product_inventory',
  'product_attribute_definitions',
  'product_group_items',
  'product_reviews',
  'related_products',
  'inventory_history',
  'customers',
  'customer_notes',
  'customer_communication_log',
  'coupons',
  'coupon_usage',
  'orders',
  'order_items',
  'order_tracking',
  'order_notes',
  'order_activity_log',
  'contact_messages',
  'contact_message_replies',
  'live_chat_conversations',
  'live_chat_messages',
  'abandoned_carts',
  'analytics_events',
  'daily_stats',
  'profiles',
  'user_roles',
  'user_sessions',
  'user_addresses',
  'login_activity',
  'failed_login_attempts',
  'blocked_login_attempts',
  'account_lockouts',
  'blocked_ips',
  'geo_blocking_rules',
  'ip_rate_limits',
  'ip_rate_limit_settings',
  'notifications',
  'email_templates',
  'enabled_payment_methods',
  'payment_methods',
  'pathao_settings',
  'steadfast_settings',
  'store_settings',
  'page_contents',
  'auto_reply_settings',
  'auto_discount_rules',
  'canned_responses',
  'conversation_tags',
  'shipping_zones',
  'shipping_rates',
  'shipments',
  'homepage_sections',
  'audit_logs',
  'csat_ratings',
  'support_tickets',
  'ticket_replies',
  'quick_replies',
  'admin_presence',
  'wishlists',
  'security_settings',
  'password_history',
  'recovery_codes',
  'trusted_devices',
  'two_factor_auth',
  'site_theme_settings',
  'return_requests',
  'saved_payment_methods',
]

interface RestoreRequest {
  backup_data: string
  format: 'json' | 'csv'
  tables?: string[]
  mode: 'merge' | 'replace'
}

async function getExistingTables(supabaseAdmin: ReturnType<typeof createClient>): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin.rpc('get_table_columns')
  if (error) {
    console.warn('Could not query table columns, falling back:', error.message)
    return new Set(RESTORABLE_TABLES)
  }
  const tableNames = new Set<string>()
  if (data) {
    for (const row of data as { table_name: string }[]) {
      tableNames.add(row.table_name)
    }
  }
  return tableNames
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
        JSON.stringify({ error: `Missing required secrets: ${missing}. Configure them in Edge Function settings.` }),
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

    const { data: userData, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !userData?.user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userData.user.id

    const { data: isAdmin } = await supabaseAdmin.rpc('has_admin_role', { user_uuid: userId })

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required. Your user does not have admin or manager role.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const { backup_data, format, tables, mode }: RestoreRequest = await req.json()
    
    if (!backup_data) {
      return new Response(
        JSON.stringify({ error: 'No backup data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting restore in ${mode} mode for format ${format}`)

    // Parse backup data
    let parsedData: Record<string, unknown[]>
    
    if (format === 'json') {
      const jsonData = JSON.parse(backup_data)
      parsedData = jsonData.data || jsonData
    } else {
      return new Response(
        JSON.stringify({ error: 'CSV restore not yet supported. Please use JSON format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check which tables actually exist in the database
    const existingTables = await getExistingTables(supabaseAdmin)
    console.log(`Found ${existingTables.size} existing tables in database`)

    const tablesToRestore = tables || Object.keys(parsedData).filter(t => RESTORABLE_TABLES.includes(t))
    
    // Identify missing tables
    const missingTables: string[] = []
    for (const table of tablesToRestore) {
      if (parsedData[table] && !existingTables.has(table)) {
        missingTables.push(table)
      }
    }

    if (missingTables.length > 0) {
      console.warn(`Missing tables: ${missingTables.join(', ')}`)
    }

    // If ALL requested tables are missing, return error with guidance
    const availableTables = tablesToRestore.filter(t => parsedData[t] && existingTables.has(t))
    if (availableTables.length === 0 && missingTables.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `None of the ${missingTables.length} tables exist in the database. Please run the schema SQL first to create the tables before restoring data.`,
          missing_tables: missingTables,
          total_restored: 0,
          tables_restored: 0,
          results: {},
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: Record<string, { success: boolean; count: number; error?: string }> = {}
    const failedDeletes = new Set<string>()

    // Mark missing tables in results
    for (const table of missingTables) {
      results[table] = { success: false, count: 0, error: 'Table does not exist. Run schema SQL first.' }
    }

    // Step 1: In replace mode, delete all tables in REVERSE order (children first)
    if (mode === 'replace') {
      const reverseOrder = [...RESTORABLE_TABLES].reverse()
      for (const table of reverseOrder) {
        if (!availableTables.includes(table) || !parsedData[table]) {
          continue
        }
        try {
          const { error: deleteError } = await supabaseAdmin
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')
          
          if (deleteError) {
            console.warn(`Error clearing ${table}:`, deleteError.message)
            failedDeletes.add(table)
          } else {
            console.log(`Cleared table ${table}`)
          }
        } catch (e) {
          console.warn(`Exception clearing ${table}:`, e)
          failedDeletes.add(table)
        }
      }
    }

    // Step 2: Insert data in FORWARD order (parents first) — only for existing tables
    for (const table of RESTORABLE_TABLES) {
      if (!availableTables.includes(table) || !parsedData[table]) {
        continue
      }

      if (mode === 'replace' && failedDeletes.has(table)) {
        results[table] = { success: false, count: 0, error: 'Skipped: failed to clear existing data' }
        continue
      }

      const tableData = parsedData[table] as Record<string, unknown>[]
      
      if (!tableData || tableData.length === 0) {
        results[table] = { success: true, count: 0 }
        continue
      }

      try {
        const batchSize = 100
        let insertedCount = 0
        
        for (let i = 0; i < tableData.length; i += batchSize) {
          const batch = tableData.slice(i, i + batchSize)

          const { error: insertError } = await supabaseAdmin
            .from(table)
            .upsert(batch, { onConflict: 'id', ignoreDuplicates: mode === 'merge' })
          
          if (insertError) {
            console.error(`Error inserting into ${table}:`, insertError.message)
            results[table] = { success: false, count: insertedCount, error: insertError.message }
            break
          }
          
          insertedCount += batch.length
        }

        if (!results[table]) {
          results[table] = { success: true, count: insertedCount }
        }
        
        console.log(`Restored ${insertedCount} rows to ${table}`)
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error'
        console.error(`Exception restoring ${table}:`, e)
        results[table] = { success: false, count: 0, error: errorMessage }
      }
    }

    const totalRestored = Object.values(results).reduce((sum, r) => sum + r.count, 0)
    const failedTables = Object.entries(results).filter(([, r]) => !r.success).map(([t]) => t)

    return new Response(
      JSON.stringify({
        success: failedTables.length === 0,
        total_restored: totalRestored,
        tables_restored: Object.keys(results).filter(t => results[t].success).length,
        results,
        failed_tables: failedTables.length > 0 ? failedTables : undefined,
        missing_tables: missingTables.length > 0 ? missingTables : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Restore error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
