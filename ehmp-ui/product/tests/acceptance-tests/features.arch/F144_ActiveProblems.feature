@F144_Problems @US2411  @reg2
Feature: F144 - eHMP viewer GUI - Active Problems
#Team Neptune 

# Below test archived, taken care of by F1239_Active_Problems

Background: 
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  
@f297_conditions_info_button_integration
Scenario: Verify Problems applet on overview page has info button toolbar
  And Overview is active
  And problems gist is loaded successfully
  And user sees the quick menu icon on Problems applet
  #When user opens the first problems gist item
  Then problems info button is displayed
  
@f297_conditions_info_button_integration
Scenario: Verify Problems applet expanded view has info button toolbar
  And user navigates to problems expanded view 
  When user opens the first problems row
  Then problems info button is displayed
  
	