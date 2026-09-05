"use client";

import { useCallback, useEffect, useRef } from "react";

const WHATSAPP_URL = "https://wa.me/5562991934046";
const WHATSAPP_DISPLAY = "+55 62 99193-4046";
const FORMSUBMIT_ENDPOINT =
  "https://formsubmit.co/ajax/flaviomorais820@gmail.com";

/** WhatsApp glyph, normalised to a 24x24 viewBox. */
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const SVG_NS = "http://www.w3.org/2000/svg";
const DONE = "data-fm-patched";

function whatsAppIcon(doc: Document, size: number): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("role", "presentation");
  svg.setAttribute("aria-hidden", "true");
  const path = doc.createElementNS(SVG_NS, "path");
  path.setAttribute("d", WHATSAPP_PATH);
  path.setAttribute("fill", "currentColor");
  svg.appendChild(path);
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
      card.setAttribute("aria-label", `Chat on WhatsApp: ${WHATSAPP_DISPLAY}`);
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
      icon.setAttribute("fill", "currentColor");
      icon.setAttribute("data-framer-name", "WhatsApp Icon");
      const path = doc.createElementNS(SVG_NS, "path");
      path.setAttribute("d", WHATSAPP_PATH);
      path.setAttribute("fill", "currentColor");
      icon.replaceChildren(path);
    }

    const value = card.querySelector<HTMLElement>(
      '[data-framer-name="Discord Value"] p, [data-framer-name="WhatsApp Value"] p',
    );
    if (value && value.textContent !== WHATSAPP_DISPLAY) {
      value.textContent = WHATSAPP_DISPLAY;
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
 * Native `scrollIntoView({ behavior: "smooth" })` is unreliable inside the
 * mirror — Framer's motion runtime cancels the browser's scroll animation, so
 * the call silently no-ops. Drive the scroll ourselves instead.
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

  const duration = Math.min(900, Math.max(320, Math.abs(distance) * 0.45));
  const startedAt = win.performance.now();
  const ease = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let settled = false;
  const step = (now: number) => {
    if (settled) return;
    const progress = Math.min(1, (now - startedAt) / duration);
    win.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) win.requestAnimationFrame(step);
    else settled = true;
  };
  win.requestAnimationFrame(step);

  // Animation frames can be starved (backgrounded tab, throttled renderer), in
  // which case the loop above never advances. Guarantee arrival regardless.
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

/** 5 — the footer social entry becomes WhatsApp, with an icon. */
function patchFooterSocials(doc: Document) {
  const slot = doc.querySelector<HTMLElement>(
    '[data-framer-name="Footer Discord"], [data-framer-name="Footer WhatsApp"]',
  );
  if (!slot || slot.getAttribute(DONE) === "footer") return;

  const link = slot.querySelector("a");
  if (!link) return;

  slot.setAttribute(DONE, "footer");
  slot.setAttribute("data-framer-name", "Footer WhatsApp");

  link.href = WHATSAPP_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "WhatsApp";

  const icon = whatsAppIcon(doc, 14);
  icon.style.display = "inline-block";
  icon.style.verticalAlign = "-2px";
  icon.style.marginRight = "6px";
  // insertBefore rather than prepend: @cloudflare/workers-types is in scope and
  // its HTMLRewriter prepend() signature otherwise wins the overload.
  link.insertBefore(icon, link.firstChild);
}

function patchMirror(doc: Document) {
  hideFramerBadge(doc);
  patchContractNowCta(doc);
  patchQuickChatCard(doc);
  patchContactForm(doc);
  patchSeeWorksLink(doc);
  patchAnchorScrolling(doc);
  patchFooterSocials(doc);
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
