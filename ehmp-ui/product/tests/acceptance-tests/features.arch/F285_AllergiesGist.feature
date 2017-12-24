@F285_allergies_gist   @reg2
Feature: F285 : Overview Screen

Background:
  Given user searches for and selects "FORTYSIX,PATIENT"
  When Overview is active
  Then user sees Allergies Gist

@F285_3_AllergiesGistDisplay
Scenario: Allergy Gist has popover menu
  Given the Allergies Gist applet is finished loading
  And the Allergies Gist contains at least 1 pill
  When user views the first allergy details
  Then a popover displays with expected icons
