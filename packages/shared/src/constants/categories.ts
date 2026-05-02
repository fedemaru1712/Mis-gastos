export const expenseCategories = [
  "Comida",
  "Transporte",
  "Vivienda",
  "Suscripciones",
  "Ocio",
  "Salud",
  "Compras",
  "Educación",
  "Viajes",
  "Seguros",
  "Impuestos",
  "Coche",
  "Regalos",
  "Mascotas",
  "Familia",
  "Trabajo",
  "Cuidado personal",
  "Tecnología",
  "Telefonía",
  "Finanzas",
  "Préstamos",
  "Otros",
] as const;

export const incomeCategories = [
  "Salario",
  "Freelance",
  "Inversiones",
  "Regalos",
  "Intereses",
  "Promociones",
  "Otros",
] as const;

export const allCategories = [...incomeCategories, ...expenseCategories] as const;
