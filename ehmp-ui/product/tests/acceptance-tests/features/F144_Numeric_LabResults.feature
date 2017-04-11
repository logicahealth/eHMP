@F144 @F144_numericlabresults  @reg2
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

@F144_numericlabresults_buttons
Scenario: User can minimize the applet when viewing expanded view.
  Given user searches for and selects "Eight,Patient"
  And Overview is active
  When user expands the numeric lab result applet from overview
  And Numeric Lab Results applet loads without issue
  And the user is viewing the expanded Numeric Lab Results Applet
  Then the Numeric Lab Results applet contains buttons
    | buttons  |
    | Minimize View |