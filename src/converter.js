import { LitElement, html } from "lit-element";

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

    fetch(
      "https://api.exchangeratesapi.io/latest?base=CAD&symbols=USD,GBP,EUR,THB,AUD"
    )
      .then(response => response.json())
      .then(json => {
        this.rates = json.rates;
        this.date = json.date;
      });
  }

  render() {
    return html`
      <h2>Simple Currency Converter</h2>

      <section>
        ${this.amount.toLocaleString(undefined, {
          style: "currency",
          currency: this.base
        })}
        <ul>
          ${Object.keys(this.rates).map(
            i =>
              html`
                <li>
                  ${(this.amount * this.rates[i]).toLocaleString(undefined, {
                    style: "currency",
                    currency: i
                  })}
                </li>
              `
          )}
        </ul>
      </section>

      <section>
        <table>
          ${Object.keys(this.rates).map(
            j => html`
              <tr>
                <td>
                  ${this.amount.toLocaleString(undefined, {
                    style: "currency",
                    currency: j
                  })}
                </td>
                <td>
                  ${(this.amount / this.rates[j]).toLocaleString(undefined, {
                    style: "currency",
                    currency: this.base
                  })}
                </td>
              </tr>
            `
          )}
        </table>
      </section>

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
