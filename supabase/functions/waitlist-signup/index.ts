import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://eczgwwpesnjlvwqrelzz.supabase.co";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const { error } = await supabase
    .from("waitlist")
    .upsert({ email, signed_up_at: new Date().toISOString() }, { onConflict: "email" });

  if (error) {
    console.error("Supabase error:", error);
    return new Response(JSON.stringify({ error: "DB error" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
});
