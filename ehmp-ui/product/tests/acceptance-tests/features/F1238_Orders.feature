@F1238 @F1238_Orders @orders_applet @regression @reg2
Feature: Implement Tile Row Component - Orders

#Team Application
   
Background:

  Given user searches for and selects "Eight,Patient"

@US18327_Orders_Quick_Menu_Icon_Coversheet_screen
Scenario: User can view the Quick Menu Icon in Orders applet summary view on coversheet screen
  Then Cover Sheet is active
  And user hovers over the orders applet row
  And user can view the Quick Menu Icon in orders applet
  And Quick Menu Icon is collapsed in orders applet
  When Quick Menu Icon is selected in orders applet
  Then user can see the options in the orders applet
  | options         | 
  | details         | 
  
@US18327_Orders_Quick_Menu_Icon_expand_view
Scenario: User can view the Quick Menu Icon in Orders applet expand view
  And POB user navigates to orders expanded view
  And user hovers over the orders applet row
  And user can view the Quick Menu Icon in orders applet
  And Quick Menu Icon is collapsed in orders applet
  When Quick Menu Icon is selected in orders applet
  Then user can see the options in the orders applet
  | options         | 
  | details         | 
  
@US18327_Orders_details_from_Quick_Menu_coversheet_screen
Scenario: User can view the details from Quick Menu Icon in Orders applet on coversheet screen
  And Cover Sheet is active
  And user hovers over the orders applet row
  And user selects the detail view from Quick Menu Icon of orders applet
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header      |
      | Activity            |
      | Current Data        |
      | Order               |
  
@US18327_Orders_details_from_Quick_Menu_expand_view
Scenario: User can view the details from Quick Menu Icon in Orders applet expand view
  And POB user navigates to orders expanded view
  And user hovers over the orders applet row
  And user selects the detail view from Quick Menu Icon of orders applet
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header      |
      | Activity            |
      | Current Data        |
      | Order               |
