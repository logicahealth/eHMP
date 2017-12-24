@F1238 @F1238_Activities @Activities_applet @regression @reg1
Feature: Implement Tile Row Component - Activities

#Team Application
#NOTE: Tests for verifying the 'details' menu option are in 'F1175_Activity_Applet.feature' file
  
Background:

  Given user searches for and selects "bcma,eight"

@US18302_Activities_Quick_Menu_Icon_summary_view
Scenario: User can view the Quick Menu Icon in Activities applet summary view
  Then user makes sure there is at least one activity
  And user hovers over the Activities applet row
  And user can view the Quick Menu Icon in Activities applet
  And Quick Menu Icon is collapsed in Activities applet
  When Quick Menu Icon is selected in Activities applet
  Then user can see the options in the Activities applet
  | options         | 
  | details         | 
  
@US18302_Activities_Quick_Menu_Icon_expand_view
Scenario: User can view the Quick Menu Icon in Activities applet expand view
  And user navigates to expanded activities applet
  Then user makes sure there is at least one activity
  And the user sorts the Activity applet by column Created On 
  And user hovers over the Activities applet row
  And user can view the Quick Menu Icon in Activities applet
  And Quick Menu Icon is collapsed in Activities applet
  When Quick Menu Icon is selected in Activities applet
  Then user can see the options in the Activities applet
  | options         | 
  | details         | 
