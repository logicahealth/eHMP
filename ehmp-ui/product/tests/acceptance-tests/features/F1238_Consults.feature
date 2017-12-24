@F1238 @US18312 @reg1
Feature: Implement Tile Row Component - Consults

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed

@US18312_quickmenu_summary
Scenario: User can view the Quick Menu Icon in Consults applet summary view
  Given user hovers over the Consults summary view row
  And user can view the Quick Menu Icon in Consults applet
  And Quick Menu Icon is collapsed in Consults applet
  When Quick Menu Icon is selected in Consults applet
  Then user can see the options in the Consults applet
  | options 				| 
  | details					| 

@US18312_quickmenu_expanded_staff
Scenario: User can view the Quick Menu Icon in Consults applet expanded view for staff
  Given user navigates to staff expanded consult applet
  When user hovers over the Consults expanded view row
  Then user can view the Quick Menu Icon in Consults applet
  And Quick Menu Icon is collapsed in Consults applet
  When Quick Menu Icon is selected in Consults applet
  Then user can see the options in the Consults applet
  | options 				| 
  | details					| 

@US18312_quickmenu_expanded_patient
Scenario: User can view the Quick Menu Icon in Consults applet expanded view for patient
  Given user searches for and selects "bcma,eight"
  And Summary View is active
  And user navigates to expanded consult applet
  When user hovers over the Consults expanded view row
  Then user can view the Quick Menu Icon in Consults applet
  And Quick Menu Icon is collapsed in Consults applet
  When Quick Menu Icon is selected in Consults applet
  Then user can see the options in the Consults applet
  | options 				| 
  | details					| 

@US18312_quickmenu_summary_detail
Scenario: User can view the details in Consults applet summary view from quick menu button
  Given user hovers over the Consults summary view row
  Given user selects the detail view from Quick Menu Icon of Consults applet
  Then the patient selection confirmation modal displays

@US18312_quickmenu_expanded_detail
Scenario: User can view the details in Consults applet expanded view from quick menu button
  Given user searches for and selects "bcma,eight"
  And Summary View is active
  And user navigates to expanded consult applet
  And user selects the detail view from Quick Menu Icon of expanded Consults applet
  Then the detail modal for consult displays 

