# Technology Choices

- No framework — plain JS/CSS/HTML, no bundler, no transforms. `npm run build`
  exists, but it's a plain file-copy script that curates what gets deployed
  (see REDESIGN.md), not a bundler.
- Rates come from the [European Central Bank][ecb] daily reference rates, fetched
  client-side through a Cloudflare Worker proxy (works around the ECB endpoint not
  sending CORS headers). The worker lives in the same Cloudflare account as the site,
  outside this repo.
- Local caching of the last-fetched rates uses plain `localStorage` — just two small
  values, no library needed.
- Using [Prettier][prettier], [PrettyQuick][pretty-quick], and [Husky][husky] for code
  standards.
- Hosted on [Cloudflare Pages][pages] at [enkelkurs.com](https://enkelkurs.com), with
  GitHub Actions (`.github/workflows/deploy.yml`) deploying on every push to `master`.
- No automated tests at the moment. If added later: [Playwright][playwright], not
  Cypress.

See `REDESIGN.md` for the fuller set of design and implementation decisions behind the
current version.

[ecb]: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
[prettier]: https://prettier.io/
[pretty-quick]: https://github.com/azz/pretty-quick
[husky]: https://github.com/typicode/husky
[pages]: https://pages.cloudflare.com/
[playwright]: https://playwright.dev/
