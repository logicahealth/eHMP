@F1162_act_on_request_before_earliest_date @reg1

Feature: F1162 : Act on Requests Before Earliest Date

@US18266_complete_before_earliest_date @US18227
Scenario: Verify that request can't be completed before earliest date but other options are actionable

  When user searches for and selects "twentythree,inpatient"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And the user takes note of number of existing tasks
  And user adds a new request titled "Request created for earliest date by Automated Testing"
  And user sets the earliest date to be a future date
  And user enters a request details text "Detail for earliest date created by Automated Testing"
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks
  Then a task is added to the applet
  And user selects the task name "Response - Request created for earliest date by Automated Testing"
  And user sees the alert message "A Request cannot be marked as complete before the earliest date"
  And user can't select Mark as Complete from Action drop down
  And the following actions are actionable
  | options                 |
  | clarification			|
  | reassign                |
  | decline                 |

@US18224_return_and_review_before_earliest_date @US18225 @US18227
Scenario: Verify that request can be acted before earliest date 

  When user searches for and selects "twentythree,inpatient"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And user selects the task name "Response - Request created for earliest date by Automated Testing"
  And user selects the option "Return for Clarification" from the Action drop down
  And user enters a comment in the request field "Request is returned for clarification"
  And user accepts the request response
  And user waits for Action tray to be updated with My Tasks
  And user selects the task name "Review - Request created for earliest date by Automated Testing"
  And user updates the request title "Request created for earliest date by Automated Testing" with timestamp
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks

@US18224_decline_and_review_before_earliest_date @US18225 @US18227
Scenario: Verify that request can be acted before earliest date 

  When user searches for and selects "twentythree,inpatient"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And user selects the task name "Response - Request created for earliest date by Automated Testing"
  And user selects the option "Decline" from the Action drop down
  And user enters a comment in the comment field "Request is declined"
  And user accepts the request response
  And user waits for Action tray to be updated with My Tasks
  And user selects the task name "Review - Request created for earliest date by Automated Testing"
  And user updates the request title "Request created for earliest date by Automated Testing" with timestamp
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks
  