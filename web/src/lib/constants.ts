import type { Plan } from "./types";

export const marketingSteps = [
  "Плейлист или папка медиа выбирается в приложении.",
  "Контент упаковывается в ZIP и отправляется на backend.",
  "Сайт показывает карточку архива и отдает скачивание по ссылке.",
];

export const pricingCards: Array<{
  key: Plan | "PAYG";
  title: string;
  price: string;
  description: string;
  highlight?: boolean;
  features: string[];
}> = [
  {
    key: "FREE",
    title: "Free",
    price: "0 EUR",
    description: "Стартовый режим для одноразового обмена ZIP.",
    features: [
      "До 1 ГБ на архив",
      "Одноразовая ссылка",
      "Хранение 24 часа",
      "1 активная ссылка",
    ],
  },
  {
    key: "PAYG",
    title: "Pay-as-you-go",
    price: "от 0.50 EUR",
    description: "Разовые апгрейды без подписки.",
    features: [
      "+1 ГБ за 0.50 EUR",
      "+5 ГБ за 2 EUR",
      "+10 ГБ за 3.5 EUR",
      "Многоразовая ссылка за 0.99 EUR",
      "+7 / +30 дней хранения",
    ],
  },
  {
    key: "PRO",
    title: "PRO",
    price: "4.99 EUR / месяц",
    description: "Основной рабочий тариф для активного шаринга.",
    highlight: true,
    features: [
      "До 10 ГБ на архив",
      "Многоразовые ссылки",
      "Хранение до 30 дней",
      "До 20 активных публикаций",
    ],
  },
  {
    key: "PRO_PLUS",
    title: "PRO+",
    price: "8.99 EUR / месяц",
    description: "Максимум объёма и срока хранения.",
    features: [
      "До 50 ГБ на архив",
      "До 90 дней хранения",
      "Без практического лимита ссылок",
      "Для больших медиабиблиотек",
    ],
  },
];

export function buildApiUrl(path: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatBytes(value: number) {
  if (value === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** exponent;

  return `${amount.toFixed(amount >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
