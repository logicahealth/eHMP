@F1238 @F1238_CommunityHealthSummaries @CommunityHealthSummaries_applet @regression @reg4
Feature: Implement Tile Row Component - CommunityHealthSummaries

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"

@US18310_CommunityHealthSummaries_Quick_Menu_Icon_Coversheet_screen
Scenario: User can view the Quick Menu Icon in CommunityHealthSummaries applet summary view on coversheet screen
  Then Cover Sheet is active
  And user hovers over the CommunityHealthSummaries applet row
  And user can view the Quick Menu Icon in CommunityHealthSummaries applet
  And Quick Menu Icon is collapsed in CommunityHealthSummaries applet
  When Quick Menu Icon is selected in CommunityHealthSummaries applet
  Then user can see the options in the CommunityHealthSummaries applet
  | options         | 
  | details         | 
  
@US18310_CommunityHealthSummaries_Quick_Menu_Icon_expand_view
Scenario: User can view the Quick Menu Icon in CommunityHealthSummaries applet expand view
  Then Cover Sheet is active
  Then the user clicks the Community Health Summary Expand Button
  And the Expanded Community Health Summary applet displays
  And user hovers over the CommunityHealthSummaries applet row
  And user can view the Quick Menu Icon in CommunityHealthSummaries applet
  And Quick Menu Icon is collapsed in CommunityHealthSummaries applet
  When Quick Menu Icon is selected in CommunityHealthSummaries applet
  Then user can see the options in the CommunityHealthSummaries applet
  | options         | 
  | details         | 
  
@US18310_CommunityHealthSummaries_details_from_Quick_Menu_coversheet_screen
Scenario: User can view the details from Quick Menu Icon in CommunityHealthSummaries applet on coversheet screen
  And Cover Sheet is active
  And user hovers over the CommunityHealthSummaries applet row
  And user selects the detail view from Quick Menu Icon of CommunityHealthSummaries applet
  Then the Community Health Summary View detail view displays
  
@US18310_CommunityHealthSummaries_details_from_Quick_Menu_expand_view
Scenario: User can view the details from Quick Menu Icon in CommunityHealthSummaries applet expand view
  Then Cover Sheet is active
  Then the user clicks the Community Health Summary Expand Button
  And the Expanded Community Health Summary applet displays
  And user hovers over the CommunityHealthSummaries applet row
  And user selects the detail view from Quick Menu Icon of CommunityHealthSummaries applet
  Then the Community Health Summary View detail view displays
