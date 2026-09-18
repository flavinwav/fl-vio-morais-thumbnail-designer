"use client";

import { useCallback, useEffect, useRef } from "react";

import { BOURICK_QUOTE_EN, installI18n, ui } from "./i18n";

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

    card.setAttribute("aria-label", ui(doc, "whatsappAria"));

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
      setLabel(button, ui(doc, "sending"));

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
          setLabel(button, ui(doc, "sent"));
          form.reset();
          setTimeout(() => {
            if (button) button.disabled = false;
            setLabel(button, original);
          }, 3000);
        })
        .catch((error) => {
          console.error("Contact form submission failed", error);
          setLabel(button, ui(doc, "tryAgain"));
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
 * in-page links to "./?v=godray-stable-1#section". That resolves to /mirror/ — a
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
/** Profile pictures served from public/avatars, keyed by reviewer name. */
const AVATAR_BY_NAME: Record<string, string> = {
  "Ali McKenzie": "/avatars/1.jpg",
  Bourick: "/avatars/2.jpg",
  Tutty: "/avatars/3.jpg",
  "João": "/avatars/4.jpg",
  Luiz: "/avatars/4.jpg",
};

function patchTestimonialAvatars(doc: Document) {
  const cards = doc.querySelectorAll<HTMLElement>(
    '[data-framer-name="Testimonial content card"]',
  );

  cards.forEach((card, index) => {
    const container = card.querySelector<HTMLElement>(
      '[data-framer-name="Profile container"]',
    );
    if (!container) return;

    const existing = container.querySelector<HTMLElement>("[data-fm-avatar]");
    const person =
      container.querySelector("p")?.textContent?.trim() ?? `Client ${index + 1}`;
    const photo = AVATAR_BY_NAME[person];

    // Framer can re-render a card after the slot exists; re-apply the photo.
    if (existing) {
      if (photo && existing.getAttribute("data-fm-avatar-src") !== photo) {
        existing.setAttribute("data-fm-avatar-src", photo);
        existing.textContent = "";
        existing.style.backgroundImage = `url("${photo}")`;
      }
      return;
    }

    const slot = doc.createElement("div");
    const slotId = `fm-avatar-${index + 1}`;
    slot.id = slotId;
    slot.setAttribute("data-fm-avatar", String(index + 1));
    slot.setAttribute("data-fm-avatar-name", person);
    slot.setAttribute("role", "img");
    slot.setAttribute("aria-label", `${person} profile picture`);
    slot.title = `${person} — ${slotId}`;
    slot.textContent = photo ? "" : person.slice(0, 1).toUpperCase();
    if (photo) slot.setAttribute("data-fm-avatar-src", photo);
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
    if (photo) slot.style.backgroundImage = `url("${photo}")`;

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
/**
 * The snapshot can't be trusted at all: on load it often reads 0 because
 * Framer's own animation hadn't started yet, which left the hero buttons and
 * text invisible or faint (reproduced on the live Replit page too). Framer
 * still writes each element's real end state inline — 1 for most, 0.1 for the
 * hero's divider lines — so the pin follows the highest opacity Framer has
 * given the element instead. Highest, so a later fade-out replay can't dim it.
 */
const revealRepairInstalled = new WeakSet<Document>();
const revealWatched = new WeakSet<HTMLElement>();
const revealPeak = new WeakMap<HTMLElement, number>();

function settleReveal(el: HTMLElement) {
  const inline = parseFloat(el.style.opacity);
  // No inline opacity means Framer has finished and handed back to CSS.
  const current = Number.isFinite(inline) ? inline : 1;
  const peak = Math.max(revealPeak.get(el) ?? 0, current);
  revealPeak.set(el, peak);
  const value = String(peak);
  // Only write on change: this is itself a style mutation we observe.
  if (el.style.getPropertyValue("--flow-final-opacity") !== value) {
    el.style.setProperty("--flow-final-opacity", value);
  }
}

function markSettledReveals(doc: Document) {
  const win = doc.defaultView;
  if (!win) return;
  doc.querySelectorAll<HTMLElement>(".flow-reveal-locked").forEach((el) => {
    settleReveal(el);
    if (revealWatched.has(el)) return;
    revealWatched.add(el);
    new win.MutationObserver(() => settleReveal(el)).observe(el, {
      attributes: true,
      attributeFilter: ["style"],
    });
  });
}

function installRevealRepair(doc: Document) {
  const win = doc.defaultView;
  if (!win) return;
  markSettledReveals(doc);
  if (revealRepairInstalled.has(doc)) return;
  revealRepairInstalled.add(doc);

  const sheet = doc.createElement("style");
  sheet.id = "fm-reveal-fix";
  // Offsets are always cleared; opacity comes from settleReveal.
  sheet.textContent = `
.flow-reveal-locked{
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
  const schedule = () => {
    if (queued) return;
    queued = true;
    win.requestAnimationFrame(() => {
      queued = false;
      revealTimelineCards();
      markSettledReveals(doc);
    });
  };
  win.addEventListener("scroll", schedule, { passive: true });
  // The pin lands on a timer after an element scrolls into view, not on a
  // scroll event, so also watch for the class being added.
  // Settled straight away rather than on the next frame: a tab opened in the
  // background gets no animation frames, and the lock must not wait for one.
  new win.MutationObserver(() => {
    markSettledReveals(doc);
    schedule();
  }).observe(doc.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}

/**
 * The blue buttons' white shine: a gradient sweep in ::before, meant to be
 * confined to a 1.5px ring by the two-layer mask trick. The export writes both
 * mask gradients as `linear-gradient(#fff 0 0)` — zero length — so the mask
 * never resolves, the exclude does nothing, and the sweep washes across the
 * whole face instead of running along the border. Giving the gradients a real
 * length restores the ring.
 */
const SHEEN_SELECTOR = [
  ".framer-r5a756::before",
  ".framer-8ttqe7::before",
  ".framer-uNypv::before",
  ".framer-kh0hjo::before",
  ".framer-1iapdbm::before",
].join(",");

function installButtonSheenFix(doc: Document) {
  if (doc.getElementById("fm-button-sheen") || !doc.head) return;
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
 * Nav highlight follows the real links.
 *
 * The export positions the active-section pill per variant with fixed
 * left/width values measured for the English labels (Work 189/66, Process
 * 258/83, About 350/66, FAQ 420/53). Wider Portuguese labels shift the links,
 * so the pill landed off target. Each variant is re-anchored to its link's
 * actual box, in either language, and re-measured on resize — which the
 * language switch triggers.
 */
const NAV_HIGHLIGHT_VARIANTS: ReadonlyArray<readonly [string, string]> = [
  ["framer-v-rf4o94", "Work Link"],
  ["framer-v-143sako", "Process Link"],
  ["framer-v-1jxwi6s", "About Link"],
  ["framer-v-ka5joz", "FAQ Link"],
];
const NAV_HIGHLIGHT_PAD = 22;
const navHighlightResize = new WeakSet<Document>();

function alignNavHighlight(doc: Document) {
  const win = doc.defaultView;
  const wrapper = doc.querySelector<HTMLElement>(".framer-1pcgty4-container");
  if (!win || !wrapper) return;

  if (!navHighlightResize.has(doc)) {
    navHighlightResize.add(doc);
    let queued = false;
    win.addEventListener(
      "resize",
      () => {
        if (queued) return;
        queued = true;
        win.requestAnimationFrame(() => {
          queued = false;
          alignNavHighlight(doc);
        });
      },
      { passive: true },
    );
  }

  const bg = wrapper.querySelector<HTMLElement>('[data-framer-name="BG"]');
  const pill = bg?.parentElement;
  if (!bg || !pill) return;
  // Collapsed links have no usable boxes; keep the last good measurement.
  if (doc.documentElement.getAttribute("data-fm-nav") === "collapsed") return;

  const pillRect = pill.getBoundingClientRect();
  if (!pillRect.width) return;
  const originX =
    pillRect.left + (parseFloat(win.getComputedStyle(pill).borderLeftWidth) || 0);

  const rules: string[] = [];
  for (const [variant, linkName] of NAV_HIGHLIGHT_VARIANTS) {
    const link = pill.querySelector<HTMLElement>(`[data-framer-name="${linkName}"]`);
    const rect = link?.getBoundingClientRect();
    if (!rect || !rect.width) continue;
    const left = rect.left - originX - NAV_HIGHLIGHT_PAD / 2;
    const width = rect.width + NAV_HIGHLIGHT_PAD;
    rules.push(
      `.framer-vYDYQ.${variant} .framer-13522nk{left:${left.toFixed(1)}px !important;width:${width.toFixed(1)}px !important;}`,
    );
  }
  if (!rules.length) return;

  let sheet = doc.getElementById("fm-nav-highlight");
  if (!sheet) {
    sheet = doc.createElement("style");
    sheet.id = "fm-nav-highlight";
    doc.head.appendChild(sheet);
  }
  const css = rules.join("\n");
  if (sheet.textContent !== css) sheet.textContent = css;
}

/**
 * 12 — re-run the export's process timeline when hydration wipes it.
 *
 * The mirror's own DESIGN PROCESS TIMELINE script runs exactly once, at
 * DOMContentLoaded, and tags the server-rendered grid (`.timeline-card`,
 * `data-timeline-ready`). Framer's hydration then errors (React #405 — also
 * thrown on the live Replit page) and client-renders fresh nodes, discarding
 * those tags. Whether the script's work survives is a load-order race: on a
 * fast host such as the Cloudflare edge the process section can come up with
 * none of its timeline layout.
 *
 * The fix re-executes that same script rather than reimplementing it, so the
 * behaviour stays byte-for-byte Replit's. It is idempotent — it returns early
 * once the grid is marked ready — and capped, since each run also registers
 * its own scroll/resize listeners.
 */
const TIMELINE_MARKER = "// === DESIGN PROCESS TIMELINE ===";
const TIMELINE_MAX_RERUNS = 3;
const timelineReruns = new WeakMap<Document, number>();

function rerunLostProcessTimeline(doc: Document) {
  const grid = doc.querySelector<HTMLElement>(".framer-mbkrrr");
  if (!grid || grid.dataset.timelineReady === "true") return;

  const hasCards = Array.from(grid.children).some((child) =>
    (child.getAttribute("data-framer-name") ?? "").startsWith("Process Card"),
  );
  if (!hasCards) return;

  const runs = timelineReruns.get(doc) ?? 0;
  if (runs >= TIMELINE_MAX_RERUNS) return;

  const original = Array.from(doc.querySelectorAll("script")).find((script) =>
    (script.textContent ?? "").includes(TIMELINE_MARKER),
  );
  if (!original?.textContent || !doc.body) return;

  timelineReruns.set(doc, runs + 1);
  const rerun = doc.createElement("script");
  rerun.textContent = original.textContent;
  doc.body.appendChild(rerun);
}

/**
 * 12 — make the blue buttons' sweeping fill loop without a seam.
 *
 * The export animates these buttons by panning `background-position` 0%→200%
 * across a gradient tiled at `background-size:200% 200%`. Each time the pan
 * crosses a tile boundary two things meet that don't match: the gradient ends
 * on rgb(5,39,99) but starts on rgb(6,43,120), and it runs at 120deg while the
 * tiles repeat horizontally. At that angle, crossing a tile sideways covers
 * only ~86% of the gradient, so the two sides of the wrap sample different
 * colours whatever the stops are — smoothing the stops alone still left a
 * visible line. Only a gradient running along the tiling axis wraps exactly.
 *
 * So: Replit's own colours, rising from the dark end to the bright blue and
 * back on a raised cosine (equal colour *and* zero slope at both ends), laid
 * out at 90deg. Same animation, no seam. Verified by freezing the pan at 150%,
 * where the boundary crosses the middle of the button.
 */
const SWEEP_CLASSES =
  ".framer-r5a756, .framer-8ttqe7, .framer-uNypv, .framer-kh0hjo, .framer-1iapdbm";
const SWEEP_ORIGINAL_END = "rgb(5, 39, 99)";
const SWEEP_SEAMLESS = [
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

function installSeamlessButtonSweep(doc: Document) {
  const win = doc.defaultView;
  if (!win) return;

  if (!doc.getElementById("fm-seamless-sweep")) {
    const sheet = doc.createElement("style");
    sheet.id = "fm-seamless-sweep";
    // Not while hovered: Framer's hover variant paints these buttons white,
    // and an !important gradient here would hide that.
    sheet.textContent = `
[data-fm-sweep]:not(:hover){
  background-image:linear-gradient(90deg,${SWEEP_SEAMLESS}) !important;
}`;
    doc.head.appendChild(sheet);
  }

  // Tag only elements that actually paint the export's sweep gradient; the
  // shared rule also lists classes (e.g. the nav CTA) that paint otherwise.
  doc.querySelectorAll<HTMLElement>(SWEEP_CLASSES).forEach((el) => {
    if (el.hasAttribute("data-fm-sweep")) return;
    const bg = win.getComputedStyle(el).backgroundImage;
    if (bg.includes("linear-gradient") && bg.includes(SWEEP_ORIGINAL_END)) {
      el.setAttribute("data-fm-sweep", "");
    }
  });
}

/**
 * 13 — put every process-timeline dot on the line.
 *
 * Each card draws its dot as ::after, placed by a hardcoded offset from the
 * card's edge: `right:-55px` for left-column cards, `left:-55px` for right.
 * Two things break that:
 *
 * - Left-column cards also inherit `left:0` from another rule. With both
 *   `left` and `right` set on a fixed-width absolute box, `left` wins, so
 *   those dots sat on the card's own edge instead of the line.
 * - The -55px assumes the card's edge lines up with its grid column. Cards are
 *   capped at 460px and centred, so on wider screens they sit inset and even
 *   the right-column dots land ~7px off the line.
 *
 * So the dot is placed from the line instead: measure the line (the grid's
 * ::before, which moves to the left edge on mobile) and centre each dot on it.
 * Written into a stylesheet keyed by each card's own class, because Framer
 * rewrites these nodes' inline styles, and re-measured on resize.
 */
const timelineDotResize = new WeakSet<Document>();

function alignTimelineDots(doc: Document) {
  const win = doc.defaultView;
  const grid = doc.querySelector<HTMLElement>(".framer-mbkrrr");
  if (!win || !grid) return;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>(".timeline-card"));
  if (!cards.length) return;

  const gridRect = grid.getBoundingClientRect();
  if (!gridRect.width) return;
  const line = win.getComputedStyle(grid, "::before");
  const lineX =
    gridRect.left + parseFloat(line.left) + parseFloat(line.width) / 2;
  if (!Number.isFinite(lineX)) return;

  const rules: string[] = [];
  for (const card of cards) {
    const key = Array.from(card.classList).find(
      (name) => name.startsWith("framer-") && name !== "framer-text",
    );
    if (!key) continue;

    const dot = win.getComputedStyle(card, "::after");
    let dotWidth = parseFloat(dot.width);
    if (dot.boxSizing !== "border-box") {
      dotWidth +=
        parseFloat(dot.borderLeftWidth) + parseFloat(dot.borderRightWidth);
    }
    if (!Number.isFinite(dotWidth)) continue;

    // ::after is positioned against the card's padding box.
    const cardRect = card.getBoundingClientRect();
    const cardStyle = win.getComputedStyle(card);
    const originX = cardRect.left + parseFloat(cardStyle.borderLeftWidth);
    const left = lineX - originX - dotWidth / 2;

    rules.push(
      `.${key}.timeline-card::after{left:${left.toFixed(2)}px !important;right:auto !important;}`,
    );
  }
  if (!rules.length) return;

  let sheet = doc.getElementById("fm-timeline-dots");
  if (!sheet) {
    sheet = doc.createElement("style");
    sheet.id = "fm-timeline-dots";
    doc.head.appendChild(sheet);
  }
  const css = rules.join("\n");
  // Only write on change: a write is itself a DOM mutation and would re-run
  // the patch pass.
  if (sheet.textContent !== css) sheet.textContent = css;

  if (!timelineDotResize.has(doc)) {
    timelineDotResize.add(doc);
    let queued = false;
    win.addEventListener(
      "resize",
      () => {
        if (queued) return;
        queued = true;
        win.requestAnimationFrame(() => {
          queued = false;
          alignTimelineDots(doc);
        });
      },
      { passive: true },
    );
  }
}

/**
 * 14 — add Bourick's review.
 *
 * Cloned from an existing card rather than built by hand, so it inherits the
 * export's exact markup and styling. A card with a name but no company is used
 * as the template, matching this review. Appended to the shortest column of
 * every Review Grid variant (the export renders one per breakpoint), and
 * re-added if Framer's hydration replaces the grid.
 */
const BOURICK_QUOTE = BOURICK_QUOTE_EN;
const BOURICK_NAME = "Bourick";

function addBourickReview(doc: Document) {
  const grids = doc.querySelectorAll<HTMLElement>(".framer-149wme3");

  grids.forEach((grid) => {
    if (grid.querySelector('[data-fm-review="bourick"]')) return;

    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>(
        '[data-framer-name="Testimonial content card"]',
      ),
    );
    // Template: a card whose profile carries just a name, like this review.
    const template =
      cards.find((card) => {
        const names = card.querySelector('[data-framer-name="Name + designation"]');
        return names ? names.querySelectorAll("p").length === 1 : false;
      }) ?? cards[0];
    if (!template) return;

    // Middle of the grid: the centre column, halfway down it. On a one-column
    // layout that is simply the middle of the list.
    const templateColumn = template.closest<HTMLElement>('[class*="-container"]')
      ?.parentElement;
    const columns = Array.from(templateColumn?.parentElement?.children ?? []);
    const column = columns[Math.floor(columns.length / 2)] as HTMLElement | undefined;
    if (!column) return;
    const anchor = column.children[Math.floor(column.children.length / 2)] ?? null;

    const clone = template.cloneNode(true) as HTMLElement;
    clone.setAttribute("data-fm-review", "bourick");
    // Drop any marks left by other patches so they re-apply cleanly.
    clone.removeAttribute(DONE);
    // Listeners aren't cloned, so the link patch has to see this card as new.
    clone.removeAttribute("data-fm-review-link");
    clone.querySelectorAll("[data-fm-avatar]").forEach((slot) => slot.remove());

    const quote = clone.querySelector("p");
    if (quote) quote.textContent = BOURICK_QUOTE;

    const designation = clone.querySelector(
      '[data-framer-name="Name + designation"]',
    );
    const name = designation?.querySelector("p");
    if (name) name.textContent = BOURICK_NAME;
    // Bourick has no company; drop the template's second line (e.g. "Ideias de
    // Chuveiro") instead of carrying it over from the card that was cloned.
    if (designation) {
      Array.from(designation.children)
        .slice(1)
        .forEach((line) => line.remove());
    }

    const wrapper = template.closest<HTMLElement>('[class*="-container"]');
    if (wrapper) {
      const holder = wrapper.cloneNode(false) as HTMLElement;
      holder.setAttribute("data-fm-review-holder", "bourick");
      // The template wrapper carries Framer's pre-reveal state inline
      // (opacity:0, will-change:transform). Real cards animate out of it; a
      // clone never does, so it would take up space while staying invisible.
      holder.style.removeProperty("transform");
      holder.style.removeProperty("opacity");
      holder.style.removeProperty("will-change");
      holder.appendChild(clone);
      column.insertBefore(holder, anchor);
      revealBourickWhenSeen(holder);
    } else {
      clone.setAttribute("data-fm-review-holder", "bourick");
      column.insertBefore(clone, anchor);
      revealBourickWhenSeen(clone);
    }
  });

  // The clone is outside Framer's animation system, so its entrance is done
  // here: the same fade-and-grow-from-half-size the other cards use, played
  // once when it scrolls into view.
  if (grids.length && !doc.getElementById("fm-bourick-review")) {
    const sheet = doc.createElement("style");
    sheet.id = "fm-bourick-review";
    sheet.textContent = `
[data-fm-review="bourick"]{
  opacity:1 !important;
  transform:none !important;
}
[data-fm-review-holder="bourick"]{
  opacity:0 !important;
  transform:scale(0.5) !important;
  transition:opacity .6s ease,transform .9s cubic-bezier(.34,1.25,.5,1) !important;
}
[data-fm-review-holder="bourick"][data-fm-seen]{
  opacity:1 !important;
  transform:none !important;
}`;
    doc.head.appendChild(sheet);
  }
}

function revealBourickWhenSeen(holder: HTMLElement) {
  const win = holder.ownerDocument.defaultView;
  if (!win || !("IntersectionObserver" in win)) {
    holder.setAttribute("data-fm-seen", "");
    return;
  }
  const observer = new win.IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      holder.setAttribute("data-fm-seen", "");
    },
    { threshold: 0.2 },
  );
  observer.observe(holder);
}

/**
 * 15 — hero god-ray: no crop, no flicker.
 *
 * The rays are a WebGL shader in a data: iframe. Two faults in it:
 *
 * - Crop: the shader is drawn at a fixed 1200×1024, so on any window wider
 *   than 1200px the rays stop in a hard vertical edge.
 * - Flicker: it pulls its script from unpkg's `@latest` (a redirect plus
 *   ~90KB) every time the iframe is created — and Framer's hydration creates
 *   it twice. Depending on that race the rays showed, went black, and came
 *   back.
 *
 * The iframe is kept hidden until it is patched (see fm-godray-boot in the
 * mirror head): its shader is sized to cover the window and loads a
 * self-hosted, pinned copy of the script (public/mirror/vendor, MIT). It fades in once, after hydration
 * has replaced the server-rendered node, so it never appears and restarts.
 */
const GODRAY_IFRAME = ".framer-1iwwyw3-container iframe";
const GODRAY_SETTLE_MS = 500;
const GODRAY_MIN_W = 1200;
const GODRAY_MIN_H = 1024;
const godraySeen = new WeakMap<HTMLIFrameElement, number>();

function godraySource(original: string, win: Window, script: string): string | null {
  const comma = original.indexOf(",");
  if (!original.startsWith("data:text/html;base64,") || comma < 0) return null;
  let html: string;
  try {
    html = new TextDecoder().decode(
      Uint8Array.from(win.atob(original.slice(comma + 1)), (c) => c.charCodeAt(0)),
    );
  } catch {
    return null;
  }
  // Never smaller than the original, so up to 1200px wide nothing changes.
  const width = Math.max(GODRAY_MIN_W, Math.ceil(win.innerWidth));
  const height = Math.max(GODRAY_MIN_H, Math.ceil(win.innerHeight));
  html = html
    .replace(
      /<script src="https:\/\/unpkg\.com\/media-shader@[^"]*"><\/script>/,
      () => `<script>${script}</script>`,
    )
    .replace(/width="1200px"/, `width="${width}px"`)
    .replace(/height="1024px"/, `height="${height}px"`);
  const bytes = new TextEncoder().encode(html);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:text/html;base64,${win.btoa(binary)}`;
}

let shaderScript: Promise<string> | null = null;

/** The self-hosted media-shader source, fetched once. */
function loadShaderScript(win: Window): Promise<string> {
  shaderScript ??= win
    .fetch("/mirror/vendor/media-shader.js")
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
    .catch((error) => {
      shaderScript = null;
      throw error;
    });
  return shaderScript;
}

function installStableGodray(doc: Document) {
  const win = doc.defaultView;
  if (!win) return;

  doc.querySelectorAll<HTMLIFrameElement>(GODRAY_IFRAME).forEach((frame) => {
    if (frame.hasAttribute("data-fm-godray")) return;
    const first = godraySeen.get(frame);
    if (first === undefined) {
      godraySeen.set(frame, Date.now());
      // Revisit once hydration has had its chance to replace this node.
      win.setTimeout(() => installStableGodray(doc), GODRAY_SETTLE_MS + 50);
      return;
    }
    if (Date.now() - first < GODRAY_SETTLE_MS || !frame.isConnected) return;

    godrayOriginal.set(frame, frame.getAttribute("src") ?? "");
    loadGodray(frame, win);
  });

  if (!godrayResize.has(doc)) {
    godrayResize.add(doc);
    let timer = 0;
    win.addEventListener("resize", () => {
      win.clearTimeout(timer);
      timer = win.setTimeout(() => {
        // Only a window grown past the drawn width uncovers an edge.
        doc.querySelectorAll<HTMLIFrameElement>(GODRAY_IFRAME).forEach((frame) => {
          const drawn = godrayWidth.get(frame);
          if (drawn !== undefined && win.innerWidth > drawn) loadGodray(frame, win);
        });
      }, 250);
    });
  }
}

const godrayOriginal = new WeakMap<HTMLIFrameElement, string>();
const godrayWidth = new WeakMap<HTMLIFrameElement, number>();
const godrayResize = new WeakSet<Document>();

function loadGodray(frame: HTMLIFrameElement, win: Window) {
  frame.setAttribute("data-fm-godray", "loading");
  loadShaderScript(win).then(
    (script) => applyGodray(frame, win, script),
    // Without our copy, fall back to the export's own iframe as it was.
    () => frame.setAttribute("data-fm-godray", "ready"),
  );
}

function applyGodray(frame: HTMLIFrameElement, win: Window, script: string) {
  const src = godraySource(godrayOriginal.get(frame) ?? "", win, script);
  if (!src || !frame.isConnected) {
    frame.setAttribute("data-fm-godray", "ready");
    return;
  }
  godrayWidth.set(frame, Math.max(GODRAY_MIN_W, Math.ceil(win.innerWidth)));
  frame.addEventListener(
    "load",
    // A few frames for the shader's first draw before fading in.
    () => win.setTimeout(() => frame.setAttribute("data-fm-godray", "ready"), 120),
    { once: true },
  );
  // Script inlined into a data: URL: no request when the frame loads, and the
  // shader keeps an opaque origin so its WebGL work stays off the page's own
  // main thread (a same-origin srcdoc frame hung the page).
  frame.setAttribute("src", src);
}

/**
 * 16 — testimonial cards: hover lift and a link to the YTJobs profile.
 *
 * The lift and blue glow reuse the process timeline cards' hover so the two
 * sections feel the same. Applied to the inner card, never to the -container
 * wrapper Framer animates in, so the entrance animation is untouched.
 */
const REVIEWS_URL = "https://ytjobs.co/talent/profile/526454?r=757";
const REVIEW_CARD = '[data-framer-name="Testimonial content card"]';

function patchReviewCards(doc: Document) {
  doc.querySelectorAll<HTMLElement>(REVIEW_CARD).forEach((card) => {
    if (card.getAttribute("data-fm-review-link") === "on") return;
    card.setAttribute("data-fm-review-link", "on");
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");

    const open = () =>
      doc.defaultView?.open(REVIEWS_URL, "_blank", "noopener,noreferrer");
    card.addEventListener("click", (event) => {
      event.preventDefault();
      open();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open();
    });
  });

  if (doc.getElementById("fm-review-hover") || !doc.head) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-review-hover";
  sheet.textContent = `
[data-fm-review-link]{
  cursor:pointer;
  transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease,filter .35s ease !important;
}
@media (hover:hover){
  [data-fm-review-link]:hover{
    transform:translateY(-6px) !important;
    box-shadow:0 0 0 1px rgba(109,188,255,.72),0 0 28px rgba(0,100,255,.24),0 12px 34px rgba(0,0,0,.24) !important;
    filter:brightness(1.06);
  }
}
[data-fm-review-link]:focus-visible{
  outline:2px solid rgba(109,188,255,.9);
  outline-offset:3px;
}`;
  doc.head.appendChild(sheet);
}

/**
 * 17 — let the portfolio button's glow show in full.
 *
 * "View More Work" glows (0 14px 38px on hover) right at the bottom of the
 * Thumbnail Works section, which clips its overflow and whose bottom padding
 * is barely as deep as the shadow — so the glow was cut off in a hard line,
 * and the next section could paint over what was left. Clipping stays on the
 * horizontal axis (the ticker scrolls wider than the page); vertically the
 * glow may spill out, and the button sits above the following section.
 */
function installWorkButtonGlowFix(doc: Document) {
  if (doc.getElementById("fm-work-glow") || !doc.head) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-work-glow";
  sheet.textContent = `
.framer-ZShEI .framer-1ccrsvh{
  overflow-x:clip !important;
  overflow-y:visible !important;
}
.framer-ZShEI .framer-14p5mbx-container{
  z-index:2 !important;
}`;
  doc.head.appendChild(sheet);
}

/**
 * 18 — the contact cards read alike: a grey label over a black value.
 *
 * The export gives only the email card's label its grey; the Instagram and
 * Quick chat (WhatsApp) labels fell back to black, so the three cards looked
 * like different components. Suffix selectors also cover the names
 * `patchQuickChatCard` swaps in.
 */
function installContactCardText(doc: Document) {
  if (doc.getElementById("fm-contact-card-text") || !doc.head) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-contact-card-text";
  sheet.textContent = `
[data-framer-name$="Contact Card"] [data-framer-name$=" Label"] .framer-text{
  --framer-text-color:rgba(0, 0, 0, 0.58) !important;
}
[data-framer-name$="Contact Card"] [data-framer-name$=" Value"] .framer-text{
  --framer-text-color:rgb(0, 0, 0) !important;
}`;
  doc.head.appendChild(sheet);
}

/**
 * 18 — the third process step is now the "text guide" (a shared document), so
 * its target icon becomes a document. Drawn with the same stroke variables the
 * export's icon symbols use, so colour and weight match the other five.
 */
const DOC_ICON_PATHS = [
  "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z",
  "M14 3v5h5",
  "M9 13h6",
  "M9 17h4",
];

function patchTextGuideIcon(doc: Document) {
  // Every breakpoint variant renders its own copy of the card.
  doc
    .querySelectorAll<SVGSVGElement>(
      '[data-framer-name="Process Card — Analyze"] svg[data-framer-name="Process Icon"]',
    )
    .forEach((icon) => replaceWithDocIcon(doc, icon));
}

function replaceWithDocIcon(doc: Document, icon: SVGSVGElement) {
  if (icon.getAttribute("data-fm-icon") === "doc") return;
  icon.setAttribute("data-fm-icon", "doc");
  icon.replaceChildren(
    ...DOC_ICON_PATHS.map((d) => {
      const path = doc.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "transparent");
      path.setAttribute("stroke", "var(--21h8s6, rgb(0, 0, 0))");
      path.setAttribute("stroke-width", "var(--pgex8v, 1.5)");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      return path;
    }),
  );
}

/**
 * 19 — the hero glow belongs to the text.
 *
 * The export's "glow" was a fixed 560×190 blue ellipse painted into the hero's
 * background, placed at a percentage of the hero's height: it never matched
 * the headline's width and drifted as the viewport changed. The ellipse goes;
 * the headline's blue words glow instead, in the god-ray's own blues (its
 * shader colours are rgb(0,105,255) and rgb(179,215,255)), so text and rays
 * read as one light. The contact heading's blue words glow the same way.
 */
const GODRAY_GLOW =
  "0 0 18px rgba(64,140,255,.55),0 0 46px rgba(0,105,255,.38),0 0 90px rgba(0,105,255,.22)";

function installTextGlow(doc: Document) {
  if (doc.getElementById("fm-text-glow") || !doc.head) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-text-glow";
  sheet.textContent = `
.framer-ZShEI .framer-fdvaze{
  background:#030508 !important;
}
.framer-ZShEI .framer-tseaf4 h1 > span:last-child{
  text-shadow:${GODRAY_GLOW};
}
.framer-ZShEI .framer-q09i75 h3 > span:last-child{
  text-shadow:0 0 22px rgba(64,140,255,.45),0 0 60px rgba(0,105,255,.25);
}
.framer-ZShEI .framer-q09i75 h3{
  text-wrap:balance;
}

/* "Tem um vídeo em mente?" chip: the flat white pill becomes the site's dark
   glass, sized like the hero's "Disponível agora" badge, led by a bare play
   glyph that breathes. Only transform and opacity animate (compositor-only);
   no backdrop blur, which would have to be recomputed every frame. */
@keyframes fm-play-breathe{
  0%,100%{transform:translateX(0) scale(.9);opacity:.7;}
  50%{transform:translateX(1.5px) scale(1.06);opacity:1;}
}
.framer-ZShEI .framer-19x4q0q .framer-mo9liq{
  --border-color:rgba(140,190,255,.3) !important;
  background:linear-gradient(180deg,rgba(32,99,171,.4) 0%,rgba(32,99,171,0) 100%),rgba(4,10,22,.78) !important;
  box-shadow:inset 0 1px 0 rgba(200,225,255,.12),0 6px 22px rgba(0,105,255,.18) !important;
  gap:7px !important;
  padding:8px 14px 8px 12px !important;
  border-radius:999px !important;
}
.framer-ZShEI .framer-19x4q0q .framer-mo9liq::before{
  content:"";
  flex:none;
  width:10px;
  height:10px;
  background:url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M2 1.2v7.6L8.6 5z" fill="#6aa6ff"/></svg>')}") center/contain no-repeat;
  filter:drop-shadow(0 0 3px rgba(64,140,255,.85));
  will-change:transform,opacity;
  animation:fm-play-breathe 2.8s ease-in-out infinite;
}
.framer-ZShEI .framer-19x4q0q .framer-mo9liq p{
  --framer-text-color:rgba(233,242,255,.94) !important;
  --framer-font-size:13px !important;
  --framer-line-height:1em !important;
}
.framer-ZShEI .framer-19x4q0q .framer-mo9liq p > span{
  --framer-text-color:rgb(106,166,255) !important;
  text-shadow:0 0 10px rgba(0,105,255,.55);
}
@media (prefers-reduced-motion:reduce){
  .framer-ZShEI .framer-19x4q0q .framer-mo9liq::before{animation:none;opacity:1;}
}}`;
  doc.head.appendChild(sheet);
}

/**
 * 20 — "Contatos" (nav) and "Enviar" (form) hover like "Contrate Agora".
 *
 * Framer gives the hero CTA a hover variant that turns it white with dark
 * blue text (#062b78), a near-white border and a lower, wider glow
 * (0 10px 38px). The nav CTA only scaled up and the submit button had no
 * hover of its own; both now take that exact white state, eased in.
 */
const WHITE_HOVER = ".framer-8ttqe7, .framer-uNypv";

function installWhiteButtonHover(doc: Document) {
  if (doc.getElementById("fm-white-hover") || !doc.head) return;
  const hovered = WHITE_HOVER.split(", ").map((c) => `${c}:hover`);
  const sheet = doc.createElement("style");
  sheet.id = "fm-white-hover";
  sheet.textContent = `
${WHITE_HOVER}{
  transition:background-color .3s ease,box-shadow .3s ease !important;
}
${WHITE_HOVER.split(", ").map((c) => `${c} .framer-text`).join(",")}{
  transition:color .3s ease;
}
@media (hover:hover){
  ${hovered.join(",")}{
    --border-color:rgba(255,255,255,.96) !important;
    background:#fff !important;
    box-shadow:0 10px 38px 0 rgba(80,177,255,.42) !important;
    transform:none !important;
  }
  ${hovered.map((c) => `${c} .framer-text`).join(",")}{
    --framer-text-color:rgb(6,43,120) !important;
    color:rgb(6,43,120) !important;
  }
}`;
  doc.head.appendChild(sheet);
}

/**
 * 21 — About copy: readable word gaps and an on-brand signature.
 *
 * The paragraph is one inline-block span per word; Stack Sans Text's space is
 * only ~0.23em (4.2px at 18px), so between those boxes the words read as run
 * together. The signature line under the name was the only Inter Medium
 * Italic on the site; it now uses Stack Sans Text like the paragraph.
 */
function installAboutTypography(doc: Document) {
  if (doc.getElementById("fm-about-type") || !doc.head) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-about-type";
  sheet.textContent = `
.framer-ZShEI .framer-qllq3i p{
  word-spacing:.14em;
}
.framer-ZShEI .framer-hbwn49 p{
  --framer-font-family:"Stack Sans Text","Stack Sans Text Placeholder",sans-serif !important;
  --framer-font-style:normal !important;
  --framer-font-weight:500 !important;
  font-family:"Stack Sans Text","Stack Sans Text Placeholder",sans-serif !important;
  font-style:normal !important;
  font-weight:500 !important;
  letter-spacing:.01em;
}`;
  doc.head.appendChild(sheet);
}

function patchMirror(doc: Document) {
  hideFramerBadge(doc);
  installStableGodray(doc);
  patchContractNowCta(doc);
  patchQuickChatCard(doc);
  patchContactForm(doc);
  patchSeeWorksLink(doc);
  patchAnchorScrolling(doc);
  patchFooterSocials(doc);
  patchNavLayering(doc);
  installNavCollapse(doc);
  patchTestimonialCards(doc);
  addBourickReview(doc);
  patchTestimonialAvatars(doc);
  patchReviewCards(doc);
  installWorkButtonGlowFix(doc);
  patchTextGuideIcon(doc);
  installTextGlow(doc);
  installWhiteButtonHover(doc);
  installAboutTypography(doc);
  installContactCardText(doc);
  rerunLostProcessTimeline(doc);
  installRevealRepair(doc);
  installSeamlessButtonSweep(doc);
  alignTimelineDots(doc);
  installGrain(doc);
  installButtonSheenFix(doc);
  alignNavHighlight(doc);
  // Last, so it also covers text the patches above put on the page.
  installI18n(doc);
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
        src="/mirror/index.html?v=godray-stable-1"
        title="Flávio Morais — Thumbnail and visual designer"
        onLoad={attachToMirror}
      />
    </main>
  );
}
