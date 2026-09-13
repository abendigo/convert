[![Netlify Status](https://api.netlify.com/api/v1/badges/c72a9c8f-a53f-41bd-8365-81a650d58446/deploy-status)](https://app.netlify.com/sites/simple-currency/deploys)

# Technology Choices

- No framework — plain JS/CSS/HTML, no build step. Static files, served as-is.
- Rates come from the [European Central Bank][ecb] daily reference rates, fetched
  client-side through a Cloudflare Worker proxy (works around the ECB endpoint not
  sending CORS headers). The worker itself lives outside this repo.
- [idb-keyval][idb-keyval] caches the last-fetched rates locally, so the app has
  something to show before the network request resolves.
- Using [Prettier][prettier], [PrettyQuick][pretty-quick], and [Husky][husky] for code
  standards.
- Using [Netlify][netlify] for CI and hosting.
- No automated tests at the moment. If added later: [Playwright][playwright], not
  Cypress.

See `REDESIGN.md` for the fuller set of design and implementation decisions behind the
current version.

[ecb]: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
[idb-keyval]: https://github.com/jakearchibald/idb-keyval
[prettier]: https://prettier.io/
[pretty-quick]: https://github.com/azz/pretty-quick
[husky]: https://github.com/typicode/husky
[netlify]: https://www.netlify.com/
[playwright]: https://playwright.dev/
