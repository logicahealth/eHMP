@F144 @F144_numericlabresults @regression @triage
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

Background:
  Given user is logged into eHMP-UI
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  And user navigates to expanded Numeric Lab Results Applet
  And Numeric Lab Results applet loads without issue
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  And Numeric Lab Results applet loads without issue

 @F144_numericlabresults_8_labtype
Scenario: User can filter Expanded Numeric Lab results applet by different columns
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  When the user filters the Expanded Numeric Lab results by text "hematocrit"
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  Then the Expanded Numeric Lab results table only diplays rows including text "hematocrit"

   @F144_numericlabresults_8_labtype_w_num
Scenario: User can filter Expanded Numeric Lab results applet by different columns
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  When the user filters the Expanded Numeric Lab results by text "a1c"
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  Then the Expanded Numeric Lab results table only diplays rows including text "a1c"

   @F144_numericlabresults_8_facilitydod
Scenario: User can filter Expanded Numeric Lab results applet by different columns
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  When the user filters the Expanded Numeric Lab results by text "DOD"
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  Then the Expanded Numeric Lab results table only diplays rows including text "DOD"

   @F144_numericlabresults_8_facilityvista
Scenario: User can filter Expanded Numeric Lab results applet by different columns
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  When the user filters the Expanded Numeric Lab results by text "tst1"
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  Then the Expanded Numeric Lab results table only diplays rows including text "tst1"

   @F144_numericlabresults_8_results
Scenario: User can filter Expanded Numeric Lab results applet by different columns
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  When the user filters the Expanded Numeric Lab results by text "185"
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  Then the Expanded Numeric Lab results table only diplays rows including text "185"

   @F144_numericlabresults_8_refrange
Scenario: User can filter Expanded Numeric Lab results applet by different columns
  Given the user is viewing the expanded Numeric Lab Results Applet
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  When the user filters the Expanded Numeric Lab results by text "134-146"
  And the user scrolls to the bottom of the Numeric Lab Results Applet
  Then the Expanded Numeric Lab results table only diplays rows including text "134-146"

#  @F144_numericlabresults_8
# Scenario Outline: User can filter Expanded Numeric Lab results applet by different columns
#   Given the user is viewing the expanded Numeric Lab Results Applet
#   And the user scrolls to the bottom of the Numeric Lab Results Applet
#   When the user filters the Expanded Numeric Lab results by text "<filter_text>"
#   And the user scrolls to the bottom of the Numeric Lab Results Applet
#   Then the Expanded Numeric Lab results table only diplays rows including text "<row_text>"



# Examples:
#   | filter_type       | filter_text | row_text   |
# #  | lab type          | hematocrit  | hematocrit |
# #  | lab type with num | a1c         | a1c|
# #  | facility dod      | DOD         | DOD |
#   | facility vista    | tst1        | tst1|
#   | results           | 185         | 185 |
#   | ref range         | 134-146     | 134-146 |