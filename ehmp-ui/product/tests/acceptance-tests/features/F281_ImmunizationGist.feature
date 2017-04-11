@F281_immunization_gist @DE618 @regression @DE1267 @triage

Feature: F281 : Intervention Gist View
	
#POC: Team Jupiter
# Test tagged as debug so doesn't run in Jenkins.  Entire test converted to new page object framework

@F281_1_immunizationGistDisplay 
Scenario: User views the immunization gist view
	Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
  	Then Overview is active
  	And user sees Immunizations Gist
	And the immunization gist view has the following information
	| vaccine name			| age 	| 
	
@F281_2_immunizationGistDisplay @US3382  @DE861 @triage
Scenario: User views the immunization gist view
	Given user is logged into eHMP-UI
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
	Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
    Then Overview is active
  	And user sees Immunizations Gist
	When user clicks on "PNEUMOCOCCAL" pill
    Then the modal is displayed
    And the modal's title is "Vaccine - PNEUMOCOCCAL"

@F281_4_immunizationGistDisplay @US3382 @debug @DE2278
Scenario: View Immunization Applet Single Page by clicking on Expand View
  Given user is logged into eHMP-UI
  And user searches for and selects "FORTYSIX,PATIENT"
  Then Overview is active
  And user sees Immunizations Gist
  When the user clicks the control "Expand View" in the "Immunization Gist applet"
  Then the immunization gist applet title is "IMMUNIZATIONS"
  And the "Immunization Gist Applet" table contains headers
    | Vaccine Name | Standardized Name | Reaction | Series | Repeat Contraindicated | Date | Facility | |
  And the "Immunization Gist Applet" table contains rows
    | Vaccine Name                          | Standardized Name 								 | Reaction | Series   | Repeat Contraindicated | Date 		| Facility |
    | PNEUMOCOCCAL                          | pneumococcal polysaccharide vaccine, 23 valent	| 		   |          | No				       | 04/04/2000	| NJS	   |
    | HEP B, ADULT                          |                                                   | NONE     | COMPLETE | No                     | 10/15/1998 | TST1     |
    | HEP B, ADULT                          |                                                   | NONE     | COMPLETE | No                     | 10/15/1998 | TST2     |
    | INFLUENZA (HISTORICAL)                | influenza virus vaccine, unspecified formulation  |          |          | No                     | 10/01/1997 | TST1     |
    | INFLUENZA (HISTORICAL)                | influenza virus vaccine, unspecified formulation  |          |          | No                     | 10/01/1997 | TST2     |  
    | DTP                                   | diphtheria, tetanus toxoids and pertussis vaccine | NONE     | COMPLETE | No                     | 06/21/1997 | TST1     | 
    | DTP                                   | diphtheria, tetanus toxoids and pertussis vaccine | NONE     | COMPLETE | No                     | 06/21/1997 | TST2     | 
    | PNEUMOCOCCAL, UNSPECIFIED FORMULATION | pneumococcal polysaccharide vaccine, 23 valent    | NONE     | COMPLETE | No                     | 01/31/1994 | TST1     |
    | PNEUMOCOCCAL, UNSPECIFIED FORMULATION | pneumococcal polysaccharide vaccine, 23 valent    | NONE     | COMPLETE | No                     | 01/31/1994 | TST2     |


@F281_5_immunizationGist_filter_capability @US3669 @debug @DE3299
Scenario: Immunization Applet Gist - filter immunization
  Given user is logged into eHMP-UI
  Given user searches for and selects "FORTYSIX,PATIENT"
  Then Overview is active
  And user sees Immunizations Gist
  And the user clicks the "Immunizations Filter Button"
  And the user filters the Immunization Gist Applet by text "PNE"
  Then the Immunization Gist only diplays pills including text "PNE"
	
@F281_6_immunizationGistDisplay @US3382 @DE861 @DE1267
Scenario: User views the immunization gist pill detail view
	Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
	Then Overview is active
  And user sees Immunizations Gist
	When user hovers over the first pill
	And the Immunization Gist Hover Table table contains headers
    | Date | Series | Reaction | Since	|
	And the Immunization Gist Hover Table table contains rows
	
@f281_immunization_gist_applet_refresh 
Scenario: Immunization Gist applet displays all of the same details after applet is refreshed
	Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
	Then Overview is active
    And user sees Immunizations Gist
    And the Immunizations Gist Applet contains data rows
    When user refreshes Immunizations Gist Applet
    Then the message on the Immunizations Gist Applet does not say "An error has occurred"
  
@f281_immunization_gist_applet_expand_view_refresh 
Scenario: Immunization expand view applet displays all of the same details after applet is refreshed
	Given user is logged into eHMP-UI
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
	Given user is logged into eHMP-UI
	And user searches for and selects "FORTYSIX,PATIENT"	
    Then Overview is active
  	And user sees Immunizations Gist
    When the user clicks the control "Expand View" in the "Immunization Gist applet"
    And the user is viewing the Immunizations expanded view
    When the user views the details for the first immunization
    Then the modal is displayed
    And the modal's title displays "Vaccine" and immunization name
	
  
