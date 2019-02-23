import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";

Given("I have loaded the app", () => {
  cy.visit("http://localhost:8080");
});

Then("It should have a manifest", () => {
  cy.get("link[rel=manifest]").as("link_manifest");
});

When("I load the manifest", () => {
  // cy.get("@link_manifest").then(link => {
  //   cy.request(link.prop("href")).as("manifest_json");
  // });

  cy.request("manifest.json").as("manifest_json");

  cy.get("@manifest_json").then(xxx => {
    console.log("=====", xxx);
  });
});

Then("I can load assetlinks.json", () => {
  cy.request(".well-known/assetlinks.json").as("assetlinks_json");
});

Then("It should have a service worker", () => {
  cy.window().then(window => {
    expect(window.navigator.serviceWorker.controller).to.exist;
  });
});
