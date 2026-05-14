const categoryToneMap: Record<
  string,
  {
    dot: string;
    pill: string;
    text: string;
    chart: string;
  }
> = {
  comida: {
    dot: "#c98a5b",
    pill: "bg-[rgba(201,138,91,0.14)]",
    text: "text-[rgba(230,184,145,0.96)]",
    chart: "rgba(201,138,91,0.88)",
  },
  transporte: {
    dot: "#6f8eb5",
    pill: "bg-[rgba(111,142,181,0.14)]",
    text: "text-[rgba(179,198,225,0.96)]",
    chart: "rgba(111,142,181,0.88)",
  },
  vivienda: {
    dot: "#a39a8b",
    pill: "bg-[rgba(163,154,139,0.14)]",
    text: "text-[rgba(217,209,194,0.96)]",
    chart: "rgba(163,154,139,0.88)",
  },
  suscripciones: {
    dot: "#7e8492",
    pill: "bg-[rgba(126,132,146,0.14)]",
    text: "text-[rgba(201,206,216,0.96)]",
    chart: "rgba(126,132,146,0.88)",
  },
  ocio: {
    dot: "#b57ca1",
    pill: "bg-[rgba(181,124,161,0.14)]",
    text: "text-[rgba(230,192,219,0.96)]",
    chart: "rgba(181,124,161,0.88)",
  },
  salud: {
    dot: "#b56d72",
    pill: "bg-[rgba(181,109,114,0.14)]",
    text: "text-[rgba(232,190,194,0.96)]",
    chart: "rgba(181,109,114,0.88)",
  },
  compras: {
    dot: "#8f79b9",
    pill: "bg-[rgba(143,121,185,0.14)]",
    text: "text-[rgba(212,200,236,0.96)]",
    chart: "rgba(143,121,185,0.88)",
  },
  educacion: {
    dot: "#8b9a6c",
    pill: "bg-[rgba(139,154,108,0.14)]",
    text: "text-[rgba(211,221,191,0.96)]",
    chart: "rgba(139,154,108,0.88)",
  },
  viajes: {
    dot: "#7898a0",
    pill: "bg-[rgba(120,152,160,0.14)]",
    text: "text-[rgba(191,214,220,0.96)]",
    chart: "rgba(120,152,160,0.88)",
  },
  seguros: {
    dot: "#9b8f73",
    pill: "bg-[rgba(155,143,115,0.14)]",
    text: "text-[rgba(218,207,181,0.96)]",
    chart: "rgba(155,143,115,0.88)",
  },
  impuestos: {
    dot: "#b39763",
    pill: "bg-[rgba(179,151,99,0.14)]",
    text: "text-[rgba(228,212,176,0.96)]",
    chart: "rgba(179,151,99,0.88)",
  },
  coche: {
    dot: "#6d8595",
    pill: "bg-[rgba(109,133,149,0.14)]",
    text: "text-[rgba(190,206,216,0.96)]",
    chart: "rgba(109,133,149,0.88)",
  },
  regalos: {
    dot: "#b18a9b",
    pill: "bg-[rgba(177,138,155,0.14)]",
    text: "text-[rgba(228,203,213,0.96)]",
    chart: "rgba(177,138,155,0.88)",
  },
  mascotas: {
    dot: "#9d8662",
    pill: "bg-[rgba(157,134,98,0.14)]",
    text: "text-[rgba(222,206,180,0.96)]",
    chart: "rgba(157,134,98,0.88)",
  },
  familia: {
    dot: "#b08272",
    pill: "bg-[rgba(176,130,114,0.14)]",
    text: "text-[rgba(229,202,193,0.96)]",
    chart: "rgba(176,130,114,0.88)",
  },
  trabajo: {
    dot: "#7a8e86",
    pill: "bg-[rgba(122,142,134,0.14)]",
    text: "text-[rgba(197,214,207,0.96)]",
    chart: "rgba(122,142,134,0.88)",
  },
  "cuidado personal": {
    dot: "#b18d9d",
    pill: "bg-[rgba(177,141,157,0.14)]",
    text: "text-[rgba(228,207,216,0.96)]",
    chart: "rgba(177,141,157,0.88)",
  },
  tecnologia: {
    dot: "#7188a7",
    pill: "bg-[rgba(113,136,167,0.14)]",
    text: "text-[rgba(194,208,229,0.96)]",
    chart: "rgba(113,136,167,0.88)",
  },
  telefonia: {
    dot: "#8a909b",
    pill: "bg-[rgba(138,144,155,0.14)]",
    text: "text-[rgba(210,215,223,0.96)]",
    chart: "rgba(138,144,155,0.88)",
  },
  finanzas: {
    dot: "#6ea887",
    pill: "bg-[rgba(110,168,135,0.14)]",
    text: "text-[rgba(190,224,205,0.96)]",
    chart: "rgba(110,168,135,0.88)",
  },
  prestamos: {
    dot: "#8d8f9f",
    pill: "bg-[rgba(141,143,159,0.14)]",
    text: "text-[rgba(210,211,223,0.96)]",
    chart: "rgba(141,143,159,0.88)",
  },
  salario: {
    dot: "#6ea887",
    pill: "bg-[rgba(110,168,135,0.14)]",
    text: "text-[rgba(190,224,205,0.96)]",
    chart: "rgba(110,168,135,0.88)",
  },
  freelance: {
    dot: "#79a27c",
    pill: "bg-[rgba(121,162,124,0.14)]",
    text: "text-[rgba(198,223,200,0.96)]",
    chart: "rgba(121,162,124,0.88)",
  },
  inversiones: {
    dot: "#5f9e76",
    pill: "bg-[rgba(95,158,118,0.14)]",
    text: "text-[rgba(182,221,197,0.96)]",
    chart: "rgba(95,158,118,0.88)",
  },
  intereses: {
    dot: "#8fa86d",
    pill: "bg-[rgba(143,168,109,0.14)]",
    text: "text-[rgba(213,225,192,0.96)]",
    chart: "rgba(143,168,109,0.88)",
  },
  promociones: {
    dot: "#c29f67",
    pill: "bg-[rgba(194,159,103,0.14)]",
    text: "text-[rgba(233,216,184,0.96)]",
    chart: "rgba(194,159,103,0.88)",
  },
  otros: {
    dot: "#8f8f95",
    pill: "bg-[rgba(143,143,149,0.14)]",
    text: "text-[rgba(214,214,219,0.96)]",
    chart: "rgba(143,143,149,0.88)",
  },
};

const fallbackTone = {
  dot: "#8f8f95",
  pill: "bg-white/[0.06]",
  text: "text-white/85",
  chart: "rgba(143,143,149,0.88)",
};

function normalizeCategory(category: string) {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getCategoryTone(category: string) {
  return categoryToneMap[normalizeCategory(category)] ?? fallbackTone;
}
