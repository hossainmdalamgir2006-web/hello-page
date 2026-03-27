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
    "Accept": "application/json",
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
        // Paperfly has no dedicated "ping" endpoint, so we do a dummy tracking call
        // A successful auth will return a JSON response (even if tracking not found)
        const response = await fetch(`${BASE_URL}/API-Order-Tracking`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ReferenceNumber: "TEST000" }),
        });
        result = await safeJsonParse(response);
        // If we get a JSON response (even error), auth is working
        result = { success: true, message: "Connection successful", details: result };
        break;
      }

      case "create_parcel": {
        const response = await fetch(`${BASE_URL}/OrderPlacement`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload.parcel),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "track_parcel": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/API-Order-Tracking`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ReferenceNumber: tracking_code }),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "get_parcel_details": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/api/v1/invoice-details/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ReferenceNumber: tracking_code }),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "cancel_parcel": {
        const { tracking_code } = payload;
        const response = await fetch(`${BASE_URL}/api/v1/cancel-order/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ReferenceNumber: tracking_code }),
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
