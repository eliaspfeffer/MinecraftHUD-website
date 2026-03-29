import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://eczgwwpesnjlvwqrelzz.supabase.co";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DOWNLOAD_URL = "https://github.com/eliaspfeffer/MinecraftHUD/releases/latest/download/MinecraftHUD.dmg";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body = await req.text();

  // Step 1: Verify with PayPal (IPN verification protocol)
  const verifyRes = await fetch("https://ipnpb.paypal.com/cgi-bin/webscr", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "cmd=_notify-validate&" + body,
  });
  const verifyText = await verifyRes.text();

  if (verifyText !== "VERIFIED") {
    console.error("PayPal IPN not verified:", verifyText);
    return new Response("Not verified", { status: 400 });
  }

  // Step 2: Parse IPN fields
  const params = new URLSearchParams(body);
  const paymentStatus = params.get("payment_status");
  const txnId = params.get("txn_id");
  const payerEmail = params.get("payer_email") ?? "";
  const payerId = params.get("payer_id") ?? "";
  const amount = parseFloat(params.get("mc_gross") ?? "0");
  const currency = params.get("mc_currency") ?? "USD";
  const receiverEmail = params.get("receiver_email") ?? "";

  // Step 3: Sanity checks
  if (receiverEmail.toLowerCase() !== "eliaspfeffer@gmail.com") {
    return new Response("Wrong receiver", { status: 400 });
  }
  if (amount < 4.98 || currency !== "USD") {
    return new Response("Wrong amount", { status: 400 });
  }
  if (paymentStatus !== "Completed") {
    // Store pending/failed but don't send download
    await supabase.from("purchases").upsert({
      email: payerEmail,
      paypal_txn_id: txnId,
      paypal_payer_id: payerId,
      amount,
      currency,
      status: paymentStatus?.toLowerCase() ?? "unknown",
    }, { onConflict: "paypal_txn_id" });
    return new Response("OK", { status: 200 });
  }

  // Step 4: Store completed purchase + generate download token
  const { data: purchase, error } = await supabase
    .from("purchases")
    .upsert({
      email: payerEmail,
      paypal_txn_id: txnId,
      paypal_payer_id: payerId,
      amount,
      currency,
      status: "completed",
      platform: "macos",
      verified_at: new Date().toISOString(),
    }, { onConflict: "paypal_txn_id" })
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return new Response("DB error", { status: 500 });
  }

  // Step 5: Send download email via Supabase Auth email (or just log for now)
  // You can plug in Resend/SendGrid here for the actual email
  console.log(`✅ Purchase verified: ${payerEmail} | txn: ${txnId} | token: ${purchase.download_token}`);

  return new Response("OK", { status: 200 });
});
