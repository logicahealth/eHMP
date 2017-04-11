#Team Pluto
@F693_OrdersAppletEnhancements @US10791 @regression
Feature: F693 - Orders Applet Enhancements

  @F693_OrdersAppletEnhancements @US10791
  Scenario: User will be able to sort reverse chronological and chronological order on Order Date Column
    # Given user is logged into eHMP-UI
    And user searches for and selects "Eight, Patient"
    Then Cover Sheet is active
    And POB the "Orders" Coversheet applet is displayed
    When POB the user clicks the Orders Expand Button
    And POB "orders" applet loaded successfully
    And the Order Date Column Header exist
    And the Orders Results are not sorted in reverse chronological or chronological order
    When the user clicks on the Order Date Column Header
    Then the Orders Results are sorted in reverse chronological order
    When the user clicks on the Order Date Column Header
    Then the Orders Results are sorted in the chronological order
