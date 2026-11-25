/*
 * HEY JUDE — SITE SETTINGS
 * The one file to edit for prices, sizes, stock, pre-orders and checkout.
 * See README.md for step-by-step instructions.
 *
 * Safety rule built in: if checkout isn't connected, the cart works but the Checkout
 * button explains it isn't open yet. Nothing is ever charged by this site itself.
 */
window.HJ_CONFIG = {
  hostname: "shopheyjude.com",

  // First-drop ordering: "Request to Order" (no payment). Buyers send a request; an adult confirms
  // stock and sends a Square invoice by hand. Orderable sizes and prices live ONLY in
  // workers/order-request/src/catalog.json (available + confirmed priceCents).
  ordering: {
    enabled: true,
    endpoint: "https://heyjude-order-request.maherkayali.workers.dev/"
  },

  // Checkout. Leave endpoint null until Square is connected (see README → Checkout).
  checkout: {
    endpoint: null // https URL that turns the cart into a Square checkout link
  },

  // Account sign-in and order tracking (Square customer accounts). null = "opens with the store".
  account: {
    signInUrl: null,
    orderStatusUrl: null
  },

  // Local hand delivery. ZIPs within roughly a 45-minute one-way drive of 80015,
  // estimated from ZIP-center distance (<= 21 mi); large rural ZIPs left out.
  // Never put the starting address in this file — it is public.
  localDelivery: {
    enabled: true,
    zips: ["80002", "80010", "80011", "80012", "80013", "80014", "80015", "80016", "80017", "80018", "80019", "80022", "80030", "80033", "80104", "80108", "80109", "80110", "80111", "80112", "80113", "80116", "80120", "80121", "80122", "80123", "80124", "80125", "80126", "80127", "80128", "80129", "80130", "80134", "80138", "80202", "80203", "80204", "80205", "80206", "80207", "80209", "80210", "80211", "80212", "80214", "80215", "80216", "80218", "80219", "80220", "80221", "80222", "80223", "80224", "80226", "80227", "80228", "80229", "80230", "80231", "80232", "80235", "80236", "80237", "80238", "80239", "80241", "80246", "80247", "80249", "80260", "80640"], // ~45-minute drive from 80015 (25 Nov 2026)
    fee: 0 // free local delivery in the Denver area (Kathryn, 25 Nov 2026); one delivery window per week
  },

  // Email signup ("Psst… new pajamas!"). null = form checks the address but sends nothing.
  signup: {
    provider: null,
    endpoint: null,
    // true = show the form even though it isn't connected yet (private preview only).
    // Set false before going public: the form then stays hidden until endpoint is set
    // and a test signup has reached the list.
    showBeforeConnected: true
  },

  // Small "Preview image" tag on mockup photos. Set false once real product photos are in.
  labelMockups: false,

  contactEmail: "hello@shopheyjude.com",

  // Contact form. null = form checks the fields but sends nothing (not wired yet).
  contactForm: { endpoint: "https://heyjude-contact.maherkayali.workers.dev/" },

  // Shopper-facing size names. The keys (XS, S, M, L) are the variant values sent to checkout.
  sizeLabels: { XS: "XS · Twinkle (4–5)", S: "S · Star (6–7)", M: "M · Moon (8–10)", L: "L · Galaxy (11–12)" },

  products: {
    flower: {
      name: "Flower Set",
      // "preorder" | "in-stock" | "sold-out" | "coming-soon"
      status: "preorder",
      price: 35, // confirmed by Kathryn 25 Nov 2026
      shipBy: null, // e.g. "January 15, 2027" — required for pre-orders before launch
      sizes: ["XS", "S", "M", "L"],
      soldOutSizes: [],
      material: "100% cotton knit. Soft, breathable and comfy all night.",
      fit: "Snug fit. Choose your child’s usual size — please don’t size up. For child’s safety, garment should fit snugly. This garment is not flame resistant. Loose-fitting garment is more likely to catch fire.",
      care: "Machine wash cold, inside out, with like colors. Tumble dry low or hang to dry. Do not bleach. Cotton may shrink slightly in a hot dryer."
    },
    checker: {
      name: "Checker Set",
      status: "preorder",
      price: 35, // confirmed by Kathryn 25 Nov 2026
      shipBy: null,
      sizes: ["XS", "S", "M", "L"],
      soldOutSizes: [],
      material: "100% cotton knit. Soft, breathable and comfy all night.",
      fit: "Snug fit. Choose your child’s usual size — please don’t size up. For child’s safety, garment should fit snugly. This garment is not flame resistant. Loose-fitting garment is more likely to catch fire.",
      care: "Machine wash cold, inside out, with like colors. Tumble dry low or hang to dry. Do not bleach. Cotton may shrink slightly in a hot dryer."
    }
  }
};
