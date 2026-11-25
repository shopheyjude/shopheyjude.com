// Hey Jude — order-request handler (Cloudflare Worker "heyjude-order-request").
// Separate from the contact form and the email signup.
// It never charges anything: it saves a request, emails Hey Jude the itemized list,
// and an adult confirms stock and sends a Square invoice by hand.
//
// Bindings (wrangler.toml): ORDERS (KV namespace), SEB (send_email).
// Secret: NOTIFY_TO (verified destination address). Vars: NOTIFY_FROM (address on shopheyjude.com),
//       ALLOWED_ORIGINS (comma list), ALLOWED_ORIGIN_SUFFIXES (comma list, e.g. ".heyjude-site.pages.dev").
import { EmailMessage } from "cloudflare:email";
import CATALOG from "./catalog.json";

const KEY_RE = /^[A-Za-z0-9-]{16,64}$/;
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;
const TTL = 60 * 60 * 24 * 365; // keep requests one year

export function orderableMap(catalog = CATALOG) {
  const m = new Map();
  for (const it of catalog.items || []) {
    if (it.available === true && Number.isInteger(it.priceCents) && it.priceCents > 0) m.set(it.sku, it);
  }
  return m;
}

function cleanLine(v, n) { return String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, n); }
function dollars(c) { return "$" + (c / 100).toFixed(2); }
function b64(s) { const b = new TextEncoder().encode(s); let x = ""; for (const c of b) x += String.fromCharCode(c); return btoa(x); }
function hdr(s) { return "=?UTF-8?B?" + b64(s) + "?="; }

async function sha256(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function newRequestId(now = new Date()) {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(5));
  return "HJ-" + ymd + "-" + [...r].map((x) => A[x % A.length]).join("");
}

function allowedOrigin(origin, env) {
  if (!origin) return false;
  const list = String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (list.includes(origin)) return true;
  let host;
  try { const u = new URL(origin); if (u.protocol !== "https:") return false; host = u.hostname; } catch (e) { return false; }
  return String(env.ALLOWED_ORIGIN_SUFFIXES || "").split(",").map((s) => s.trim()).filter(Boolean)
    .some((suf) => host.endsWith(suf) && /^[a-z0-9.-]+$/.test(host));
}

// Returns { ok, error, data } — data is the normalized request.
export function validate(body, catalog = CATALOG) {
  if (!body || typeof body !== "object") return { ok: false, error: "bad_request" };
  const name = cleanLine(body.name, 100);
  const email = cleanLine(body.email, 200).toLowerCase();
  const zip = cleanLine(body.zip, 10);
  const key = cleanLine(body.requestKey, 64);
  if (!KEY_RE.test(key)) return { ok: false, error: "bad_request" };
  if (!name) return { ok: false, error: "name" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "email" };
  if (!ZIP_RE.test(zip)) return { ok: false, error: "zip" };
  if (!Array.isArray(body.items) || body.items.length === 0) return { ok: false, error: "empty" };
  const map = orderableMap(catalog);
  const maxQty = catalog.maxQtyPerItem || 5, maxItems = catalog.maxItemsPerRequest || 10;
  if (body.items.length > maxItems) return { ok: false, error: "too_many" };
  const merged = new Map();
  for (const it of body.items) {
    const sku = cleanLine(it && it.sku, 40);
    const qty = it && it.qty;
    if (!map.has(sku)) return { ok: false, error: "unavailable", sku };
    if (!Number.isInteger(qty) || qty < 1 || qty > maxQty) return { ok: false, error: "qty", sku };
    merged.set(sku, (merged.get(sku) || 0) + qty);
  }
  const lines = [];
  let subtotal = 0;
  for (const [sku, qty] of merged) {
    if (qty > maxQty) return { ok: false, error: "qty", sku };
    const c = map.get(sku);
    const line = c.priceCents * qty;
    subtotal += line;
    lines.push({ sku, product: c.productName, size: c.sizeLabel, qty, unitCents: c.priceCents, lineCents: line });
  }
  lines.sort((a, b) => a.sku.localeCompare(b.sku));
  const method = body.delivery == null ? "ship" : cleanLine(body.delivery, 10);
  if (method !== "ship" && method !== "local") return { ok: false, error: "delivery" };
  let feeCents = 0;
  if (method === "local") {
    const ld = catalog.localDelivery || {};
    if (!(ld.enabled === true && Array.isArray(ld.zips) && ld.zips.includes(zip.slice(0, 5)) && Number.isInteger(ld.feeCents) && ld.feeCents >= 0)) return { ok: false, error: "local_unavailable" };
    feeCents = ld.feeCents;
  }
  return { ok: true, data: { key, name, email, zip, lines, subtotalCents: subtotal, delivery: method, deliveryFeeCents: feeCents } };
}

function emailBody(rec) {
  const L = [
    (rec.test ? "TEST REQUEST — placeholder prices from the preview site. Do not invoice.\r\n\r\n" : "") + "New order request — " + rec.requestId,
    "",
    "Nothing has been charged and nothing is reserved.",
    "Next: confirm stock, then send a Square invoice by hand.",
    "",
    "Name: " + rec.name,
    "Email: " + rec.email,
    "ZIP (US): " + rec.zip,
    "Delivery: " + (rec.delivery === "local" ? "Local delivery — " + (rec.deliveryFeeCents === 0 ? "free" : dollars(rec.deliveryFeeCents)) : "Ship it — shipping cost to confirm"),
    "Received: " + rec.createdAt,
    "",
    "Items:"
  ];
  for (const l of rec.lines) L.push("- " + l.product + ", " + l.size + " [" + l.sku + "] × " + l.qty + " @ " + dollars(l.unitCents) + " = " + dollars(l.lineCents));
  L.push("", "Subtotal: " + dollars(rec.subtotalCents));
  if (rec.delivery === "local") L.push("Local delivery: " + (rec.deliveryFeeCents === 0 ? "free" : dollars(rec.deliveryFeeCents)), "Total: " + dollars(rec.subtotalCents + rec.deliveryFeeCents) + " (before any tax)");
  else L.push("Shipping: to confirm", "Total before shipping and tax: " + dollars(rec.subtotalCents));
  L.push("", "Reply to this email to reach the customer.");
  return L.join("\r\n");
}

function rawEmail(rec, env) {
  return [
    "From: " + hdr("Hey Jude Order Requests") + " <" + env.NOTIFY_FROM + ">",
    "To: <" + env.NOTIFY_TO + ">",
    "Reply-To: " + hdr(rec.name) + " <" + rec.email + ">",
    "Subject: " + hdr((rec.test ? "[TEST] " : "") + "Order request " + rec.requestId + " — " + rec.name),
    "Message-ID: <" + rec.requestId + "." + Date.now() + "@shopheyjude.com>",
    "Date: " + new Date().toUTCString(),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(emailBody(rec)).replace(/.{76}/g, "$&\r\n")
  ].join("\r\n");
}

export async function notify(rec, env) {
  await env.SEB.send(new EmailMessage(env.NOTIFY_FROM, env.NOTIFY_TO, rawEmail(rec, env)));
}

export function createHandler(catalog = CATALOG) {
  return {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const ok = allowedOrigin(origin, env);
    const cors = {
      "Access-Control-Allow-Origin": ok ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
      "Vary": "Origin"
    };
    const out = (o, s) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
    if (req.method === "OPTIONS") return new Response(null, { status: ok ? 204 : 403, headers: cors });
    if (req.method !== "POST") return out({ ok: false, error: "not_found" }, 404);
    if (!ok) return out({ ok: false, error: "origin" }, 403);

    // Email signups ("Psst… new pajamas!"): stored in KV as signup:<email>. Export with
    // `wrangler kv key list --binding ORDERS --prefix signup:`.
    if (new URL(req.url).pathname.replace(/\/+$/, "") === "/signup") {
      if (!env.ORDERS) return out({ ok: false, error: "not_configured" }, 503);
      let sb;
      try {
        if (Number(req.headers.get("Content-Length") || 0) > 2000) return out({ ok: false, error: "bad_request" }, 413);
        sb = await req.json();
      } catch (e) { return out({ ok: false, error: "bad_request" }, 400); }
      if (!sb || sb.website) return out({ ok: false, error: "bad_request" }, 400); // honeypot
      const email = String(sb.email || "").trim().toLowerCase();
      if (email.length > 254 || !EMAIL_RE.test(email)) return out({ ok: false, error: "email" }, 422);
      const k = "signup:" + email;
      if (!(await env.ORDERS.get(k))) {
        await env.ORDERS.put(k, JSON.stringify({ email, createdAt: new Date().toISOString(), source: String(sb.source || "").slice(0, 80) }));
      }
      return out({ ok: true }, 200);
    }
    if (!env.ORDERS || !env.SEB || !env.NOTIFY_TO || !env.NOTIFY_FROM) return out({ ok: false, error: "not_configured" }, 503);

    let body;
    try {
      if (Number(req.headers.get("Content-Length") || 0) > 20000) return out({ ok: false, error: "bad_request" }, 413);
      body = await req.json();
    } catch (e) { return out({ ok: false, error: "bad_request" }, 400); }
    if (body && body.website) return out({ ok: false, error: "bad_request" }, 400); // honeypot

    const v = validate(body, catalog);
    if (!v.ok) return out({ ok: false, error: v.error, sku: v.sku || null }, 422);
    const d = v.data;
    const hash = await sha256(JSON.stringify([d.name, d.email, d.zip, d.delivery, d.lines.map((l) => [l.sku, l.qty])]));
    const kk = "key:" + d.key;

    // Duplicate submission (double click, retry after a lost response): same key → same request.
    let rec = await env.ORDERS.get(kk, "json");
    if (rec && rec.hash !== hash) return out({ ok: false, error: "key_reused" }, 409);

    if (!rec) {
      let id = newRequestId();
      for (let i = 0; i < 3 && (await env.ORDERS.get("req:" + id)); i++) id = newRequestId();
      rec = {
        requestId: id, hash, createdAt: new Date().toISOString(),
        name: d.name, email: d.email, zip: d.zip, lines: d.lines, subtotalCents: d.subtotalCents,
        delivery: d.delivery, deliveryFeeCents: d.deliveryFeeCents,
        emailed: false, status: "new", test: catalog.testMode === true
      };
      await env.ORDERS.put("req:" + id, JSON.stringify(rec), { expirationTtl: TTL });
      await env.ORDERS.put(kk, JSON.stringify(rec), { expirationTtl: TTL });
    }

    if (!rec.emailed) {
      try {
        await notify(rec, env);
      } catch (e) {
        // Saved but Hey Jude hasn't been told: report failure so the buyer retries with the same key.
        return out({ ok: false, error: "notify_failed", retry: true }, 502);
      }
      rec.emailed = true;
      rec.emailedAt = new Date().toISOString();
      await env.ORDERS.put("req:" + rec.requestId, JSON.stringify(rec), { expirationTtl: TTL });
      await env.ORDERS.put(kk, JSON.stringify(rec), { expirationTtl: TTL });
      return out({ ok: true, requestId: rec.requestId, duplicate: false }, 200);
    }
    return out({ ok: true, requestId: rec.requestId, duplicate: true }, 200);
  }
};
}

export default createHandler(CATALOG);
