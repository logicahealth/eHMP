@F144_Global_Date_Filter  
Feature: F144 - eHMP Viewer GUI - Global Date Filter

# Team: Andromeda

Background:
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@f144_global_date_applet_integration_custom @US2626 @TA8070e @DE3588 @future @DE4560
Scenario: Global date filtering is applied to applets on the coversheet - Orders applet.
  When the user changes the global date filter to 2YR
  Then the Orders applet displays orders from the last 2 yrs

  When the user changes the global date filter to 1YR
  Then the Orders applet displays orders from the last yr

  When the user changes the global date filter to 3M
  Then the Orders applet displays orders from the last 3 months

  When the user changes the global date filter to custom dates From "02/01/2010" and to "10/10/2020"
  Then the Orders applet displays orders between "02/01/2010" and "10/10/2020"

@f144_global_date_applet_integration_custom @US2626 @DE387 @TA8070f @DE3588
Scenario: Global date filtering is applied to applets on the coversheet - Numeric Lab Results applet.
  When the user changes the global date filter to 2YR
  Then the Numeric Lab Results applet displays results from the last 2 yrs

  When the user changes the global date filter to 1YR
  Then the Numeric Lab Results applet displays results from the last yr

  When the user changes the global date filter to 3M
  Then the Numeric Lab Results applet displays results from the last 3 months

  When the user changes the global date filter to custom dates From "02/01/2010" and to "10/10/2020"
  Then the Numeric Lab Results applet displays results between "02/01/2010" and "10/10/2020"

@f144_global_date_filter_persistence @US2761 @TA8896d @DE6230
Scenario: Single-page extended view date changes to not carry back to global date filter.
  When the user changes the global date filter to 24HR
  Then the Numeric Lab Results applets displays results from the last 24 hrs
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  And the user is viewing the expanded view of the Numeric Lab Results Applet
  And Numeric Lab Results applet loads without issue
  And the user clicks the date control All in the Numeric Lab Results applet
  And Numeric Lab Results applet loads without issue
  And the user minimizes the expanded Numeric Lab Results Applet
  Then the coversheet is displayed
  And the global date filter displays 24 hour range

