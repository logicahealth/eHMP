#Team Neptune
@US1847 @regression @appointmentsandvisits 
Feature:F144-eHMP Viewer GUI - Appointments & Visits

Background:
	# Given user is logged into eHMP-UI
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@appointment_filter @DE2901
Scenario: Users will be able to filter data on the Appointments Applet by description
  And Appointments applet loads without issue
  And the user has selected All within the global date picker
  And Appointments applet loads without issue
  When the user filters the Appointment Applet by text "Visit"
  Then the Appointments table only diplays rows including text "Visit"

@appointment_refresh
Scenario: User will be able to refresh the applet
  And Appointments applet loads without issue
  And the user has selected All within the global date picker
  And Appointments applet loads without issue
  When the user refreshes the applet
  Then Appointments applet loads without issue

@appointment_modalb
Scenario: Users will be able to view modal popup for appointments
  And the user has selected All within the global date picker
  And Appointments applet loads without issue
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

@appointment_expand
Scenario: Users will be able to expand Appointments applet
  When the user clicks the "Appointments Expand Button"
  Then the Appointments & Visits expanded applet is displayed
  And Appointments applet loads without issue
  And the Appointments expanded table contains headers
      | Headers     |
      | Date        |
      | Description |
      | Location    |
      | Status      |
      | Type        |
      | Reason      |
      | Facility    |

  
@US1847d @DE3318
Scenario: Users will be able to use the date filter on the expanded view
  And the applets are displayed on the coversheet
		| applet 					|
		| APPOINTMENTS   		 	|
  And the Appointments coversheet table contains headers
       | Headers     |
       | Date        | 
       | Description | 
       | Location    |
       | Status      |
       | Facility    |
  When the user clicks the "Appointments Expand Button"
  When the user clicks the "24 hr Appointments Range"
  Then Appointments applet loads without issue
  And the user scrolls the Appointments applet
  And the Appointments table only displays rows from the last 24 hours
	
@f144_appointmentsvisits_applet_summary_view_refresh 
Scenario: Appointments and Visits Summary applet displays all of the same details after applet is refreshed
  And Appointments applet loads without issue
  And the user has selected All within the global date picker
  And the Appointments and Visits Applet contains data rows
  When user refreshes Appointments and Visits Applet
  Then the message on the Appointments and Visits Applet does not say "An error has occurred"
  
@f144_appointmentsvisits_applet_expand_view_refresh 
Scenario: Appointments and Visits expand view applet displays all of the same details after applet is refreshed 
  And Appointments applet loads without issue
  And the user has selected All within the global date picker
  When the user clicks the "Appointments Expand Button"
  Then the Appointments & Visits expanded applet is displayed
  And the Appointments and Visits Applet contains data rows
  When user refreshes Appointments and Visits Applet
  Then the message on the Appointments and Visits Applet does not say "An error has occurred"

