@future @third_party
Feature: eHMP_Document_Applet_Imaging

Background: As a clinician, I need the ability to launch third party software to view patient images, so that I can use the advanced display features of the third party software.

	#Given user is logged into eHMP-UI
	And user searches for and selects "EIGHT,PATIENT"
	When user navigates to Documents Screen
	Then "Documents" is active


@KRM_Imaging_1

Scenario: User will be able to view modal popup for Imaging Study
	When user clicks on "Type" column header in Documents Applet
  	And user views the first "Imaging" detail view
  	#When user clicks the first thumbnail
  	Then User launches third party software and views image using the third party software.


