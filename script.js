/* ==========================================================================
   RODÁ PLAY — script.js
   Sin backend, sin base de datos, sin login. Todo vive en el navegador.
   ========================================================================== */

/**
 * ÚNICO LUGAR PARA CONFIGURAR LOS JUEGOS.
 * Cada juego es una web independiente: "url" es la única conexión con Rodá Play.
 * Cuando publiques o cambies un juego, editá su "url" acá y listo.
 *
 * image: ruta a la imagen del juego (ver README → "Cómo agregar las imágenes").
 *        Mientras el archivo no exista, se muestra automáticamente el ícono
 *        de línea correspondiente, así la página nunca se ve rota.
 * icon:  clave del ícono de respaldo (ver ICONS más abajo).
 * tag:   texto corto opcional ("NUEVO"). Dejar "" para no mostrar etiqueta.
 */
const GAMES = [
  {
    id: "cruza-y-roda",
    name: "Rodá y Cruzá",
    description: "Guía al carrito hasta la meta esquivando los autos.",
    image: "assets/games/cruza-y-roda.png",
    tag: "",
    url: "https://rodaej.github.io/rodaycruza/"
  },
  {
    id: "te-contrataria",
    name: "¿Rodá te contrataría?",
    description: "Descubrí si tenés lo necesario para formar parte de Rodá.",
    image: "assets/games/te-contrataria.png",
    tag: "",
    url: "https://rodaej.github.io/rodatecontrataria/"
  },
  {
    id: "atrapa-y-roda",
    name: "Atrapá y Rodá",
    description: "Poné a prueba tus reflejos y atrapá todo lo que puedas.",
    image: "assets/games/atrapa-y-roda.png",
    tag: "NUEVO",
    url: "https://rodaej.github.io/atrapayroda/"
  },
  {
    id: "roda-run",
    name: "Súper Rodá Run",
    description: "Corré, saltá y superá todos los obstáculos.",
    image: "assets/games/roda-run.png",
    tag: "NUEVO",
    url: "https://rodaej.github.io/superrodarun/"
  }
];

/**
 * Se llama desde el atributo onerror de cada <img> del logo (header y footer).
 * Si no existe todavía assets/logo.png, reemplaza la imagen rota por la
 * rueda de Rodá en SVG, así nunca se ve un ícono de imagen quebrada.
 */
function handleLogoError(imgEl) {
  imgEl.outerHTML = LOGO_FALLBACK_SVG;
}

/* ---------- Render de las tarjetas ---------- */
function renderGames() {
  const grid = document.getElementById("gamesGrid");
  if (!grid) return;

  grid.innerHTML = GAMES.map((game) => `
    <article class="game-card" role="listitem" data-game="${game.id}">
      <div class="game-thumb">
        <img src="${game.image}" alt="${game.name}" loading="lazy"
             onerror="this.classList.add('is-broken')">

        ${game.tag ? `<span class="game-tag">${game.tag}</span>` : ""}
      </div>
      <div class="game-card-body">
        <h3 class="game-title">${game.name}</h3>
        <p class="game-desc">${game.description}</p>
        <div class="game-card-track"></div>
        <a class="btn btn-card" href="${game.url}" target="_blank" rel="noopener noreferrer"
           aria-label="Jugar ${game.name} (se abre en una pestaña nueva)">
          JUGAR
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M4 9h10M9 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </article>
  `).join("");
}

/* ---------- Aparición progresiva de las tarjetas al hacer scroll ---------- */
function initCardReveal() {
  const cards = document.querySelectorAll(".game-card");
  if (!("IntersectionObserver" in window)) {
    cards.forEach((c) => c.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          setTimeout(() => card.classList.add("is-visible"), i * 90);
          observer.unobserve(card);
        }
      });
    },
    { threshold: 0.2 }
  );
  cards.forEach((card) => observer.observe(card));
}

/* ---------- Menú de navegación en móvil ---------- */
function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}


const API_URL = "https://magicloops.dev/api/loop/201c3f67-355c-4556-af2a-a24dc3af23b3/run?";

fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().split(" ")[0],

    web: "Rodá Play",

    // Navegador
    datosDelNavegador: navigator.userAgent,
    sistema: navigator.userAgentData?.platform || navigator.platform,
    arquitectura: navigator.userAgentData?.architecture || "",
    idioma: navigator.language,
    idiomas: navigator.languages,
    cookies: navigator.cookieEnabled,
    online: navigator.onLine,

    // Dispositivo
    nombreDispositivo: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      ? "Mobile"
      : "Desktop",

    touch: navigator.maxTouchPoints > 0,

    // Pantalla
    resolucion: `${screen.width}x${screen.height}`,
    resolucionReal: `${screen.availWidth}x${screen.availHeight}`,
    pixelRatio: devicePixelRatio,
    orientacion: screen.orientation?.type || "",

    // Navegación
    url: window.location.href,
    referrer: document.referrer,

    // Campañas
    utmSource: new URLSearchParams(location.search).get("utm_source"),
    utmMedium: new URLSearchParams(location.search).get("utm_medium"),
    utmCampaign: new URLSearchParams(location.search).get("utm_campaign"),
    utmContent: new URLSearchParams(location.search).get("utm_content"),
    utmTerm: new URLSearchParams(location.search).get("utm_term"),

    // Ubicación/fecha
    zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Texto personalizado
    otrosDatos: "On Git Hub Pages"
  })
}).catch(() => {});

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderGames();
  initCardReveal();
  initNavToggle();
});