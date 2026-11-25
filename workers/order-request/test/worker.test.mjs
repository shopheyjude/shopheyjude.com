// Run: node --import ./test/register.mjs --test test/  (from workers/order-request)
import test from "node:test";
import assert from "node:assert/strict";
import worker, { validate } from "../src/index.js";

const cat = { maxQtyPerItem: 5, maxItemsPerRequest: 10, items: [
  { sku: "A-M", productName: "Flower Set", sizeLabel: "M", priceCents: 3200, available: true },
  { sku: "A-XS", productName: "Flower Set", sizeLabel: "XS", priceCents: null, available: true },
  { sku: "A-L", productName: "Flower Set", sizeLabel: "L", priceCents: 3200, available: false } ] };

function kv() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); return v == null ? null : t === "json" ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, v); } }; }
function env(fail = 0) { const sent = []; return { sent, ORDERS: kv(), NOTIFY_TO: "to@x.com", NOTIFY_FROM: "orders@shopheyjude.com", ALLOWED_ORIGINS: "https://shopheyjude.com", ALLOWED_ORIGIN_SUFFIXES: ".heyjude-site.pages.dev",
  SEB: { async send(m) { if (fail-- > 0) throw new Error("down"); sent.push(m); } } }; }
const req = (body, origin = "https://shopheyjude.com") => new Request("https://w/", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("unconfirmed price or unavailable size is rejected", () => {
  const base = { requestKey: "k".repeat(20), name: "A", email: "a@b.co", zip: "77584" };
  assert.equal(validate({ ...base, items: [{ sku: "A-XS", qty: 1 }] }, cat).error, "unavailable");
  assert.equal(validate({ ...base, items: [{ sku: "A-L", qty: 1 }] }, cat).error, "unavailable");
  assert.equal(validate({ ...base, items: [{ sku: "A-M", qty: 2 }] }, cat).data.subtotalCents, 6400);
});

test("shipped catalog has nothing orderable until prices are confirmed", async () => {
  const e = env();
  const r = await worker.fetch(req({ requestKey: "k".repeat(20), name: "A", email: "a@b.co", zip: "77584", items: [{ sku: "HJ-FLW-M", qty: 1 }] }), e);
  assert.equal(r.status, 422);
  assert.equal(e.sent.length, 0);
});

test("preview origin allowed, lookalike rejected", async () => {
  const b = { requestKey: "k".repeat(20), name: "A", email: "a@b.co", zip: "77584", items: [] };
  assert.equal((await worker.fetch(req(b, "https://preview-first-drop.heyjude-site.pages.dev"), env())).status, 422);
  assert.equal((await worker.fetch(req(b, "https://evilheyjude-site.pages.dev.attacker.com"), env())).status, 403);
  assert.equal((await worker.fetch(req(b, "http://x.heyjude-site.pages.dev"), env())).status, 403);
});

import { createHandler } from "../src/index.js";
const h = createHandler(cat);
const good = { requestKey: "retry-key-000000000001", name: "Ann", email: "ann@example.com", zip: "77584", items: [{ sku: "A-M", qty: 2 }] };

test("email failure → 502, retry with same key sends once and keeps the same ID", async () => {
  const e = env(1);
  const r1 = await h.fetch(req(good), e);
  assert.equal(r1.status, 502);
  assert.equal((await r1.json()).retry, true);
  assert.equal(e.sent.length, 0);
  const r2 = await h.fetch(req(good), e); const j2 = await r2.json();
  assert.equal(r2.status, 200); assert.equal(j2.duplicate, false);
  const r3 = await h.fetch(req(good), e); const j3 = await r3.json();
  assert.equal(j3.requestId, j2.requestId); assert.equal(j3.duplicate, true);
  assert.equal(e.sent.length, 1);
  assert.match(j2.requestId, /^HJ-\d{6}-[A-Z2-9]{5}$/);
  const saved = JSON.parse(e.ORDERS.m.get("req:" + j2.requestId));
  assert.equal(saved.subtotalCents, 6400); assert.equal(saved.emailed, true);
});

test("same key with different items is refused", async () => {
  const e = env();
  await h.fetch(req(good), e);
  const r = await h.fetch(req({ ...good, items: [{ sku: "A-M", qty: 1 }] }), e);
  assert.equal(r.status, 409);
  assert.equal(e.sent.length, 1);
});

test("not configured → 503, nothing sent", async () => {
  const e = env(); delete e.ORDERS;
  assert.equal((await h.fetch(req(good), e)).status, 503);
});
