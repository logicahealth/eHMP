@F295_encounters_gist @regression @triage
Feature: F295 - Encounters Applet

# Team - Jupiter

@F295_encounters_initial_view
Scenario: User views the encounters gist view
	Given user is logged into eHMP-UI
	And user searches for and selects "Sixhundred,Patient"
  Then Overview is active
  And user sees Encounters Gist
  And the Encounters Gist Applet details view has headers
      | Header Id   | Headers Text  |
      | Description | Encounter     |
      | Event       | Hx Occurrence |
      | Age         | Last          |

@F295_encounters_initial_view @F295-1.1 @F295-1.2 @F295-1.3 @F295_4 @F295-1.5 @F295-1.7 @US3706 @US4001 @US4154 @US5126
Scenario: User views the encounters gist view
	Given user is logged into eHMP-UI
	And user searches for and selects "Sixhundred,Patient"
  Then Overview is active
  And user sees Encounters Gist
	And the user has selected All within the global date picker
	And the Encounters Gist Applet detail view contains
      | Description  | Occurrence |
      | Visits       | IS_NUMBER          |
      | Appointments | IS_NUMBER          |
      | Admissions   | IS_NUMBER          |
      | Procedures   | IS_NUMBER          |

@F295_encounters_visit_view @F295-1.9 @295-10.1 @295-10.2 @295-10.3 @295-10.4 @295-10.5 @295-10.6 @295-10.7 @295-10.8 @295-10.9 @295-10.10 @US3706 @US4001 @US4154 @US5126
Scenario: Presence of dynamic arrow for Visits group and Visits expansion
	  Given user is logged into eHMP-UI
	  And user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker
  	And there is a dynamic arrow next to visits in Encounters Gist Applet
  	When the user expands "Visits" in Encounters Gist Applet
  	Then Encounters Gist Applet "Visits" grouping expanded view contains headers
 	   | Visit Type	| Hx Occurrence	| Last	|
  	And the Encounters Gist Applet "Visits" grouping expanded view contains
      | Visit Type                | Hx Occurrence |
      | GENERAL INTERNAL MEDICINE | IS_NUMBER     |
      | CARDIOLOGY                | IS_NUMBER     |
  	
@F295_encounterGist_expanded_view @F295-2.1 @F295-2.2 @F295-2.3 @F295-2.4 @F295-2.5 @F295-12.1 @F295-12.2 @US4154 @US5126
Scenario: View Encounters Applet Gist - Single Page by clicking on Expand View
  	Given user is logged into eHMP-UI
  	And user searches for and selects "Sixhundred,PATIENT"
  	Then Overview is active
  	And user sees Encounters Gist
  	When the user clicks the control "Expand View" in the "Encounters Gist applet"
  	Then "Timeline" is active   	
  	When user exits the Timeline Applet
  	Then user sees Encounters Gist




  	
@F295_encounterGist_multioption_menu_visits @F295-4.7 @F295-4.8 @US4154 @US5126 @DE1388
Scenario: Encounters Applet Gist - Multi option menu display
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker 
  	When the user expands "Visits" in Encounters Gist Applet
 	  When user clicks on the "Left" hand side of the "Visit Type" "GENERAL INTERNAL MEDICINE" 
  	Then a Menu appears on the Encounters Gist 
  	When user clicks on the "Right" hand side of the "Visit Type" "GENERAL INTERNAL MEDICINE"
  	Then a Menu appears on the Encounters Gist 
  	

@F295_encounterGist_Column_Sorting_Visit_Type @F295-13.1 @F295-13.2 @US4684 @US4154 @US5126
Scenario: Encounter Gist Applet is sorted by the column header Visit Type under Visit.
  Given user is logged into eHMP-UI
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Encounters Gist
  And the user has selected All within the global date picker
  When the user expands "Visits" in Encounters Gist Applet
  When user clicks on the column header "Visit Type" in Encounters Gist
  Then "Visit Type" column is sorted in ascending order in Encounters Gist
  When user clicks on the column header "Visit Type" in Encounters Gist
  Then "Visit Type" column is sorted in descending order in Encounters Gist
  
@F295_encounterGist_Column_Sorting_Hx_Occurrence @F295-13.1 @F295-13.2 @US4684 @US4154 @US5126
Scenario: Encounters Gist Applet is sorted by the column header Hx Occrrence
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Encounters Gist
  And the user has selected All within the global date picker
  When the user expands "Visits" in Encounters Gist Applet
  When user clicks on the column header "Hx Occurrence" in Encounters Gist
  Then "Hx Occurrence" column is sorted in ascending order in Encounters Gist
  When user clicks on the column header "Hx Occurrence" in Encounters Gist
  Then "Hx Occurrence" column is sorted in descending order in Encounters Gist

#Following test has a tendency to fail since the data is not constant.  Due to calculation of dates, data is prone to chagne.
# so the test needs to be tested manually
@F295_encounterGist_Column_Sorting_last @F295-13.1 @F295-13.2 @US4684 @US4154 @US5126 @debug
Scenario: Encounters Gist Applet is sorted by the column header Last
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Encounters Gist
  And the user has selected All within the global date picker
  When the user expands "Visits" in Encounters Gist Applet
  When user clicks on the column header "Last" in Encounters Gist
  Then Last column is sorted in "ascending" order in Encounters Gist
  | 16y | 16y | 16y | 16y | 16y | 15y | 15y | 15y | 15y | 15y |
  When user clicks on the column header "Last" in Encounters Gist
  Then Last column is sorted in "descending" order in Encounters Gist
  | 15y | 15y | 15y | 15y | 15y | 16y | 16y | 16y | 16y | 16y |

@F295_encounters_global_datefilter @F295-9.2 @US4001
Scenario: Encounters gist applet is able to filter data based date filter search
  Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
  Then Overview is active
  And user sees Encounters Gist
  And the user clicks the control "Date Filter" on the "Overview"
  And the following choices should be displayed for the "Overview" Date Filter
    | Any | 2yr | 1yr | 3mo | 1mo | 7d | 72hr | 24hr |

  And the user clicks the date control "1yr" on the "Overview"
  And the user clicks the control "Apply" on the "Overview"
  And the Encounters Gist Applet detail view contains
	| Description	| Occurrence|
	| Visits		| 0			| 
	| Appointments	| 0 		| 
	| Admissions	| 0			| 
	| Procedures	| 0			| 

  And the user clicks the control "Date Filter" on the "Overview"
  And the user inputs "01/01/2006" in the "From Date" control on the "Overview"
  And the user clicks the control "Apply" on the "Overview"
  And the Encounters Gist Applet detail view contains
	| Description	| Occurrence| 
	| Visits		| 2			| 
	| Appointments	| 0 		| 
	| Admissions	| 0			| 
	| Procedures	| 0			| 


  @F295_encounters_procedures_view_b @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US3706 @US4001 @US4154 @US5126
Scenario: Expansion of procedures object
  Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
    Then Overview is active
    And user sees Encounters Gist
    And the user has selected All within the global date picker
    When the user expands "Procedures" in Encounters Gist Applet
    Then Encounters Gist Applet "Procedures" grouping expanded view contains headers
  | Procedure name  | Hx Occurrence | Last  |
    And the Encounters Gist Applet "Procedures" grouping expanded view contains
  | Procedure name        | Hx Occurrence |  
  | PULMONARY FUNCTION INTERPRET  | 1     |
  | PULMONARY FUNCTION TEST     | 1       | 
		
@F295_encounterGist_quick_view_procedures @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US4154 @US5126
Scenario: Encounters Applet Gist - quick view of Procedures
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker
  	When user hovers over and selects the right side of the "Procedures" tile
  	Then quick view table with title "Recent Procedures" appears
  	And the "Encounters Gist Quick View - Procedures" table contains headers
    |Date |	Procedure Name | Service | Facility|
    And the "Encounters Gist Quick View - Procedures" table contains 2 rows 
  	And the "Encounters Gist Quick View - Procedures" table contains rows
	| Date		 | Procedure Name 				| Service 		| Facility 	|
	| 02/04/2005 | PULMONARY FUNCTION INTERPRET | Unknown 		| BAY	   	|
	| 02/03/2005 | PULMONARY FUNCTION TEST 		| CP CARDIOLOGY	| TST1 		|
	When user hovers over and selects the right side of the "Procedures" tile
	Then Quick View draw box for "Procedures" closes
 	
@F295_procedures_quick_view @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US4154 @US5126 @DE1388
Scenario: Encounters Applet Gist - quick view of a particular Procedure 
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker 
  	When the user expands "Procedures" in Encounters Gist Applet
 	When user clicks on the "Right" hand side of the "Procedure Name" "PULMONARY FUNCTION INTERPRET"
  	Then the "Encounters Gist Quick View - Procedure Name" table contains headers
    |Date 	| Service |	Provider |	Facility |
  	And the "Encounters Gist Quick View - Procedure Name" table contains rows
	| Date		| Service | Provider| Facility	|
	| 02/04/2005| Unknown |	Unknown	| BAY		|
	When user clicks on the "Right" hand side of the "Procedure Name" "PULMONARY FUNCTION INTERPRET" 	
	Then Quick View draw box for "Procedure Name" closes

@F295_multioption_menu_procedure_quick_view @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US4154 @US5126 @future
Scenario: Encounters Applet Gist - quick view of a particular procedure thro' multi option menu
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker 
  	When the user expands "Procedures" in Encounters Gist Applet
 	When user clicks on the "Left" hand side of the "Procedure Name" "PULMONARY FUNCTION INTERPRET"
  	Then a Menu appears on the Encounters Gist 
  	When user select the menu "Quick View Icon" in Encounters Gist
  	Then the "Encounters Gist Quick View - Procedure Name" table contains headers
    |Date 	| Service |	Provider |	Facility |
  	And the "Encounters Gist Quick View - Procedure Name" table contains rows
	| Date		| Service | Provider| Facility	|
	| 02/04/2005| Unknown |	Unknown	| BAY		|
	When user select the menu "Quick View Icon" in Encounters Gist
	Then Quick View draw box for "Procedure Name" closes
	  	
@F295_multioption_menu_procedure_detail_view @F295-27.1 @F295-27.2 @F295-27.3 @F295-27.4 @F295-27.5 @F295-27.6 @F295-27.7 @F295-27.8 @US4154 @US5126 @debug @DE3334
Scenario: Encounters Applet Gist - detail view of Procedure thro' multi option menu
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker 
  	When the user expands "Procedures" in Encounters Gist Applet
 	When user clicks on the "Left" hand side of the "Procedure Name" "PULMONARY FUNCTION INTERPRET" 
  	Then a Menu appears on the Encounters Gist for the item "PULMONARY FUNCTION INTERPRET"
  	#When user select the menu "Detail View Icon" in Encounters Gist
    Then user selects the "PULMONARY FUNCTION INTERPRET" detail icon in Encounters Gist
  	Then it should show the detail modal of the most recent encounter
	And the modal's title is "pulmonary function interpret Details" 
    And the Timeline event "Procedure" Detail modal displays 
      | modal item      |
      | Facility        | 
      | Type            | 
      | Status          | 
      | Date/Time       | 
	
@F295_encounters_Appointments_view  @US3706 @US4001 @US4154 @US5126 @DE2923
Scenario: Expansion of Appointments object
	Given user is logged into eHMP-UI
	And user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker
  	When the user expands "Appointments" in Encounters Gist Applet
  	Then Encounters Gist Applet "Appointments" grouping expanded view contains headers
 	| Appointment Type 	| Hx Occurrence	| Last	|
  	And the Encounters Gist Applet "Appointments" grouping expanded view contains
	| Appointment Type				| Hx Occurrence	| 	
	| GENERAL INTERNAL MEDICINE 	| 10		    | 
	
@F295_encounterGist_quick_view_appointments @F295-34.1 @F295-34.2 @F295-34.3 @F295-34.4 @F295-34.5 @F295-34.6 @F295-34.7 @US4154 @US5126 @DE2923
Scenario: Encounters Applet Gist - quick view of Appointments
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker
  	When user hovers over and selects the right side of the "Appointments" tile
  	Then quick view table with title "Recent Appointments" appears
  	And the "Encounters Gist Quick View - Appointments" table contains headers
    | Date	| Appt Status | Clinic Name	| Provider | Facility |
    And the "Encounters Gist Quick View - Appointments" table contains 5 rows 
  	And the Encounters Gist Quick View - Appointments table contains rows
	# | Date		| Appt Status 		| Clinic Name				| Provider 			| Facility	|
	# | 05/28/2004|  NO ACTION TAKEN 	| GENERAL INTERNAL MEDICINE	| Provider, Eight 	| TST1		|
	# | 05/27/2004|  NO ACTION TAKEN	| GENERAL INTERNAL MEDICINE	| Provider, Eight 	| TST1		|
	# | 05/26/2004|  NO ACTION TAKEN	| GENERAL INTERNAL MEDICINE | Provider, Eight 	| TST1		|
	# | 05/25/2004|  NO ACTION TAKEN	| GENERAL INTERNAL MEDICINE | Provider, Eight 	| TST1		|
	# | 05/24/2004|  NO ACTION TAKEN	| GENERAL INTERNAL MEDICINE | Provider, Eight 	| TST1		|
	When user hovers over and selects the right side of the "Appointments" tile
	Then Quick View draw box for "Appointments" closes
  	
@F295_appointment_type_quick_view @F295-34.1 @F295-34.2 @F295-34.3 @F295-34.4 @F295-34.5 @F295-34.6 @F295-34.7 @US4154 @US5126 @DE1388 @DE2923
Scenario: Encounters Applet Gist - quick view of a particular Appointment 
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker 
  	When the user expands "Appointments" in Encounters Gist Applet
 	When user clicks on the "Right" hand side of the "Appointment Type" "GENERAL INTERNAL MEDICINE"
  	Then the "Encounters Gist Quick View - Appointment Type" table contains headers
    | Date	| Appt Status | Location | Provider | Facility |
  	And the "Encounters Gist Quick View - Appointment Type" table contains rows
	| Date		| Appt Status 		| Location			| Provider 			| Facility	|
	| 05/28/2004|  NO ACTION TAKEN 	| General Medicine	| Provider, Eight 	| TST1		|
	| 05/27/2004|  NO ACTION TAKEN	| General Medicine	| Provider, Eight 	| TST1		|
	| 05/26/2004|  NO ACTION TAKEN	| General Medicine 	| Provider, Eight 	| TST1		|
	| 05/25/2004|  NO ACTION TAKEN	| General Medicine 	| Provider, Eight 	| TST1		|
	| 05/24/2004|  NO ACTION TAKEN	| General Medicine 	| Provider, Eight 	| TST1		|
	When user clicks on the "Right" hand side of the "Appointment Type" "GENERAL INTERNAL MEDICINE"	
	Then Quick View draw box for "Appointment Type" closes

@F295_multioption_menu_appointment_quick_view @F295-34.2 @US5386 @future
Scenario: Encounters Applet Gist - quick view of a particular appointment thro' multi option menu
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker 
  	When the user expands "Appointments" in Encounters Gist Applet
 	When user clicks on the "Left" hand side of the "Appointment Type" "GENERAL INTERNAL MEDICINE"
  	Then a Menu appears on the Encounters Gist 
  	When user select the menu "Quick View Icon" in Encounters Gist
  	Then the "Encounters Gist Quick View - Appointment Type" table contains headers
    | Date	| Appt Status | Location | Provider | Facility |
  	And the "Encounters Gist Quick View - Appointment Type" table contains rows
	| Date		| Appt Status 		| Location			| Provider 			| Facility	|
	| 05/28/2004|  SCHEDULED/KEPT 	| General Medicine	| Provider, Eight 	| TST1		|
	| 05/27/2004|  SCHEDULED/KEPT	| General Medicine	| Provider, Eight 	| TST1		|
	| 05/26/2004|  SCHEDULED/KEPT	| General Medicine 	| Provider, Eight 	| TST1		|
	| 05/25/2004|  SCHEDULED/KEPT	| General Medicine 	| Provider, Eight 	| TST1		|
	| 05/24/2004|  SCHEDULED/KEPT	| General Medicine 	| Provider, Eight 	| TST1		|
	When user select the menu "Quick View Icon" in Encounters Gist
	Then Quick View draw box for "Appointment Type" closes
	  	
@F295_multioption_menu_appointment_detail_view @F295-32.5 @US4154 @US5126 @DE1388 @DE2923
Scenario: Encounters Applet Gist - detail view of Appointment thro' multi option menu
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "Sixhundred,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker 
  	When the user expands "Appointments" in Encounters Gist Applet
 	When user clicks on the "Left" hand side of the "Appointment Type" "GENERAL INTERNAL MEDICINE" 
  	#Then a Menu appears on the Encounters Gist 
    Then a Menu appears on the Encounters Gist for the item "GENERAL INTERNAL MEDICINE"
     Then user selects the "GENERAL INTERNAL MEDICINE" detail icon in Encounters Gist
  	#When user select the menu "Detail View Icon" in Encounters Gist
  	Then it should show the detail modal of the most recent encounter
	And the modal's title is "GENERAL INTERNAL MEDICINE" 
	  And the Timeline event "Appointment" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Appointment Status|
      | Location        | 
      | Stop Code       | 
      | Facility        | 
	
@F295_encounters_Admissions_view  @US3706 @US4001 @US4154 @US5126
Scenario: Expansion of Admission object
	Given user is logged into eHMP-UI
	And user searches for and selects "zzzretiredonenineteen,patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker
  	When the user expands "Admissions" in Encounters Gist Applet
  	Then Encounters Gist Applet "Admissions" grouping expanded view contains headers
 	| Diagnosis 	| Hx Occurrence	| Last	|
  	And the Encounters Gist Applet "Admissions" grouping expanded view contains
	| Diagnosis		| Hx Occurrence	|  	
	| SLKJFLKSDJF 	| 1			    | 
	| OBSERVATION	| 1				| 
		

	  	
@F295_multioption_menu_admission_detail_view @F295-35.4 @US4154 @US5126 @US4805 @DE1388
Scenario: Encounters Applet Gist - detail view of admission thro' multi option menu
  	Given user is logged into eHMP-UI
  	Given user searches for and selects "zzzretiredonenineteen,Patient"
  	Then Overview is active
  	And user sees Encounters Gist
  	And the user has selected All within the global date picker 
  	When the user expands "Admissions" in Encounters Gist Applet
 	When user clicks on the "Left" hand side of the "Diagnosis" "OBSERVATION" 
    Then a Menu appears on the Encounters Gist for the item "OBSERVATION"
    Then user selects the "OBSERVATION" detail icon in Encounters Gist
  	Then it should show the detail modal of the most recent encounter
	And the modal's title is "Hospitalization" 
    And the Timeline event "Admission" Detail modal displays 
      | modal item      |
      | Date            | 
      | Type            | 
      | Category        | 
      | Patient Class   | 
      | Location        | 
      | Stop Code       | 
      | Facility        | 
      | Movements		|
      | Reason			|
      
@DE1375 @debug @DE3334
Scenario: Encounters Applet Gist - Verify expected buttons are present, visible and accessable
  Given user is logged into eHMP-UI
  Given user searches for and selects "Sixhundred,Patient"
  Then Overview is active
  And user sees Encounters Gist
  And the user has selected All within the global date picker 
  When the user expands "Procedures" in Encounters Gist Applet
  When user clicks on the "Left" hand side of the "Procedure Name" "PULMONARY FUNCTION INTERPRET" 
  Then a Menu appears on the Encounters Gist for the item "PULMONARY FUNCTION INTERPRET"
  #When user select the menu "Detail View Icon" in Encounters Gist
  Then user selects the "PULMONARY FUNCTION INTERPRET" detail icon in Encounters Gist
  Then it should show the detail modal of the most recent encounter
  And the modal's title is "pulmonary function interpret Details" 
  And the user can view and interact with the "Close" control
  
@f295_encounters_gist_refresh 
Scenario: Encounters Gist displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred"
  Then Overview is active
  And user sees Encounters Gist
  And the user has selected All within the global date picker
  And the Encounters Gist Applet contains data rows
  When user refreshes Encounters Gist Applet
  Then the message on the Encounters Gist Applet does not say "An error has occurred"
  
@f295_encounters_gist_expand_view_refresh 
Scenario: Encounters expand view (which is Timeline) displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred"
  Then Overview is active
  And user sees Encounters Gist
  And the user has selected All within the global date picker
  When the user clicks the control "Expand View" in the "Encounters Gist applet"
  Then "Timeline" is active   	
  And the NewsFeed Applet table contains data rows
  When user refreshes Timeline Applet
  Then the message on the Timline Applet does not say "An error has occurred"
