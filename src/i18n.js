export var SUPPORTED_LOCALES = ["en", "sv"];
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
    footerRatesFrom: "Rates from the",
    footerEcbName: "European Central Bank",
    liveLink: "See live rates →"
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
    footerRatesFrom: "Kurser från",
    footerEcbName: "Europeiska centralbanken",
    liveLink: "Se aktuella kurser →"
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

export function currencyName(locale, code) {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code);
  } catch (e) {
    return code;
  }
}
