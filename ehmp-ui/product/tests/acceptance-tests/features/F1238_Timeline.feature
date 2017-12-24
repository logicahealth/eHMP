@F1238 @F1238_timeline @timeline_applet @regression @reg4
Feature: Implement Tile Row Component - Timeline

#Team Application
   
Background:

  Given user searches for and selects "Sixhundred,Patient"

@US18333_timeline_Quick_Menu_Icon
Scenario: User can view the Quick Menu Icon in Timeline applet
  And Summary View is active
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And user hovers over the timeline applet row
  And user can view the Quick Menu Icon in timeline applet
  And Quick Menu Icon is collapsed in timeline applet
  When Quick Menu Icon is selected in timeline applet
  Then user can see the options in the timeline applet
  | options 				|  
  | details					| 
  
@US18333_timekne_details_view_from_quick_menu
Scenario: User can view details if details icon is selected from the quick view menu toolbar
  And Summary View is active
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And user hovers over the timeline applet row
  When the selects the detail view button from Quick Menu Icon of the first timeline row
  Then the modal is displayed
   