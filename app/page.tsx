"use client";

import { useCallback, useEffect, useRef } from "react";

const WHATSAPP_URL = "https://wa.me/5562991934046";
const WHATSAPP_LABEL = "WhatsApp";
const FORMSUBMIT_ENDPOINT =
  "https://formsubmit.co/ajax/flaviomorais820@gmail.com";

/** WhatsApp glyph, normalised to a 24x24 viewBox. */
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

/**
 * Instagram glyph, same 24x24 box as the WhatsApp one.
 *
 * The export's own Instagram symbol (#942143898) paints through CSS variables
 * that are only defined on the contact card, so re-using it in the footer would
 * render it invisible. A self-contained path inheriting currentColor keeps the
 * two footer icons identical in weight and colour.
 */
const INSTAGRAM_PATH =
  "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z";

const SVG_NS = "http://www.w3.org/2000/svg";
const DONE = "data-fm-patched";

/** Glyph size relative to the link's own font size. */
const ICON_EM = "1.05em";

function brandIcon(doc: Document, path: string, size: string): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("role", "presentation");
  svg.setAttribute("aria-hidden", "true");
  svg.style.width = size;
  svg.style.height = size;
  svg.style.flex = "0 0 auto";
  const node = doc.createElementNS(SVG_NS, "path");
  node.setAttribute("d", path);
  node.setAttribute("fill", "currentColor");
  svg.appendChild(node);
  return svg;
}

/** Hide the Framer badge that ships with the mirrored export. */
function hideFramerBadge(doc: Document) {
  const badge = doc.getElementById("__framer-badge-container");
  if (badge) badge.style.display = "none";
}

/** 1 — the "Contract Now" CTA points at WhatsApp (desktop + mobile variants). */
function patchContractNowCta(doc: Document) {
  doc
    .querySelectorAll<HTMLAnchorElement>('a[data-framer-name="Primary"]')
    .forEach((anchor) => {
      if (anchor.getAttribute(DONE) === "cta") return;
      const label = anchor.querySelector("h1");
      if (!label?.textContent?.trim().includes("Contract Now")) return;
      anchor.href = WHATSAPP_URL;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.setAttribute(DONE, "cta");
    });
}

/**
 * 2 — the "Quick chat" contact card becomes a WhatsApp entry point.
 *
 * The card is a <div>, and the Framer app hydrates around it, so it is made
 * activatable in place (role/tabindex/handlers) rather than re-parented into an
 * <a> — restructuring the tree here risks hydration mismatches.
 */
function patchQuickChatCard(doc: Document) {
  const cards = doc.querySelectorAll<HTMLElement>(
    '[data-framer-name="Discord Contact Card"], [data-framer-name="WhatsApp Contact Card"]',
  );

  cards.forEach((card) => {
    if (card.getAttribute(DONE) !== "card") {
      card.setAttribute(DONE, "card");
      card.setAttribute("role", "link");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", "Quick chat on WhatsApp");
      card.style.cursor = "pointer";

      const open = () =>
        doc.defaultView?.open(WHATSAPP_URL, "_blank", "noopener");

      card.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        open();
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        open();
      });
    }

    const icon = card.querySelector<SVGSVGElement>(
      'svg[data-framer-name="Discord Icon"]',
    );
    if (icon) {
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("data-framer-name", "WhatsApp Icon");
      const path = doc.createElementNS(SVG_NS, "path");
      path.setAttribute("d", WHATSAPP_PATH);
      // The sibling Instagram glyph paints with this variable (#2063ab on the
      // light-blue tile). currentColor here resolves to black, which is what
      // made the WhatsApp mark look like a black stamp next to it.
      path.setAttribute("fill", "var(--21h8s6, #2063ab)");
      icon.replaceChildren(path);
    }

    const value = card.querySelector<HTMLElement>(
      '[data-framer-name="Discord Value"] p, [data-framer-name="WhatsApp Value"] p',
    );
    if (value && value.textContent !== WHATSAPP_LABEL) {
      value.textContent = WHATSAPP_LABEL;
    }

    // Keep the data-framer-name attributes honest once swapped.
    card
      .querySelector('[data-framer-name="Discord Copy"]')
      ?.setAttribute("data-framer-name", "WhatsApp Copy");
    card
      .querySelector('[data-framer-name="Discord Label"]')
      ?.setAttribute("data-framer-name", "WhatsApp Label");
    card
      .querySelector('[data-framer-name="Discord Value"]')
      ?.setAttribute("data-framer-name", "WhatsApp Value");
    card.setAttribute("data-framer-name", "WhatsApp Contact Card");
  });
}

/** 3 — the contact form submits through FormSubmit.co instead of Framer. */
function patchContactForm(doc: Document) {
  const form = doc.querySelector<HTMLFormElement>(
    '#fm-contact-form, form[data-framer-name="Contact Form"]',
  );
  if (!form || form.getAttribute(DONE) === "form") return;
  form.setAttribute(DONE, "form");

  const setLabel = (button: HTMLButtonElement | null, text: string) => {
    if (!button) return;
    const target = button.querySelector("h1") ?? button;
    target.textContent = text;
  };

  // Capture phase: Framer binds its own submit handler on this form.
  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const button = form.querySelector<HTMLButtonElement>(
        'button[type="submit"]',
      );
      const original =
        (button?.querySelector("h1") ?? button)?.textContent ?? "Submit";

      // Framer injects decoy fields (aria-hidden, tabindex="-1"), one of which
      // is also called "message" — a blanket FormData sweep would overwrite the
      // real message with the empty decoy. Anything filled in there is a bot.
      const decoys = form.querySelectorAll<HTMLInputElement>(
        'input[aria-hidden="true"][name]',
      );
      const looksLikeSpam = Array.from(decoys).some(
        (field) => field.value.trim() !== "",
      );
      if (looksLikeSpam) {
        form.reset();
        return;
      }

      const payload: Record<string, string> = {
        _subject: "New contact from flaviomorais.com",
        _captcha: "false",
        _template: "table",
      };
      // Only the real, visible controls carry Framer's form-input class.
      form
        .querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement
        >(".framer-form-input[name]")
        .forEach((field) => {
          if (field.name) payload[field.name] = field.value;
        });

      if (button) button.disabled = true;
      setLabel(button, "Sending…");

      fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`FormSubmit ${response.status}`);
          return response.json();
        })
        .then(() => {
          setLabel(button, "✓ Sent!");
          form.reset();
          setTimeout(() => {
            if (button) button.disabled = false;
            setLabel(button, original);
          }, 3000);
        })
        .catch((error) => {
          console.error("Contact form submission failed", error);
          setLabel(button, "Try again");
          setTimeout(() => {
            if (button) button.disabled = false;
            setLabel(button, original);
          }, 3000);
        });
    },
    true,
  );
}

/**
 * Film grain.
 *
 * Generated from an SVG turbulence filter rather than shipped as a texture —
 * no extra request, and it tiles at any viewport. One fixed layer above the
 * content, below the site's custom cursor (z-index 9999999), and transparent
 * to pointer events so nothing underneath stops responding.
 */
const GRAIN_TILE = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>" +
    "<filter id='g'>" +
    "<feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/>" +
    "<feColorMatrix type='saturate' values='0'/>" +
    "</filter>" +
    "<rect width='100%' height='100%' filter='url(#g)'/>" +
    "</svg>",
);

function installGrain(doc: Document) {
  if (doc.getElementById("fm-grain") || !doc.body) return;
  const layer = doc.createElement("div");
  layer.id = "fm-grain";
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = [
    "position:fixed",
    "inset:0",
    "pointer-events:none",
    "z-index:9999990",
    `background-image:url("data:image/svg+xml,${GRAIN_TILE}")`,
    "background-repeat:repeat",
    "opacity:0.14",
    "mix-blend-mode:overlay",
  ].join(";");
  doc.body.appendChild(layer);
}

/**
 * Anchor scrolling only — the wheel is left alone.
 *
 * The export's own inertial wheel handler was removed and nothing replaces it:
 * plain native scrolling is what the wheel should feel like. The easing below
 * runs only when an in-page link is clicked, and it is hand-rolled because
 * Framer's motion runtime cancels the browser's own `behavior: "smooth"`, so
 * `scrollIntoView` silently no-ops here.
 */
function smoothScrollTo(doc: Document, section: Element) {
  const win = doc.defaultView;
  if (!win) return;

  const start = win.scrollY;
  const maxScroll = Math.max(
    0,
    doc.documentElement.scrollHeight - win.innerHeight,
  );
  const target = Math.max(
    0,
    Math.min(start + section.getBoundingClientRect().top, maxScroll),
  );
  const distance = target - start;
  if (Math.abs(distance) < 2) return;

  if (win.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    win.scrollTo(0, target);
    return;
  }

  const duration = Math.min(700, Math.max(280, Math.abs(distance) * 0.35));
  const startedAt = win.performance.now();
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);

  let settled = false;
  const step = (now: number) => {
    if (settled) return;
    const progress = Math.min(1, (now - startedAt) / duration);
    win.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) win.requestAnimationFrame(step);
    else settled = true;
  };
  win.requestAnimationFrame(step);

  // Animation frames can be starved; guarantee arrival regardless.
  win.setTimeout(() => {
    if (settled) return;
    settled = true;
    win.scrollTo(0, target);
  }, duration + 120);
}

/**
 * 4a — "See Works" points at the works section.
 *
 * The export ships href="./#work", but Framer's runtime overwrites it with its
 * own link data on hydration — it resolves to "#contact". So the intent is
 * recorded on a private attribute that Framer does not touch, and the scroll
 * handler below trusts that over href.
 */
function patchSeeWorksLink(doc: Document) {
  doc.querySelectorAll<HTMLAnchorElement>("a").forEach((anchor) => {
    if (anchor.textContent?.trim() !== "See Works") return;
    anchor.setAttribute("data-fm-scroll", "work");
    if (!anchor.getAttribute("href")?.endsWith("#work")) {
      anchor.setAttribute("href", "./#work");
    }
  });
}

/**
 * 4b — in-page links actually scroll.
 *
 * Inside the iframe the document is /mirror/index.html, and Framer rewrites
 * in-page links to "./?v=godray-full-3#section". That resolves to /mirror/ — a
 * different path — so the browser reloads instead of scrolling.
 */
function patchAnchorScrolling(doc: Document) {
  const root = doc.documentElement;
  if (root.getAttribute(DONE) === "anchors") return;
  root.setAttribute(DONE, "anchors");

  doc.addEventListener(
    "click",
    (event) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      // Our recorded intent wins over whatever Framer last wrote into href.
      const href = anchor.getAttribute("href") ?? "";
      const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
      const id = anchor.getAttribute("data-fm-scroll") || hash;
      if (!id) return;

      // A matching element id is what makes this an in-page link; outbound
      // links (Behance, wa.me) carry no fragment.
      const section = doc.getElementById(id);
      if (!section) return;

      event.preventDefault();
      // preventDefault alone is not enough: Framer's own link handler runs
      // afterwards and pushState()s its route. Stop the event here so only the
      // scroll happens — scoped to links we are actually handling.
      event.stopImmediatePropagation();
      event.stopPropagation();
      smoothScrollTo(doc, section);
    },
    true,
  );
}

/**
 * 5 — the footer socials column.
 *
 * Discord becomes WhatsApp and links out. Both entries get a matching glyph:
 * inline-flex with a gap aligns the icon to the text far more reliably than a
 * vertical-align nudge, and sizing in `em` keeps it locked to the type scale
 * the sibling links already use.
 */
function decorateFooterLink(
  link: HTMLAnchorElement,
  icon: SVGSVGElement,
  label: string,
) {
  link.textContent = label;
  link.style.display = "inline-flex";
  link.style.alignItems = "center";
  link.style.gap = "0.5em";
  // insertBefore rather than prepend: @cloudflare/workers-types is in scope and
  // its HTMLRewriter prepend() signature otherwise wins the overload.
  link.insertBefore(icon, link.firstChild);
}

function patchFooterSocials(doc: Document) {
  const whatsappSlot = doc.querySelector<HTMLElement>(
    '[data-framer-name="Footer Discord"], [data-framer-name="Footer WhatsApp"]',
  );
  if (whatsappSlot && whatsappSlot.getAttribute(DONE) !== "footer") {
    const link = whatsappSlot.querySelector("a");
    if (link) {
      whatsappSlot.setAttribute(DONE, "footer");
      whatsappSlot.setAttribute("data-framer-name", "Footer WhatsApp");
      link.href = WHATSAPP_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      decorateFooterLink(
        link,
        brandIcon(doc, WHATSAPP_PATH, ICON_EM),
        WHATSAPP_LABEL,
      );
    }
  }

  // Instagram keeps its existing href; it only needs the matching glyph so the
  // column reads as one set.
  const instagramSlot = doc.querySelector<HTMLElement>(
    '[data-framer-name="Footer Instagram"]',
  );
  if (instagramSlot && instagramSlot.getAttribute(DONE) !== "footer") {
    const link = instagramSlot.querySelector("a");
    if (link) {
      instagramSlot.setAttribute(DONE, "footer");
      decorateFooterLink(
        link,
        brandIcon(doc, INSTAGRAM_PATH, ICON_EM),
        "Instagram",
      );
    }
  }
}

/**
 * 6 — the floating nav stays above the page.
 *
 * The export already pins it (position:fixed, top:43px, backdrop blur), which
 * is the behaviour we want, but at z-index 1 later sections can ride over it
 * while scrolling. Lift it clear of the content, still under the grain layer
 * and the site's own cursor.
 */
function patchNavLayering(doc: Document) {
  const nav = doc.querySelector<HTMLElement>(".framer-1pcgty4-container");
  if (!nav || nav.getAttribute(DONE) === "nav") return;
  nav.setAttribute(DONE, "nav");
  nav.style.setProperty("z-index", "9999900", "important");
}

/**
 * 6b — the nav collapses on the way down and reopens on the way up.
 *
 * The links group shrinks away so the pill is left with just the brand and the
 * CTA, then comes back the moment the reader scrolls up — and is always open at
 * the top of the page. The wrapper is centred with translateX(-50%), so the
 * pill stays centred by itself as its width changes; the negative margin is
 * only there to absorb one of the flex gaps that would otherwise be left
 * behind by a zero-width child.
 */
const NAV_COLLAPSE_AT = 80;
const NAV_TOP_ZONE = 40;
const NAV_JITTER = 4;

function installNavCollapse(doc: Document) {
  const win = doc.defaultView;
  if (!win || doc.getElementById("fm-nav-collapse")) return;

  const links = doc.querySelector<HTMLElement>(
    '[data-framer-name="Navigation Links"]',
  );
  if (!links) return;

  // Framer's animation runtime rewrites these nodes' inline style attributes,
  // so inline changes are wiped within a frame. Drive it from a stylesheet
  // instead — which also covers every responsive variant at once.
  const ease = "cubic-bezier(0.22, 0.61, 0.36, 1)";
  const sheet = doc.createElement("style");
  sheet.id = "fm-nav-collapse";
  sheet.textContent = `
[data-framer-name="Navigation Links"]{
  overflow:hidden !important;
  white-space:nowrap !important;
  max-width:var(--fm-nav-links-w, 320px) !important;
  /* Opening: widen first, fade the labels in behind it. */
  transition:max-width 360ms ${ease}, margin-left 360ms ${ease}, opacity 180ms ease 170ms !important;
}
/* Without this the labels compress as the track narrows and you watch
   "Work Process About FAQ" squash itself flat. Fixed-size children are
   clipped by the overflow instead, so they simply slide out of view. */
[data-framer-name="Navigation Links"] > *{
  flex:0 0 auto !important;
}
:root[data-fm-nav="collapsed"] [data-framer-name="Navigation Links"]{
  max-width:0 !important;
  opacity:0 !important;
  margin-left:calc(-1 * var(--fm-nav-gap, 45px)) !important;
  pointer-events:none !important;
  /* Closing: fade out first, then take the width away. */
  transition:opacity 130ms ease, max-width 360ms ${ease} 90ms, margin-left 360ms ${ease} 90ms !important;
}
/* The active-section highlight is a sibling of the links, not a child, so
   collapsing the track leaves it stranded in the empty space. It is invisible
   until you scroll, which is why it only shows up in real use.

   Scoped to the fixed nav wrapper, NOT to a variant name: Framer swaps the
   pill to a different variant once the page scrolls, so a rule hung off
   [data-framer-name="Variant 1"] stops matching exactly when it is needed. */
.framer-1pcgty4-container [data-framer-name="BG"]{
  transition:opacity 130ms ease !important;
}
:root[data-fm-nav="collapsed"] .framer-1pcgty4-container [data-framer-name="BG"]{
  opacity:0 !important;
}`;
  doc.head.appendChild(sheet);

  const pill = links.parentElement;
  const gap = pill
    ? parseFloat(win.getComputedStyle(pill).columnGap || "0") || 0
    : 0;
  const root = doc.documentElement;
  root.style.setProperty("--fm-nav-gap", `${gap}px`);

  const measure = () => {
    const wasCollapsed = root.getAttribute("data-fm-nav") === "collapsed";
    if (wasCollapsed) return;
    root.style.setProperty("--fm-nav-links-w", "none");
    const width = links.getBoundingClientRect().width;
    root.style.setProperty("--fm-nav-links-w", `${Math.ceil(width)}px`);
  };
  measure();

  let collapsed = false;
  const setCollapsed = (next: boolean) => {
    if (next === collapsed) return;
    collapsed = next;
    if (next) root.setAttribute("data-fm-nav", "collapsed");
    else root.removeAttribute("data-fm-nav");
    links.setAttribute("aria-hidden", next ? "true" : "false");
  };

  let lastY = win.scrollY;
  win.addEventListener(
    "scroll",
    () => {
      const y = win.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < NAV_JITTER) return;
      lastY = y;

      if (y <= NAV_TOP_ZONE) setCollapsed(false);
      else if (delta > 0 && y > NAV_COLLAPSE_AT) setCollapsed(true);
      else if (delta < 0) setCollapsed(false);
    },
    { passive: true },
  );

  // Breakpoint changes alter the links' natural width; re-measure while open.
  win.addEventListener("resize", measure, { passive: true });
}

/**
 * 7 — testimonials read as a proper card grid.
 *
 * The section already lays out as `grid` with three 341px tracks and a 16px
 * gap, so the layout itself is left alone. What made it look wrong is that
 * every card wrapper is frozen at scale(0.5) — an appear animation that never
 * settles — so each card filled half its track. Only that is undone here; card
 * borders, radius, type and colour are untouched.
 */
function patchTestimonialCards(doc: Document) {
  const grid = doc.querySelector<HTMLElement>(".framer-149wme3");
  if (!grid) return;

  grid.querySelectorAll<HTMLElement>('[class*="-container"]').forEach((box) => {
    if (box.getAttribute(DONE) === "unscaled") return;
    const transform = doc.defaultView?.getComputedStyle(box).transform ?? "";
    if (!transform.startsWith("matrix(") || transform === "matrix(1, 0, 0, 1, 0, 0)") {
      return;
    }
    box.setAttribute(DONE, "unscaled");
    box.style.setProperty("transform", "none", "important");
    box.style.setProperty("width", "100%", "important");
  });
}

/**
 * 8 — every testimonial gets a profile picture slot.
 *
 * Placeholders only: each carries a stable id and the person's name, so a real
 * portrait can be dropped in per card later. The initial keeps it looking
 * deliberate until then.
 */
function patchTestimonialAvatars(doc: Document) {
  const cards = doc.querySelectorAll<HTMLElement>(
    '[data-framer-name="Testimonial content card"]',
  );

  cards.forEach((card, index) => {
    const container = card.querySelector<HTMLElement>(
      '[data-framer-name="Profile container"]',
    );
    if (!container || container.querySelector("[data-fm-avatar]")) return;

    const person =
      container.querySelector("p")?.textContent?.trim() ?? `Client ${index + 1}`;

    const slot = doc.createElement("div");
    const slotId = `fm-avatar-${index + 1}`;
    slot.id = slotId;
    slot.setAttribute("data-fm-avatar", String(index + 1));
    slot.setAttribute("data-fm-avatar-name", person);
    slot.setAttribute("role", "img");
    slot.setAttribute("aria-label", `${person} profile picture`);
    slot.title = `${person} — ${slotId}`;
    slot.textContent = person.slice(0, 1).toUpperCase();
    slot.style.cssText = [
      "flex:0 0 auto",
      "width:40px",
      "height:40px",
      "border-radius:50%",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "background:rgba(179,215,255,0.10)",
      "border:1px solid rgba(179,215,255,0.28)",
      "background-size:cover",
      "background-position:center",
      "color:rgba(221,235,255,0.85)",
      "font-size:15px",
      "font-weight:500",
      "line-height:1",
      "overflow:hidden",
      "user-select:none",
    ].join(";");

    container.style.setProperty("display", "flex");
    container.style.setProperty("flex-direction", "row");
    container.style.setProperty("align-items", "center");
    container.style.setProperty("gap", "12px");
    container.insertBefore(slot, container.firstChild);
  });
}

/**
 * 9 — un-stick the export's reveal animations.
 *
 * Two separate faults in the mirror's own scripts leave content half-faded:
 *
 * 1. The reveal-settling script snapshots getComputedStyle().opacity when an
 *    element scrolls into view and pins it via
 *    `.flow-reveal-locked{opacity:var(--flow-final-opacity)!important}`. It
 *    only retries when that reading is near zero, so a mid-animation value —
 *    0.45, say — is locked in permanently, transform offset included.
 * 2. Timeline cards are `opacity:0 !important` until an IntersectionObserver
 *    adds `.is-visible`. When that observer misses one, the card never appears.
 *
 * Neither is recoverable from inside those scripts, so the settled state is
 * asserted here instead.
 */
function installRevealRepair(doc: Document) {
  const win = doc.defaultView;
  if (!win || doc.getElementById("fm-reveal-fix")) return;

  const sheet = doc.createElement("style");
  sheet.id = "fm-reveal-fix";
  // A settled reveal means fully shown and back in place — never a frame
  // captured part-way there.
  sheet.textContent = `
.flow-reveal-locked{
  opacity:1 !important;
  transform:none !important;
}`;
  doc.head.appendChild(sheet);

  const revealTimelineCards = () => {
    doc
      .querySelectorAll<HTMLElement>(".timeline-card:not(.is-visible)")
      .forEach((card) => {
        // Anything level with the fold or already behind us should be showing.
        if (card.getBoundingClientRect().top < win.innerHeight * 0.95) {
          card.classList.add("is-visible");
        }
      });
  };

  revealTimelineCards();

  let queued = false;
  win.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      win.requestAnimationFrame(() => {
        queued = false;
        revealTimelineCards();
      });
    },
    { passive: true },
  );
}

/**
 * 10 — stop the hero section clipping the god-ray backdrop.
 *
 * The backdrop is meant to be full-bleed: the export's own stylesheet pins it
 * `position:fixed; inset:0; width:100vw; height:100vh`. But its ancestor — the
 * "Opening" section — carries `will-change:transform`, which promotes that
 * section into the containing block for fixed descendants. Two things follow:
 * the backdrop resolves `inset:0` against the section rather than the viewport,
 * and the section's `overflow:clip` then crops it at the section's own height.
 * The result is a hard horizontal edge where the glow stops dead.
 *
 * `will-change` is only a performance hint here, so dropping it costs nothing
 * and hands the backdrop back to the viewport.
 */
function installGodrayClipFix(doc: Document) {
  if (doc.getElementById("fm-godray-fix")) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-godray-fix";
  sheet.textContent = `
.framer-fdvaze{
  will-change:auto !important;
}`;
  doc.head.appendChild(sheet);
}

/**
 * 10 — keep the button shine on the border instead of across the face.
 *
 * The blue buttons paint an animated sweep in ::before and confine it to a
 * 1.5px ring with the usual two-layer mask trick. But both mask gradients are
 * written `linear-gradient(#fff 0px, #fff 0px)` — every stop at 0px, so the
 * gradient line has zero length. That degenerate gradient does not resolve to
 * a solid mask, the `exclude` never punches out the content box, and the sweep
 * paints across the whole button. What shows is the sweep's own 35%/65% stop
 * as a hard vertical seam that drifts with the 2.4s animation.
 *
 * Giving the mask gradients a real length restores the ring.
 */
const SHEEN_SELECTOR = [
  ".framer-r5a756::before",
  ".framer-8ttqe7::before",
  ".framer-uNypv::before",
  ".framer-kh0hjo::before",
  ".framer-1iapdbm::before",
].join(",");

function installButtonSheenFix(doc: Document) {
  if (doc.getElementById("fm-button-sheen")) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-button-sheen";
  sheet.textContent = `
${SHEEN_SELECTOR}{
  -webkit-mask:linear-gradient(#fff 0 100%) content-box,linear-gradient(#fff 0 100%) !important;
  mask:linear-gradient(#fff 0 100%) content-box,linear-gradient(#fff 0 100%) !important;
  -webkit-mask-composite:xor !important;
  mask-composite:exclude !important;
}`;
  doc.head.appendChild(sheet);
}

/**
 * 11 — stop the button fill from looking like a tile sweeping through.
 *
 * Separately from the border sheen above, the same buttons animate their own
 * fill: `background-size:200% 200%` with `background-position` sliding
 * 0%→200% on a 2.5s loop (@keyframes btn-sweep). That doubles the gradient
 * past the button's own edges, so the animation is really panning a window
 * across it — and `background-repeat` is left at its default (`repeat`),
 * which is load-bearing: past 100% the window has nothing left to show
 * without it. The paint job's own two colour stops don't tile cleanly against
 * that repeat, though — `rgb(6,43,120)` at 0% against `rgb(5,39,99)` at 100% —
 * so every time the pattern wraps, that mismatch shows up as a hard-edged
 * diagonal seam sweeping across the fill, exactly like a tile passing through.
 *
 * Matching the two endpoint colours removes the jump, but not the artefact —
 * a sharp peak still meets a sharp trough at the seam, so the *rate* of colour
 * change still kinks there even when the colour itself doesn't. What actually
 * disappears it is a raised-cosine curve: eleven stops sampling
 * `(1 − cos(2πt)) / 2` from t=0 to t=1, which brings the slope to zero at both
 * ends, not just the colour. That's what a seamlessly tileable pulse needs.
 * Verified by freezing the animation at both the 150% and 175% positions,
 * where the wrap is on-screen — the raised-cosine fill held with no visible
 * line in either, while the colour-matched-only version still showed one.
 */
const FILL_SELECTOR = [
  ".framer-r5a756",
  ".framer-8ttqe7",
  ".framer-uNypv",
  ".framer-kh0hjo",
  ".framer-1iapdbm",
].join(",");

const RAISED_COSINE_FILL = [
  "rgb(6,43,120) 0%",
  "rgb(7,51,133) 10%",
  "rgb(9,71,167) 20%",
  "rgb(12,95,208) 30%",
  "rgb(14,115,242) 40%",
  "rgb(15,123,255) 50%",
  "rgb(14,115,242) 60%",
  "rgb(12,95,208) 70%",
  "rgb(9,71,167) 80%",
  "rgb(7,51,133) 90%",
  "rgb(6,43,120) 100%",
].join(",");

function installButtonFillFix(doc: Document) {
  if (doc.getElementById("fm-button-fill")) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-button-fill";
  sheet.textContent = `
${FILL_SELECTOR}{
  background-image:linear-gradient(120deg,${RAISED_COSINE_FILL}) !important;
}`;
  doc.head.appendChild(sheet);
}

function patchMirror(doc: Document) {
  hideFramerBadge(doc);
  patchContractNowCta(doc);
  patchQuickChatCard(doc);
  patchContactForm(doc);
  patchSeeWorksLink(doc);
  patchAnchorScrolling(doc);
  patchFooterSocials(doc);
  patchNavLayering(doc);
  installNavCollapse(doc);
  patchTestimonialCards(doc);
  patchTestimonialAvatars(doc);
  installRevealRepair(doc);
  installButtonSheenFix(doc);
  installButtonFillFix(doc);
  installGodrayClipFix(doc);
  installGrain(doc);
}

export default function Home() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const attachToMirror = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;

    let patching = false;
    const apply = () => {
      if (patching) return;
      patching = true;
      try {
        patchMirror(doc);
      } catch (error) {
        console.error("Mirror patching failed", error);
      } finally {
        patching = false;
      }
    };

    apply();

    // Framer hydrates after load and can revert DOM edits, so re-apply on
    // mutation. Every patch is guarded, so re-runs are no-ops.
    observerRef.current?.disconnect();
    const observer = new MutationObserver(apply);
    observer.observe(doc.documentElement, {
      childList: true,
      subtree: true,
      // Framer rewrites in-page hrefs on hydration; watch just that attribute
      // so re-applying does not churn on its constant style animations.
      attributes: true,
      attributeFilter: ["href"],
    });
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    // The iframe is server-rendered, so it usually finishes loading before
    // React hydrates and the onLoad prop is ever attached — that load event is
    // missed. Attach here instead, and patch straight away if it is already up.
    if (frame.contentDocument?.readyState === "complete") attachToMirror();
    frame.addEventListener("load", attachToMirror);

    return () => {
      frame.removeEventListener("load", attachToMirror);
      observerRef.current?.disconnect();
    };
  }, [attachToMirror]);

  return (
    <main className="mirror-shell">
      <iframe
        ref={frameRef}
        className="mirror-frame"
        src="/mirror/index.html?v=godray-full-3"
        title="Flávio Morais — Thumbnail and visual designer"
        onLoad={attachToMirror}
      />
    </main>
  );
}
