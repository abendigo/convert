import { LitElement, html, css } from "lit-element";

// import xxx from './xxx.html';

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

    this.amount = 100;
    this.base = "CAD";
    this.rates = {};

    this.locale = "en-CA";

    fetch(
      "https://api.exchangeratesapi.io/latest?base=CAD&symbols=USD,GBP,EUR,THB,AUD"
    )
      .then(response => response.json())
      .then(json => {
        this.rates = json.rates;
        this.date = json.date;
      });
  }

  static get styles() {
    return css`
      @import "src/converter.css";
    `;
  }

  render() {
    // console.log('xxx', xxx);

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
