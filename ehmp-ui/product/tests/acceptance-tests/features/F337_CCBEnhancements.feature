@F337   @reg1
Feature: CCB Enhancements

@US4321
Scenario: Displaying Vitals Qualifiers on Expanded View
  # Given user is logged into eHMP-UI
  And user searches for and selects "FORTYSIX,PATIENT"
  And Overview is active
  When the user expands the vitals applet
  When the expanded vitals applet is displayed
  When the user clicks the All vitals range
  Then some vitals display qualifiers

