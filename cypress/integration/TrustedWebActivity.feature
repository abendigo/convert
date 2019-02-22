Feature: Trusted Web Activity

  Scenario: Must have a Manifest
    Given I have loaded the app
    Then It should have a manifest

  Scenario: Must have Digital Assets Links
    Then I can load assetlinks.json

  Scenario: Must have a Service Worker
    Given I have loaded the app
    Then It should have a service worker
