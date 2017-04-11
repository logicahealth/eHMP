@F337 @regression @triage
Feature: CCB Enhancements

@US4321
Scenario: Displaying Vitals Qualifiers on Expanded View
  Given user is logged into eHMP-UI
  And user searches for and selects "FORTYSIX,PATIENT"
  And Overview is active
  When the user expands the vitals applet
  When the expanded vitals applet is displayed
  When the user clicks the all-range-vitals
  And the user filters the Vitals Applet by text "BAY"
  Then the vitals table only diplays rows including text "BAY"
  Then some vitals display qualifiers

