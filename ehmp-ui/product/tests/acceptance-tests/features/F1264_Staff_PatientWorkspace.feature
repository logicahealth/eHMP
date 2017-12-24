@F1264 @US18772 @reg3
Feature: Staff Context Workspaces - Apply Workspace Manager Selector and Applet to Staff Context

Background:
  Given staff view screen is displayed

@US18772_1
Scenario: Verify the Workspace Selection dropdown button appears in the header of the staff context and HOMEPAGE is default 
    Given the staff view screen has Workspace Selection dropdown button and named Homepage
    And user selects Workspace Selector dropdown button menu option for the HOMEPAGE
    Then dropdown list has HOMEPAGE option 

@US18772_2
Scenario: on Selecting HOMEPAGE from Workspace Selection list user is still on staff view and Workspace Selection is nammed HOMEPAGE
    And user selects Workspace Selector dropdown button menu option for the HOMEPAGE
    And dropdown list has HOMEPAGE option 
    And user selects HOMEPAGE option 
    Then staff view screen is displayed
