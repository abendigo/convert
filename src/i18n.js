export var SUPPORTED_LOCALES = ["en", "sv"];
export var DEFAULT_LOCALE = "en";

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
    costOf: function (formattedAmount) {
      return "for " + formattedAmount;
    },
    buyingLine: function (formattedGiven, formattedBought) {
      return formattedGiven + " buys " + formattedBought;
    },
    costLine: function (formattedGiven, formattedCost) {
      return formattedGiven + " costs " + formattedCost;
    },
    asOf: function (formattedDate) {
      return "as of " + formattedDate;
    },
    footerRatesFrom: "Rates from the",
    footerEcbName: "European Central Bank",
    liveLink: "See live rates →"
  },
  sv: {
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

export function currencyName(locale, code) {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code);
  } catch (e) {
    return code;
  }
}
