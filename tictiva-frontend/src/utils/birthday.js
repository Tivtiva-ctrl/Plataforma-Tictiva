// src/utils/birthday.js
export function calcNextBirthdayLabel(birthDateStr) {
  if (!birthDateStr) return { label: "—", daysToGo: null, nextDate: null };

  const [y, m, d] = birthDateStr.split("-").map(Number); // "YYYY-MM-DD"
  if (!y || !m || !d) return { label: "—", daysToGo: null, nextDate: null };

  const today = new Date();
  const thisYear = today.getFullYear();

  // Próximo cumpleaños (este año o el siguiente)
  let next = new Date(thisYear, m - 1, d);
  if (
    next.getMonth() !== m - 1 || // corrige fechas inválidas (ej. 31/02)
    next.getDate() !== d
  ) return { label: "—", daysToGo: null, nextDate: null };

  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = new Date(thisYear + 1, m - 1, d);
  }

  const oneDay = 24 * 60 * 60 * 1000;
  const daysToGo = Math.round((next - today.setHours(0,0,0,0)) / oneDay);

  // Formato “dd • mmm” (ej: 14 • ago)
  const day = String(next.getDate()).padStart(2, "0");
  const monthShort = next.toLocaleDateString("es-CL", { month: "short" }).replace(".", "");
  const label = `${day} • ${monthShort}`;

  return { label, daysToGo, nextDate: next };
}
