import { Given, Then } from "cypress-cucumber-preprocessor/steps";

Given("I have loaded the app", () => {
  cy.visit("http://localhost:8080");
});

Then("It should have a manifest", () => {
  expect(cy.get("link[rel=manifest]")).to.exist;
});

Then("I can load assetlinks.json", () => {
  // cy.visit('http://localhost:8080/.well-known/assetlinks.json');
});

Then("It should have a service worker", () => {
  cy.window().then(window => {
    expect(window.navigator.serviceWorker.controller).to.exist;
  });
});
