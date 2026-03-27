import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://api.paperfly.com.bd";

async function getCredentialsFromDB(supabaseClient: any) {
  try {
    const { data, error } = await supabaseClient
      .from("store_settings")
      .select("key, setting_value")
      .in("key", ["PAPERFLY_USERNAME", "PAPERFLY_PASSWORD", "PAPERFLY_KEY"]);

    if (error || !data) return null;
    const username = data.find((s: any) => s.key === "PAPERFLY_USERNAME")?.setting_value;
    const password = data.find((s: any) => s.key === "PAPERFLY_PASSWORD")?.setting_value;
    const paperflyKey = data.find((s: any) => s.key === "PAPERFLY_KEY")?.setting_value;
    if (username && password && paperflyKey) return { username, password, paperflyKey };
    return null;
  } catch (e) {
    console.error("Exception fetching Paperfly credentials:", e);
    return null;
  }
}

function buildHeaders(username: string, password: string, paperflyKey: string) {
  const basicAuth = btoa(`${username}:${password}`);
  return {
    "Authorization": `Basic ${basicAuth}`,
    "paperflykey": paperflyKey,
    "Content-Type": "application/json",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const creds = await getCredentialsFromDB(supabaseClient);
    if (!creds) {
      throw new Error("Paperfly API credentials not configured. Please set them in System Settings > Integrations.");
    }

    const headers = buildHeaders(creds.username, creds.password, creds.paperflyKey);

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
        const response = await fetch(`${BASE_URL}/merchant/api/service/merchant-info`, {
          method: "GET",
          headers,
        });
        result = await safeJsonParse(response);
        break;
      }

      case "create_parcel": {
        const response = await fetch(`${BASE_URL}/merchant/api/service/order/create`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload.parcel),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "track_parcel": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/merchant/api/service/order/tracking`, {
          method: "POST",
          headers,
          body: JSON.stringify({ tracking_code }),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "get_parcel_details": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/merchant/api/service/order/details/${tracking_code}`, {
          method: "GET",
          headers,
        });
        result = await safeJsonParse(response);
        break;
      }

      case "cancel_parcel": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/merchant/api/service/order/cancel`, {
          method: "POST",
          headers,
          body: JSON.stringify({ tracking_code }),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "bulk_create_parcels": {
        const response = await fetch(`${BASE_URL}/merchant/api/service/order/bulk-create`, {
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
