/* Hey Jude — first-drop "Request to Order" flow.
 * Off unless HJ_CONFIG.ordering.enabled is true AND ordering.endpoint is an https URL.
 * Prices and availability come only from window.HJ_CATALOG (generated from the Worker's
 * catalog.json). A size is orderable only when available === true and priceCents is a
 * confirmed whole number. Nothing here takes payment.
 */
(function () {
  "use strict";
  var C = window.HJ_CONFIG || {};
  var O = C.ordering || {};
  var CAT = window.HJ_CATALOG || { items: [] };
  function validUrl(u) { try { return new URL(u).protocol === "https:" || (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u)); } catch (e) { return false; } }
  if (!O.enabled || !validUrl(O.endpoint)) return;

  var root = document.documentElement;
  root.classList.add("ordering");
  var DONE_TEXT = "We’ll email you to confirm availability, shipping, and your total. You haven’t been charged, and your items aren’t reserved yet.";
  var MAXQ = CAT.maxQtyPerItem || 5, MAXI = CAT.maxItemsPerRequest || 10;
  var BY = {};
  (CAT.items || []).forEach(function (it) { BY[it.sku] = it; });
  function orderable(it) { return !!(it && it.available === true && typeof it.priceCents === "number" && it.priceCents > 0 && Math.floor(it.priceCents) === it.priceCents); }
  function skusFor(pid) { return (CAT.items || []).filter(function (it) { return it.product === pid; }); }
  function money(c) { return "$" + (c / 100).toFixed(2); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function msg(el, kind, text, focus) { if (!el) return; el.className = el.className.replace(/\s*(show|ok|err|info)\b/g, "") + " show " + kind; el.textContent = text; if (focus) try { el.focus(); } catch (e) {} }
  function newKey() {
    try { if (crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  }

  if (CAT.testMode === true) {
    var tb = document.createElement("div");
    tb.className = "test-banner"; tb.setAttribute("role", "note");
    tb.textContent = "Test mode: prices are placeholders and requests are marked TEST. Nothing is charged.";
    var main = document.getElementById("main") || document.body;
    main.insertBefore(tb, main.firstChild);
  }

  /* ---------- Bag (this browser only) ---------- */
  var KEY = "hj-bag-v1";
  function readBag() {
    try {
      var b = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!b || !Array.isArray(b.items)) return { items: [], key: newKey() };
      b.items = b.items.filter(function (i) { return i && BY[i.sku] && i.qty > 0; }).map(function (i) { return { sku: i.sku, qty: Math.min(MAXQ, Math.floor(i.qty)) }; });
      if (typeof b.key !== "string" || b.key.length < 16) b.key = newKey();
      return b;
    } catch (e) { return { items: [], key: newKey() }; }
  }
  function writeBag(b, keepKey) {
    if (!keepKey) b.key = newKey(); // the bag changed → it is a new request
    try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {}
    updateCount();
  }
  function count() { return readBag().items.reduce(function (a, i) { return a + i.qty; }, 0); }
  function updateCount() {
    var n = count();
    $$("[data-cart-count]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    $$("[data-cart-link]").forEach(function (a) { a.setAttribute("aria-label", "Bag, " + n + (n === 1 ? " item" : " items")); });
  }

  /* ---------- Prices shown on the page: confirmed only ---------- */
  function priceText(pid) {
    var ps = skusFor(pid).filter(orderable).map(function (it) { return it.priceCents; });
    if (!ps.length) return "Price coming soon";
    var lo = Math.min.apply(null, ps), hi = Math.max.apply(null, ps);
    return lo === hi ? money(lo) : money(lo) + "–" + money(hi);
  }
  $$("[data-card], [data-product]").forEach(function (box) {
    var pid = box.getAttribute("data-card") || box.getAttribute("data-product");
    $$('[data-f="price"]', box).forEach(function (el) { el.textContent = priceText(pid); });
  });
  // Shop cards: send buyers to the product page to choose size and quantity.
  $$("[data-card]").forEach(function (card) {
    var f = $("[data-add-form]", card); if (!f) return;
    var link = $("h3 a", card);
    var d = document.createElement("div"); d.className = "card-actions order-card-actions";
    d.innerHTML = '<a class="btn pill" href="' + esc(link ? link.getAttribute("href") : "#") + '">Choose size</a>';
    f.parentNode.insertBefore(d, f.nextSibling);
  });

  /* ---------- Product page: size + quantity → Add to Bag ---------- */
  $$("[data-order-form]").forEach(function (form) {
    var pid = form.getAttribute("data-product-id");
    var box = $("[data-o-sizes]", form), chosen = $("[data-o-chosen]", form), out = $("[data-o-msg]", form);
    var qty = $("[data-o-qty]", form), add = $("[data-o-add]", form);
    var items = skusFor(pid);
    box.innerHTML = items.map(function (it) {
      var ok = orderable(it);
      return '<label class="size-opt' + (ok ? "" : " is-unavailable") + '"><input type="radio" name="o-size-' + esc(pid) + '" value="' + esc(it.sku) + '"' + (ok ? "" : " disabled") +
        ' aria-label="' + esc(it.sizeLabel + (ok ? "" : ", not available yet")) + '"><span>' + esc(it.sizeLabel) + (ok ? "" : ' <em class="na">Not available yet</em>') + "</span></label>";
    }).join("");
    qty.max = MAXQ;
    var anyOk = items.some(orderable);
    if (!anyOk) { add.disabled = true; msg(out, "info", "This set isn’t open for requests yet."); }
    form.hidden = false;
    function clampQty() { var v = Math.floor(Number(qty.value)); if (!(v >= 1)) v = 1; if (v > MAXQ) v = MAXQ; qty.value = v; return v; }
    $("[data-o-dec]", form).addEventListener("click", function () { qty.value = Math.max(1, clampQty() - 1); });
    $("[data-o-inc]", form).addEventListener("click", function () { qty.value = Math.min(MAXQ, clampQty() + 1); });
    qty.addEventListener("change", clampQty);
    box.addEventListener("change", function (e) {
      var it = BY[e.target.value]; chosen.textContent = it ? ": " + it.sizeLabel : "";
      out.className = out.className.replace(/\s*(show|ok|err|info)\b/g, ""); out.textContent = "";
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = $("input[type=radio]:checked", form);
      if (!r) { msg(out, "err", "Please choose a size first.", true); return; }
      var it = BY[r.value];
      if (!orderable(it)) { msg(out, "err", "That size isn’t available yet.", true); return; }
      var q = clampQty();
      var b = readBag();
      var line = b.items.filter(function (i) { return i.sku === it.sku; })[0];
      var have = line ? line.qty : 0;
      if (have + q > MAXQ) { msg(out, "err", "You can request up to " + MAXQ + " of each size.", true); return; }
      if (!line && b.items.length >= MAXI) { msg(out, "err", "Your bag is full. Please send this request first.", true); return; }
      if (line) line.qty += q; else b.items.push({ sku: it.sku, qty: q });
      writeBag(b);
      out.className = out.className.replace(/\s*(show|ok|err|info)\b/g, "") + " show ok";
      out.innerHTML = "Added " + esc(it.productName) + ", " + esc(it.sizeLabel) + " × " + q + ". " + '<a href="' + esc((document.body.getAttribute("data-base") || "") + "cart.html") + '">View bag</a>';
      try { out.focus(); } catch (e2) {}
    });
  });

  /* ---------- Bag page ---------- */
  var bag = $("[data-bag]");
  if (bag) {
    var legacy = $("[data-legacy-cart]"); if (legacy) legacy.hidden = true;
    var eyebrow = $(".page-head .eyebrow"), h1 = $(".page-head h1");
    if (eyebrow) eyebrow.textContent = "Bag"; if (h1) h1.textContent = "Your bag";
    document.title = "Bag | Hey Jude";
    bag.hidden = false;
    var list = $("[data-bag-items]"), sub = $("[data-bag-subtotal]"), bmsg = $("[data-bag-msg]");
    var start = $("[data-bag-start]"), rf = $("[data-request-form]"), status = $("[data-request-status]"), send = $("[data-request-send]");
    var done = $("[data-bag-done]"), sending = false, lastSubtotal = 0;
    var LD = CAT.localDelivery || {};
    var zipIn = $("[data-bag-zip]"), zipNote = $("[data-zip-note]"), delOpts = $("[data-del-opts]"), delLocal = $("[data-del-local]");
    var feeRow = $("[data-bag-fee-row]"), totalEl = $("[data-bag-total]"), totalLabel = $("[data-bag-total-label]");
    var FEE = Number.isInteger(LD.feeCents) && LD.feeCents >= 0 ? LD.feeCents : null;
    $$("[data-del-fee], [data-bag-fee]").forEach(function (el) { if (FEE !== null) el.textContent = money(FEE); });
    function zip5() { var z = (zipIn.value || "").trim(); return /^\d{5}(-\d{4})?$/.test(z) ? z.slice(0, 5) : null; }
    function localOK(z) { return !!(z && LD.enabled === true && FEE !== null && Array.isArray(LD.zips) && LD.zips.indexOf(z) !== -1); }
    function delivery() { var r = $("input[name=bag-delivery]:checked"); return r ? r.value : "ship"; }
    try { var savedZip = localStorage.getItem("hj-bag-zip"); if (savedZip && !zipIn.value) zipIn.value = savedZip; } catch (e) {}
    function syncDelivery() {
      var z = zip5(), ok = localOK(z);
      delOpts.hidden = !z;
      delLocal.hidden = !ok;
      if (!ok && delivery() === "local") $("input[name=bag-delivery][value=ship]").checked = true;
      if (!zipIn.value.trim()) zipNote.textContent = "Enter your ZIP to see delivery options.";
      else if (!z) zipNote.textContent = "Please enter a 5-digit U.S. ZIP code.";
      else zipNote.textContent = ok ? "Local delivery is available for " + z + " (" + money(FEE) + "), or choose shipping." : "Shipping only for " + z + ".";
      var local = ok && delivery() === "local";
      feeRow.hidden = !local;
      totalLabel.textContent = local ? "Total before any tax" : "Total before shipping";
      totalEl.textContent = money(lastSubtotal + (local ? FEE : 0));
    }
    zipIn.addEventListener("input", function () { try { localStorage.setItem("hj-bag-zip", zipIn.value.trim()); } catch (e) {} syncDelivery(); });
    delOpts.addEventListener("change", syncDelivery);

    function render() {
      var b = readBag(), total = 0, blocked = false;
      if (!b.items.length) {
        list.innerHTML = '<p class="muted">Your bag is empty.</p>';
        sub.textContent = "$0.00"; lastSubtotal = 0; syncDelivery(); start.disabled = true; rf.hidden = true; return;
      }
      list.innerHTML = '<ul class="bag-list">' + b.items.map(function (i) {
        var it = BY[i.sku], ok = orderable(it);
        if (ok) total += it.priceCents * i.qty; else blocked = true;
        return '<li class="bag-item' + (ok ? "" : " is-unavailable") + '" data-sku="' + esc(i.sku) + '">' +
          '<div class="bag-what"><strong>' + esc(it.productName) + "</strong><span>" + esc(it.sizeLabel) + "</span>" +
          (ok ? '<span class="muted">' + money(it.priceCents) + " each</span>" : '<span class="na">Not available to request right now. Please remove it.</span>') + "</div>" +
          '<div class="qty-step" role="group" aria-label="Quantity for ' + esc(it.productName + ", " + it.sizeLabel) + '">' +
          '<button type="button" class="qty-btn" data-dec aria-label="One fewer">&minus;</button>' +
          '<input class="qty-in" type="number" inputmode="numeric" min="1" max="' + MAXQ + '" value="' + i.qty + '" data-q aria-label="Quantity">' +
          '<button type="button" class="qty-btn" data-inc aria-label="One more"' + (ok ? "" : " disabled") + ">+</button></div>" +
          '<div class="bag-line">' + (ok ? money(it.priceCents * i.qty) : "—") + '</div>' +
          '<button type="button" class="link-btn" data-remove>Remove</button></li>';
      }).join("") + "</ul>";
      sub.textContent = money(total);
      lastSubtotal = total;
      syncDelivery();
      start.disabled = blocked || sending;
      if (blocked) msg(bmsg, "err", "Remove the items marked “not available” to send your request.");
      else if (/\berr\b/.test(bmsg.className) && /not available/.test(bmsg.textContent)) { bmsg.className = bmsg.className.replace(/\s*(show|ok|err|info)\b/g, ""); bmsg.textContent = ""; }
    }
    function setQty(sku, q) {
      var b = readBag();
      b.items = b.items.map(function (i) { return i.sku === sku ? { sku: sku, qty: q } : i; }).filter(function (i) { return i.qty > 0; });
      writeBag(b); render();
    }
    list.addEventListener("click", function (e) {
      if (sending) return;
      var li = e.target.closest("[data-sku]"); if (!li) return;
      var sku = li.getAttribute("data-sku"), cur = Number($("[data-q]", li).value) || 1;
      if (e.target.closest("[data-remove]")) setQty(sku, 0);
      else if (e.target.closest("[data-dec]")) setQty(sku, Math.max(1, cur - 1));
      else if (e.target.closest("[data-inc]")) setQty(sku, Math.min(MAXQ, cur + 1));
    });
    list.addEventListener("change", function (e) {
      if (sending || !e.target.matches("[data-q]")) return;
      var li = e.target.closest("[data-sku]"), v = Math.floor(Number(e.target.value));
      setQty(li.getAttribute("data-sku"), Math.min(MAXQ, v >= 1 ? v : 1));
    });
    start.addEventListener("click", function () {
      rf.hidden = false; start.hidden = true;
      try { $("#rq-name").focus(); } catch (e) {}
    });

    function bad(input, text) { input.setAttribute("aria-invalid", "true"); msg(status, "err", text, false); input.focus(); return false; }
    function check() {
      $$("input", rf).forEach(function (i) { i.removeAttribute("aria-invalid"); }); zipIn.removeAttribute("aria-invalid");
      var n = $("#rq-name"), em = $("#rq-email"), z = $("#rq-zip");
      if (!n.value.trim()) return bad(n, "Please add your name.");
      if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(em.value.trim())) return bad(em, "Please enter a valid email address, like name@example.com.");
      if (!/^\d{5}(-\d{4})?$/.test(z.value.trim())) return bad(z, "Please enter a 5-digit U.S. ZIP code above.");
      return true;
    }
    function lock(on) {
      sending = on; send.disabled = on; send.textContent = on ? "Sending…" : "Send request";
      $$("input", rf).forEach(function (i) { i.readOnly = on; });
      zipIn.readOnly = on; $$("input", delOpts).forEach(function (i) { i.disabled = on; });
      $$("button", list).forEach(function (bt) { bt.disabled = on; });
      $$("input", list).forEach(function (i) { i.readOnly = on; });
    }
    rf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return; // one request at a time
      if (!check()) return;
      var b = readBag();
      if (!b.items.length) return;
      if (b.items.some(function (i) { return !orderable(BY[i.sku]); })) { render(); return; }
      lock(true);
      msg(status, "info", "Sending your request…");
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
      fetch(O.endpoint, {
        method: "POST", mode: "cors", credentials: "omit", signal: ctl ? ctl.signal : undefined,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestKey: b.key, name: $("#rq-name").value.trim(), email: $("#rq-email").value.trim(), zip: $("#rq-zip").value.trim(),
          delivery: localOK(zip5()) ? delivery() : "ship",
          website: rf.elements.website.value, items: b.items
        })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j }; });
      }).then(function (res) {
        clearTimeout(timer);
        if (res.status === 200 && res.j && res.j.ok && res.j.requestId) {
          // Saved on the server. Only now show the confirmation and empty the bag.
          try { localStorage.removeItem(KEY); localStorage.removeItem("hj-bag-zip"); } catch (e2) {}
          updateCount();
          bag.hidden = true;
          $("[data-done-text]").textContent = DONE_TEXT;
          $("[data-done-id]").textContent = res.j.requestId;
          done.hidden = false;
          var hd = $("h2", done); hd.setAttribute("tabindex", "-1"); try { hd.focus(); } catch (e3) {}
          return;
        }
        lock(false);
        var err = res.j && res.j.error;
        if (err === "unavailable") {
          var bb = readBag(); render();
          msg(status, "err", "One of your items can’t be requested right now, so nothing was sent. Please remove it and try again.", true);
        } else if (err === "key_reused") {
          var b2 = readBag(); writeBag(b2); // fresh key for the changed bag
          msg(status, "err", "Your bag changed. Please send the request again.", true);
        } else if (err === "local_unavailable" || err === "delivery") {
          $("input[name=bag-delivery][value=ship]").checked = true; syncDelivery();
          msg(status, "err", "Local delivery isn’t available for that ZIP, so nothing was sent. We switched you to shipping — please send again.", true);
        } else if (err === "email" || err === "zip" || err === "name") {
          msg(status, "err", "Please check your name, email and ZIP code, then try again.", true);
        } else if (res.status === 403 || res.status === 503) {
          msg(status, "err", "Requests aren’t open right now, so nothing was sent. Please try again later.", true);
        } else {
          msg(status, "err", "Your request didn’t go through. Your bag is still here — please try again.", true);
        }
        send.textContent = "Try again";
      }).catch(function () {
        clearTimeout(timer);
        lock(false);
        msg(status, "err", "Your request didn’t go through. Your bag is still here — please try again.", true);
        send.textContent = "Try again";
      });
    });
    render();
    window.addEventListener("storage", function (e) { if (e.key === KEY && !sending) render(); });
  }
  updateCount();
})();
