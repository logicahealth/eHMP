@F1238 @US18330 @reg1
Feature: Implement Tile Row Component - Open Requests

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed

  Scenario: User can view the Quick Menu icon in Requests applet summary view ( staff view )
    Given user hovers over the Requests summary view row
    And user can view the Quick Menu Icon in Requests applet
    And Quick Menu Icon is collapsed in Requests applet
    When Quick Menu Icon is selected in Requests applet
    Then user can see the options in the Requests applet
    | options 				| 
    | details					| 

  Scenario: User can view the Quick Menu icon in Requests applet expanded view ( staff view )
    Given user navigates to staff expanded Requests applet
    When user hovers over the Requests expanded view row
    Then user can view the Quick Menu Icon in Requests applet
    And Quick Menu Icon is collapsed in Requests applet
    When Quick Menu Icon is selected in Requests applet
    Then user can see the options in the Requests applet
    | options 				| 
    | details					| 

  Scenario: User can view the Quick Menu icon in Request applet expanded view ( patient view )
    Given user searches for and selects "bcma,eight"
    And Summary View is active
    And user navigates to expanded Requests applet
    When user hovers over the Requests expanded view row
    Then user can view the Quick Menu Icon in Requests applet
    And Quick Menu Icon is collapsed in Requests applet
    When Quick Menu Icon is selected in Requests applet
    Then user can see the options in the Requests applet
    | options 				| 
    | details					| 

  Scenario: User can view the details in Request applet summary staff view
    Given user hovers over the Request summary view row
    Given user selects the detail view from Quick Menu Icon of Request applet
    Then the patient selection confirmation modal displays

  Scenario: Uer can view the details in Request applet expanded view ( staff view )
    Given user navigates to staff expanded Requests applet
    Given user hovers over the Request summary view row
    Given user selects the detail view from Quick Menu Icon of Request applet
    Then the patient selection confirmation modal displays