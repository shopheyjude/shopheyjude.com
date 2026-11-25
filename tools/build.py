#!/usr/bin/env python3
"""Regenerates the HTML pages from the shared header/footer below.
Optional: you can also edit the .html files directly. If you edit them directly,
don't run this script afterwards or it will overwrite those edits.
Run from the site folder:  python3 tools/build.py
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

NAV = [
    ("shop.html", "Shop Pajamas"),
    ("size-guide.html", "Size Guide"),
    ("our-story.html", "Our Story"),
    ("faq.html", "FAQ"),
]

SIZES = ["XS", "S", "M", "L"]
SIZE_LABELS = {"XS": "XS · Twinkle (4–5)", "S": "S · Star (6–7)", "M": "M · Moon (8–10)", "L": "L · Galaxy (10–12)"}


SITE_URL = "https://shopheyjude.com/"

HOME_SOCIAL = """<meta property="og:title" content="Pajamas by Kids, for Kids">
<meta property="og:description" content="Soft cotton pajamas in prints picked by a kid.">
<meta property="og:site_name" content="Hey Jude Cotton Clothing Company">
<meta property="og:type" content="website">
<meta property="og:url" content="https://shopheyjude.com/">
<meta property="og:image" content="https://shopheyjude.com/assets/img/hey-jude-share-2026-11b.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Two kids in flower and checker pajamas laugh in a blanket fort.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Pajamas by Kids, for Kids">
<meta name="twitter:description" content="Soft cotton pajamas in prints picked by a kid.">
<meta name="twitter:image" content="https://shopheyjude.com/assets/img/hey-jude-share-2026-11b.jpg">
<meta name="twitter:image:alt" content="Two kids in flower and checker pajamas laugh in a blanket fort.">"""


def head(title, desc, base, social=None):
    if social is None:
        social = f"""<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://shopheyjude.com/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">"""
    return f"""<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#FAF8F4">
<link rel="icon" type="image/png" href="{base}favicon.png">
<link rel="apple-touch-icon" href="{base}apple-touch-icon.png">
{social}
<link rel="stylesheet" href="{base}assets/fonts.css">
<link rel="stylesheet" href="{base}assets/site.css">
<script src="{base}assets/config.js"></script>
</head>"""


ICON_USER = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>'
ICON_BAG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round"/></svg>'


def header(base, current):
    links = "\n".join(
        f'        <li><a href="{base}{h}"{" aria-current=\"page\"" if h == current else ""}>{t}</a></li>'
        for h, t in NAV
    )
    return f"""<body data-base="{base}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="{base}index.html"><img src="{base}assets/img/hey-jude-logo-horizontal.png" alt="Hey Jude — home"></a>
    <div class="head-tools">
      <a class="icon-link" href="{base}cart.html" aria-label="Cart, 0 items" data-cart-link>{ICON_BAG}<span class="cart-count" data-cart-count hidden>0</span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    </div>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul>
{links}
      </ul>
    </nav>
  </div>
</header>"""


def footer(base):
    return f"""<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="foot-logo" href="{base}index.html"><img src="{base}assets/img/hey-jude-logo.png" alt="Hey Jude — home"></a>
        <p class="foot-tag">Pajamas by kids, for kids.</p>
      </div>
      <div>
        <h2>Shop</h2>
        <ul>
          <li><a href="{base}shop.html">Shop Pajamas</a></li>
          <li><a href="{base}products/flower-set.html">Flower Set</a></li>
          <li><a href="{base}products/checker-set.html">Checker Set</a></li>
          <li><a href="{base}size-guide.html">Size Guide</a></li>
        </ul>
      </div>
      <div>
        <h2>Help</h2>
        <ul>
          <li><a href="{base}faq.html">FAQ</a></li>
          <li><a href="{base}shipping-returns.html">Shipping &amp; Returns</a></li>
          <li><a href="{base}contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2>About</h2>
        <ul>
          <li><a href="{base}our-story.html">Our Story</a></li>
          <li><a href="{base}privacy.html">Privacy</a></li>
          <li><a href="{base}terms.html">Terms of Use</a></li>
        </ul>
      </div>
    </div>
    <p class="foot-legal">&copy; <span data-year>2026</span> Hey Jude Cotton Clothing Company. Shipping within the US.</p>
  </div>
</footer>
<script src="{base}assets/site.js"></script>
</body>
</html>
"""


def signup(base):
    return f"""<section class="section sage" id="drop-alerts" aria-labelledby="alerts-h" data-signup-section>
  <div class="wrap">
    <div class="signup">
      <h2 id="alerts-h">Psst… new pajamas!</h2>
      <p class="lede">Grown-ups, get an email when new prints and sizes are ready.</p>
      <form data-signup novalidate>
        <label class="vh" for="alert-email">Email address</label>
        <input id="alert-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
        <button class="btn pill" type="submit">Keep Me Posted</button>
      </form>
      <div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
      <p class="fine">Just Hey Jude news, and you can unsubscribe anytime. See our <a href="{base}privacy.html">Privacy notice</a>.</p>
    </div>
  </div>
</section>"""


PRODUCTS = {
    "flower": {
        "label": "Flower Set",
        "slug": "flower-set",
        "tag": "A little flower power for lights-out.",
        "desc": "A little flower power for lights-out, with a small Hey Jude logo on the chest.",
        "home_desc": "A little flower power for lights-out.",
        "img": "assets/img/flower-card-2026-11.webp",
        "alt": "Girl standing in a cozy room and smiling, wearing cream pajamas with a lavender flower print",
        "gallery": [
            ("assets/img/gallery/flower-01-lifestyle.webp", "Girl standing in a cozy room and smiling, wearing the Flower Set", "Front view"),
            ("assets/img/gallery/flower-02-side.webp", "Side view of the Flower Set being worn", "Side view"),
            ("assets/img/gallery/flower-03-back.webp", "Back view of the Flower Set being worn", "Back view"),
            ("assets/img/gallery/flower-04-fabric-detail.webp", "Close-up of the lavender flower print on the Flower Set top and pants", "Fabric close-up"),
            ("assets/img/gallery/flower-05-pattern.webp", "The Flower Set print: lavender flowers on a cream background", "Print pattern"),
        ],
        "print": "assets/img/flower-print.webp",
        "print_alt": "Close-up of the print: lavender flowers on a cream background",
    },
    "checker": {
        "label": "Checker Set",
        "slug": "checker-set",
        "tag": "Checkers on the bottom, Hey Jude on top.",
        "desc": "Checker pants and a simple Hey Jude top, ready for couch forts and one more chapter.",
        "home_desc": "Ready for couch forts and one more chapter.",
        "img": "assets/img/checker-card-2026-11.webp",
        "alt": "Boy sitting on a sofa looking at a toy car, wearing a blue top and sage-and-cream checker pajama pants",
        "gallery": [
            ("assets/img/gallery/checker-01-lifestyle.webp", "Boy sitting on a sofa looking at a toy car, wearing the Checker Set", "Front view"),
            ("assets/img/gallery/checker-02-side.webp", "Side view of the Checker Set being worn", "Side view"),
            ("assets/img/gallery/checker-03-back.webp", "Back view of the Checker Set being worn", "Back view"),
            ("assets/img/gallery/checker-04-fabric-detail.webp", "Close-up of the blue top and sage checker pants of the Checker Set", "Fabric close-up"),
            ("assets/img/gallery/checker-05-pattern.webp", "The Checker Set print: sage and cream checkerboard", "Print pattern"),
        ],
        "print": "assets/img/checker-print.webp",
        "print_alt": "Close-up of the print: sage and cream checkerboard",
    },
}


def size_radios(name):
    return "\n".join(
        f'<label class="size-opt"><input type="radio" name="{name}" value="{s}"><span>{SIZE_LABELS[s]}</span></label>' for s in SIZES
    )


def card(key, base, mode="home"):
    p = PRODUCTS[key]
    url = f"{base}products/{p['slug']}.html"
    if mode == "home":
        price_row = '<p class="price-row"><span class="price" data-f="price"></span></p>'
        actions = f'<div class="card-actions"><a class="btn pill" href="{url}" aria-label="Pre-order the {p['label']}">Pre-order</a></div>'
    else:
        price_row = '<p class="price-row"><span class="price" data-f="price"></span></p>'
        actions = f"""<form class="card-form" data-add-form data-product-id="{key}">
      <fieldset class="size-field">
        <legend class="size-head">Size<span class="chosen" data-chosen></span></legend>
        <div class="size-opts">
{size_radios("size-" + key)}
        </div>
      </fieldset>
      <div class="size-msg" role="status" aria-live="polite"></div>
      <div class="card-actions">
        <button class="btn pill" type="submit" data-add-btn>Add to cart</button>
        <a class="btn ghost" href="{url}">View details</a>
      </div>
    </form>"""
    return f"""<article class="card" data-card="{key}">
  <a class="mock" href="{url}" tabindex="-1" aria-hidden="true"><img class="card-img" src="{base}{p['img']}" alt="" loading="lazy"><span class="mock-tag">Preview image</span></a>
  <div class="card-body">
    <h3><a href="{url}" data-f="name">{p['label']}</a></h3>
    <p class="meta">{p['home_desc'] if mode == "home" else p['desc']}</p>
    {price_row}
    {actions}
  </div>
</article>"""


def cards(base, mode="home"):
    return f'<div class="cards">\n{card("flower", base, mode)}\n{card("checker", base, mode)}\n</div>'


ICON_COTTON = '<svg viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="3.2"/><circle cx="8.2" cy="12.5" r="3.2"/><circle cx="15.8" cy="12.5" r="3.2"/><path d="M12 15.5V21"/></svg>'
ICON_BREEZE = '<svg viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/></svg>'
ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'


def page(path, title, desc, body, current="", base=None, social=None):
    if base is None:
        base = "../" * path.count("/")
    html = head(title, desc, base, social) + "\n" + header(base, current) + "\n<main id=\"main\">\n" + body + "\n</main>\n" + footer(base)
    out = ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")


# ---------------- HOME ----------------
home = f"""<section class="hero" aria-labelledby="hero-h">
  <picture class="hero-bg">
    <source media="(max-width: 860px)" srcset="assets/img/hero-fort-2026-11-mobile.webp">
    <img src="assets/img/hero-fort-2026-11.webp" srcset="assets/img/hero-fort-2026-11-1200.webp 1200w, assets/img/hero-fort-2026-11.webp 1945w" sizes="100vw" alt="Two kids laughing in a blanket fort, one in ivory pajamas with a peach-and-green floral print and one in a blue top with sage checker pajama pants" fetchpriority="high">
  </picture>
  <span class="mock-tag hero-tag">Preview image</span>
  <div class="wrap hero-wrap">
    <div class="hero-copy">
      <p class="eyebrow">Pajamas by kids, for kids</p>
      <h1 id="hero-h"><span class="nowrap">Soft Sleep.</span><br><span class="nowrap">Happy Dreams.</span><br><span class="nowrap">Better Tomorrows.</span></h1>
      <p class="lede">Soft pajamas for blanket forts, bedtime stories, and mornings when getting dressed can wait.</p>
      <div class="btn-row">
        <a class="btn pill" href="#prints">Meet the Pajamas</a>
      </div>
    </div>
  </div>
</section>

<section class="section oat" id="prints" aria-labelledby="prints-h">
  <div class="wrap center">
    <p class="eyebrow">Our first collection</p>
    <h2 id="prints-h">Flowers or checkers?</h2>
    <p class="lede">Two sets. Which one are you wearing for movie night?</p>
    {cards("")}
  </div>
</section>

<section class="section" aria-labelledby="fabric-h">
  <div class="wrap center">
    <p class="eyebrow">Why cotton</p>
    <h2 id="fabric-h">Comfy enough for every night</h2>
    <p class="lede">“I picked cotton because I wanted soft pajamas that didn’t make me feel too hot.”</p>
    <div class="trio">
      <div class="t-sage"><img src="assets/img/ill-soft-cotton.webp" alt=""><h3>Soft from collar to cuff</h3><p>The first thing I wanted my pajamas to be? Soft.</p></div>
      <div class="t-lav"><img src="assets/img/ill-breathable.webp" alt=""><h3>Room to breathe</h3><p>Cotton lets air move through the fabric, even when you’re all curled up.</p></div>
      <div class="t-blush"><img src="assets/img/ill-kid-picked-prints.webp" alt=""><h3>Kid-picked prints</h3><p>I picked flowers for my little sister and checkers for me.</p></div>
    </div>
  </div>
</section>

<section class="section oat" aria-labelledby="story-h">
  <div class="wrap story story-teaser">
    <a class="mock story-thumb wide" href="our-story.html" tabindex="-1" aria-hidden="true"><img src="assets/img/story-teaser-wide.webp" alt=""><span class="mock-tag">Preview image</span></a>
    <div>
      <p class="eyebrow">Our story</p>
      <h2 id="story-h">Hey, I’m Jude.</h2>
      <p class="story-text">When I started picking out my own clothes, I wanted to pick my own pajamas, too. So I started Hey Jude.</p>
      <p><a class="btn ghost" href="our-story.html">Read My Story</a></p>
    </div>
  </div>
</section>

{signup("")}"""
page("index.html", "Hey Jude | Cotton pajamas by kids, for kids", "Soft cotton pajamas in prints picked by a kid. Meet Hey Jude’s first two sets: flowers and checkers.", home, social=HOME_SOCIAL)

# ---------------- SHOP ----------------
shop = f"""<section class="page-head">
  <div class="wrap">
    <p class="eyebrow">Shop Pajamas</p>
    <h1>Flowers or checkers?</h1>
    <p class="lede">Two sets. Which one are you wearing for movie night?<br>100% cotton, sizes XS–L (4–12).</p>
  </div>
</section>
<section class="section" style="padding-top:0" aria-label="Pajama sets">
  <div class="wrap">
    {cards("", "shop")}
  </div>
</section>
{signup("")}"""
page("shop.html", "Shop Pajamas | Hey Jude", "Soft cotton pajamas in prints picked by a kid. Meet Hey Jude’s first two sets: flowers and checkers.", shop, "shop.html")


# ---------------- PRODUCT PAGES ----------------
def product(key):
    p = PRODUCTS[key]
    radios = size_radios("size")
    thumbs = "\n".join(
        f'        <button type="button" class="thumb" data-src="../{src}" data-alt="{alt}" aria-label="Show {label.lower()}" aria-pressed="{"true" if i == 0 else "false"}"><img src="../{src}" alt=""></button>'
        for i, (src, alt, label) in enumerate(p["gallery"])
    )
    body = f"""<div class="wrap">
  <p class="crumbs"><a href="../shop.html">Shop Pajamas</a> / <span data-f="name">{p['label']}</span></p>
</div>
<section class="section" style="padding-top:22px" data-product="{key}">
  <div class="wrap pdp">
    <div class="gallery" data-gallery>
      <div class="gallery-main"><img src="../{p['gallery'][0][0]}" alt="{p['gallery'][0][1]}" data-gallery-main>
        <button type="button" class="g-arrow prev" data-gallery-prev aria-label="Previous photo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
        <button type="button" class="g-arrow next" data-gallery-next aria-label="Next photo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
        <span class="g-count" aria-live="polite" data-gallery-count></span>
      </div>
      <div class="gallery-thumbs" role="group" aria-label="{p['label']} photos">
{thumbs}
      </div>
    </div>
    <div class="pdp-info">
      <h1 data-f="name">{p['label']}</h1>
      <div class="price-line"><span data-f="price"></span></div>
      <p>{p['desc']}</p>

      <form class="size-form" data-add-form data-product-id="{key}">
        <fieldset class="size-field">
          <legend class="size-head">Size<span class="chosen" data-chosen></span></legend>
          <a class="size-link" href="../size-guide.html">Size guide &amp; measurements</a>
          <div class="size-opts">
{radios}
          </div>
        </fieldset>
        <div class="size-msg" role="status" aria-live="polite"></div>
        <div class="btn-row"><button class="btn pill" type="submit" data-add-btn>Add to cart</button></div>
        <p class="ship-note" data-ship-note></p>
      </form>

      <div class="facts">
        <details open><summary>Fabric</summary><div class="inner" data-f="material"></div></details>
        <details><summary>Fit</summary><div class="inner" data-f="fit"></div></details>
        <details><summary>Care</summary><div class="inner" data-f="care"></div></details>
        <details><summary>Shipping &amp; returns</summary><div class="inner">We ship within the US.<span data-local-only hidden> Local delivery is $7 for eligible addresses in ZIP code 80015.</span> Costs, timing and returns are on our <a href="../shipping-returns.html">Shipping &amp; Returns</a> page.</div></details>
      </div>
    </div>
  </div>
</section>
{signup("../")}"""
    page(f"products/{p['slug']}.html", f"{p['label']} | Hey Jude", f"Hey Jude {p['label']}: {p['desc']} Sizes XS–L (4–12).", body, "shop.html")


product("flower")
product("checker")

# ---------------- SIZE GUIDE ----------------
size = f"""<section class="page-head centered-head"><div class="wrap"><p class="eyebrow">Size Guide</p><h1>Finding the right size</h1>
<p class="lede">Our pajamas are made to fit snugly.</p></div></section>
<section class="section sg-body"><div class="wrap prose sg">
<h2 id="how-to-measure">How to measure your favorite PJs</h2>
<p>Lay a pair that already fits well on a flat surface. Measure in inches without stretching the fabric.</p>
<figure class="flat-lay"><a href="assets/img/size-guide-flat-lay.webp" class="zoom-link"><img src="assets/img/size-guide-flat-lay.webp" width="1536" height="1024" alt="Pajama top and pants laid flat, with numbered arrows 1 to 4 showing where to measure"></a><figcaption class="zoom-hint">Tap the picture to see it larger.</figcaption></figure>
<ol class="measure-steps">
<li><strong>Chest width:</strong> measure straight across from armpit to armpit. This is a flat width across the front, not a measurement around the body.</li>
<li><strong>Top length:</strong> measure from the highest point of the shoulder down to the hem.</li>
<li><strong>Relaxed waist:</strong> measure across the waistband from one edge to the other, without stretching it. This is also a flat width, not a measurement around the body.</li>
<li><strong>Inseam:</strong> measure from the crotch seam down to the hem of the leg.</li>
</ol>
<h2>Measurements</h2>
<p class="muted">Measured flat on the finished pajamas, in inches. Final measurements coming soon.</p>
<div class="table-wrap"><table>
<caption class="vh">Garment measurements by size, in inches</caption>
<thead><tr><th scope="col">Size</th><th scope="col">Top chest width</th><th scope="col">Top length</th><th scope="col">Waist, relaxed</th><th scope="col">Inseam</th></tr></thead>
<tbody>
<tr><th scope="row">XS · Twinkle (4–5)</th><td></td><td></td><td></td><td></td></tr>\n<tr><th scope="row">S · Star (6–7)</th><td></td><td></td><td></td><td></td></tr>\n<tr><th scope="row">M · Moon (8–10)</th><td></td><td></td><td></td><td></td></tr>\n<tr><th scope="row">L · Galaxy (10–12)</th><td></td><td></td><td></td><td></td></tr>
</tbody>
</table></div>
<p class="size-note">Between Moon and Galaxy? Both include size 10. Compare the measurements with a pair of PJs your child already loves.</p>
<h2>Why snug?</h2>
<p>Kids’ cotton pajamas are made to fit close to the body. It’s a safety rule for children’s sleepwear that isn’t flame resistant, so please don’t buy a size up to “grow into.”</p>
</div></section>"""
page("size-guide.html", "Size Guide | Hey Jude", "Hey Jude pajama sizes XS–L (4–12) and how to measure.", size, "size-guide.html")

# ---------------- OUR STORY ----------------
story = f"""<section class="story-page"><div class="wrap story-intro">
<div>
<p class="eyebrow">Our Story</p>
<h1>Hey, I’m Jude. I started a pajama company.</h1>
<p class="lede">When I started picking out my own clothes, I wanted to pick my own pajamas, too. I had my own style. And if I was going to wear something every night, I wanted it to be something I’d actually choose.</p>
<p>That’s why I started Hey Jude. I wanted to make pajamas that feel soft when you put them on and look fun enough that you’ll pull them out of the drawer first.</p>
</div>
<div class="mock story-photo-wrap"><img class="story-photo" src="assets/img/our-story-mock.webp" alt="Preview image: a kid’s hands choosing checker fabric next to a flower-print fabric and a pencil sketch of pajamas"><span class="mock-tag">Preview image</span></div>
</div>
<div class="wrap prose story-body">
<h2>Pajamas by kids, for kids</h2>
<p>When I was coming up with my first two sets, I picked flowers for my little sister. For mine, I wanted checker pants and a simple shirt with my logo on it. I like that they’re different. Picking your pajamas is more fun when you get to pick something that feels like you.</p>
<p>I chose cotton because I wanted something soft and breathable. My family helps me with the grown-up parts of running a business, but I get to do one of my favorite parts: picking what the pajamas look like.</p>
<h2>Why I say “Better Tomorrows”</h2>
<p>In my first pitch, I said tomorrow starts the night before. I still think that’s true. A cozy night is a pretty good way to get ready for whatever you’re doing tomorrow.</p>
<p>I also think every kid deserves something cozy to put on at the end of the day. One of my goals as Hey Jude grows is to help other kids get pajamas of their own. That’s the kind of business I want to build.</p>
<p>Thanks for being here while I get started. Now I want to know: would you pick flowers or checkers?</p>
<p class="signoff"><span class="sig">Jude</span><br>Founder, Hey Jude</p>
<div class="story-close">
<p class="closing-line">Soft Sleep. Happy Dreams. Better Tomorrows.</p>
<div class="btn-row"><a class="btn pill" href="shop.html">Meet the Pajamas</a></div>
</div>
</div></section>"""
page("our-story.html", "Our Story | Hey Jude", "Hey, I’m Jude. I started a pajama company.", story, "our-story.html")

# ---------------- FAQ ----------------
faqs = [
    ("What are the pajamas made of?", "100% cotton. Soft, breathable and comfy all night."),
    ("Why should I choose cotton pajamas for my child?", "Cotton is soft against the skin and lets air move through the fabric. If your child tends to feel warm in pajamas, cotton is a good option to try for a more comfortable bedtime."),
    ("What sizes do you make?", 'XS · Twinkle (4–5), S · Star (6–7), M · Moon (8–10) and L · Galaxy (10–12). See the <a href="size-guide.html">Size Guide</a> for measurements.'),
    ("Should I size up so they last longer?", "Please don’t. Kids’ cotton pajamas are designed to fit snugly — it’s a safety rule for children’s sleepwear — so choose your child’s usual size."),
    ("How do I wash them?", "Machine wash cold, inside out, with like colors. Tumble dry low or hang to dry. Skip the bleach."),
    ("Will they shrink?", "Cotton can shrink a little in a hot dryer. Washing cold and drying low keeps them closest to their original size."),
    ("Where do you ship?", 'Within the United States. Details are on our <a href="shipping-returns.html">Shipping &amp; Returns</a> page.'),
    ("Do you deliver locally?", 'LOCAL::Local delivery is $7 for eligible addresses in ZIP code 80015. We group deliveries into one weekly window. If your address isn’t eligible, you can still choose shipping. <a href="shipping-returns.html#local-delivery">Check your ZIP</a>.'),
    ("Can I order now?", 'Yes — both sets are open for pre-order. Pick a size, add to cart, and we’ll ship when they’re ready. You can cancel a pre-order any time before it ships.'),
    ("When will my pre-order ship?", 'We show the expected ship timing on each product page and at checkout, and we’ll email you if anything changes.'),
    ("Who is Jude?", 'A kid who wanted better pajamas, so he started a company. <a href="our-story.html">Read our story</a>.'),
]
faq_html = "\n".join(
    (f'<details data-local-only hidden><summary>{q}</summary><div class="inner">{a[7:]}</div></details>' if a.startswith("LOCAL::")
     else f'<details><summary>{q}</summary><div class="inner">{a}</div></details>') for q, a in faqs)
faq = f"""<section class="page-head"><div class="wrap"><p class="eyebrow">FAQ</p><h1>Questions grown-ups ask</h1></div></section>
<section class="section" style="padding-top:0"><div class="wrap prose"><div class="facts">
{faq_html}
</div></div></section>
{signup("")}"""
page("faq.html", "FAQ | Hey Jude", "Answers about Hey Jude pajamas: fabric, sizing, care and shipping.", faq, "faq.html")

# ---------------- SHIPPING ----------------
ship = """<section class="page-head"><div class="wrap"><p class="eyebrow">Shipping &amp; Returns</p><h1>Shipping &amp; returns</h1></div></section>
<section class="section" style="padding-top:0"><div class="wrap prose">
<h2>Where we ship</h2>
<p>We ship within the United States.</p>
<h2>Cost and timing</h2>
<p>Shipping costs and delivery times are shown at checkout before you pay.</p>
<div data-local-only hidden>
<h2 id="local-delivery">Local delivery</h2>
<p>Local delivery is $7 for eligible addresses in ZIP code 80015. We group deliveries into one weekly window. If your address isn’t eligible, you can still choose shipping.</p>
<form class="zip-check" data-zip-check novalidate>
<label for="zip-in">Check your ZIP code</label>
<div class="zip-row"><input id="zip-in" name="zip" inputmode="numeric" autocomplete="postal-code" maxlength="5" pattern="[0-9]{5}" required><button class="btn pill" type="submit">Check</button></div>
<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
</form>
<p class="muted small">We confirm each address before delivering and email you once your delivery is scheduled.</p>
</div>
<h2>Returns &amp; exchanges</h2>
<p>Hey Jude is online only, so returns and exchanges happen by mail. There’s no store or drop-off location.</p>
<p>To start a return or swap a size, email <a href="mailto:hello@shopheyjude.com">hello@shopheyjude.com</a> with your order number and what you’d like to do. We’ll reply with mailing instructions.</p>
<p>Our full return policy will be posted here before pre-orders ship.</p>
</div></section>"""
page("shipping-returns.html", "Shipping & Returns | Hey Jude", "Hey Jude shipping and returns.", ship)

# ---------------- CONTACT ----------------
contact = """<section class="page-head centered-head"><div class="wrap"><p class="eyebrow">Contact</p><h1>Get in touch</h1>
<p class="lede">Questions about sizing, an order or anything else? A grown-up on the Hey Jude team reads every message.</p></div></section>
<section class="section sg-body"><div class="wrap contact-grid">
<form class="panel contact-form" data-contact-form novalidate>
<label for="c-name">Your name</label>
<input id="c-name" name="name" type="text" autocomplete="name" required>
<label for="c-email">Email</label>
<input id="c-email" name="email" type="email" autocomplete="email" required>
<label for="c-order">Order number <span class="muted">(optional)</span></label>
<input id="c-order" name="order" type="text" autocomplete="off">
<label for="c-topic">What’s it about?</label>
<select id="c-topic" name="topic">
<option>Sizing and fit</option>
<option>My order</option>
<option>Shipping or local delivery</option>
<option>Returns</option>
<option>Something else</option>
</select>
<label for="c-msg">Message</label>
<textarea id="c-msg" name="message" rows="6" required></textarea>
<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="vh" aria-hidden="true">
<p class="muted small">For grown-ups only. We’ll use your email just to reply. See our <a href="privacy.html">Privacy notice</a>.</p>
<button class="btn pill" type="submit">Send message</button>
<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
<p class="contact-alt">Prefer email? Write to us at <a href="mailto:hello@shopheyjude.com">hello@shopheyjude.com</a>.</p>
</form>
<img class="contact-art" src="assets/img/Hey-Jude-Contact-Page.webp" width="1536" height="1024" alt="">
</div></section>"""
page("contact.html", "Contact | Hey Jude", "Contact Hey Jude.", contact)

# ---------------- PRIVACY ----------------
privacy = """<section class="page-head"><div class="wrap"><p class="eyebrow">Privacy</p><h1>Privacy notice</h1></div></section>
<section class="section" style="padding-top:0"><div class="wrap prose">
<p>Hey Jude is run by a family, and we keep what we collect to a minimum.</p>
<h2>What we collect</h2>
<ul>
<li><strong>Drop alerts:</strong> if you sign up, your email address — and nothing else.</li>
<li><strong>Your account:</strong> your email address and order history, so you can sign in and track orders.</li>
<li><strong>Orders:</strong> checkout is handled by our payment provider, which collects what it needs to process payment and shipping. We receive your order and shipping details, not your full card number.</li>
<li><strong>Website hosting:</strong> our host may keep standard technical logs (like IP address and browser type) to keep the site secure.</li>
</ul>
<h2>What we don't do</h2>
<ul>
<li>We don't sell your information.</li>
<li>We don't knowingly collect information from children. Sign-ups and orders are for adults.</li>
<li>We don't use advertising trackers on this site.</li>
</ul>
<h2>Your choices</h2>
<p>You can unsubscribe from emails at any time using the link in any email, or contact us to have your information deleted.</p>
<h2>Contact</h2>
<p>Questions? See our <a href="contact.html">Contact</a> page.</p>
</div></section>"""
page("privacy.html", "Privacy | Hey Jude", "Hey Jude privacy notice.", privacy)


# ---------------- CART ----------------
cart = """<section class="page-head"><div class="wrap"><p class="eyebrow">Cart</p><h1>Your cart</h1></div></section>
<section class="section" style="padding-top:0"><div class="wrap cart-wrap">
<div data-cart-items><p class="muted">Your cart is empty.</p></div>
<aside class="cart-summary" aria-labelledby="sum-h">
<h2 id="sum-h">Summary</h2>
<p class="sum-row"><span>Subtotal</span><strong data-cart-subtotal>$0</strong></p>
<fieldset class="delivery" data-delivery>
<legend>Delivery</legend>
<label for="cart-zip">Your ZIP code</label>
<input id="cart-zip" class="cart-zip" inputmode="numeric" autocomplete="postal-code" maxlength="5">
<div class="size-msg" role="status" aria-live="polite" data-zip-msg></div>
<label class="radio"><input type="radio" name="delivery" value="ship" checked> Ship it (US) <span class="muted">— cost shown at checkout</span></label>
<label class="radio" data-local-option hidden><input type="radio" name="delivery" value="local"> Local delivery <span class="muted">— $7</span></label>
</fieldset>
<p class="sum-row" data-fee-row hidden><span>Local delivery</span><strong data-fee>$7</strong></p>
<p class="sum-row sum-total"><span>Total before tax</span><strong data-total>$0</strong></p>
<p class="muted small" data-ship-note-cart>Shipping and tax are added at checkout. Pre-orders ship together when the sets are ready.</p>
<button class="btn btn-block" type="button" data-checkout>Checkout</button>
<div class="size-msg" role="status" aria-live="polite" data-checkout-msg></div>
<p><a href="shop.html">Keep shopping</a></p>
</aside>
</div></section>"""
page("cart.html", "Cart | Hey Jude", "Your Hey Jude cart.", cart)

# ---------------- ACCOUNT ----------------
account = """<section class="page-head"><div class="wrap"><p class="eyebrow">My Account</p><h1>My account</h1>
<p class="lede">Sign in to see your pre-orders and track a delivery.</p></div></section>
<section class="section" style="padding-top:0"><div class="wrap account-grid">
<div class="panel">
<h2>Sign in</h2>
<form data-account-form novalidate>
<label for="acct-email">Email</label>
<input id="acct-email" name="email" type="email" autocomplete="email" required>
<button class="btn" type="submit">Email me a sign-in link</button>
<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
</form>
<p class="muted small">No password to remember — we’ll email you a link. New here? Your account is created with your first order.</p>
</div>
<div class="panel">
<h2>Track an order</h2>
<form data-track-form novalidate>
<label for="trk-order">Order number</label>
<input id="trk-order" name="order" type="text" autocomplete="off" required>
<label for="trk-email">Email used at checkout</label>
<input id="trk-email" name="email" type="email" autocomplete="email" required>
<button class="btn ghost" type="submit">Find my order</button>
<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
</form>
</div>
</div></section>"""
page("account.html", "My Account | Hey Jude", "Sign in to your Hey Jude account or track an order.", account)

# ---------------- SUSTAINABILITY ----------------
sust = """<section class="page-head"><div class="wrap"><p class="eyebrow">Sustainability</p><h1>Made to be worn, washed and handed down</h1>
<p class="lede">We’re a small company, so we keep this simple and honest: here’s what we do today.</p></div></section>
<section class="section" style="padding-top:0"><div class="wrap prose">
<h2>100% cotton</h2>
<p>Our pajamas are 100% cotton, a natural plant fiber, instead of polyester or other plastic-based fabrics.</p>
<h2>Small runs</h2>
<p>We make a small number of each print and take pre-orders, so we order closer to what families actually want.</p>
<h2>Made to last</h2>
<p>Good care keeps pajamas soft for longer, so they can go to a younger sibling or cousin next. Wash cold, dry low, and see the <a href="faq.html">FAQ</a> for care tips.</p>
<h2>What we’re still working on</h2>
<p>Packaging and shipping materials are next on our list. We’ll share what we choose here, with the facts behind it.</p>
</div></section>"""
page("sustainability.html", "Sustainability | Hey Jude", "How Hey Jude approaches materials, small runs and making pajamas last.", sust)

# ---------------- TERMS ----------------
terms = """<section class="page-head"><div class="wrap"><p class="eyebrow">Terms of Use</p><h1>Terms of use</h1></div></section>
<section class="section" style="padding-top:0"><div class="wrap prose">
<p>These terms apply when you use this website or place an order with Hey Jude Cotton Clothing Company (“Hey Jude,” “we”). By using the site you agree to them.</p>
<h2>Who can order</h2>
<p>Orders are for adults 18 and over. Kids are welcome to browse with a grown-up.</p>
<h2>Products, prices and colors</h2>
<p>We work hard to show our pajamas accurately, but colors can look different on different screens. Prices are in US dollars and may change; the price you pay is the one shown at checkout.</p>
<h2>Pre-orders</h2>
<ul>
<li>A pre-order is an order for pajamas that haven’t shipped yet. We show the expected ship timing before you pay.</li>
<li>If we can’t ship by the time we told you, we’ll email you with a new date, and you can cancel for a full refund.</li>
<li>You can cancel a pre-order any time before it ships for a full refund.</li>
</ul>
<h2>Shipping and returns</h2>
<p>We ship within the United States. See <a href="shipping-returns.html">Shipping &amp; Returns</a> for details.</p>
<h2>Payments</h2>
<p>Payments are processed by our payment provider. We never see or store your full card number.</p>
<h2>Our content</h2>
<p>The Hey Jude name, logo, prints, photos and words on this site belong to Hey Jude. Please don’t copy or reuse them without permission.</p>
<h2>Limits</h2>
<p>The site is provided “as is.” To the extent the law allows, we aren’t responsible for indirect losses from using it. Nothing here limits rights you have under consumer protection law.</p>
<h2>Changes</h2>
<p>We may update these terms. The date below shows the latest version.</p>
<h2>Questions</h2>
<p>See our <a href="contact.html">Contact</a> page.</p>
<p class="muted small">Last updated: November 24, 2026</p>
</div></section>"""
page("terms.html", "Terms of Use | Hey Jude", "Hey Jude terms of use.", terms)

# ---------------- 404 ----------------
nf = """<section class="section"><div class="wrap center"><p class="eyebrow">Page not found</p><h1>Oops — that page is asleep.</h1>
<p class="lede">Let's get you back somewhere cozy.</p><div class="btn-row" style="justify-content:center"><a class="btn" href="/index.html">Go home</a><a class="btn ghost" href="/shop.html">Shop Pajamas</a></div></div></section>"""
page("404.html", "Page not found | Hey Jude", "Page not found.", nf, base="/")

print("built")
