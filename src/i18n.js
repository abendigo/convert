export var SUPPORTED_LOCALES = ["en", "sv", "ar", "ru"];
export var DEFAULT_LOCALE = "en";

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
    footer: "Rates from the {ecbLink}",
    footerEcbName: "European Central Bank",
    liveLink: "See live rates →",
    selectedCount: {
      one: "{count} currency selected",
      other: "{count} currencies selected"
    },
    theme: {
      light: "Light",
      dark: "Dark",
      device: "Use device setting"
    }
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
    footer: "Kurser från {ecbLink}",
    footerEcbName: "Europeiska centralbanken",
    liveLink: "Se aktuella kurser →",
    selectedCount: {
      one: "{count} valuta vald",
      other: "{count} valutor valda"
    },
    // "tema" is an ett-word (neuter) in Swedish, so the adjective takes the
    // neuter -t ending — "ljust"/"mörkt", not "ljus"/"mörk".
    theme: {
      light: "Ljust",
      dark: "Mörkt",
      device: "Använd enhetens inställning"
    }
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
    footer: "أسعار الصرف من {ecbLink}",
    footerEcbName: "البنك المركزي الأوروبي",
    liveLink: "عرض الأسعار الحية ←",
    selectedCount: {
      zero: "{count} عملة محددة",
      one: "عملة واحدة محددة",
      two: "عملتان محددتان",
      few: "{count} عملات محددة",
      many: "{count} عملة محددة",
      other: "{count} عملة محددة"
    },
    // Agrees with "الوضع" (mode), masculine — the base adjective form
    // needs no suffix here, unlike Russian's feminine "тема" below.
    theme: {
      light: "فاتح",
      dark: "داكن",
      device: "استخدام إعداد الجهاز"
    }
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
    footer: "Курсы от {ecbLink}",
    footerEcbName: "Европейского центрального банка",
    liveLink: "Смотреть текущие курсы →",
    selectedCount: {
      one: "{count} валюта выбрана",
      few: "{count} валюты выбрано",
      many: "{count} валют выбрано",
      other: "{count} валюты выбрано"
    },
    // Agrees with "тема" (theme), feminine — the -ая ending, unlike
    // Arabic's masculine "الوضع" above or Swedish's neuter "tema".
    theme: {
      light: "Светлая",
      dark: "Тёмная",
      device: "Как в системе"
    }
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

export function interpolate(template, values) {
  return template.replace(/\{(\w+)\}/g, function (match, key) {
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
  });
}

// forms is a map of CLDR plural category ("zero"/"one"/"two"/"few"/"many"/
// "other") to a template string. Not every locale defines every category
// (English only has one/other), so this always falls back to "other" —
// every locale must define that one.
export function pluralSelect(locale, count, forms) {
  var category = new Intl.PluralRules(locale).select(count);
  return forms[category] || forms.other;
}

export function currencyName(locale, code) {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code);
  } catch (e) {
    return code;
  }
}
