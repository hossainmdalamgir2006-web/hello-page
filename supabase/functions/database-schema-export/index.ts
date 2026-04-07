import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r: any) =>
      ["admin", "manager"].includes(r.role)
    );
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch schema info using existing DB functions
    const [
      { data: columns },
      { data: constraints },
      { data: indexes },
      { data: policies },
      { data: functions },
      { data: triggers },
      { data: enums },
    ] = await Promise.all([
      adminClient.rpc("get_table_columns"),
      adminClient.rpc("get_table_constraints"),
      adminClient.rpc("get_table_indexes"),
      adminClient.rpc("get_rls_policies"),
      adminClient.rpc("get_db_functions"),
      adminClient.rpc("get_db_triggers"),
      adminClient.rpc("get_enum_types"),
    ]);

    // Build SQL output
    let sql = "-- Database Schema Export\n";
    sql += `-- Generated at: ${new Date().toISOString()}\n\n`;

    // Enums
    if (enums?.length) {
      const enumMap: Record<string, string[]> = {};
      for (const e of enums) {
        if (!enumMap[e.typname]) enumMap[e.typname] = [];
        enumMap[e.typname].push(e.enumlabel);
      }
      for (const [name, labels] of Object.entries(enumMap)) {
        sql += `CREATE TYPE public.${name} AS ENUM (${labels.map((l) => `'${l}'`).join(", ")});\n`;
      }
      sql += "\n";
    }

    // Tables
    if (columns?.length) {
      const tableMap: Record<string, any[]> = {};
      for (const col of columns) {
        if (!tableMap[col.table_name]) tableMap[col.table_name] = [];
        tableMap[col.table_name].push(col);
      }

      for (const [tableName, cols] of Object.entries(tableMap)) {
        sql += `-- Table: ${tableName}\n`;
        sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
        const colDefs = cols.map((c: any) => {
          let def = `  ${c.column_name} ${c.udt_name}`;
          if (c.character_maximum_length) def += `(${c.character_maximum_length})`;
          if (c.is_nullable === "NO") def += " NOT NULL";
          if (c.column_default) def += ` DEFAULT ${c.column_default}`;
          return def;
        });
        sql += colDefs.join(",\n");
        sql += "\n);\n\n";

        sql += `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;
      }
    }

    // RLS Policies
    if (policies?.length) {
      sql += "-- RLS Policies\n";
      for (const p of policies) {
        sql += `CREATE POLICY "${p.policyname}" ON public.${p.tablename}`;
        sql += ` FOR ${p.cmd}`;
        sql += ` TO ${p.roles?.join(", ") || "public"}`;
        if (p.qual) sql += ` USING (${p.qual})`;
        if (p.with_check) sql += ` WITH CHECK (${p.with_check})`;
        sql += ";\n";
      }
      sql += "\n";
    }

    // Functions
    if (functions?.length) {
      sql += "-- Functions\n";
      for (const f of functions) {
        sql += `${f.full_definition};\n\n`;
      }
    }

    // Triggers
    if (triggers?.length) {
      sql += "-- Triggers\n";
      for (const t of triggers) {
        sql += `CREATE TRIGGER ${t.trigger_name} ${t.action_timing} ${t.event_manipulation} ON public.${t.event_object_table} ${t.action_statement};\n`;
      }
      sql += "\n";
    }

    // Build stats
    const tableNames = columns ? [...new Set(columns.map((c: any) => c.table_name))] : [];
    const stats = {
      tables: tableNames.length,
      columns: columns?.length || 0,
      constraints: constraints?.length || 0,
      indexes: indexes?.length || 0,
      policies: policies?.length || 0,
      functions: functions?.length || 0,
      triggers: triggers?.length || 0,
      enums: enums?.length || 0,
    };

    return new Response(JSON.stringify({ schema: sql, stats, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
