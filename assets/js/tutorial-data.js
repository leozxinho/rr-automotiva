/* ============================================================
   RR Studio Details — Tutorial "Como funciona"
   10 etapas: intro + 8 serviços (carrossel) + orçamento.
   Edite os textos aqui; não toque em tutorial.js.
   ============================================================ */

var TUTORIAL_DATA = {
  steps: [
    /* ── 1. Intro ─────────────────────────────────────────── */
    {
      id: 1,
      title: "Bem-vindo!",
      target: "#servicos",
      targetLabel: "seção de serviços",
      audio: null,
      timestamps: null,
      phrases: [
        "Olá! Seja bem-vindo à RR Studio Details.",
        "Temos 8 serviços de estética automotiva, cada um feito com cuidado e atenção a cada detalhe.",
        "Vou te mostrar cada serviço, o que está incluso e o prazo. Vamos lá!"
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 12l4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9L32 37.4l-9.8 5.1 1.9-10.9L17 24.7l10.9-1.6z"/><circle cx="32" cy="49" r="2" fill="currentColor" stroke="none"/><line x1="32" y1="43" x2="32" y2="46"/></svg>`
    },

    /* ── 2. Lavagem Geral ─────────────────────────────────── */
    {
      id: 2,
      title: "Lavagem Geral",
      target: ".spin-card[data-active=\"true\"]",
      targetLabel: "card de lavagem geral",
      carouselIndex: 0,
      audio: null,
      timestamps: null,
      phrases: [
        "A Lavagem Geral é a nossa limpeza técnica completa do exterior.",
        "Usamos a técnica dos dois baldes para não arranhar a pintura, com atenção especial às rodas, caixas de roda e frisos.",
        "O serviço termina com cera de proteção aplicada. É feito no mesmo dia!"
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 38c4-10 30-10 34 0"/><path d="M8 42l4-8h40l4 8"/><rect x="6" y="42" width="52" height="10" rx="4"/><circle cx="19" cy="42" r="4" fill="currentColor" stroke="none"/><circle cx="45" cy="42" r="4" fill="currentColor" stroke="none"/><path d="M28 20c0-4 8-4 8 0s-8 4-8 8"/></svg>`
    },

    /* ── 3. Higienização Completa ─────────────────────────── */
    {
      id: 3,
      title: "Higienização Completa",
      target: ".spin-card[data-active=\"true\"]",
      targetLabel: "card de higienização",
      carouselIndex: 1,
      audio: null,
      timestamps: null,
      phrases: [
        "A Higienização Completa cuida do interior do seu carro de ponta a ponta.",
        "Bancos, carpetes, teto e forros são limpos com extratora e produtos específicos para cada material.",
        "Eliminamos manchas, odores e ácaros. Prazo: 1 dia."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="22" width="36" height="26" rx="3"/><path d="M22 22v-6a6 6 0 0 1 12 0"/><path d="M14 32h36"/><circle cx="32" cy="42" r="4"/></svg>`
    },

    /* ── 4. Polimento ─────────────────────────────────────── */
    {
      id: 4,
      title: "Polimento",
      target: ".spin-card[data-active=\"true\"]",
      targetLabel: "card de polimento",
      carouselIndex: 2,
      audio: null,
      timestamps: null,
      phrases: [
        "O Polimento corrige riscos, hologramas e marcas de lavagem da pintura.",
        "Usamos máquinas com corte e refino para devolver profundidade à cor e reflexo de espelho.",
        "É o serviço mais técnico da casa. Prazo: 1 a 2 dias."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="18"/><path d="M32 14v4M32 46v4M14 32h4M46 32h4"/><circle cx="32" cy="32" r="8"/></svg>`
    },

    /* ── 5. Enceramento ───────────────────────────────────── */
    {
      id: 5,
      title: "Enceramento",
      target: ".spin-card[data-active=\"true\"]",
      targetLabel: "card de enceramento",
      carouselIndex: 3,
      audio: null,
      timestamps: null,
      phrases: [
        "O Enceramento protege e dá brilho à pintura já corrigida.",
        "Aplicamos cera protetora que defende contra sol, chuva ácida e facilita a manutenção do carro.",
        "Ideal após o polimento. Feito em meio dia."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 44c0-8 24-8 24 0"/><path d="M16 48h32"/><path d="M24 20c2-6 14-6 16 0l2 8H22z"/><line x1="32" y1="28" x2="32" y2="44"/></svg>`
    },

    /* ── 6. PPF ───────────────────────────────────────────── */
    {
      id: 6,
      title: "PPF — Película de Proteção",
      target: ".spin-card[data-active=\"true\"]",
      targetLabel: "card de PPF",
      carouselIndex: 4,
      audio: null,
      timestamps: null,
      phrases: [
        "O PPF é a Película de Proteção de Pintura, invisível a olho nu.",
        "Aplicamos nas regiões mais vulneráveis do carro: soleiras, quinas de porta, concha e mídias.",
        "Protege o verniz original contra pedriscos e arranhões. Prazo: 1 dia."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 10l20 10v14c0 10-8 18-20 20C20 52 12 44 12 34V20z"/><path d="M23 32l6 6 12-12"/></svg>`
    },

    /* ── 7. Vitrificação ──────────────────────────────────── */
    {
      id: 7,
      title: "Vitrificação",
      target: ".spin-card[data-active=\"true\"]",
      targetLabel: "card de vitrificação",
      carouselIndex: 5,
      audio: null,
      timestamps: null,
      phrases: [
        "A Vitrificação aplica proteção cerâmica diretamente sobre a pintura.",
        "Depois de curada, a água escorre em bolhas, a sujeira sai fácil e o brilho é muito mais intenso.",
        "É a proteção de maior durabilidade. Cura em 24 horas."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 14c0 0-14 16-14 26a14 14 0 0 0 28 0C46 30 32 14 32 14z"/><path d="M24 42c2 4 6 6 10 6"/></svg>`
    },

    /* ── 8. Hidratação de Couro ───────────────────────────── */
    {
      id: 8,
      title: "Hidratação de Couro",
      target: ".spin-card[data-active=\"true\"]",
      targetLabel: "card de hidratação de couro",
      carouselIndex: 6,
      audio: null,
      timestamps: null,
      phrases: [
        "A Hidratação de Couro restaura a maciez dos bancos e do volante.",
        "Limpamos com produtos de pH adequado e aplicamos hidratante específico para couro automotivo.",
        "Previne rachaduras e mantém o interior como novo. Feito em meio dia."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="30" width="44" height="20" rx="6"/><path d="M10 36h44"/><path d="M22 30v-8a10 10 0 0 1 20 0v8"/></svg>`
    },

    /* ── 9. Restauração de Faróis ─────────────────────────── */
    {
      id: 9,
      title: "Restauração de Faróis",
      target: ".spin-card[data-active=\"true\"]",
      targetLabel: "card de restauração de faróis",
      carouselIndex: 7,
      audio: null,
      timestamps: null,
      phrases: [
        "A Restauração de Faróis devolve a transparência dos faróis amarelados ou opacos.",
        "Fazemos lixamento progressivo, polimento e aplicamos verniz com proteção UV.",
        "Resultado: mais luz na pista e visual renovado. Feito em meio dia."
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 32a18 18 0 0 1 18-18"/><path d="M14 32a18 18 0 0 0 18 18"/><path d="M32 14h6a14 14 0 0 1 0 36h-6"/><path d="M38 26l10-6M38 32h10M38 38l10 6"/></svg>`
    },

    /* ── 10. Orçamento ────────────────────────────────────── */
    {
      id: 10,
      title: "Monte seu Orçamento",
      target: "#orcamento",
      targetLabel: "formulário de orçamento",
      audio: null,
      timestamps: null,
      phrases: [
        "Pronto! Agora você conhece todos os nossos serviços.",
        "Para pedir seu orçamento, é simples: informe nome e veículo, escolha os serviços e selecione data e horário.",
        "A mensagem vai montada para o WhatsApp, e você confere tudo antes de enviar. O orçamento é gratuito!"
      ],
      icon: `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="16" y="10" width="32" height="46" rx="3"/><path d="M25 10v-3h14v3"/><line x1="24" y1="24" x2="40" y2="24"/><line x1="24" y1="32" x2="40" y2="32"/><line x1="24" y1="40" x2="33" y2="40"/><circle cx="20" cy="24" r="1.8" fill="currentColor" stroke="none"/><circle cx="20" cy="32" r="1.8" fill="currentColor" stroke="none"/><circle cx="20" cy="40" r="1.8" fill="currentColor" stroke="none"/></svg>`
    }
  ]
};
