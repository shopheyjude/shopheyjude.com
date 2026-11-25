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

  // Checkout. Leave endpoint null until Square is connected (see README → Checkout).
  checkout: {
    endpoint: null // https URL that turns the cart into a Square checkout link
  },

  // Account sign-in and order tracking (Square customer accounts). null = "opens with the store".
  account: {
    signInUrl: null,
    orderStatusUrl: null
  },

  // Local hand delivery (pilot). OFF until drive times from the private starting point
  // are checked (30-minute one-way limit) and the weekly schedule is approved.
  // Checkout can only check ZIP codes, so if any 80015 address is outside the limit,
  // leave this off rather than accept orders we can't deliver.
  // Never put the starting address in this file — it is public.
  localDelivery: {
    enabled: false,
    zips: ["80015"], // pilot: 80015 only. Do not add 80013 or 80016 yet.
    fee: 7 // flat fee per order, no free-delivery threshold; one delivery window per week
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
  sizeLabels: { XS: "XS · Twinkle (4–5)", S: "S · Star (6–7)", M: "M · Moon (8–10)", L: "L · Galaxy (10–12)" },

  products: {
    flower: {
      name: "Flower Set",
      // "preorder" | "in-stock" | "sold-out" | "coming-soon"
      status: "preorder",
      price: 32, // PLACEHOLDER from the business plan — confirm before launch
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
      price: 32, // PLACEHOLDER — confirm
      shipBy: null,
      sizes: ["XS", "S", "M", "L"],
      soldOutSizes: [],
      material: "100% cotton knit. Soft, breathable and comfy all night.",
      fit: "Snug fit. Choose your child’s usual size — please don’t size up. For child’s safety, garment should fit snugly. This garment is not flame resistant. Loose-fitting garment is more likely to catch fire.",
      care: "Machine wash cold, inside out, with like colors. Tumble dry low or hang to dry. Do not bleach. Cotton may shrink slightly in a hot dryer."
    }
  }
};
