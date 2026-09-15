import { test, expect } from "@playwright/test";

// Runs inside a real browser page (not Node) because src/i18n.js has a
// top-level `import` from a CDN URL — only a real browser can resolve
// that, so this exercises the actual module exactly as it ships, rather
// than a Node-side approximation of it.
test("CURRENCY_GENDER has an entry for every currency, in every gendered locale", async ({
  page
}) => {
  await page.goto("/");
  var missing = await page.evaluate(async function() {
    var mod = await import("/src/i18n.js");
    var missing = [];
    for (var locale in mod.CURRENCY_GENDER) {
      for (var i = 0; i < mod.CURRENCY_CODES.length; i++) {
        var code = mod.CURRENCY_CODES[i];
        if (!(code in mod.CURRENCY_GENDER[locale]))
          missing.push(locale + "/" + code);
      }
    }
    return missing;
  });
  expect(missing).toEqual([]);
});
