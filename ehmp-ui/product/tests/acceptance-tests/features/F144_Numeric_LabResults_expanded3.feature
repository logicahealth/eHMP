@F144 @F144_numericlabresults @regression @triage @DE4084
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

Background:
  # Given user is logged into eHMP-UI
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  And user navigates to expanded Numeric Lab Results Applet
  And Numeric Lab Results applet loads without issue

@F144_numericlabresults_9 @US2481 @TA7508
Scenario: Default date range of the applet is 18 months past and 6 months in the future.
  Given the user is viewing the expanded Numeric Lab Results Applet
  Then the Numeric Lab Results Applet Text Filter is displayed 
  And the Numeric Lab Results Applet Date Filter is displayed
  And the Numeric Lab Results Date Filter displays "18" months in the past and "6" months in the future