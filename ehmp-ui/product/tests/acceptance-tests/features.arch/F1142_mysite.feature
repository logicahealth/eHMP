@F1142 @F1142_mysite @US17415
Feature: Implement My Site search tray

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "DNS    " verifycode as  "DNS    !!"
  Then staff view screen is displayed

@F1142_mysite_11_a
Scenario Outline: Verify My Site results retained and repopulated when tray is reopened
    When the user searchs My Site with search term Eight,Patient
    Then the My Site Tray displays
    And the My Site Tray contains search results
    When the user opens the <tray> tray
    Then the My Site search input box is cleared
    When the user opens the My Site tray
    Then the My Site Tray displays
    And the My Site search input box is populated with term Eight,Patient
    And the My Site Tray contains search results
Examples:
    | tray            |
    | My CPRS list    |
    | Recent Patients |
    | Ward            |
    | Nationwide      |