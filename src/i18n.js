// Locale dictionary — per REDESIGN.md's "Settings > Language" decision:
// the translation surface is a short, fixed list of UI strings (this file),
// not a general-purpose i18n library. Currency full names and number
// formatting are NOT here — those lean on the browser's own
// Intl.DisplayNames / toLocaleString (see currencyName() below), which
// cover far more locales than this app will ever hand-translate.
//
// Swedish is included from the start (not added later) — see REDESIGN.md's
// Domain name / Settings sections for why.
//
// CAUTION: the Swedish strings below are a first-pass draft, not a
// native-speaker review. REDESIGN.md is explicit that the wordmark
// description in particular needs real native-speaker translation, not a
// one-shot mechanical pass (that's exactly what broke "dead simple"
// earlier in that doc) — treat every string here as provisional until
// checked by a Swedish speaker before this ships.

export var SUPPORTED_LOCALES = ["en", "sv"];
export var DEFAULT_LOCALE = "en";

export var strings = {
  en: {
    // The wordmark itself ("Enkel Kurs") never translates — only this
    // parenthetical description does. See REDESIGN.md > Settings > Language.
    wordmarkDescription: "Simple Rates",
    metaDescription:
      "A simple currency converter using European Central Bank reference rates.",
    stageAriaLabel:
      "Amount and base currency. Swipe or use arrow keys to change.",
    tableCurrency: "Currency",
    tableBuyingPower: "Buying power",
    tableCost: "Cost",
    // caption under the Cost column's figure, e.g. "for 100 USD"
    costOf: function (formattedAmount) {
      return "for " + formattedAmount;
    },
    // snapshot page lines, e.g. "100 CAD buys $73.47 USD"
    buyingLine: function (formattedGiven, formattedBought) {
      return formattedGiven + " buys " + formattedBought;
    },
    // e.g. "100 USD costs $136.11 CAD"
    costLine: function (formattedGiven, formattedCost) {
      return formattedGiven + " costs " + formattedCost;
    },
    // footer/snapshot "as of" date caption
    asOf: function (formattedDate) {
      return "as of " + formattedDate;
    },
    footerRatesFrom: "Rates from the",
    footerEcbName: "European Central Bank",
    liveLink: "See live rates →"
  },
  sv: {
    // "Enkel Kurs" is already Swedish, so in the Swedish locale the
    // parenthetical description is redundant — omit it (module consumers
    // should skip rendering "(...)" when this is empty).
    wordmarkDescription: "",
    metaDescription:
      "En enkel valutaomvandlare baserad på Europeiska centralbankens referenskurser.",
    stageAriaLabel:
      "Belopp och basvaluta. Svep eller använd piltangenterna för att ändra.",
    tableCurrency: "Valuta",
    tableBuyingPower: "Köpkraft",
    tableCost: "Kostnad",
    costOf: function (formattedAmount) {
      return "för " + formattedAmount;
    },
    buyingLine: function (formattedGiven, formattedBought) {
      return formattedGiven + " köper " + formattedBought;
    },
    costLine: function (formattedGiven, formattedCost) {
      return formattedGiven + " kostar " + formattedCost;
    },
    asOf: function (formattedDate) {
      return "per " + formattedDate;
    },
    footerRatesFrom: "Kurser från",
    footerEcbName: "Europeiska centralbanken",
    liveLink: "Se aktuella kurser →"
  }
};

// Walks the browser's full ordered language-preference list (not just the
// single top value navigator.language returns — see the language-order
// discussion this module came out of) and picks the first entry whose
// primary subtag matches a supported locale. Falls back to DEFAULT_LOCALE
// if nothing matches, including when the list itself is unavailable
// (navigator.languages has had inconsistent support, e.g. on Safari).
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

// Resolved string table for a locale, falling back to DEFAULT_LOCALE for
// an unsupported/unrecognized locale code.
export function t(locale) {
  return strings[locale] || strings[DEFAULT_LOCALE];
}

// Locale-aware currency full name (e.g. "Canadian Dollar" / "kanadensisk
// dollar"), via the browser's own Intl.DisplayNames rather than a
// hand-maintained per-language dictionary — see the file header note.
export function currencyName(locale, code) {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code);
  } catch (e) {
    return code; // unsupported locale/code combo — fall back to the ISO code itself
  }
}
