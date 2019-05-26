import { LitElement, html, css } from "lit-element";
import { get, set } from "idb-keyval";

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

    fetch(
      "https://api.exchangeratesapi.io/latest?base=CAD&symbols=USD,GBP,EUR,THB,AUD"
    )
      .then(response => response.json())
      .then(json => {
        set("rates", json.rates);
        set("date", json.date);
        this.rates = json.rates;
        this.date = json.date;
      });
    // });

    this.amount = 100;
    this.base = "CAD";
    this.rates = {};

    this.locale = "en-CA";
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
          ${Object.keys(this.rates).map(
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
          ${Object.keys(this.rates).map(
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
        >, via <a href="https://exchangeratesapi.io/">exchangeratesapi.io</a>,
        as of ${this.date}.
      </footer>
    `;
  }
}

customElements.define("simple-currency-converter", SimpleCurrencyConverter);
