Feature: Trusted Web Activity

  Background:
    Given I have loaded the app

  Scenario: Must have a Manifest
    Then It should have a manifest

    Scenario: Manifest must ...
      When I load the manifest

  Scenario: Must have Digital Assets Links
    Then I can load assetlinks.json

  Scenario: Must have a Service Worker
    Given I have loaded the app
    Then It should have a service worker
