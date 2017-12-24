@F1273 @F1273_reports @reports_applet @regression @reg2
Feature: Reports Applet Tile Behavior

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"
   
@US18880_reports_Quick_Menu_Icon_Overview_screen
Scenario: User can view the Quick Menu Icon in Reports applet trend view on overview screen
  And Overview is active
  And user hovers over the reports applet row
  And user can view the Quick Menu Icon in reports applet
  And Quick Menu Icon is collapsed in reports applet
  When Quick Menu Icon is selected in reports applet
  Then user can see the options in the reports applet
  | options 				| 
  | details					| 
  
@US18880_reports_Quick_Menu_Icon_expand_view
Scenario: User can view the Quick Menu Icon in reports applet expand view
  And Overview is active
  When the user clicks the control Expand View in the Reports Gist applet
  Then the expanded Reports Applet is displayed
  And user hovers over the reports applet row
  And user can view the Quick Menu Icon in reports applet
  And Quick Menu Icon is collapsed in reports applet
  When Quick Menu Icon is selected in reports applet
  Then user can see the options in the reports applet
  | options 				| 
  | details					| 
  
@US18880_reports_details_from_Quick_Menu_Overview_screen
Scenario: User can view the details from Quick Menu Icon in reports applet on overview screen
  And Overview is active
  And user hovers over the reports applet row
  And user selects the detail view from Quick Menu Icon of reports applet
  Then the modal's title is displayed
  And the modal dialog contains data labels
  
@US18880_Problems_details_from_Quick_Menu_exapnd_view
Scenario: User can view the details from Quick Menu Icon in reports applet expand view
  And Overview is active
  When the user clicks the control Expand View in the Reports Gist applet
  Then the expanded Reports Applet is displayed
  And user hovers over the reports applet row
  And user selects the detail view from Quick Menu Icon of reports applet
  Then the modal's title is displayed
  And the modal dialog contains data labels
  