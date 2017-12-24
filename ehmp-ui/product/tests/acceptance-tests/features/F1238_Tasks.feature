@F1238 @US18332 @F1238_Tasks @tasks_applet @regression @reg1
Feature: Implement Tile Row Component - Tasks

#Team Application
#NOTE: Tests for verifying the 'details' and 'go to task' menu options from expanded view are in 'F1142_Request.feature' file
 
Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed

@US18332_Tasks_quickmenu_summary_staff
Scenario: User can view the Quick Menu Icon in Tasks applet summary view from staff view
  Given user hovers over the tasks applet row
  And user can view the Quick Menu Icon in Tasks applet
  And Quick Menu Icon is collapsed in Tasks applet
  When Quick Menu Icon is selected in Tasks applet
  Then user can see the options in the Tasks applet
  | options         | 
  | details         | 
  | go to task      |

@US18332_Tasks_quickmenu_expanded_staff
Scenario: User can view the Quick Menu Icon in Tasks applet expanded view from staff view
  Given user navigates to expanded tasks applet from staff view
  When user hovers over the tasks applet row
  Then user can view the Quick Menu Icon in Tasks applet
  And Quick Menu Icon is collapsed in Tasks applet
  When Quick Menu Icon is selected in Tasks applet
  Then user can see the options in the Tasks applet
  | options         | 
  | details         | 
  | go to task      |

@US18332_Tasks_quickmenu_summary_patient
Scenario: User can view the Quick Menu Icon in Tasks applet summary view from patient view
  Given user searches for and selects "bcma,eight"
  And Summary View is active
  And user scrolls the tasks applet into view
  Then user hovers over the tasks applet row
  And user can view the Quick Menu Icon in Tasks applet
  And Quick Menu Icon is collapsed in Tasks applet
  When Quick Menu Icon is selected in Tasks applet
  Then user can see the options in the Tasks applet
  | options         | 
  | details         | 
  | go to task      |

@US18332_Tasks_quickmenu_expanded_patient
Scenario: User can view the Quick Menu Icon in Tasks applet expanded view from patient view
  Given user searches for and selects "bcma,eight"
  And Summary View is active
  And user scrolls the tasks applet into view
  And user navigates to expanded tasks applet from summary view
  And user hovers over the tasks applet row
  Then user can view the Quick Menu Icon in Tasks applet
  And Quick Menu Icon is collapsed in Tasks applet
  When Quick Menu Icon is selected in Tasks applet
  Then user can see the options in the Tasks applet
  | options         | 
  | details         | 
  | go to task      |
