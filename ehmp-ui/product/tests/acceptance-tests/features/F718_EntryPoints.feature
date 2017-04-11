@F718 @regression @triage
Feature: Invoke Outpatient Lab Order Form

Background:
  Given user is logged into eHMP-UI
  And user searches for and selects "twenty,patient"
  Then Default Screen is active
  And user selects and sets new encounter

@US6777 @TC968_1
Scenario: Verify Lab Order Form can be accessed from all entry points - Numeric Lab Results Trend View
  Given Overview is active
  Then the Numeric Lab Results Trend applet is displayed
  And the Numeric Lab Results applet contains buttons
    | buttons  |
    | Add      |
  When the user clicks the Add button on the Numeric Lab Results Applet
  Then add order modal detail title says "Order a Lab Test"


@US6777 @TC968_2
Scenario: Verify Lab Order Form can be accessed from all entry points - Numeric Lab Results Summary View
  Given Cover Sheet is active
  Then the Numeric Lab Results Summary applet is displayed
  And the Numeric Lab Results applet contains buttons
    | buttons  |
    | Add      |
  When the user clicks the Add button on the Numeric Lab Results Applet
  Then add order modal detail title says "Order a Lab Test"

@US6777 @TC968_3
Scenario: Verify Lab Order Form can be accessed from all entry points - Numeric Lab Results Expanded View
  When the user navigates to Numeric Lab Results Expanded
  Then the Numeric Lab Results Expanded applet is displayed
  And the Numeric Lab Results applet contains buttons
    | buttons  |
    | Add      |
  When the user clicks the Add button on the Numeric Lab Results Applet
  Then add order modal detail title says "Order a Lab Test"


@US6777 @TC968_4 @debug @DE3715
Scenario: Verify Lab Order Form can be accessed from all entry points - Orders Summary View
	Given Cover Sheet is active
	And the "Orders" applet is displayed
	And the Orders Applet contains buttons
       | buttons  |
       | Add      |
  When user adds a new order
  Then add order modal detail title says "Order a Lab Test"

@US6777 @TC968_5 @debug @DE3715
Scenario: Verify Lab Order Form can be accessed from all entry points - Orders Expanded View
  When the user navigates to Orders Expanded
  And the "Orders" applet is displayed
  And the Orders Applet contains buttons
       | buttons  |
       | Add      |
  When user adds a new order
  Then add order modal detail title says "Order a Lab Test"
