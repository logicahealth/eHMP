@F297_InfoButtonEnterpriseIntegration

Feature: F236 - OnLineHelp
#"By displaying context sensitive medical information specific to certain concepts (problems, medications, and labs), a clinician can better assess and treat patients."

#POC: Team Venus
@F297_1_InfoButton @US4529 @future
Scenario: Verify button appears and disappears
	Given user is logged into eHMP-UI
	And user searches for and selects "Five,Patient"
	Then Cover Sheet is active
	Then the InfoButtton is present on "Coversheet" page

@F297_2_InfoButton @US4529 @US6045 @future
Scenario: Verify button is clickable and a new window si opened
	Given user is logged into eHMP-UI
	And user searches for and selects "Five,Patient"
	Then Cover Sheet is active
	Then the InfoButtton page is opened by clicking on the infobutton icon
	
@f297_allergies_info_button_integration_1
Scenario: Verify allergy applet on overview page has info button toolbar
  When user searches for and selects "eight,patient"
  And Overview is active
  Given allergy gist is loaded successfully
  And user opens the first allergy pill
  Then allergies info button is displayed
  
@f297_allergies_info_button_integration_2
Scenario: Verify allergy applet expanded view has info button toolbar
  When user searches for and selects "eight,patient"
  And Overview is active
  Given user navigates to allergies expanded view 
  And user opens the first allergy row
  Then allergies info button is displayed