// Agrupamento de datas por mês para os gráficos (Etapa 2). Sempre no fuso
// America/Sao_Paulo: um pagamento revisado às 23h50 é 20h50 em UTC do dia
// seguinte só em horário de verão... na prática, ler em UTC pode jogar um
// pagamento de fim de mês pro mês errado. O Intl.DateTimeFormat abaixo lê a
// data já convertida pro fuso do Brasil antes de extrair ano/mês.
const SAO_PAULO_TZ = "America/Sao_Paulo";

const monthKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SAO_PAULO_TZ,
  year: "numeric",
  month: "2-digit",
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SAO_PAULO_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// "AAAA-MM" no fuso de São Paulo — chave estável pra agrupar Payments por mês.
export function monthKeySaoPaulo(date: Date): string {
  const parts = monthKeyFormatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  return `${year}-${month}`;
}

// "AAAA-MM" em UTC — pra colunas @db.Date (Service.serviceDate/dueDate), que
// o Prisma sempre devolve à meia-noite UTC representando só a data em si,
// sem hora de verdade (mesma observação de formatDate em format.ts). Ler
// essas colunas com monthKeySaoPaulo (acima) jogaria a data um dia pra
// trás: meia-noite UTC do dia 1 é 21h do dia 30 em São Paulo — dia 1
// cairia no mês anterior. monthKeySaoPaulo continua certo pra DateTime de
// verdade (Payment.reviewedAt); esta função é só pra data pura.
export function monthKeyUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

const MONTH_ABBREV_PT_BR = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

// Rótulo curto pt-BR pra uma chave "AAAA-MM" (ex.: "jul/26"). Montado à mão
// (em vez de Intl.DateTimeFormat) porque o formato de saída do "short month"
// em pt-BR varia entre runtimes ("jul." vs "jul de 26") — aqui o rótulo é
// sempre previsível.
export function monthLabelPtBR(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTH_ABBREV_PT_BR[month - 1]}/${String(year).slice(2)}`;
}

// Últimas N chaves de mês (mais antigo primeiro) terminando no mês atual em
// São Paulo — garante que meses sem nenhum pagamento apareçam como zero no
// gráfico em vez de simplesmente sumir.
export function lastNMonthKeys(n: number, now: Date = new Date()): string[] {
  const currentKey = monthKeySaoPaulo(now);
  const [currentYear, currentMonth] = currentKey.split("-").map(Number);

  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(currentYear, currentMonth - 1 - i, 1));
    keys.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    );
  }
  return keys;
}

// "Hoje" (ou "hoje + N dias") como data de calendário em São Paulo,
// devolvida já no formato que as colunas @db.Date usam (meia-noite UTC do
// dia certo — mesma convenção de parseServiceDate em clientes/actions.ts).
// Usado pelo lembrete de vencimento por push: rodar o cron perto da
// meia-noite UTC sem isso jogaria "hoje" pro dia errado em São Paulo.
export function saoPauloCalendarDateUTC(
  daysFromNow = 0,
  now: Date = new Date(),
): Date {
  const parts = dayKeyFormatter.formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value);
  const day = Number(parts.find((p) => p.type === "day")!.value);

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date;
}
