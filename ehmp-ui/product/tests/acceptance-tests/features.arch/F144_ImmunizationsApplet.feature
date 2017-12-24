@US2171 @F144_Immunization
Feature: F144 - eHMP viewer GUI - Immunizations
#Team Neptune

Background:
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	Then Cover Sheet is active
  Then the Immunizations applet displays
  
@f297_immunization_info_button_integration_overview
Scenario: Verify Immunization applet on overview page has info button toolbar
  And Overview is active
  And immunization gist is loaded successfully
  When user opens the first immunization gist item
  Then immunization info button is displayed
  
@f297_immunization_info_button_integration_expand_view
Scenario: Verify Immunization applet expanded view has info button toolbar
  When user navigates to immunization expanded view 
  And user opens the first immunization row
  Then immunization info button is displayed
  
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
