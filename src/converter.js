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

    // https://api.exchangeratesapi.io/latest?base=CAD

    this.data = {
      base: "CAD",
      date: "2019-02-15",
      rates: {
        // "ISK":89.7787285246,
        // "CAD":1.0,
        // "MXN":14.5497693696,
        // "CHF":0.7580720636,
        AUD: 1.0586269136,
        CNY: 5.0963299686,
        GBP: 0.5878601511,
        USD: 0.7527241126,
        // "SEK":7.0066849388,
        // "NOK":6.5305167458,
        // "TRY":3.9656394144,
        // "IDR":10645.4041045524,
        // "ZAR":10.6297880874,
        // "HRK":4.9522026873,
        EUR: 0.6684938833,
        // "HKD":5.9074804466,
        // "ILS":2.7364128618,
        NZD: 1.098469149,
        // "MYR":3.0748713149,
        JPY: 83.1940637743,
        // "CZK":17.1863092453,
        // "SGD":1.0223276957,
        // "RUB":50.1915903469,
        // "RON":3.1691289525,
        // "HUF":212.7214385988,
        // "BGN":1.3074403369,
        // "INR":53.7208369543,
        // "KRW":848.5326559262,
        // "DKK":4.9877665619,
        THB: 23.5376696303
        // "PHP":39.4652048934,
        // "PLN":2.8950464603,
        // "BRL":2.7977806003
      }
    };
  }

  render() {
    return html`
      <h2>Simple Currency Converter</h2>

      <section>
        ${this.amount.toLocaleString(undefined, {
          style: "currency",
          currency: this.data.base
        })}
        <ul>
          ${Object.keys(this.data.rates).map(
            i =>
              html`
                <li>
                  ${(this.amount * this.data.rates[i]).toLocaleString(
                    undefined,
                    {
                      style: "currency",
                      currency: i
                    }
                  )}
                </li>
              `
          )}
        </ul>
      </section>

      <section>
        <table>
          ${Object.keys(this.data.rates).map(
            j => html`
              <tr>
                <td>
                  ${this.amount.toLocaleString(undefined, {
                    style: "currency",
                    currency: j
                  })}
                </td>
                <td>
                  ${(this.amount / this.data.rates[j]).toLocaleString(
                    undefined,
                    {
                      style: "currency",
                      currency: this.data.base
                    }
                  )}
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
        as of ${this.data.date}.
      </footer>
    `;
  }
}

customElements.define("simple-currency-converter", SimpleCurrencyConverter);
