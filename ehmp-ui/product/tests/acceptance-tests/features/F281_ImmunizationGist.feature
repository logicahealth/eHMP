@F281_immunization_gist @DE618 @regression @DE1267 @triage

Feature: F281 : Intervention Gist View
	
#POC: Team Jupiter
# Test tagged as debug so doesn't run in Jenkins.  Entire test converted to new page object framework

@F281_1_immunizationGistDisplay 
Scenario: User views the immunization gist view
	# Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
  	Then Overview is active
  	And user sees Immunizations Gist
	And the immunization gist view has the following information
	| vaccine name			| age 	| 
	
@F281_2_immunizationGistDisplay @US3382  @DE861 @triage
Scenario: User views the immunization gist view
	# Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
  Then Overview is active
  And user sees Immunizations Gist
	And the immunization gist view has the following information
      | vaccine name                          | age |
      | HEP B, ADULT                          | FORMATED #y  |
      | INFLUENZA, UNSPECIFIED FORMULATION    | FORMATED #y  |
      | DTP                                   | FORMATED #y  |
      | PNEUMOCOCCAL, UNSPECIFIED FORMULATION | FORMATED #y  |
      | PNEUMOCOCCAL                          | FORMATED #y  |
	
@F281_3_immunizationGistDisplay @US3382
Scenario: User views the immunization gist modal pop-up
	# Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
    Then Overview is active
  	And user sees Immunizations Gist
	When user clicks on "PNEUMOCOCCAL" pill
    Then the modal is displayed
    And the modal's title is "PNEUMOCOCCAL"



@F281_4_immunizationGistDisplay @US3382 @DE2278
Scenario: View Immunization Applet Single Page by clicking on Expand View
  # Given user is logged into eHMP-UI
  And user searches for and selects "FORTYSIX,PATIENT"
  Then Overview is active
  And user sees Immunizations Gist
  When the user clicks the control "Expand View" in the "Immunization Gist applet"
  Then the immunization gist applet title is "IMMUNIZATIONS"
  And the Immunization Expanded applet table contains headers
  | header |
   | Vaccine Name |
   | Standardized Name |
   | Reaction |
   | Series |
   | Repeat Contraindicated |
   | Administered Date |
   | Facility |

  And the Immunization Applet contains data rows

@F281_5_immunizationGist_filter_capability @US3669 @DE3299
Scenario: Immunization Applet Gist - filter immunization
  # Given user is logged into eHMP-UI
  Given user searches for and selects "FORTYSIX,PATIENT"
  Then Overview is active
  And user sees Immunizations Gist
  And the user clicks the "Immunizations Filter Button"
  And the user filters the Immunization Gist Applet by text "PNE"
  Then the Immunization Gist only diplays pills including text "PNE"
	
@F281_6_immunizationGistDisplay @F281-4 @F281-9 @US3382 @DE861 @DE1267 @DE5249 @DE4667
Scenario: User views the immunization gist pill quick view
	# Given user is logged into eHMP-UI
	Given user searches for and selects "FORTYSIX,PATIENT"	
	And Overview is active
  And user sees Immunizations Gist
	When user clicks the first pill
  And a quick look icon is displayed in the immunization toolbar
  And user clicks the quick look icon
	Then the Immunization Gist Hover Table table contains headers
    | Date | Series | Reaction | Since	|
	And the Immunization Gist Hover Table table contains rows
	
@f281_immunization_gist_applet_refresh 
Scenario: Immunization Gist applet displays all of the same details after applet is refreshed
	# Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
	Then Overview is active
    And user sees Immunizations Gist
    And the Immunizations Gist Applet contains data rows
    When user refreshes Immunizations Gist Applet
    Then the message on the Immunizations Gist Applet does not say "An error has occurred"
  
@f281_immunization_gist_applet_expand_view_refresh 
Scenario: Immunization expand view applet displays all of the same details after applet is refreshed
	# Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
	Then Overview is active
    And user sees Immunizations Gist
    When the user clicks the control "Expand View" in the "Immunization Gist applet"
    And the user is viewing the Immunizations expanded view
    And the Immunization Applet contains data rows
    When user refreshes Immunization Applet
    Then the message on the Immunization Applet does not say "An error has occurred"
    
@F281_immunization_modal_details_expand_view
Scenario: User views the immunization gist modal pop-up from expand view
	# Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
    Then Overview is active
  	And user sees Immunizations Gist
    When the user clicks the control "Expand View" in the "Immunization Gist applet"
    And the user is viewing the Immunizations expanded view
    When the user views the details for the first immunization
    Then the modal is displayed
    #And the modal's title displays "Vaccine" and immunization name
    And the modal's title displays the immunization name
	
  
