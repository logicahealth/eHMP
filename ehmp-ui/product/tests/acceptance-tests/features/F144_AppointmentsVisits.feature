@US1847  @appointmentsandvisits  @reg2
Feature:F144-eHMP Viewer GUI - Appointments & Visits

Background:
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@appointment_appearance
Scenario:
  Then the Appointments & Visits title is "Appointments & Visits"
  And the Appointments coversheet table contains headers
       | Headers     |
       | Date        | 
       | Description | 
       | Location    |
       | Status      |
       | Facility    |
  And Appointments applet loads without issue

@appointment_filter @DE2901
Scenario: Users will be able to filter data on the Appointments Applet by description
  Given the user has selected All within the global date picker
  And Appointments applet loads without issue
  When the user filters the Appointment Applet by text "Visit"
  Then the Appointments table only diplays rows including text "Visit"

@appointment_sort
Scenario: Verify sort
  Given the user has selected All within the global date picker
  And Appointments applet loads without issue
  And the Appointments and Visits Applet contains data rows
  When the user sorts the Appointments and Visits applet by column Description
  Then the Appointments and Visits applet is sorted in alphabetic order based on column Description


@appointment_modal
Scenario: Users will be able to view modal popup for appointments
  Given the user has selected All within the global date picker
  And Appointments applet loads without issue
  And the Appointments and Visits Applet contains data rows
  When the user views the first appointment detail view
  Then the modal is displayed
  And the Appointment Detail modal displays 
      | modal item      |
      | Date            |
      | Type            |
      | Description     |
      | Patient class   |
      | Location        |
      | Status          |
      | Stop code       |
      | Facility        |

@f144_appointmentsvisits_applet_summary_view_refresh 
Scenario: Appointments and Visits Summary applet displays all of the same details after applet is refreshed
  Given the user has selected All within the global date picker
  And Appointments applet loads without issue
  And the Appointments and Visits Applet contains data rows
  And the user has noted the number of Appointments and Visit rows
  When user refreshes Appointments and Visits Applet
  Then the message on the Appointments and Visits Applet does not say "An error has occurred"
  And the Appointments and Visits Applet displays the expected number of rows
  


