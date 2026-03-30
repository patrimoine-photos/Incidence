/* ==========================================================================
   Patrimoine Photos — mini-site statique (GitHub Pages)
   - Menu responsive (menu en haut / drawer mobile)
   - Active link state
   - Reveal animations (IntersectionObserver)
   - Before/After slider
   - YouTube embeds "légers" (chargement au clic)
   - Config centralisée : changez ici vos URLs (YouTube / Email)
   ========================================================================== */

const SITE = {
  // Chaîne YouTube (mettez l’URL de la chaîne)
  youtubeChannelUrl: "https://www.youtube.com/@VOTRE-CHAINE",

  // Email de contact
  email: "incidence.image@gmail.com",

};

(function init() {
  bindNav();
  setActiveNav();
  hydrateLinks();
  initTallyEmbeds();
  setYear();
  revealOnScroll();
  applyAccentCycle();
  initArticleCards();
  initBeforeAfter();
  initYouTube();
  initImageLightbox();
})();

function bindNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const body = document.body;
  const nav = document.querySelector("[data-nav]");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = body.getAttribute("data-nav-open") === "true";
    body.setAttribute("data-nav-open", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  // Close menu when clicking a link (mobile)
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    if (window.matchMedia("(max-width: 1240px)").matches) {
      body.setAttribute("data-nav-open", "false");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    body.setAttribute("data-nav-open", "false");
    toggle.setAttribute("aria-expanded", "false");
  });
}

function setActiveNav() {
  const links = Array.from(document.querySelectorAll(".nav__link[href]"));
  if (!links.length) return;

  const path = normalizePath(location.pathname);
  links.forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http")) return;

    // Resolve relative href to a comparable pathname
    const url = new URL(href, location.href);
    const hrefPath = normalizePath(url.pathname);

    // Special case: articles index folder
    const isArticlesIndex = href.includes("articles/index.html") && path.endsWith("/articles/");
    const exactMatch = hrefPath === path;
    if (exactMatch || isArticlesIndex) a.classList.add("is-active");
  });
}

function normalizePath(p) {
  // GitHub pages may serve /Incidence/ or /Incidence/index.html
  return p
    .replace(/index\.html$/i, "")
    .replace(/\/+$/g, "/");
}

function hydrateLinks() {
  // Replace YouTube placeholder links
  document.querySelectorAll("[data-youtube-link]").forEach((a) => {
    a.setAttribute("href", SITE.youtubeChannelUrl);
  });

  // Replace email placeholders
  document.querySelectorAll("[data-email]").forEach((a) => {
    a.textContent = SITE.email;
    a.setAttribute("href", `mailto:${SITE.email}`);
  });

  document.querySelectorAll("[data-email-link]").forEach((a) => {
    a.textContent = SITE.email;
    a.setAttribute("href", `mailto:${SITE.email}`);
  });

  // Replace MyPortfolio link if needed
  // (You can add data-myportfolio on elements if you want to hydrate them too.)
}


function initTallyEmbeds() {
  const iframes = document.querySelectorAll("iframe[data-tally-src]");
  if (!iframes.length) return;

  const widgetScriptSrc = "https://tally.so/widgets/embed.js";

  const load = () => {
    if (typeof Tally !== "undefined") {
      Tally.loadEmbeds();
      return;
    }

    document
      .querySelectorAll("iframe[data-tally-src]:not([src])")
      .forEach((iframeEl) => {
        iframeEl.src = iframeEl.dataset.tallySrc;
      });
  };

  if (typeof Tally !== "undefined") {
    load();
    return;
  }

  const existing = document.querySelector(`script[src="${widgetScriptSrc}"]`);
  if (existing) {
    existing.addEventListener("load", load, { once: true });
    existing.addEventListener("error", load, { once: true });
    load();
    return;
  }

  const script = document.createElement("script");
  script.src = widgetScriptSrc;
  script.async = true;
  script.onload = load;
  script.onerror = load;
  document.body.appendChild(script);
}
function setYear() {
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
}

function revealOnScroll() {
  // Respect reduced motion
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  items.forEach((el) => io.observe(el));
}


function applyAccentCycle() {
  const accents = ["gold", "green", "blue", "red"];
  const selectors = [".kicker[data-accent-cycle]", ".hairline", ".eyebrow-mark[data-accent-cycle]"];

  if (document.body.dataset.page !== "home") {
    selectors.push(".section__head");
  }

  const nodes = Array.from(document.querySelectorAll(selectors.join(", ")));
  nodes.forEach((el, index) => {
    if (el.dataset.accent) return;
    el.dataset.accent = accents[index % accents.length];
  });
}

function initArticleCards() {
  const cards = Array.from(document.querySelectorAll("[data-article-card]"));
  if (!cards.length) return;

  const palette = [
    { border: "rgba(201,163,74,.62)", hover: "rgba(201,163,74,.11)" },
    { border: "rgba(181,46,46,.62)", hover: "rgba(181,46,46,.1)" },
    { border: "rgba(52,103,193,.62)", hover: "rgba(52,103,193,.1)" },
    { border: "rgba(53,132,96,.62)", hover: "rgba(53,132,96,.1)" },
    { border: "rgba(114,121,132,.62)", hover: "rgba(114,121,132,.1)" },
  ];

  const shuffled = [...palette].sort(() => Math.random() - 0.5);

  cards.forEach((card, index) => {
    const accent = shuffled[index % shuffled.length];
    const link = card.querySelector(".card__title a[href]");
    if (!link) return;

    card.style.setProperty("--article-accent", accent.border);
    card.style.setProperty("--article-accent-soft", accent.hover);

    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Ouvrir l’article : ${link.textContent.trim()}`);

    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      link.click();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      link.click();
    });
  });
}

function initBeforeAfter() {
  const components = Array.from(document.querySelectorAll("[data-ba]"));
  if (!components.length) return;

  components.forEach((wrap) => {
    const stage = wrap.querySelector(".ba__stage");
    const range = wrap.querySelector("[data-ba-range]");
    if (!stage || !range) return;

    const setPos = () => {
      const val = Number(range.value || 50);
      stage.style.setProperty("--pos", `${val}%`);
    };

    range.addEventListener("input", setPos);
    setPos();
  });
}

function initYouTube() {
  const blocks = Array.from(document.querySelectorAll(".yt[data-youtube]"));
  if (!blocks.length) return;

  blocks.forEach((block) => {
    const btn = block.querySelector(".yt__btn");
    const id = block.getAttribute("data-youtube");
    if (!btn || !id) return;

    btn.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.width = "560";
      iframe.height = "315";
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      // YouTube can return Error 153 when no referrer is sent.
      iframe.referrerPolicy = "strict-origin-when-cross-origin";

      // "nocookie" for privacy
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;

      // Replace block content
      block.innerHTML = "";
      block.appendChild(iframe);
    }, { once: true });
  });
}

function initImageLightbox() {
  const figures = Array.from(document.querySelectorAll(".thumb-duo figure"));
  if (!figures.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image agrandie">
      <button class="lightbox__close" type="button" aria-label="Fermer l'image agrandie">Fermer</button>
      <figure class="lightbox__figure">
        <img class="lightbox__image" alt="">
        <figcaption class="lightbox__caption"></figcaption>
      </figure>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".lightbox__image");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");
  const closeButton = lightbox.querySelector(".lightbox__close");
  let previousFocus = null;

  const closeLightbox = () => {
    if (lightbox.hidden) return;

    lightbox.hidden = true;
    document.body.removeAttribute("data-lightbox-open");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxCaption.textContent = "";

    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  };

  const openLightbox = (figure) => {
    const image = figure.querySelector("img");
    if (!image) return;

    previousFocus = document.activeElement;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "";
    lightboxCaption.textContent = image.alt || "";
    lightbox.hidden = false;
    document.body.setAttribute("data-lightbox-open", "true");
    closeButton.focus();
  };

  figures.forEach((figure) => {
    const image = figure.querySelector("img");
    if (!image) return;

    figure.classList.add("is-zoomable");
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-haspopup", "dialog");
    figure.setAttribute("aria-label", `Agrandir l'image : ${image.alt || "aperçu"}`);

    figure.addEventListener("click", () => openLightbox(figure));
    figure.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openLightbox(figure);
    });
  });

  closeButton.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}
