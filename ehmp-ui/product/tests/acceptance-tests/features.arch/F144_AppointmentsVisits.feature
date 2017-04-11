#Team Neptune
@US1847 @regression @appointmentsandvisits @triage
Feature:F144-eHMP Viewer GUI - Appointments & Visits

Background:
  # Given user is logged into eHMP-UI
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

# The expected row does not scroll into view using the scroll function that all other applets use
# not sure what is going on
@appointment_modal @modal_test @DE433 @debug @DE1600
Scenario: Users will be able to view modal popup for appointments
  And the user has selected All within the global date picker
  And Appointments applet loads without issue
  Then the user clicks the "Appointments Expand Button"
  Then the Appointments & Visits expanded applet is displayed
  And Appointments applet loads without issue
  When the user clicks the "12/02/2013 - 13:00 Visit GENERAL MEDICINE (TST1)" appointment row
  And the modal's title is "Visit"
  Then user sees Appointments Modal table display
     | header 1         | header 2              |
     | Date Value| 12/02/2013              |
     | Location Value | GENERAL MEDICINE |
