@F282_coditions_gist @regression @triage
Feature: F82 - Conditions Gist View

#TEAM JUPITER
	
@F282-1.1 @F282-2.1 @F282_1_conditionsGist_problems @US3390 @US4317
Scenario: User views the conditions gist view
	Given user is logged into eHMP-UI
	And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"	
  	Then Overview is active
  	And user sees Conditions Gist
  	And the user has selected All within the global date picker
  	And the conditions gist detail view has headers
  	  | Headers       |
      | Problem       |
      | Acuity        |
      | Status        |
      | Facility      |
	And the conditions gist detail view contains
	  | Problem                                        | Acuity  | Status | Facility |
      | UPPER EXTREMITY                              | Unknown | Active | TST1     |
      | Chronic Sinusitis                            | Acute   | Active | TST1     |
      | MANIC DISORDER-MILD                          | Chronic | Active | TST1     |
      | ALCOH DEP NEC/NOS-REMISS                     | Unknown | Active | TST1     |
      | Essential Hypertension                       | Acute   | Active | TST1     |
      | Adjustment Reaction With Physical Symptoms   | Unknown | Active | TST1     |
    

@F282-1.2 @US3390 @US4317
Scenario: User views the conditions gist view
	Given user is logged into eHMP-UI
	And user searches for and selects "Sixhundred,PATIENT"	
  	Then Overview is active
  	And user sees Conditions Gist
  	And "No Records Found" message is displayed in Conditions Gist

#@F282-3.1 @US3390 @US4317
#since the color is not attached to the correct id, this test case is moved as being manual.
#Scenario: User views the conditions gist view
#	Given user is logged into eHMP-UI
#	And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"	
#  	Then Overview is active
#  	And user sees Conditions Gist
#  	When hovering over the "right" side of the tile "UPPER EXTREMITY" 
#  	Then right half of the tile "UPPER EXTREMITY" changes color to indicate that there are more records that can be review
#    When hovering over the "left" side of the tile "UPPER EXTREMITY" 
#  	Then left half of the tile "UPPER EXTREMITY" changes color to indicate that the user can go to the detailed view

#@F282-3.2 is a manual test case
  	
@F282-5.1 @F282_2_conditionsGist_ExpandView @US3390 @4317 @DE1576 
Scenario: View Conditions Applet Single Page by clicking on Expand View
  Given user is logged into eHMP-UI
  And user searches for and selects "FORTYSIX,PATIENT"
  Then Overview is active
  And user sees Conditions Gist
  When the user clicks the control "Expand View" in the "Conditions Gist applet"
  Then the Conditions Gist applet title is "CONDITIONS"
  And the Conditions Gist Applet table contains headers
    | header text |
    | Description | 
    | Standardized Description |  
    | Acuity | 
    | Onset Date | 
    | Last Updated | 
    | Provider | 
    | Facility |
  And the Conditions Applet contains data rows

@F282-4.1 @F282_3_conditionsGist_filter_capability @US3390 @4317 
Scenario: Conditions Applet Gist - filter problems
  Given user is logged into eHMP-UI
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  When the user clicks the control "Filter Toggle" in the "Conditions Gist applet"
  And the user filters the Conditions Applet by text "Dia"
  Then the conditions table only diplays rows including text "Dia"

@F282_4_conditionsGist_global_datefilter @US3390 @4317 @vimm_observed
Scenario: Conditions gist applet is able to filter data based date filter search
 Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Encounters Gist
  And the user clicks the control "Date Filter" on the "Overview"
  And the Date Filter displays "18" months in the past and "6" months in the future
  And the user inputs "01/01/1999" in the "From Date" control on the "Overview"
  And the user inputs "12/31/2099" in the "To Date" control on the "Overview"
  And the user clicks the control "Apply" on the "Overview"
  And the conditions gist detail view contains
	| Problem									| Acuity	| Status	| Facility	|
	| MANIC DISORDER-MILD 		| Chronic	| Active	| TST1	    |
	| UPPER EXTREMITY					| Unknown	| Active	| TST1 	    |

@F282-7.1 @F282_5_conditionsGist_quick_view @US4155 @4317 @DE1321
Scenario: Conditions Applet Gist - quick view of problems
  Given user is logged into eHMP-UI
 Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  #Given user searches for and selects "FORTYSIX,PATIENT"
  
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  And hovering over the right side of problem trend view and selecting the "quick view" pop-up link
  Then the "Problems Gist Quick View Table" table contains headers
    | Date | Description | Facility |
  And the Problems Gist Quick View Table table contains rows
  And clicking a second time on the "quick view" hover button will result in the closure of the quick draw data box

@F282-9.1 @F282_6_conditionsGist_Column_Sorting_Problem @US4684 @DE1371
  Scenario: Conditions Gist Applet is sorted by the column header Problems
    Given user is logged into eHMP-UI
    And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
    Then Overview is active
    And user sees Conditions Gist
    And the user has selected All within the global date picker
    When user clicks on the column header "Problem" in Conditions Gist
    Then "Problem" column is sorted in ascending order in Conditions Gist
    When user clicks on the column header "Problem" in Conditions Gist
    Then "Problem" column is sorted in descending order in Conditons Gist
  
#@F282-9.1 @F282_7_conditionsGist_Column_Sorting_Problem @US4684
#Scenario: Conditions Gist Applet is sorted by the column header Problems
#  Given user is logged into eHMP-UI
#  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
#  Then Overview is active
#  And user sees Conditions Gist
#  And the user has selected All within the global date picker
#  When user clicks on the column header "Problem" in Conditions Gist
#  Then "Problem" column is sorted in ascending order in Conditions Gist
#  When user clicks on the column header "Problem" in Conditions Gist
#  Then "Problem" column is sorted in descending order in Conditons Gist
  
@F282-9.1 @F282_8_conditionsGist_Column_Sorting_Acuity @US4684
Scenario: Conditions Gist Applet is sorted by the column header Acuity
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  When user clicks on the column header "Acuity" in Conditions Gist
  Then "Acuity" column is sorted in ascending order in Conditions Gist
  When user clicks on the column header "Acuity" in Conditions Gist
  Then "Acuity" column is sorted in descending order in Conditons Gist
  
@F282-9.1 @F282_9_conditionsGist_Column_Sorting_Status @US4684
Scenario: Conditions Gist Applet is sorted by the column header Hx Occrrence
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Conditions Gist
 And the user has selected All within the global date picker
  When user clicks on the column header "Status" in Conditions Gist
  Then "Status" column is sorted in ascending order in Conditions Gist
  When user clicks on the column header "Status" in Conditions Gist
  Then "Status" column is sorted in descending order in Conditons Gist

@F282-9.1 @F282_10_conditionsGist_Column_Sorting_facility @US4684
Scenario: Conditions Gist Applet is sorted by the column header Last
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  When user clicks on the column header "Facility" in Conditions Gist
  Then "Facility" column is sorted in ascending order in Conditions Gist
  # | 19y | 17y | 17y | 16y | 16y | 16y | 15y |
  When user clicks on the column header "Facility" in Conditions Gist
  Then "Facility" column is sorted in descending order in Conditons Gist
  # | 15y | 16y | 16y | 16y | 17y | 17y | 19y |
  
@F282_11_conditionsGist_menu @US4317 @US4805 @debug @DE1400
Scenario: Conditions Applet Gist - menu appears in any chosen problem 
  Given user is logged into eHMP-UI
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  When user clicks on the left hand side of the item "MANIC DISORDER-MILD" 
  Then a Menu appears on the Conditions Gist for item "Mainic Disorder"

@F282-6.1 @F282_12_conditionsGist_detail_view @US4317 @US4805 @DE1400
Scenario: Conditions Applet Gist - detail view of most recent problem 
  Given user is logged into eHMP-UI
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  When user clicks on the left hand side of the item "MANIC DISORDER-MILD" 
  Then a Menu appears on the Conditions Gist for item "Mainic Disorder"
  #When user select the menu "Detail View Icon" in Conditions Gist
  Then user selects the "Mainic Disorder" detail icon in Conditions Gist
  Then it should show the detail modal of the most recent for this problem
  And the modal's title is "MANIC DISORDER-MILD (ICD-9-CM 296.01)"

#This test works well in browsers. In phantomJs it doesn't work consistently.  So attached a debug tag.  
@F282-7.1 @F282_13_conditionsGist_quick_view_from_menu @US4317 @US4805 @debug
Scenario: Conditions Applet Gist - quick view of chosen problem 
  Given user is logged into eHMP-UI
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  When user clicks on the left hand side of the item "Manic Disorder" 
  Then a Menu appears on the Conditions Gist for item "Mainic Disorder"
  #When user select the menu "Quick View Icon" in Conditions Gist
  Then user selects the "Mainic Disorder" quick view icon in Conditions Gist
  Then the "Problems Gist Quick View Table" table contains headers
    | Date | Description | Facility | 
  And the "Problems Gist Quick View Table" table contains rows
	| Date			| Description				| Facility	 	|
	| 04/22/1999	| MANIC DISORDER-MILD		| CAMP MASTER 	|
	| 04/22/1999	| MANIC DISORDER-MILD		| CAMP BEE	 	|
	| 03/22/1999	| MANIC DISORDER-MILD		| FT. LOGAN		|
	| 03/22/1999	| MANIC DISORDER-MILD		| FT. LOGAN		|
	| 02/03/1999  	| MANIC DISORDER-MILD		| FT. LOGAN		|
	
@f282_conditions_refresh 
Scenario: Conditions Gist displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT"
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  And the Conditions Gist Applet contains data rows
  When user refreshes Conditions Gist Applet
  Then the message on the Conditions Gist Applet does not say "An error has occurred"
  
@f282_conditions_exapnd_view_refresh 
Scenario: Conditions Gist expand view displays all of the same details after applet is refreshed
  Given user is logged into eHMP-UI
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT"
  Then Overview is active
  And user sees Conditions Gist
  And the user has selected All within the global date picker
  When the user clicks the control "Expand View" in the "Conditions Gist applet"
  Then the expanded Conditions Applet is displayed
  And the Conditions Applet contains data rows
  When user refreshes Conditions Applet
  Then the message on the Conditions Applet does not say "An error has occurred"
  
@F282_conditions_modal_details_expand_view
Scenario: User views the conditions gist modal pop-up from expand view
	Given user is logged into eHMP-UI
	And user searches for and selects "eight,patient"	
    Then Overview is active
    And user sees Conditions Gist
    And the user has selected All within the global date picker
    When the user clicks the control "Expand View" in the "Conditions Gist applet"
    Then the expanded Conditions Applet is displayed
    And the user views a problem applet row's details
    Then the modal is displayed
    And the modal's title is "Diabetes Mellitus Type II or unspecified "
  
