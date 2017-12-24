@US1847  @appointmentsandvisits  @reg2
Feature:F144-eHMP Viewer GUI - Appointments & Visits

Background:
  Given user searches for and selects "Eight,Patient"
  And user navigates to expanded Appointments and Visits applet

@US1847d @DE3318
Scenario: Users will be able to use the date filter on the expanded view
  Given the user has selected 24hr within the filter daterange on Appointments and Visits
  Then Appointments applet loads without issue
  And the user scrolls the Appointments applet
  And the Appointments table only displays rows from the last 24 hours

@f144_appointmentsvisits_applet_expand_view_refresh 
Scenario: Appointments and Visits expand view applet displays all of the same details after applet is refreshed 
  Given the user has selected All within the filter daterange on Appointments and Visits
  Then the Appointments & Visits expanded applet is displayed
  And the Appointments and Visits Applet contains data rows
  And the user has noted the number of Appointments and Visit rows
  When user refreshes Appointments and Visits Applet
  Then the message on the Appointments and Visits Applet does not say "An error has occurred"
  And the Appointments and Visits Applet displays the expected number of rows

@appointment_expand
Scenario: Users will be able to expand Appointments applet
  Then the Appointments & Visits title is "Appointments & Visits"
  And the Appointments expanded table contains headers
      | Headers     |
      | Date        |
      | Description |
      | Location    |
      | Status      |
      | Type        |
      | Reason      |
      | Facility    |

 @appointment_detail
 Scenario: View detail view
  Given the user has selected All within the filter daterange on Appointments and Visits
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

 @appointment_sort
 Scenario: Verify sort
  Given the user has selected All within the filter daterange on Appointments and Visits
  And Appointments applet loads without issue
  And the Appointments and Visits Applet contains data rows
  When the user sorts the Appointments and Visits applet by column Description
  Then the Appointments and Visits applet is sorted in alphabetic order based on column Description

 @appointment_sourcefilter
 Scenario: Verify source filter
  Given the user has selected All within the filter daterange on Appointments and Visits
  And Appointments applet loads without issue
  And the Appointments and Visits Applet contains data rows
  When the user changes Source to Local VA
  Then the Appointments and Visits does not display DOD facility rows
  When the user changes Source to All VA + DOD
  Then the Appointments and Visits does display DOD facility rows
