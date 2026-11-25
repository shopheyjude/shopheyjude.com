/* Hey Jude — page behavior. Reads window.HJ_CONFIG (assets/config.js). Fails closed. */
(function () {
  "use strict";
  var C = window.HJ_CONFIG || {};
  var P = C.products || {};
  var base = document.body.getAttribute("data-base") || "";
  document.documentElement.classList.remove("no-js");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function validUrl(u) {
    if (typeof u !== "string") return false;
    try { return new URL(u).protocol === "https:"; } catch (e) { return false; }
  }
  function money(n) { return typeof n === "number" && n >= 0 ? "$" + n.toFixed(2).replace(/\.00$/, "") : ""; }
  function validEmail(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v); }
  function orderable(p) {
    return !!(p && (p.status === "preorder" || p.status === "in-stock") && typeof p.price === "number" && p.price > 0);
  }
  function sizeLabel(v) { return (C.sizeLabels && C.sizeLabels[v]) || v; }
  function statusLabel(p) {
    if (!p) return "Coming soon";
    if (p.status === "preorder") return "Pre-order";
    if (p.status === "in-stock") return "In stock";
    if (p.status === "sold-out") return "Sold out";
    return "Coming soon";
  }

  /* ---------- Cart (kept in this browser only) ---------- */
  var KEY = "hj-cart-v1";
  function readCart() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(c) ? c.filter(function (i) { return P[i.id] && i.size && i.qty > 0 && (P[i.id].sizes || []).indexOf(i.size) !== -1; }) : [];
    } catch (e) { return []; }
  }
  function writeCart(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} updateCount(); }
  function addToCart(id, size) {
    var c = readCart();
    var hit = c.filter(function (i) { return i.id === id && i.size === size; })[0];
    if (hit) hit.qty = Math.min(hit.qty + 1, 10); else c.push({ id: id, size: size, qty: 1 });
    writeCart(c);
  }
  function updateCount() {
    var n = readCart().reduce(function (a, i) { return a + i.qty; }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    document.querySelectorAll("[data-cart-link]").forEach(function (el) {
      el.setAttribute("aria-label", "Cart, " + n + (n === 1 ? " item" : " items"));
    });
  }
  updateCount();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { toggle.click(); toggle.focus(); }
    });
  }

  document.querySelectorAll("[data-contact-email]").forEach(function (el) {
    if (typeof C.contactEmail === "string" && validEmail(C.contactEmail)) {
      el.innerHTML = '<a href="mailto:' + esc(C.contactEmail) + '">' + esc(C.contactEmail) + "</a>";
    }
  });

  /* ---------- Cards and product page: price, badge, details ---------- */
  document.querySelectorAll("[data-card], [data-product]").forEach(function (root) {
    var id = root.getAttribute("data-card") || root.getAttribute("data-product");
    var p = P[id];
    if (!p) return;
    root.querySelectorAll("[data-f='price']").forEach(function (el) { el.textContent = money(p.price) || "Price coming soon"; });
    root.querySelectorAll(".badge").forEach(function (el) { el.textContent = statusLabel(p); });
    ["material", "fit", "care"].forEach(function (f) {
      root.querySelectorAll("[data-f='" + f + "']").forEach(function (el) { el.textContent = p[f] || "Details coming soon."; });
    });
    root.querySelectorAll("[data-ship-note]").forEach(function (el) {
      el.textContent = p.status === "preorder"
        ? (p.shipBy ? "Pre-order: expected to ship by " + p.shipBy + "." : "Pre-order: we’ll email your ship date. Cancel any time before it ships.")
        : "";
    });
  });

  /* ---------- Size + add-to-cart forms ---------- */
  document.querySelectorAll("[data-add-form]").forEach(function (form) {
    var id = form.getAttribute("data-product-id");
    var p = P[id];
    var msg = form.querySelector(".size-msg");
    var chosen = form.querySelector("[data-chosen]");
    var btn = form.querySelector("[data-add-btn]");
    var sizes = p && Array.isArray(p.sizes) ? p.sizes : [];
    var out = p && Array.isArray(p.soldOutSizes) ? p.soldOutSizes : [];

    form.querySelectorAll(".size-opt input").forEach(function (r) {
      var lab = r.closest(".size-opt");
      if (sizes.indexOf(r.value) === -1) { lab.remove(); return; }
      if (out.indexOf(r.value) !== -1) {
        r.disabled = true; lab.classList.add("is-out");
        lab.querySelector("span").setAttribute("aria-label", sizeLabel(r.value) + ", sold out");
      }
    });
    if (!orderable(p)) {
      btn.disabled = true;
      btn.textContent = p && p.status === "sold-out" ? "Sold out" : "Coming soon";
    }
    form.addEventListener("change", function () {
      var r = form.querySelector("input[type=radio]:checked");
      if (chosen) chosen.textContent = r ? ": " + sizeLabel(r.value) : "";
      msg.textContent = ""; msg.classList.remove("ok");
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!orderable(p)) return;
      var r = form.querySelector("input[type=radio]:checked");
      if (!r) {
        msg.classList.remove("ok");
        msg.textContent = "Please choose a size first.";
        var first = form.querySelector(".size-opt input:not(:disabled)");
        if (first) first.focus();
        return;
      }
      addToCart(id, r.value);
      msg.classList.add("ok");
      msg.innerHTML = "Added " + esc(p.name) + ", size " + esc(sizeLabel(r.value)) + '. <a href="' + base + 'cart.html">View cart</a>';
    });
  });

  /* ---------- Local delivery ---------- */
  var LD = C.localDelivery || {};
  var LD_ON = LD.enabled === true && Array.isArray(LD.zips) && LD.zips.length > 0 && typeof LD.fee === "number";
  function localOK(zip) { return !!(LD_ON && /^\d{5}$/.test(zip) && LD.zips.indexOf(zip) !== -1); }
  document.querySelectorAll("[data-local-only]").forEach(function (el) { el.hidden = !LD_ON; });
  document.querySelectorAll("[data-zip-check]").forEach(function (form) {
    var input = form.querySelector("input"), status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var z = (input.value || "").trim();
      status.className = "form-status show";
      if (!/^\d{5}$/.test(z)) { input.setAttribute("aria-invalid", "true"); status.classList.add("err"); status.textContent = "Please enter a 5-digit ZIP code."; input.focus(); return; }
      input.removeAttribute("aria-invalid");
      if (localOK(z)) { status.classList.add("ok"); status.textContent = z + " is in our delivery area. Choose " + (LD.fee === 0 ? "free local delivery" : "Local delivery ($" + LD.fee + ")") + " in your bag, or choose shipping."; }
      else { status.classList.add("info"); status.textContent = "Local delivery isn’t available for " + z + ", but you can still choose shipping."; }
      status.focus();
    });
  });

  /* ---------- Cart page ---------- */
  var list = document.querySelector("[data-cart-items]");
  if (list) {
    var subEl = document.querySelector("[data-cart-subtotal]");
    var checkout = document.querySelector("[data-checkout]");
    var cmsg = document.querySelector("[data-checkout-msg]");
    var DKEY = "hj-delivery-v1";
    var dset = document.querySelector("[data-delivery]");
    var zipIn = document.getElementById("cart-zip");
    var zipMsg = document.querySelector("[data-zip-msg]");
    var localOpt = document.querySelector("[data-local-option]");
    var feeRow = document.querySelector("[data-fee-row]");
    var feeEl = document.querySelector("[data-fee]");
    var totalEl = document.querySelector("[data-total]");
    var subtotal = 0;
    if (feeEl && typeof LD.fee === "number") feeEl.textContent = money(LD.fee);
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(DKEY) || "{}") || {}; } catch (e) {}
    if (saved.zip) zipIn.value = saved.zip;
    function delivery() {
      var z = (zipIn.value || "").trim();
      var m = (dset.querySelector("input[name=delivery]:checked") || {}).value || "ship";
      if (m === "local" && !localOK(z)) m = "ship";
      return { method: m, zip: z, fee: m === "local" ? LD.fee : 0 };
    }
    function syncDelivery() {
      var z = (zipIn.value || "").trim();
      var eligible = localOK(z);
      localOpt.hidden = !eligible;
      if (!eligible) dset.querySelector("input[value=ship]").checked = true;
      else if (saved.method === "local") { dset.querySelector("input[value=local]").checked = true; saved.method = null; }
      zipMsg.classList.remove("ok"); zipMsg.textContent = "";
      if (z.length === 5 && LD_ON) {
        if (eligible) { zipMsg.classList.add("ok"); zipMsg.textContent = (LD.fee === 0 ? "Free local delivery is available for " + z : "Local delivery is available for " + z + " ($" + LD.fee + ")") + ", or choose shipping."; }
        else zipMsg.textContent = "Shipping only for " + z + ".";
      }
      var d = delivery();
      feeRow.hidden = d.method !== "local";
      totalEl.textContent = money(subtotal + (d.fee || 0));
      try { localStorage.setItem(DKEY, JSON.stringify(d)); } catch (e) {}
    }
    dset.addEventListener("change", syncDelivery);
    zipIn.addEventListener("input", syncDelivery);
    var renderCart = function () {
      var c = readCart();
      if (!c.length) {
        list.innerHTML = '<p class="muted">Your cart is empty. <a href="shop.html">Meet the pajamas</a>.</p>';
        subEl.textContent = "$0"; subtotal = 0; syncDelivery(); checkout.disabled = true; return;
      }
      checkout.disabled = false;
      var total = 0;
      list.innerHTML = '<ul class="cart-list">' + c.map(function (i, n) {
        var p = P[i.id]; var line = (p.price || 0) * i.qty; total += line;
        return '<li class="cart-item"><div><strong>' + esc(p.name) + "</strong><br><span class=\"muted\">Size " + esc(sizeLabel(i.size)) +
          " · " + esc(statusLabel(p)) + '</span></div>' +
          '<div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + " size " + esc(i.size) + '">' +
          '<button type="button" data-dec="' + n + '" aria-label="Decrease quantity">−</button><span aria-live="polite">' + i.qty +
          '</span><button type="button" data-inc="' + n + '" aria-label="Increase quantity">+</button></div>' +
          '<div class="line">' + money(line) + '</div><button type="button" class="link-btn" data-rm="' + n + '">Remove</button></li>';
      }).join("") + "</ul>";
      subEl.textContent = money(total);
      subtotal = total; syncDelivery();
    };
    list.addEventListener("click", function (e) {
      var t = e.target, c = readCart(), n;
      if ((n = t.getAttribute("data-inc")) !== null) c[n].qty = Math.min(c[n].qty + 1, 10);
      else if ((n = t.getAttribute("data-dec")) !== null) { c[n].qty -= 1; if (c[n].qty < 1) c.splice(n, 1); }
      else if ((n = t.getAttribute("data-rm")) !== null) c.splice(n, 1);
      else return;
      writeCart(c); renderCart();
    });
    checkout.addEventListener("click", function () {
      var ep = C.checkout && validUrl(C.checkout.endpoint) ? C.checkout.endpoint : null;
      var d = delivery();
      if (!ep) { cmsg.classList.remove("ok"); cmsg.textContent = "Checkout opens very soon — your cart is saved on this device."; return; }
      checkout.disabled = true; cmsg.textContent = "Opening secure checkout…";
      fetch(ep, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: readCart(), delivery: delivery() }) })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { if (d && validUrl(d.url)) location.href = d.url; else throw 0; })
        .catch(function () { cmsg.textContent = "Checkout couldn’t open. Nothing was charged — please try again."; checkout.disabled = false; });
    });
    renderCart();
  }

  if (C.labelMockups === false) document.documentElement.classList.add("no-mock-tags");
  document.querySelectorAll("[data-signup-section]").forEach(function (sec) {
    var connected = C.signup && validUrl(C.signup.endpoint);
    if (!connected && !(C.signup && C.signup.showBeforeConnected)) sec.hidden = true;
  });

  /* ---------- Forms that send email (signup, account) ---------- */
  function wireEmailForm(form, onValid) {
    var status = form.querySelector(".form-status") || form.parentNode.querySelector(".form-status");
    function show(kind, m) { status.className = "form-status show " + kind; status.textContent = m; status.focus(); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll("input[required], textarea[required]").forEach(function (inp) {
        var v = (inp.value || "").trim();
        var ok = inp.type === "email" ? validEmail(v) : v.length > 0;
        if (ok) inp.removeAttribute("aria-invalid"); else { inp.setAttribute("aria-invalid", "true"); bad = bad || inp; }
      });
      if (bad) { show("err", bad.type === "email" ? "Please enter a valid email address, like name@example.com." : "Please fill in every field."); bad.focus(); return; }
      onValid(show, form);
    });
  }
  document.querySelectorAll("form[data-signup]").forEach(function (form) {
    wireEmailForm(form, function (show) {
      var ep = C.signup && validUrl(C.signup.endpoint) ? C.signup.endpoint : null;
      if (!ep) { show("info", "Sign-up opens soon — nothing was sent yet. Please check back!"); return; }
      var hp = form.querySelector("input[name=website]");
      fetch(ep, { method: "POST", body: JSON.stringify({ email: form.querySelector("input[type=email]").value.trim(), website: hp ? hp.value : "", source: location.pathname }), headers: { "Content-Type": "application/json", "Accept": "application/json" }, mode: "cors" })
        .then(function (r) { if (!r.ok) throw 0; form.reset(); show("ok", "You’re on the list! We’ll email you when new pajamas are ready."); })
        .catch(function () { show("err", "Something went wrong and you weren’t signed up. Please try again."); });
    });
  });
  document.querySelectorAll("form[data-contact-form]").forEach(function (form) {
    wireEmailForm(form, function (show) {
      var ep = C.contactForm && validUrl(C.contactForm.endpoint) ? C.contactForm.endpoint : null;
      if (!ep) { show("info", "The contact form isn’t connected yet, so nothing was sent."); return; }
      var btn = form.querySelector("button"); btn.disabled = true;
      fetch(ep, { method: "POST", body: new FormData(form), headers: { "Accept": "application/json" }, mode: "cors" })
        .then(function (r) { if (!r.ok) throw 0; form.reset(); show("ok", "Thanks! Your message was sent. We’ll reply by email."); })
        .catch(function () { show("err", "Your message didn’t send. Please try again in a moment."); })
        .then(function () { btn.disabled = false; });
    });
  });
  document.querySelectorAll("form[data-account-form]").forEach(function (form) {
    wireEmailForm(form, function (show) {
      var u = C.account && validUrl(C.account.signInUrl) ? C.account.signInUrl : null;
      if (u) { location.href = u; return; }
      show("info", "Accounts open when ordering opens. Nothing was sent yet.");
    });
  });
  document.querySelectorAll("form[data-track-form]").forEach(function (form) {
    wireEmailForm(form, function (show) {
      var u = C.account && validUrl(C.account.orderStatusUrl) ? C.account.orderStatusUrl : null;
      if (u) { location.href = u; return; }
      show("info", "Order tracking opens when ordering opens. Your confirmation email will also have a tracking link.");
    });
  });

  /* ---------- Product photo gallery ---------- */
  document.querySelectorAll("[data-gallery]").forEach(function (g) {
    var main = g.querySelector("[data-gallery-main]");
    var thumbs = Array.prototype.slice.call(g.querySelectorAll(".thumb"));
    var count = g.querySelector("[data-gallery-count]");
    var cur = 0;
    function show(i) {
      cur = (i + thumbs.length) % thumbs.length;
      var t = thumbs[cur];
      main.src = t.getAttribute("data-src");
      main.alt = t.getAttribute("data-alt");
      thumbs.forEach(function (o, k) { o.setAttribute("aria-pressed", k === cur ? "true" : "false"); });
      if (count) count.textContent = (cur + 1) + " of " + thumbs.length;
    }
    thumbs.forEach(function (t, k) { t.addEventListener("click", function () { show(k); }); });
    var prev = g.querySelector("[data-gallery-prev]"), next = g.querySelector("[data-gallery-next]");
    if (prev) prev.addEventListener("click", function () { show(cur - 1); });
    if (next) next.addEventListener("click", function () { show(cur + 1); });
    g.addEventListener("keydown", function (e) {
      if (e.target.closest("input, textarea")) return;
      if (e.key === "ArrowLeft") { show(cur - 1); }
      else if (e.key === "ArrowRight") { show(cur + 1); }
    });
    var x0 = null;
    main.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    main.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
    });
    show(0);
  });

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
