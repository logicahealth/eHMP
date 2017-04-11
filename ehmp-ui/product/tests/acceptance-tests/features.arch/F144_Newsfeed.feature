@F144_NewsFeedApplet @regression

Feature: F144-eHMP Viewer GUI - Timeline(NewsFeed)

#DE1328 has been implemented in new framework.  Archiving.
@f144_21_newsFeedDisplay_DoDEncounters @US4183 @DE1328 @debug
Scenario: News feed applet displays all of the DoD Encounters for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "Onehundredsixteen, Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then the NewsFeed Applet table contains rows
    | Date & Time        | Activity    		  | Type          | Entered By | Facility    |
	  | 09/10/2012 - 14:21 | Visit OUTPATIENT	| DoD Encounter |			       | DOD         |
	
#implemented in RDK, test modified in UI only to check presence of rows.  Specific data checking have been moved to RDK
@f144_1_newsFeedDisplay @US1946  @US5422
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the NewsFeed Applet table contains specific rows
	  | row index   | Date & Time        | Activity                          			            | Type      | Entered By | Facility      |
      |	2			| 11/02/2006 - 15:28 | Seen in GENERAL INTERNAL MEDICINE 20 Minute            | Visit     |            | FT. LOGAN     |
      |	3			| 11/02/2006 - 14:30 | Seen in GENERAL INTERNAL MEDICINE 20 Minute            | Visit     |            | FT. LOGAN     |
      |	6			| 02/04/2005 - 10:51 | PULMONARY FUNCTION INTERPRET completed	                | Procedure |            | ABILENE (CAA) |
      |	5			| 02/04/2005 - 10:51 | Seen in CARDIOLOGY Cardiology                          | Visit     |            | FT. LOGAN     |
      |	7			| 02/03/2005 - 13:47 | Seen in CARDIOLOGY Cardiology                          | Visit     |            | FT. LOGAN     |
      |	8			| 02/03/2005 - 13:44 | PULMONARY FUNCTION TEST CP CARDIOLOGY Proc completed   | Procedure |            | CAMP MASTER   |

#implemented in RDK, test modified in UI only to check presence of rows.  Specific data checking have been moved to RDK      
@f144_1b_newsFeedDisplay @US1946
Scenario: News feed applet displays all of the Visits for a given patient in a grid form if the global date filter is set after user has navigated to timeline
  Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
  When user navigates to Timeline Applet
  And the user has selected All within the global date picker
  And the NewsFeed Applet table contains specific rows
      | row index | Date & Time        | Activity                                             | Type      | Entered By | Facility      |
      | 2         | 11/02/2006 - 15:28 | Seen in GENERAL INTERNAL MEDICINE 20 Minute          | Visit     |            | FT. LOGAN     |
      | 3         | 11/02/2006 - 14:30 | Seen in GENERAL INTERNAL MEDICINE 20 Minute          | Visit     |            | FT. LOGAN     |
      | 6         | 02/04/2005 - 10:51 | Seen in CARDIOLOGY Cardiology                        | Visit     |            | FT. LOGAN     |
      | 5         | 02/04/2005 - 10:51 | PULMONARY FUNCTION INTERPRET completed               | Procedure |            | ABILENE (CAA) |
      | 7         | 02/03/2005 - 13:47 | Seen in CARDIOLOGY Cardiology                        | Visit     |            | FT. LOGAN     |
      | 8         | 02/03/2005 - 13:44 | PULMONARY FUNCTION TEST CP CARDIOLOGY Proc completed | Procedure |            | CAMP MASTER   |
      
@f144_2_newsFeedDisplay @US2457
Scenario: News feed applet displays all of the Visits for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then "Timeline" is active
  And the NewsFeed Applet table contains specific rows
  	|row index    | Date & Time        | Activity                    	    | Type      | Entered By          | Facility    |
    |	2		        | 05/03/1996 - 11:12 | Visit Event (Historical) 		    | Visit     |                     | CAMP MASTER |
    |  	10		    | 12/26/1995 - 11:55 | Visit Event (Historical) 		    | Visit     |                     | CAMP MASTER |
    |  	15		    | 09/29/1995 - 00:00 | Consulted                   		  | Consult   |                     | CAMP MASTER |
    |   21        | 01/25/1995 - 15:57 | Admitted to TROY GENERAL MEDICINE| Admission |                     | TROY        |
    |   23        | 05/20/1993 - 13:00 | Discharged from CAMP MASTER      | Admission | Provider,Twentynine | CAMP MASTER |
  And the user sees "admitted" and "discharged" highlighted in orange
  
# This test is moved into RDK
@f144_17_newsFeedDisplay_Appointments @US2845 @DE713 @future
Scenario: News feed applet displays all of the appointments for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "Onehundredsixteen, Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the NewsFeed Applet table contains specific rows
      | row index | Date & Time        | Activity   | Type            | Entered By | Facility |
      | 18        | 10/18/2012 - 08:00 | Visit ROUT | DoD Appointment |            | DOD      |
      | 19        | 10/17/2012 - 14:30 | Visit SPEC | DoD Appointment |            | DOD      |
      
# This test is moved into RDK
@f144_18_newsFeedDisplay_LabResults @US2845 @DE713 @future
Scenario: News feed applet displays all of the lab visits for a given patient in a grid form
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFORTYSEVEN"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  Then the NewsFeed Applet table contains specific rows
      | row index | Date & Time        | Activity         | Type       | Entered By | Facility    |
      | 9        | 11/20/1998 - 16:34 | CHLORIDE - SERUM | Laboratory |            | CAMP MASTER |
      | 10        | 11/20/1998 - 16:34 | CO2 - SERUM      | Laboratory |            | CAMP MASTER |
      
@f144_4_newsFeedDisplay @US2389 @modal_test
Scenario: News feed applet displays visit modal pop-up after you select that event

  Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "Visit 1996" in NewsFeedApplet
  Then the user sees the modal pop-up
      | field                | value              |
      | Date                 | 05/03/1996 - 11:12 |
      | Type                 | Event (Historical) |
      | Category             | Outpatient Visit   |
      | Patient Class        | Inpatient          |
      | Location             | Blank              |
      | Stop Code            | Blank              |
      | Facility             | CAMP MASTER        |
  When user clicks on the Close button
  Then the detail view in NewsFeed Applet closes
  
@f144_5_newsFeedDisplay @US2389
Scenario: News feed applet displays admission modal pop-up after you select that event

  Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "Admitted 1995" in NewsFeedApplet
  Then the user sees the modal pop-up
      | field                | value              |
      | Date                 | 01/25/1995 - 15:57 |
      | Type                 | Hospitalization    |
      | Category             | Admission          |
      | Patient Class        | Inpatient          |
      | Location             | Gen Med            |
      | Stop Code            | Blank              |
      | Facility             | TROY               |
  And the user sees the section header "Movements"
  And the user sees modal details
  	  | field	   |
      | 03/15/1995 |
      | GEN MED    |
      | TRANSFER   |
  When user clicks on the Close button
  Then the detail view in NewsFeed Applet closes
  
@f144_6_newsFeedDisplay @US2389 @modal_test
Scenario: News feed applet displays discharged modal pop-up after you select that event

  Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "Discharged 1993" in NewsFeedApplet
  Then the user sees the modal pop-up
      | field                | value              |
      | Date                 | 05/20/1993 - 10:00 |
      | Type                 | Hospitalization    |
      | Category             | Admission          |
      | Patient Class        | Inpatient          |
      | Location             | Drugster           |
      | Stop Code            | Blank              |
      | Facility             | CAMP MASTER        |
  And the user sees the section header "Providers"
  And the user sees the section header "Movements"
  Then the user sees the modal pop-up
      | field                      | value                |
      | Additional Provider        | Provider,Twentynine  |
      | Primary                    | Provider,Twentynine  |
  And the user sees modal details
      | value      |
      | 05/20/1993 |
      | Blank      |
      | DISCHARGE  |
  When user clicks on the Close button
  Then the detail view in NewsFeed Applet closes
  
@f144_7_newsFeedDisplay	@US2385  @modal_test
Scenario: News feed applet displays immunization modal pop-up for after you select that event

  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURNINETEEN,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "Immunization 2000" in NewsFeedApplet
  Then the user sees modal pop-up title "Vaccine - PNEUMOCOCCAL, UNSPECIFIED FORMULATION"
  When user clicks on the Close button
  Then the detail view in NewsFeed Applet closes
  
@f144_10_newsFeedDisplay @US2388  @MJB2
Scenario: News feed applet displays Surgery detail view correctly
# the details of surgery applet are verified in Documents test case

  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOUREIGHTY,PATIENT"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "Surgery 1994" in NewsFeedApplet
  Then the user sees modal pop-up title "biospy Details"
  When user clicks on the Close button
  Then the detail view in NewsFeed Applet closes
  
@f144_11_newsFeedDisplay @US2403
Scenario: News feed applet displays Consult detail view correctly
# the details of Consult applet are verified in Documents test case

  Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "Consult 1995" in NewsFeedApplet
  Then the user sees modal pop-up title "cardiology cons Details"
  When user clicks on the Close button
  Then the detail view in NewsFeed Applet closes
  
@f144_12_newsFeedDisplay @US2403 @modal_test
Scenario: News feed applet displays Procedure detail view correctly

# the details of Procedure applet are verified in Documents test case

  Given user is logged into eHMP-UI
  And user searches for and selects "Sixhundred,Patient"
  Given the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "Procedure 2005" in NewsFeedApplet
  Then the user sees modal pop-up title "pulmonary function interpret Details"
  When user clicks on the Close button
  Then the modal is closed
  
@f144_19_newsFeedDisplay_AppointmentDetails @US2845 @DE713
Scenario: News feed applet displays Appointment detail view correctly

  Given user is logged into eHMP-UI
  And user searches for and selects "Onehundredsixteen, Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet

  And the user clicks on the event "DoD Appointment" in NewsFeedApplet
  Then the user sees modal pop-up title "ROUT"
  When user clicks on the Close button
  Then the modal is closed
  
@f144_22_newsFeedDisplay_Encounter_Details @US4183
Scenario: News feed applet displays Encounters detail view correctly

  Given user is logged into eHMP-UI
  And user searches for and selects "Onehundredsixteen, Patient"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "DoD Encounter 2012" in NewsFeedApplet
  Then the user sees modal pop-up title "OUTPATIENT"
  When user clicks on the Close button
  Then the modal is closed
  
@f144_20_newsFeedDisplay_LabDetails @US2845 @DE910 @debug @DE2066
Scenario: News feed applet displays Labs detail view correctly
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFORTYSEVEN"
  And the user has selected All within the global date picker
  When user navigates to Timeline Applet
  And the user clicks on the event "Lab 1998" in NewsFeedApplet
  Then the user sees modal pop-up title "CHLORIDE - SERUM"
  When user clicks on the Close button
  Then the modal is closed
  
@f144_16_newsFeedDisplay @US2639
Scenario: Newsfeed applet is able to filter data based date filter search

  Given user is logged into eHMP-UI
  And user searches for and selects "Zzzretiredonenineteen,Patient"
  When user navigates to Timeline Applet
  Then "Timeline" is active

  And the user clicks the control "Date Filter" in the "NewsFeed Applet"
  And the user inputs "12/01/1995" in the "From Date" control in the "NewsFeed Applet"
  And the user inputs "12/31/2020" in the "To Date" control in the "NewsFeed Applet"
  And the user clicks the control "Apply" in the "NewsFeed Applet"
  And the NewsFeed Applet table contains specific rows
  | row index	| Date & Time		    | Activity				 		| Type		| Entered By | Facility		|
  | 2			  | 05/03/1996 - 11:12  | Visit Event (Historical)		| Visit		|			 | CAMP MASTER	|
  | 10			| 12/26/1995 - 11:55  | Visit Event (Historical)		| Visit		|			 | CAMP MASTER	|
  | 11			| 12/26/1995 - 11:29  | Visit Event (Historical)		| Visit		|			 | CAMP MASTER	|
