import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ECOURIER_BASE_URL = "https://backoffice.ecourier.com.bd/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getCredentialsFromDB(supabaseClient: any) {
  try {
    const { data, error } = await supabaseClient
      .from("store_settings")
      .select("key, setting_value")
      .in("key", ["ECOURIER_API_KEY", "ECOURIER_API_SECRET", "ECOURIER_USER_ID"]);

    if (error || !data) return null;
    const apiKey = data.find((s: any) => s.key === "ECOURIER_API_KEY")?.setting_value;
    const apiSecret = data.find((s: any) => s.key === "ECOURIER_API_SECRET")?.setting_value;
    const userId = data.find((s: any) => s.key === "ECOURIER_USER_ID")?.setting_value;
    if (apiKey && apiSecret) return { apiKey, apiSecret, userId };
    return null;
  } catch (e) {
    console.error("Exception fetching eCourier credentials:", e);
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
    const apiKey = dbCredentials?.apiKey || Deno.env.get("ECOURIER_API_KEY");
    const apiSecret = dbCredentials?.apiSecret || Deno.env.get("ECOURIER_API_SECRET");
    const userId = dbCredentials?.userId || Deno.env.get("ECOURIER_USER_ID") || "";

    if (!apiKey || !apiSecret) {
      throw new Error("eCourier credentials not configured. Please set them in Settings > Integrations.");
    }

    const headers = {
      "API-KEY": apiKey,
      "API-SECRET": apiSecret,
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
        const response = await fetch(`${ECOURIER_BASE_URL}/district`, {
          method: "GET",
          headers,
        });
        result = await safeJsonParse(response);
        break;
      }

      case "get_districts": {
        const response = await fetch(`${ECOURIER_BASE_URL}/district`, {
          method: "GET",
          headers,
        });
        result = await safeJsonParse(response);
        break;
      }

      case "get_thanas": {
        const { district_id } = payload;
        const response = await fetch(`${ECOURIER_BASE_URL}/thana/${district_id}`, {
          method: "GET",
          headers,
        });
        result = await safeJsonParse(response);
        break;
      }

      case "get_areas": {
        const { thana_id } = payload;
        const response = await fetch(`${ECOURIER_BASE_URL}/area/${thana_id}`, {
          method: "GET",
          headers,
        });
        result = await safeJsonParse(response);
        break;
      }

      case "create_order": {
        const orderData = { ...payload.order };
        if (userId) orderData.user_id = userId;
        const response = await fetch(`${ECOURIER_BASE_URL}/order/place`, {
          method: "POST",
          headers,
          body: JSON.stringify(orderData),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "track_order": {
        const { tracking_code } = payload;
        const response = await fetch(`${ECOURIER_BASE_URL}/tracking`, {
          method: "POST",
          headers,
          body: JSON.stringify({ tracking_code }),
        });
        result = await safeJsonParse(response);
        break;
      }

      case "cancel_order": {
        const { tracking_code } = payload;
        const response = await fetch(`${ECOURIER_BASE_URL}/order/cancel`, {
          method: "POST",
          headers,
          body: JSON.stringify({ tracking_code }),
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
    console.error("eCourier API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
