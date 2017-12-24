@F280_Scope_Item  @reg2 @Lab_Results
Feature: F280 - Numeric Lab Results Applet
# Apply gist view type as an option against applet domains. "As an eHMP  user, I need to view a complete operation gist view to include the Labs domain that displays all defined panels and data; so that I can access Labs information for a given patient."

@f280_labresults_gist_quicklook_button @debug @DE6842
Scenario: User views quicklook through toolbar
  Given user searches for and selects "Five,patient"
  And Overview is active
  And the user has selected All within the global date picker
  And user sees Numeric Lab Results Gist
  And the Numeric Lab Results Gist Applet contains data rows
  When the user views the first Numeric Lab Result Gist quick look via the toolbar
  Then a quickview displays a numeric lab table with expected headers
      | header     |
      | VALUE      |
      | REF. RANGE |
      | OBSERVED   |
      | FACILITY   |

@f280_labresults_gist_quicklook_result_column @debug @DE6842
Scenario: User views quicklook through results column
  Given user searches for and selects "Five,patient"
  And Overview is active
  And the user has selected All within the global date picker
  And user sees Numeric Lab Results Gist
  And the Numeric Lab Results Gist Applet contains data rows
  When the user views the first Numeric Lab Result Gist quick look via the results column
  Then a quickview displays a numeric lab table with expected headers
      | header     |
      | VALUE      |
      | REF. RANGE |
      | OBSERVED   |
      | FACILITY   |