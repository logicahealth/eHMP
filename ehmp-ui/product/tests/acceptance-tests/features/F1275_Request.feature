@F1275_request @reg1

Feature: F1142 : Encounter Context used by Request Activities for Task completion

@US18894_no_encounter_for_editing_request
Scenario: Verify no encounter is needed for Editing the Request

  Given user searches for and selects "twenty,patient"
  Then Summary View is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Ehmp,Uattwo"
  And user navigates to expanded tasks applet
  And the user takes note of number of existing tasks
  And user adds a new request titled "Request created for Encounter Context by Automated Testing"
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks
  Then a task is added to the applet
  #Changing patient resets the encounter. So no encounter is set before Editing the Request.  
  Then user searches for and selects "eight,inpatient"
  Then Summary View is active
  And user searches for and selects "twenty,patient"
  And user does not have an encounter set
  And user navigates to expanded tasks applet
  Then the user sorts the Task applet by column Created On in ascending order
  Then user hovers over the tasks applet row
  And user can view the Quick Menu Icon in Tasks applet
  And user selects the detail view from Quick Menu Icon of tasks applet
  Then the detail modal for request displays
  And user clicks on the Edit Request Button from Actions dropdown
  Then the request edit form should be displayed

@US18894_no_encounter_for_response_and_review_tasks
Scenario: Verify no encounter is needed for Response and Review Tasks of a Request Activity

  Given user searches for and selects "twenty,patient"
  Then Summary View is active
  And user does not have an encounter set
  And user navigates to expanded tasks applet
  And user selects the task name "Response - Request created for Encounter Context by Automated Testing"
  And user selects the option "Return for Clarification" from the Action drop down
  And user enters a comment in the request field "Request is returned for clarification"
  And user accepts the request response
  And user waits for Action tray to be updated with My Tasks
  And user selects the task name "Review - Request created for Encounter Context by Automated Testing" 
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks
