/**
 * English / Portuguese for the mirrored site.
 *
 * Language is chosen in this order:
 *   1. the visitor's own choice from the toggle (remembered in localStorage);
 *   2. Cloudflare's view of their location (`/cdn-cgi/trace`, `loc=BR`);
 *   3. a Brazilian timezone, when that endpoint isn't available (local dev);
 *   4. English.
 *
 * The export is English. Translation swaps text nodes in place and remembers
 * each node's original, so switching back restores the exact source text.
 */

export type Lang = "en" | "pt";

const STORAGE_KEY = "fm-lang";

const BRAZIL_TIMEZONES = new Set([
  "America/Sao_Paulo",
  "America/Araguaina",
  "America/Bahia",
  "America/Belem",
  "America/Boa_Vista",
  "America/Campo_Grande",
  "America/Cuiaba",
  "America/Eirunepe",
  "America/Fortaleza",
  "America/Maceio",
  "America/Manaus",
  "America/Noronha",
  "America/Porto_Velho",
  "America/Recife",
  "America/Rio_Branco",
  "America/Santarem",
]);

/** Strings the patches themselves put on the page. */
const UI: Record<string, Record<Lang, string>> = {
  sending: { en: "Sending…", pt: "Enviando…" },
  sent: { en: "✓ Sent!", pt: "✓ Enviado!" },
  tryAgain: { en: "Try again", pt: "Tente novamente" },
  whatsappAria: { en: "Quick chat on WhatsApp", pt: "Conversa rápida no WhatsApp" },
};

export const BOURICK_QUOTE_EN = '"Very creative and versatile. You can trust him!!"';

/**
 * Copy aligned with the commercial proposal (PROPOSTA THUMB): the export's
 * English is replaced where the proposal says it differently. Same keys as PT
 * — the export's source text. Word counts match the source wherever words are
 * individually highlighted or animated, so the emphasis lands on the
 * equivalent words.
 */
export const EN: Record<string, string> = {
  // Hero
  "Conversion-focused visuals crafted for creators, launches, and brands that need attention fast.":
    "Cinematic thumbnails strategically designed to grab attention and build your channel's brand.",

  // Process — the proposal's workflow: briefing, contract, text guide,
  // creation, alignment, delivery.
  "Our Thumbnail Desgin Process": "My Proven Work Process",
  "A simple, proven workflow to move from first message to ready-to-post visuals.":
    "From the first briefing to thumbnails ready to publish, every step is clear and organized.",
  "Reach Out": "Briefing",
  "Send the goal, deadline, and any examples you like.":
    "I send you a form about your channel, so I understand your audience and goals.",
  Approval: "Contract",
  "Once approved, the delivery window is locked in.":
    "A digital contract sets out every project detail, with deadlines and deliveries.",
  "Angle Check": "Text Guide",
  "The concept is shaped around audience, promise, and curiosity.":
    "A shared document centralizes your channel's references and ideas for total consistency.",
  "Design & Optimize": "Creation",
  "Composition, contrast, and hierarchy are tuned for speed.":
    "I develop the concept with cinematic composition, contrast, and hierarchy built to hold attention.",
  "Concept Preview": "Alignment",
  "A clear direction is shared before the final polish begins.":
    "You receive the concept for alignment; we review its visual impact and adjust if needed.",
  "Final files arrive ready to upload, test, or publish.":
    "The finished project arrives via Google Drive, ready to publish.",

  // About
  "Thumbnail-focused visual direction": "3+ years delivering creative solutions",
  "Hi, I'm Flávio Morais, Thumbnail Graphic Designer for YouTube":
    "Hi, I'm Flávio Morais, Thumbnail Designer specialized in YouTube",
  "I create high-quality compositions strategically designed to capture attention. I have proven experience in the gaming, finance, and technology sectors, creating narratives that drive real results.":
    "I create cinematic compositions strategically designed to capture attention. I have validated experience in the gaming, finance, and technology niches, crafting narratives that drive real results.",

  // FAQ
  "How fast can a visual be delivered?": "How do deadlines work?",
  "Most single visuals can be delivered within 24–48 hours, depending on complexity and feedback speed.":
    "Deadlines follow your monthly plan: 4, 8, or 12 thumbnails a month, with one to three deliveries a week. A single test thumbnail is delivered in 2 business days. The clock starts once payment clears, the briefing is filled in, and all materials (texts and images) are sent.",
  "Yes. Share your brand assets, references, and the visual direction you want to protect, and the work will be shaped to fit.":
    "Yes. The briefing and a shared text guide centralize your channel's references and ideas, so every thumbnail stays consistent with your brand.",
  "Every project includes a focused revision round so the final visual feels resolved, aligned, and ready to publish.":
    "Yes. Every thumbnail includes two free revisions, and spelling corrections are always free.",
  "A short brief, your deadline, brand assets, and any examples that capture the direction are enough to get started.":
    "The filled-in briefing and all the materials (texts and images). A digital contract then formalizes the details, deadlines, and deliveries.",

  // Contact
  "Send a short brief below replies usually land within 24 hours.":
    "Send a short message below and I'll reply with the briefing to get started.",
};

/**
 * English source phrase → Portuguese. Keys are the whitespace-normalised text
 * of a whole text block, so word-split headings translate as one phrase.
 */
export const PT: Record<string, string> = {
  // Hero — word counts match the source so the highlighted words stay blue.
  "Available now": "Disponível agora",
  "Elevate Your Reach. Grow Faster.": "Amplie Seu Alcance. Cresça Rápido.",
  "Conversion-focused visuals crafted for creators, launches, and brands that need attention fast.":
    "Thumbnails cinematográficas pensadas estrategicamente para prender a atenção e fortalecer sua marca.",
  "Contract Now": "Contrate Agora",
  "See Works": "Ver Trabalhos",
  "Scroll down": "Role para baixo",
  "to see projects": "para ver os projetos",

  // Work
  "Thumbnail Portfolio": "Portfólio de Thumbnails",
  "Works That Stop The Scroll": "Trabalhos Que Prendem a Atenção",
  "View More Work": "Ver Mais Trabalhos",

  // Process
  "Our Thumbnail Desgin Process": "Meu Processo de Trabalho",
  "A simple, proven workflow to move from first message to ready-to-post visuals.":
    "Do primeiro briefing à thumbnail pronta para publicar, cada etapa é clara e organizada.",
  "Reach Out": "Briefing",
  "Send the goal, deadline, and any examples you like.":
    "Te envio um formulário sobre o seu canal para compreender seu público e objetivos.",
  Approval: "Contrato",
  "Once approved, the delivery window is locked in.":
    "Envio um contrato digital com todos os detalhes do projeto, prazos e entregas.",
  "Angle Check": "Guia Textual",
  "The concept is shaped around audience, promise, and curiosity.":
    "Um documento compartilhado centraliza as referências e ideias do seu canal, garantindo total consistência.",
  "Design & Optimize": "Criação",
  "Composition, contrast, and hierarchy are tuned for speed.":
    "Desenvolvo o conceito com composição cinematográfica, contraste e hierarquia para prender a atenção.",
  "Concept Preview": "Alinhamento",
  "A clear direction is shared before the final polish begins.":
    "Te envio o conceito para alinhamento, avaliamos o impacto visual e ajustamos se for necessário.",
  Delivery: "Entrega",
  "Final files arrive ready to upload, test, or publish.":
    "Entrego o projeto finalizado via Google Drive, pronto para publicação.",

  // About
  "About Me": "Sobre Mim",
  "Behind the work": "Por trás do trabalho",
  "Thumbnail-focused visual direction": "3+ anos entregando soluções criativas",
  // Nine words, like the source: the last one sits on its own line.
  "Hi, I'm Flávio Morais, Thumbnail Graphic Designer for YouTube":
    "Sou Flávio Morais, Designer especializado em Thumbnails para YouTube",
  // Word 3 is set bold and words 5–6 blue in the source.
  "I create high-quality compositions strategically designed to capture attention. I have proven experience in the gaming, finance, and technology sectors, creating narratives that drive real results.":
    "Crio composições cinematográficas e estrategicamente pensadas para prender a atenção. Tenho experiência validada nos nichos de games, finanças e tecnologia, com narrativas que geram resultados reais.",
  "Thumbnail & visual designer": "Designer de thumbnails e visual",

  // Testimonials
  Testimonials: "Depoimentos",
  // Rendered with white-space:pre in a narrow card: keep the source line break.
  "Partners in different countries": "Parceiros em\ndiferentes países",
  '"Man, you nailed it, I think that was the work of yours I liked the most out of everything you’ve done for us; it was exactly what I had in mind, congratulations."':
    '"Cara, você acertou em cheio, acho que foi o trabalho seu de que mais gostei entre tudo o que você fez pra gente; era exatamente o que eu tinha em mente, parabéns."',
  '"Hi Flávio, your work is always great, thanks again 5/5 stars"':
    '"Oi Flávio, seu trabalho é sempre ótimo, obrigado de novo 5/5 estrelas"',
  [BOURICK_QUOTE_EN]: '"Muito criativo e versátil. Pode confiar!!"',
  '"Hi Flávio, is everything right? Dude, you made it, they were all very good, congratulations, that social media detail on the front, it was awesome"':
    '"Oi Flávio, tudo certo? Cara, você mandou bem, ficaram todas muito boas, parabéns, aquele detalhe das redes sociais na frente ficou incrível"',
  '"Cheers man, definitley be using you again. Well recommended by llama"':
    '"Valeu, cara, com certeza vou te contratar de novo. Muito bem recomendado pelo Llama"',
  '"That\'s great dude. You are a pro at what you do."':
    '"Ficou ótimo, cara. Você é profissional no que faz."',
  '"Versatility and above-average delivery times."':
    '"Versatilidade e prazos de entrega acima da média."',
  '"Flávio is unbelievable. Never have I worked with someone this tireless as myself. His turnaround time is unbelievable. I don\'t think he sleeps. He is the best editor out of the dozens that I\'ve worked with over the last two years. I wouldn\'t hesitate a minute or a second to use him again or recommend him if you\'re looking for great results in record speed."':
    '"O Flávio é inacreditável. Nunca trabalhei com alguém tão incansável quanto eu. O tempo de entrega dele é impressionante. Acho que ele não dorme. É o melhor editor entre as dezenas com quem trabalhei nos últimos dois anos. Eu não hesitaria nem um segundo em contratá-lo de novo ou recomendá-lo se você busca ótimos resultados em tempo recorde."',
  '"Great Designer!"': '"Ótimo designer!"',
  "See More Reviews": "Ver Mais Avaliações",

  // FAQ
  "Frequently Asked Questions": "Perguntas Mais Frequentes",
  "A few quick answers before the first message.":
    "Algumas respostas rápidas antes da primeira mensagem.",
  "How fast can a visual be delivered?": "Como funcionam os prazos?",
  "Can the style match existing branding?":
    "O estilo pode seguir a identidade visual existente?",
  "Are revisions included?": "As revisões estão incluídas?",
  "What should be sent before starting?": "O que devo enviar antes de começar?",
  // Answers only enter the DOM when an accordion opens; the patch pass re-runs
  // on that mutation, so they translate as they appear.
  "Most single visuals can be delivered within 24–48 hours, depending on complexity and feedback speed.":
    "Os prazos seguem o seu plano mensal: 4, 8 ou 12 thumbnails por mês, com uma a três entregas por semana. A thumb teste avulsa é entregue em 2 dias úteis. O prazo começa após a compensação do pagamento, a devolução do briefing preenchido e o envio de todos os materiais (textos e imagens).",
  "Yes. Share your brand assets, references, and the visual direction you want to protect, and the work will be shaped to fit.":
    "Sim. O briefing e um guia textual compartilhado centralizam as referências e ideias do seu canal, garantindo que cada thumbnail mantenha a consistência da sua marca.",
  "Every project includes a focused revision round so the final visual feels resolved, aligned, and ready to publish.":
    "Sim. Cada thumbnail inclui duas alterações gratuitas, e correções ortográficas são sempre isentas.",
  "A short brief, your deadline, brand assets, and any examples that capture the direction are enough to get started.":
    "O briefing preenchido e todos os materiais (textos e imagens). Em seguida, um contrato digital formaliza os detalhes, prazos e entregas.",

  // Contact
  "Have a video in mind?": "Tem um vídeo em mente?",
  "Let's make the next click impossible to ignore.":
    "Vamos tornar o próximo clique impossível de ignorar.",
  "Send a short brief below replies usually land within 24 hours.":
    "Envie uma mensagem abaixo e eu te respondo com o briefing para começarmos.",
  "Hit me up wherever you’re most comfortable:":
    "Fale comigo onde for mais confortável para você:",
  "Send an email": "Envie um e-mail",
  "Social inbox": "Redes sociais",
  "Quick chat": "Conversa rápida",
  Name: "Nome",
  Email: "E-mail",
  Message: "Mensagem",
  Submit: "Enviar",
  "Your name": "Seu nome",
  "name@example.com": "nome@exemplo.com",
  "Write here…": "Escreva aqui…",

  // Footer & nav
  "Your next viral visual starts here.": "Seu próximo visual viral começa aqui.",
  "© 2026 All Rights Reserved": "© 2026 Todos os direitos reservados",
  Navigation: "Navegação",
  Work: "Trabalhos",
  Process: "Processo",
  About: "Sobre",
  Socials: "Redes Sociais",
  // The nav CTA has a fixed width; keep it about as long as "Let’s Talk".
  "Let’s Talk": "Contatos",
};

function safeStorage(win: Window): Storage | null {
  try {
    return win.localStorage;
  } catch {
    return null;
  }
}

function storedLang(win: Window): Lang | null {
  const value = safeStorage(win)?.getItem(STORAGE_KEY);
  return value === "en" || value === "pt" ? value : null;
}

function timezoneLang(): Lang {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return BRAZIL_TIMEZONES.has(zone) ? "pt" : "en";
  } catch {
    return "en";
  }
}

async function cloudflareLang(win: Window): Promise<Lang | null> {
  try {
    const response = await win.fetch("/cdn-cgi/trace", { cache: "no-store" });
    if (!response.ok) return null;
    const match = /^loc=([A-Z]{2})$/m.exec(await response.text());
    return match ? (match[1] === "BR" ? "pt" : "en") : null;
  } catch {
    return null;
  }
}

const currentLang = new WeakMap<Document, Lang>();

export function langOf(doc: Document): Lang {
  return currentLang.get(doc) ?? "en";
}

export function ui(doc: Document, key: keyof typeof UI): string {
  return UI[key][langOf(doc)];
}

const originals = new WeakMap<Text, string>();
const placeholderOriginals = new WeakMap<Element, string>();

const normalise = (value: string) => value.replace(/\s+/g, " ").trim();

function textLeaves(root: Element): Text[] {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const leaves: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    const parent = text.parentElement;
    if (!parent || parent.closest("script,style,noscript,[data-fm-i18n-skip]")) {
      continue;
    }
    if (!originals.has(text)) originals.set(text, text.data);
    if (normalise(originals.get(text) ?? "")) leaves.push(text);
  }
  return leaves;
}

function write(text: Text, value: string) {
  if (text.data !== value) text.data = value;
}

function withEdges(original: string, core: string) {
  if (!core) return "";
  const lead = /^\s*/.exec(original)?.[0] ?? "";
  const trail = /\s*$/.exec(original)?.[0] ?? "";
  return lead + core + trail;
}

/** Spread a translated phrase across a block's text nodes, word by word. */
function distribute(leaves: Text[], translated: string) {
  const words = translated.split(" ").filter(Boolean);
  let cursor = 0;
  leaves.forEach((leaf, index) => {
    const original = originals.get(leaf) ?? "";
    const sourceWords = normalise(original).split(" ").filter(Boolean).length || 1;
    const take =
      index === leaves.length - 1
        ? words.length - cursor
        : Math.min(sourceWords, words.length - cursor);
    const chunk = words.slice(cursor, cursor + take).join(" ");
    cursor += take;
    write(leaf, withEdges(original, chunk));
  });
}

const BLOCK = '[data-framer-component-type="RichTextContainer"]';

function translateBlocks(doc: Document, lang: Lang) {
  // English has its own table too: the export's copy, rewritten in places.
  const table = lang === "pt" ? PT : EN;
  const blocks = Array.from(doc.querySelectorAll<HTMLElement>(BLOCK)).filter(
    (el) => !el.querySelector(BLOCK),
  );
  const covered = new Set<Text>();

  for (const block of blocks) {
    const leaves = textLeaves(block);
    if (!leaves.length) continue;
    leaves.forEach((leaf) => covered.add(leaf));

    const phrase = normalise(leaves.map((leaf) => originals.get(leaf)).join(" "));
    const whole = table[phrase];
    if (whole !== undefined) {
      if (leaves.length === 1) {
        write(leaves[0], withEdges(originals.get(leaves[0]) ?? "", whole));
      } else {
        distribute(leaves, whole);
      }
      continue;
    }
    // No phrase entry: fall back to translating each piece on its own.
    for (const leaf of leaves) {
      const original = originals.get(leaf) ?? "";
      const piece = table[normalise(original)];
      write(leaf, piece === undefined ? original : withEdges(original, piece));
    }
  }

  // Text outside Framer's rich-text blocks (buttons, labels, patch output).
  if (doc.body) {
    for (const leaf of textLeaves(doc.body)) {
      if (covered.has(leaf)) continue;
      const original = originals.get(leaf) ?? "";
      const piece = table[normalise(original)];
      write(leaf, piece === undefined ? original : withEdges(original, piece));
    }
  }

  doc.querySelectorAll<HTMLElement>("[placeholder]").forEach((field) => {
    if (!placeholderOriginals.has(field)) {
      placeholderOriginals.set(field, field.getAttribute("placeholder") ?? "");
    }
    const original = placeholderOriginals.get(field) ?? "";
    const next = table[normalise(original)] ?? original;
    if (field.getAttribute("placeholder") !== next) {
      field.setAttribute("placeholder", next);
    }
  });
}

function renderToggle(doc: Document, onPick: (lang: Lang) => void) {
  let toggle = doc.getElementById("fm-lang-toggle");
  if (!toggle && doc.body) {
    toggle = doc.createElement("div");
    toggle.id = "fm-lang-toggle";
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "Language / Idioma");
    toggle.setAttribute("data-fm-i18n-skip", "");
    toggle.style.cssText = [
      "position:fixed",
      "left:16px",
      "bottom:16px",
      "z-index:9999950",
      "display:flex",
      "gap:2px",
      "padding:4px",
      "border-radius:999px",
      "background:linear-gradient(180deg,rgba(32,99,171,0.38) 0%,rgba(171,171,171,0) 100%),rgba(2,5,11,0.6)",
      "border:1px solid rgba(179,214,255,0.17)",
      "backdrop-filter:blur(20px)",
      "-webkit-backdrop-filter:blur(20px)",
      'font:500 13px/1 "Geist","Geist Placeholder",system-ui,sans-serif',
    ].join(";");

    for (const [lang, label, name] of [
      ["en", "EN", "English"],
      ["pt", "PT", "Português"],
    ] as const) {
      const button = doc.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-label", name);
      button.setAttribute("data-lang", lang);
      button.style.cssText = [
        "border:0",
        "border-radius:999px",
        "padding:7px 11px",
        "cursor:pointer",
        "font:inherit",
        "letter-spacing:0.02em",
        "transition:background 160ms ease,color 160ms ease",
      ].join(";");
      button.addEventListener("click", () => onPick(lang));
      toggle.appendChild(button);
    }
    doc.body.appendChild(toggle);
  }

  toggle?.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    const active = button.getAttribute("data-lang") === langOf(doc);
    button.setAttribute("aria-pressed", String(active));
    button.style.background = active ? "rgb(179,215,255)" : "transparent";
    button.style.color = active ? "rgb(6,43,120)" : "rgba(221,235,255,0.72)";
  });
}

/**
 * Portuguese runs longer than some of the export's fixed-height text boxes.
 * The contact heading's wrapper is a fixed 336px with overflow:clip, so the
 * extra line was cut off; in Portuguese it may grow to fit.
 */
function ensureLayoutFixes(doc: Document) {
  if (doc.getElementById("fm-i18n-layout") || !doc.head) return;
  const sheet = doc.createElement("style");
  sheet.id = "fm-i18n-layout";
  sheet.textContent = `
:root[lang="pt-BR"] .framer-19x4q0q{
  height:auto !important;
  overflow:visible !important;
}`;
  doc.head.appendChild(sheet);
}

const installed = new WeakSet<Document>();
const pending = new WeakSet<Document>();

function apply(doc: Document, lang: Lang) {
  const win = doc.defaultView;
  const changed = langOf(doc) !== lang;
  currentLang.set(doc, lang);
  doc.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  ensureLayoutFixes(doc);
  translateBlocks(doc, lang);
  renderToggle(doc, (picked) => {
    if (win) safeStorage(win)?.setItem(STORAGE_KEY, picked);
    apply(doc, picked);
  });
  // Labels change width: let the nav and timeline re-measure themselves.
  if (changed && win) win.dispatchEvent(new win.Event("resize"));
}

/**
 * Install once per document, then re-apply the current language whenever the
 * patch pass runs (Framer re-renders text on hydration). Re-applies are
 * batched to one per frame.
 */
export function installI18n(doc: Document) {
  const win = doc.defaultView;
  if (!win) return;

  if (!installed.has(doc)) {
    installed.add(doc);
    const chosen = storedLang(win);
    apply(doc, chosen ?? timezoneLang());
    if (!chosen) {
      void cloudflareLang(win).then((located) => {
        if (located && !storedLang(win) && located !== langOf(doc)) {
          apply(doc, located);
        }
      });
    }
    return;
  }

  if (pending.has(doc)) return;
  pending.add(doc);
  win.requestAnimationFrame(() => {
    pending.delete(doc);
    apply(doc, langOf(doc));
  });
}
