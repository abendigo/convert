import { LitElement, html, css } from "lit-element";
import { get, set } from "idb-keyval";

// Copied from https://gist.github.com/chinchang/8106a82c56ad007e27b1
function xmlToJson(xml) {
  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    // text
    obj = xml.nodeValue;
  }

  // do children
  // If all text nodes inside, get concatenated text from them.
  var textNodes = [].slice.call(xml.childNodes).filter(function(node) {
    return node.nodeType === 3;
  });
  if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
    obj = [].slice.call(xml.childNodes).reduce(function(text, node) {
      return text + node.nodeValue;
    }, "");
  } else if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof obj[nodeName] == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

class SimpleCurrencyConverter extends LitElement {
  static get properties() {
    return {
      // amount: {type: Number}
      base: String,
      date: String,
      rates: Object
    };
  }

  constructor() {
    super();

    get("date").then(date => {
      if (date) this.date = date;
    });
    get("rates").then(rates => {
      if (rates) this.rates = rates;
    });

    fetch("https://red-band-e7de.pokerdiary.workers.dev/")
      .then(response => response.text())
      .then(xmlString => new DOMParser().parseFromString(xmlString, "text/xml"))
      .then(xmlNode => xmlToJson(xmlNode))
      .then(json => {
        const data = json["gesmes:Envelope"].Cube.Cube;
        this.date = data["@attributes"].time;

        this.rates = data.Cube.reduce((rates, item) => {
          const { currency, rate } = item["@attributes"];
          rates[currency] = rate;
          return rates;
        }, {});
      });

    this.amount = 100;
    this.base = "EUR";
    this.rates = {};

    this.currencies = ["CAD", "USD", "GBP", "THB", "AUD"];
    this.locale = "en-GB";
  }

  static get styles() {
    return css`
      h2 {
        text-align: center;
      }

      .container {
        display: flex;
        justify-content: center;
      }

      table {
        max-width: 400px;
        width: 100%;
        padding: 10px;
      }
      td {
        text-align: right;
        font-size: large;
      }

      .heading {
        text-align: center;
        padding: 20px 0;
        font-size: x-large;
      }

      footer {
        font-size: small;
        padding-top: 50px;
        text-align: center;
      }
    `;
  }

  render() {
    return html`
      <h2>Simple Currency Converter</h2>

      <div class="container">
        <table>
          <tr>
            <td colspan="2" class="heading">My ${this.base} Buying Power</td>
          </tr>
          ${this.currencies.map(
            (currency, index) =>
              html`
                <tr>
                  <td>
                    ${index === 0
                      ? this.amount.toLocaleString(this.locale, {
                          style: "currency",
                          currency: this.base
                        })
                      : ""}
                  </td>
                  <td>
                    ${(this.amount * this.rates[currency]).toLocaleString(
                      this.locale,
                      {
                        style: "currency",
                        currency: currency
                      }
                    )}
                  </td>
                </tr>
              `
          )}
          <tr>
            <td colspan="2" class="heading">What does it cost?</td>
          </tr>
          ${this.currencies.map(
            currency =>
              html`
                <tr>
                  <td>
                    ${this.amount.toLocaleString(this.locale, {
                      style: "currency",
                      currency: currency
                    })}
                  </td>
                  <td>
                    ${(this.amount / this.rates[currency]).toLocaleString(
                      this.locale,
                      {
                        style: "currency",
                        currency: this.base
                      }
                    )}
                  </td>
                </tr>
              `
          )}
        </table>
      </div>

      <footer>
        Rates from
        <a
          href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html"
          >European Central Bank</a
        >, as of ${this.date}.
      </footer>
    `;
  }
}

customElements.define("simple-currency-converter", SimpleCurrencyConverter);
