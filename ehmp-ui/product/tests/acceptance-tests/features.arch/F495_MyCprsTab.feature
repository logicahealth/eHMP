@F495 @US7510 @US7507 @US8138 @US7828  @OBG
Feature: Enhance the Patient Selection Process

Background:
	Given user is logged into eHMP-UI
	When the patient search screen is displayed

@TC980 @TC859 @TC532 @US6108 @TC3410
Scenario:
  Given the call to my cprs list is completed
  Then the user verifies the focus is on Patient Selection bubble
  And the user verifies the text "Select Patient" is displayed in the bubble field
  And the user verifies that list of tabs in mysite tab groups are in the following order: My Site, Nationwide
  And the user verifies that the all tabs group list has order All, My CPRS List, Clinics, Wards

@TC980  @TC3410
Scenario: TC980: Patient Selection bubble clears/resets when user clicks on sub tabs
  Given the call to my cprs list is completed
  Then the user verifies the focus moves to the selected sub-tab My Cprs List
  Then the user verifies the focus moves to the selected sub-tab Clinics
  Then the user verifies the focus moves to the selected sub-tab Wards

@TC981  @TC3727
Scenario: TC981: Verify the patient selection bubble clears/resets and focus moves to the selected sub-tab when user enters text and clicks sub-tab
  Given the call to my cprs list is completed
  And the user has entered a patient search term
  When the user clicks the clinics tab
  Then the patient search is cleared

