/* ============================================================
   RR Studio Details — Tutorial "Como funciona"
   10 etapas: intro + 8 serviços + orçamento.
   Edite os textos aqui; não toque em tutorial.js.
   ============================================================ */

var TUTORIAL_DATA = {
  steps: [
    /* ── 1. Intro ─────────────────────────────────────────── */
    {
      id: 1,
      title: "Bem-vindo!",
      target: ".hero-grid > div:first-child",
      targetLabel: "bloco de apresentação do hero",
      audio: "assets/audio/tour/tour-01.mp3",
      timestamps: [0.1, 5.132],
      phrases: [
        "Olá! Bem-vindo à RR Studio Details.",
        "Vou te mostrar os 8 serviços disponíveis e como pedir o orçamento."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 12l4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9L32 37.4l-9.8 5.1 1.9-10.9L17 24.7l10.9-1.6z"/><circle cx="32" cy="49" r="2" fill="currentColor" stroke="none"/><line x1="32" y1="43" x2="32" y2="46"/></svg>`
    },

    /* ── 2. Lavagem Geral ─────────────────────────────────── */
    {
      id: 2,
      title: "Lavagem Geral",
      target: ".svc[data-svc-idx=\"0\"]",
      targetLabel: "card de lavagem geral",
      audio: "assets/audio/tour/tour-02.mp3",
      timestamps: [0.1, 6.308],
      phrases: [
        "Limpeza técnica do exterior com a técnica dos dois baldes — sem arranhar a pintura.",
        "Atenção especial a rodas, caixas de roda e frisos."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 38c4-10 30-10 34 0"/><path d="M8 42l4-8h40l4 8"/><rect x="6" y="42" width="52" height="10" rx="4"/><circle cx="19" cy="42" r="4" fill="currentColor" stroke="none"/><circle cx="45" cy="42" r="4" fill="currentColor" stroke="none"/><path d="M28 20c0-4 8-4 8 0s-8 4-8 8"/></svg>`
    },

    /* ── 3. Higienização Completa ─────────────────────────── */
    {
      id: 3,
      title: "Higienização Completa",
      target: ".svc[data-svc-idx=\"1\"]",
      targetLabel: "card de higienização",
      audio: "assets/audio/tour/tour-03.mp3",
      timestamps: [0.1, 7.436],
      phrases: [
        "Interior completo: bancos, carpetes, teto e forros com extratora e produtos específicos.",
        "Elimina manchas, odores e ácaros."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="22" width="36" height="26" rx="3"/><path d="M22 22v-6a6 6 0 0 1 12 0"/><path d="M14 32h36"/><circle cx="32" cy="42" r="4"/></svg>`
    },

    /* ── 4. Polimento ─────────────────────────────────────── */
    {
      id: 4,
      title: "Polimento",
      target: ".svc[data-svc-idx=\"2\"]",
      targetLabel: "card de polimento",
      audio: "assets/audio/tour/tour-04.mp3",
      timestamps: [0.1, 5.684],
      phrases: [
        "Corrige riscos, hologramas e marcas de lavagem com corte e refino.",
        "Devolve profundidade à cor e reflexo de espelho."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="18"/><path d="M32 14v4M32 46v4M14 32h4M46 32h4"/><circle cx="32" cy="32" r="8"/></svg>`
    },

    /* ── 5. Enceramento ───────────────────────────────────── */
    {
      id: 5,
      title: "Enceramento",
      target: ".svc[data-svc-idx=\"3\"]",
      targetLabel: "card de enceramento",
      audio: "assets/audio/tour/tour-05.mp3",
      timestamps: [0.1, 6.764],
      phrases: [
        "Cera protetora sobre a pintura corrigida: mais brilho e proteção contra sol e chuva ácida.",
        "Ideal após o polimento."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 44c0-8 24-8 24 0"/><path d="M16 48h32"/><path d="M24 20c2-6 14-6 16 0l2 8H22z"/><line x1="32" y1="28" x2="32" y2="44"/></svg>`
    },

    /* ── 6. PPF ───────────────────────────────────────────── */
    {
      id: 6,
      title: "PPF — Película de Proteção",
      target: ".svc[data-svc-idx=\"4\"]",
      targetLabel: "card de PPF",
      audio: "assets/audio/tour/tour-06.mp3",
      timestamps: [0.1, 7.316],
      phrases: [
        "Película invisível nas regiões mais vulneráveis: soleiras, quinas de porta, concha e mídias.",
        "Protege o verniz original contra pedriscos e arranhões."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 10l20 10v14c0 10-8 18-20 20C20 52 12 44 12 34V20z"/><path d="M23 32l6 6 12-12"/></svg>`
    },

    /* ── 7. Vitrificação ──────────────────────────────────── */
    {
      id: 7,
      title: "Vitrificação",
      target: ".svc[data-svc-idx=\"5\"]",
      targetLabel: "card de vitrificação",
      audio: "assets/audio/tour/tour-07.mp3",
      timestamps: [0.1, 7.004],
      phrases: [
        "Proteção cerâmica sobre a pintura: água em bolhas, sujeira fácil de lavar e brilho intenso.",
        "A proteção de maior durabilidade."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 14c0 0-14 16-14 26a14 14 0 0 0 28 0C46 30 32 14 32 14z"/><path d="M24 42c2 4 6 6 10 6"/></svg>`
    },

    /* ── 8. Hidratação de Couro ───────────────────────────── */
    {
      id: 8,
      title: "Hidratação de Couro",
      target: ".svc[data-svc-idx=\"6\"]",
      targetLabel: "card de hidratação de couro",
      audio: "assets/audio/tour/tour-08.mp3",
      timestamps: [0.1, 5.468],
      phrases: [
        "Limpeza com pH adequado e hidratante específico para couro automotivo.",
        "Previne rachaduras e mantém volante e bancos como novos."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="30" width="44" height="20" rx="6"/><path d="M10 36h44"/><path d="M22 30v-8a10 10 0 0 1 20 0v8"/></svg>`
    },

    /* ── 9. Restauração de Faróis ─────────────────────────── */
    {
      id: 9,
      title: "Restauração de Faróis",
      target: ".svc[data-svc-idx=\"7\"]",
      targetLabel: "card de restauração de faróis",
      audio: "assets/audio/tour/tour-09.mp3",
      timestamps: [0.1, 5.684],
      phrases: [
        "Lixamento, polimento e verniz UV nos faróis amarelados ou opacos.",
        "Resultado: mais luz na pista e visual renovado."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 32a18 18 0 0 1 18-18"/><path d="M14 32a18 18 0 0 0 18 18"/><path d="M32 14h6a14 14 0 0 1 0 36h-6"/><path d="M38 26l10-6M38 32h10M38 38l10 6"/></svg>`
    },

    /* ── 10. Orçamento ────────────────────────────────────── */
    {
      id: 10,
      title: "Monte seu Orçamento",
      target: "#orcamento > .wrap",
      targetLabel: "formulário de orçamento",
      audio: "assets/audio/tour/tour-10.mp3",
      timestamps: [0.1, 6.14],
      phrases: [
        "Nome, veículo, serviços e data — tudo em 3 passos simples.",
        "A mensagem vai montada para o WhatsApp. Você confere antes de enviar. Orçamento gratuito!"
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="16" y="10" width="32" height="46" rx="3"/><path d="M25 10v-3h14v3"/><line x1="24" y1="24" x2="40" y2="24"/><line x1="24" y1="32" x2="40" y2="32"/><line x1="24" y1="40" x2="33" y2="40"/><circle cx="20" cy="24" r="1.8" fill="currentColor" stroke="none"/><circle cx="20" cy="32" r="1.8" fill="currentColor" stroke="none"/><circle cx="20" cy="40" r="1.8" fill="currentColor" stroke="none"/></svg>`
    }
  ]
};
