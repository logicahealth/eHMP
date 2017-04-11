@F144 @F144_numericlabresults @regression @triages
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

Background:
  Given user is logged into eHMP-UI
  Given user searches for and selects "Seven,Patient"
  Then Cover Sheet is active
  And user navigates to expanded Numeric Lab Results Applet
  And Numeric Lab Results applet loads without issue

@F144_numericlabresults_1
Scenario: Expanded Numeric Lab results applet contains expected buttons	
  When the user is viewing the expanded Numeric Lab Results Applet
  Then the Numeric Lab Results applet contains buttons
    | buttons  |
    | Refresh  |
    | Filter Toggle   |
    | Minimize View |

@F144_numericlabresults_2
Scenario: Expanded Numeric Lab results applet displays expected headers	
  When the user is viewing the expanded Numeric Lab Results Applet
  And the "Numeric Lab Results Applet" table has headers
    | DATE | LAB TEST | FLAG | RESULT | UNIT | REF RANGE | FACILITY |

@F144_numericlabresults_4
Scenario: Expanded Numeric Lab results applet has infinite scroll
  #  Right now Numeric Lab results applet is loading ALL rows after global date All is applied
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  And Numeric Lab Results applet loads without issue
  And the the Numeric Lab Results applet is displaying a subset of rows
  When the user scrolls to the bottom of the Numeric Lab Results Applet
  Then the Numeric Lab Results applet adds more rows


