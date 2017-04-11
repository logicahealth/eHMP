@F495 @US7510 @US7507 @US8138 @US7828 @regression @triage
Feature: Enhance the Patient Selection Process

Background:
	# Given user is logged into eHMP-UI
	When the patient search screen is displayed

@TC982
Scenario: Verify the text is persisting in the patient selection text area when switching between search types
  Given the call to my cprs list is completed
  And the user has entered a patient search term 
  When the user clicks the nationwide search tab
  And the user clicks the mysite search tab
  Then the patient search term is displayed

@TC983
Scenario: Verify ALL tab from Patient Selection menu pane is not visible
  Given the call to my cprs list is completed
  Then the user verifies only the following tabs are displayed
   |tab |
   | My CPRS List |
   | My Site |
   | Nationwide |
   And the user verifies only the following patient search pills are displayed
   | pill |
   | Clinics |
   | Wards |
