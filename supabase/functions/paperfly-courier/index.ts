import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getCredentialsFromDB(supabaseClient: any) {
  try {
    const { data, error } = await supabaseClient
      .from("store_settings")
      .select("key, setting_value")
      .in("key", ["PAPERFLY_API_TOKEN", "PAPERFLY_ENVIRONMENT"]);

    if (error || !data) return null;
    const apiToken = data.find((s: any) => s.key === "PAPERFLY_API_TOKEN")?.setting_value;
    const environment = data.find((s: any) => s.key === "PAPERFLY_ENVIRONMENT")?.setting_value || "production";
    if (apiToken) return { apiToken, environment };
    return null;
  } catch (e) {
    console.error("Exception fetching Paperfly credentials:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const dbCredentials = await getCredentialsFromDB(supabaseClient);
    const apiToken = dbCredentials?.apiToken || Deno.env.get("PAPERFLY_API_TOKEN");
    const environment = dbCredentials?.environment || "production";

    if (!apiToken) {
      throw new Error("Paperfly API token not configured. Please set it in Settings > Integrations.");
    }

    const BASE_URL = environment === "sandbox"
      ? "https://merchant-api-sandbox.paperfly.com.bd"
      : "https://merchant-api.paperfly.com.bd";

    const headers = {
      "X-Auth-Token": apiToken,
      "Content-Type": "application/json",
    };

    const safeJsonParse = async (response: Response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(text || `HTTP ${response.status}: Non-JSON response`);
      }
    };

    const { action, ...payload } = await req.json();
    let result;

    switch (action) {
      case "test_connection": {
        const response = await fetch(`${BASE_URL}/merchant`, {
          method: "GET",
          headers,
        });
        result = await safeJsonParse(response);
        break;
      }

      case "create_parcel": {
        const response = await fetch(`${BASE_URL}/parcel/add`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload.parcel),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "track_parcel": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/tracking`, {
          method: "POST",
          headers,
          body: JSON.stringify({ tracking_code }),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "get_parcel_details": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/parcel/${tracking_code}`, {
          method: "GET",
          headers,
        });
        result = await safeJsonParse(response);
        break;
      }

      case "cancel_parcel": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/parcel/cancel`, {
          method: "POST",
          headers,
          body: JSON.stringify({ tracking_code }),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "bulk_create_parcels": {
        const response = await fetch(`${BASE_URL}/parcel/bulk-add`, {
          method: "POST",
          headers,
          body: JSON.stringify({ parcels: payload.parcels }),
        });
        result = await safeJsonParse(response);
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Paperfly API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
