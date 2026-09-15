import IntlMessageFormat from "https://cdn.jsdelivr.net/npm/intl-messageformat@12.0.0/+esm";

export var SUPPORTED_LOCALES = ["en", "sv", "ar", "ru"];
export var DEFAULT_LOCALE = "en";

export var CURRENCY_CODES = [
  "CAD",
  "USD",
  "GBP",
  "THB",
  "AUD",
  "JPY",
  "CHF",
  "SGD",
  "NZD",
  "MXN"
];

// Currency full names and number formatting aren't translated here —
// Intl.DisplayNames / toLocaleString handle those directly.
export var strings = {
  en: {
    wordmarkDescription: "Simple Rates",
    metaDescription:
      "A simple currency converter using European Central Bank reference rates.",
    stageAriaLabel:
      "Amount and base currency. Swipe or use arrow keys to change.",
    tableCurrency: "Currency",
    tableBuyingPower: "Buying power",
    tableCost: "Cost",
    costOf: "for {amount}",
    buyingLine: "{given} buys {bought}",
    costLine: "{given} costs {cost}",
    asOf: "as of {date}",
    footer: "Rates from the {ecbLink}, as of {date}",
    footerEcbName: "European Central Bank",
    liveLink: "See live rates →",
    selectedCount:
      "{count, plural, one {# currency selected} other {# currencies selected}}",
    currencySelected: "{currency} selected"
  },
  sv: {
    // "Enkel Kurs" is already Swedish; a translated parenthetical would be
    // redundant in this locale (unlike en/fr/etc., where it's the wordmark's
    // only translated part).
    wordmarkDescription: "",
    metaDescription:
      "En enkel valutaomvandlare baserad på Europeiska centralbankens referenskurser.",
    stageAriaLabel:
      "Belopp och basvaluta. Svep eller använd piltangenterna för att ändra.",
    tableCurrency: "Valuta",
    tableBuyingPower: "Köpkraft",
    tableCost: "Kostnad",
    costOf: "för {amount}",
    buyingLine: "{given} köper {bought}",
    costLine: "{given} kostar {cost}",
    asOf: "per {date}",
    footer: "Kurser från {ecbLink}, per {date}",
    footerEcbName: "Europeiska centralbanken",
    liveLink: "Se aktuella kurser →",
    selectedCount:
      "{count, plural, one {# valuta vald} other {# valutor valda}}",
    // "vald"/"valt" agrees with the currency noun's own gender (see
    // CURRENCY_GENDER below) — common for most, neuter for "pund" (GBP).
    currencySelected:
      "{gender, select, common {{currency} vald} neuter {{currency} valt} other {{currency} vald}}"
  },
  ar: {
    wordmarkDescription: "أسعار بسيطة",
    metaDescription:
      "محول عملات بسيط يستخدم أسعار الصرف المرجعية للبنك المركزي الأوروبي.",
    stageAriaLabel:
      "المبلغ والعملة الأساسية. اسحب أو استخدم مفاتيح الأسهم للتغيير.",
    tableCurrency: "العملة",
    tableBuyingPower: "القوة الشرائية",
    tableCost: "التكلفة",
    costOf: "مقابل {amount}",
    buyingLine: "{given} يشتري {bought}",
    costLine: "{given} يكلف {cost}",
    asOf: "اعتبارًا من {date}",
    footer: "أسعار الصرف من {ecbLink}، اعتبارًا من {date}",
    footerEcbName: "البنك المركزي الأوروبي",
    liveLink: "عرض الأسعار الحية ←",
    selectedCount:
      "{count, plural, zero {# عملة محددة} one {عملة واحدة محددة} two {عملتان محددتان} few {# عملات محددة} many {# عملة محددة} other {# عملة محددة}}",
    // All 10 currencies in this app's list happen to be masculine nouns in
    // Arabic (see CURRENCY_GENDER) — the feminine branch exists here for
    // correctness if a feminine-noun currency (e.g. Turkish lira, "ليرة")
    // is ever added, but nothing in the current list ever selects it.
    currencySelected:
      "{gender, select, masculine {{currency} مُختار} feminine {{currency} مُختارة} other {{currency} مُختار}}"
  },
  ru: {
    wordmarkDescription: "Простые курсы",
    metaDescription:
      "Простой конвертер валют на основе справочных курсов Европейского центрального банка.",
    stageAriaLabel:
      "Сумма и базовая валюта. Проведите пальцем или используйте клавиши со стрелками, чтобы изменить.",
    tableCurrency: "Валюта",
    tableBuyingPower: "Покупательная способность",
    tableCost: "Стоимость",
    costOf: "за {amount}",
    buyingLine: "{given} покупает {bought}",
    costLine: "{given} стоит {cost}",
    asOf: "по состоянию на {date}",
    footer: "Курсы от {ecbLink}, по состоянию на {date}",
    footerEcbName: "Европейского центрального банка",
    liveLink: "Смотреть текущие курсы →",
    selectedCount:
      "{count, plural, one {# валюта выбрана} few {# валюты выбрано} many {# валют выбрано} other {# валюты выбрано}}",
    // masculine/feminine/neuter agreement with the currency noun's own
    // gender — see CURRENCY_GENDER below. Most currency nouns default
    // masculine, but "иена" (JPY) is feminine and "песо" (MXN) is neuter.
    currencySelected:
      "{gender, select, masculine {{currency} выбран} feminine {{currency} выбрана} neuter {{currency} выбрано} other {{currency} выбран}}"
  }
};

// Grammatical gender of each currency's noun in a given locale — needed
// because ICU's `select` argument still requires the caller to supply
// which category applies; there's no Intl API that can derive gender from
// a value the way Intl.PluralRules derives plural category from a number.
export var CURRENCY_GENDER = {
  sv: {
    CAD: "common",
    USD: "common",
    GBP: "neuter",
    THB: "common",
    AUD: "common",
    JPY: "common",
    CHF: "common",
    SGD: "common",
    NZD: "common",
    MXN: "common"
  },
  ar: {
    CAD: "masculine",
    USD: "masculine",
    GBP: "masculine",
    THB: "masculine",
    AUD: "masculine",
    JPY: "masculine",
    CHF: "masculine",
    SGD: "masculine",
    NZD: "masculine",
    MXN: "masculine"
  },
  ru: {
    CAD: "masculine",
    USD: "masculine",
    GBP: "masculine",
    THB: "masculine",
    AUD: "masculine",
    JPY: "feminine",
    CHF: "masculine",
    SGD: "masculine",
    NZD: "masculine",
    MXN: "neuter"
  }
};

// Walks the full ordered navigator.languages list, not just the single
// top navigator.language value, so a user's second-ranked language still
// matches when their first isn't supported.
export function detectLocale(preferredLanguages) {
  var langs =
    preferredLanguages ||
    (typeof navigator !== "undefined" && navigator.languages) ||
    (typeof navigator !== "undefined" && navigator.language
      ? [navigator.language]
      : []);

  for (var i = 0; i < langs.length; i++) {
    var primary = langs[i].split("-")[0].toLowerCase();
    if (SUPPORTED_LOCALES.indexOf(primary) !== -1) return primary;
  }
  return DEFAULT_LOCALE;
}

export function t(locale) {
  return strings[locale] || strings[DEFAULT_LOCALE];
}

// Handles plain interpolation, plural, and gender select in one call,
// since all three are just ICU MessageFormat argument types.
export function format(locale, template, values) {
  return new IntlMessageFormat(template, locale).format(values);
}

export function currencyName(locale, code) {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code);
  } catch (e) {
    return code;
  }
}
