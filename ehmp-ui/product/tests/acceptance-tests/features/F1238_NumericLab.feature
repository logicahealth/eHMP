@F1238 @US18326 @reg4
Feature:

Background:
  Given user searches for and selects "Eight,Patient"

@US18326_menuicon_trend
Scenario: User can view the Quick Menu Icon in Numeric Lab Trend view applet 
  Given Overview is active
  And the user has selected All within the global date picker
  And user hovers over the numeric lab trend row
  And user can view the Quick Menu Icon in numeric lab applet
  And Quick Menu Icon is collapsed in numeric lab applet
  When Quick Menu Icon is selected in numeric lab applet
  Then user can see the options in the numeric lab applet
  | options 				| 
  | more information| 
  | details					| 

@US18326_menuicon_summary_nonpanel
Scenario: User can view the Quick Menu Icon on a Numeric Lab Summary view non-panel row
  Given Cover Sheet is active
  And the user has selected All within the global date picker
  And user hovers over the numeric lab non-panel summary row
  And user can view the Quick Menu Icon in numeric lab applet
  And Quick Menu Icon is collapsed in numeric lab applet
  When Quick Menu Icon is selected in numeric lab applet
  Then user can see the options in the numeric lab applet
  | options 				| 
  | more information| 
  | details					| 

@US18326_menuicon_summary_expandedpanel
Scenario: User can view the Quick Menu Icon ona  Numeric Lab Summary view applet 
  Given Cover Sheet is active
  And the user has selected All within the global date picker
  When the user clicks the first numeric lab result panel row
  Then the numeric lab result applet displays expanded panel rows
  And user hovers over the numeric expanded panel summary row
  
  And user can view the Quick Menu Icon in numeric lab applet
  And Quick Menu Icon is collapsed in numeric lab applet
  When Quick Menu Icon is selected in numeric lab applet
  Then user can see the options in the numeric lab applet
  | options 				| 
  | more information| 
  | details					| 

@US18326_menuicon_expanded
Scenario: User can view the Quick Menu Icon on Numeric Lab Expanded view applet
  Given user navigates to expanded Numeric Lab Results Applet
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  And Numeric Lab Results applet loads without issue
  When user hovers over the numeric lab expanded non-panel row
  And user can view the Quick Menu Icon in numeric lab applet
  And Quick Menu Icon is collapsed in numeric lab applet
  When Quick Menu Icon is selected in numeric lab applet
  Then user can see the options in the numeric lab applet
  | options 				| 
  | more information| 
  | details					|



@US18326_popover_quickview
Scenario: User can view the the popover table in Numeric Lab applet trend view
  And Overview is active
  And the user has selected All within the global date picker
  And user hovers over the numeric lab trend row
  Then a quickview displays a numeric lab table with expected headers
      | header     |
      | VALUE      |
      | REF. RANGE |
      | OBSERVED   |
      | FACILITY   |

@US18326_menuicon_trend_detail
Scenario: User can view the details from Quick Menu Icon in Numeric Lab Trend view applet
  Given Overview is active
  And the user has selected All within the global date picker
  And user hovers over the numeric lab trend row
  And user selects the detail view from Quick Menu Icon of numeric lab applet
  Then the numeric lab result modal displays

@US18326_menuicon_summary_nonpanel_detail
Scenario: User can view the details from Quick Menu Icon in Numeric Lab Summary view applet
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And user hovers over the numeric lab non-panel summary row
  And user selects the detail view from Quick Menu Icon of numeric lab applet
  Then the numeric lab result modal displays

@US18326_menuicon_summary_expanded_panel_detail
Scenario: User can view the details from Quick Menu Icon in Numeric Lab Summary view applet
  And Cover Sheet is active
  And the user has selected All within the global date picker
  When the user clicks the first numeric lab result panel row
  Then the numeric lab result applet displays expanded panel rows
  And user hovers over the numeric expanded panel summary row
  And user selects the detail view from Quick Menu Icon of numeric lab applet
  Then the numeric lab result modal displays

@US18326_menuicon_expanded_detail
Scenario: User can view the details from Quick Menu Icon in Numeric Lab Expanded view applet
  Given user navigates to expanded Numeric Lab Results Applet
    And the user clicks the date control "All" in the "Numeric Lab Results applet"
  And Numeric Lab Results applet loads without issue
  When user hovers over the numeric lab expanded non-panel row
  And user selects the detail view from Quick Menu Icon of numeric lab applet
  Then the numeric lab result modal displays
