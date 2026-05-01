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
  "Regalos",
  "Mascotas",
  "Familia",
  "Trabajo",
  "Cuidado personal",
  "Tecnología",
  "Finanzas",
  "Préstamos",
  "Otros",
] as const;

export const incomeCategories = ["Salario", "Freelance", "Inversiones", "Regalos", "Otros"] as const;

export const allCategories = [...incomeCategories, ...expenseCategories] as const;
