// Lógica pura de calendário (sem "use client" nem "server-only" de
// propósito — mesmo raciocínio de service-status.ts: dá pra testar direto,
// sem precisar de DOM nem contexto de servidor). Cálculo de qual dia da
// semana cai em qual data não depende de fuso horário — dia 1 de um mês é
// dia 1 em qualquer lugar do planeta, só a HORA muda.
export function buildMonthGrid(monthKey: string): (number | null)[] {
  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
