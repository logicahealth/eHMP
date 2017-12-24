@F1142_request @reg4

Feature: F1142 : Home Page usability  (Staff View)

@US18353_flagged_checkbox_request
Scenario: Verify that by default the flagged checkbox is unchecked 

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And flagged checkbox is unchecked by default in Request Applet
  
@US17397_add_request
Scenario: Create a request and review it in request applet expanded view - 1

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And the user takes note of number of existing requests
  And user adds a new request titled "Call Patient"
  And user enters a request details text "Status of medication"
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks
  Then a request is added to the applet
  
@F1238 @US18332 @US18332_Tasks_quickmenu_details_expanded_staff
Scenario: User can view the Activity details from Quick Menu Icon in Tasks applet expanded view from staff view

  When POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  Then staff view screen is displayed
  And user navigates to expanded tasks applet from staff view
  Then the user sorts the Task applet by column Created On in ascending order
  Then user hovers over the tasks applet row
  And user can view the Quick Menu Icon in Tasks applet
  And user selects the detail view from Quick Menu Icon of tasks applet
  Then the patient selection confirmation modal displays
  And user clicks on confirm patient button
  Then the detail modal for request displays 

@F1238 @US18332 @US18332_Tasks_quickmenu_gototask_expanded_staff
Scenario: User can view the task details from Quick Menu Icon in Tasks applet expanded view from staff view

  When POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  Then staff view screen is displayed
  And user navigates to expanded tasks applet from staff view
  Then the user sorts the Task applet by column Created On in ascending order
  Then user hovers over the tasks applet row
  And user can view the Quick Menu Icon in Tasks applet
  And user selects the go to task option from Quick Menu Icon of tasks applet
  Then the patient selection confirmation modal displays
  And user clicks on confirm patient button
  Then the response task form for request displays

@F1238 @US18332 @US18332_Tasks_quickmenu_details_expanded_patient
Scenario: User can view the Activity details from Quick Menu Icon in Tasks applet expanded view from patient view

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet from summary view
  Then the user sorts the Task applet by column Created On in ascending order
  Then user hovers over the tasks applet row
  And user can view the Quick Menu Icon in Tasks applet
  And user selects the detail view from Quick Menu Icon of tasks applet
  Then the detail modal for request displays 

@F1238 @US18332 @US18332_Tasks_quickmenu_gototask_expanded_patient
Scenario: User can view the task details from Quick Menu Icon in Tasks applet expanded view from patient view

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet from summary view
  Then the user sorts the Task applet by column Created On in ascending order
  Then user hovers over the tasks applet row
  And user can view the Quick Menu Icon in Tasks applet
  And user selects the go to task option from Quick Menu Icon of tasks applet
  Then the response task form for request displays

@US17397_request_view_details @DE7396
Scenario: View request detail view

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And user makes sure there exists at least one request
  And user views the details of the request
  Then the detail modal for request displays 

@F1238 @US18330_request_detail_view
Scenario: View request detail from quick menu
  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And user makes sure there exists at least one request
  And user hovers over the first request row
  And user selects the detail view from Quick Menu Icon of Request applet
  Then the detail modal for request displays 
  
@US17397_add_request
Scenario: Create a request and review it in request applet expanded view - 2

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And the user takes note of number of existing requests
  And user adds a new request titled "Write Prescription"
  And user enters a request details text "prescription refill"
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks
  Then a request is added to the applet

@US17397_request_sort
Scenario: Sorts the request applet based on column Request

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And the user sorts the Request applet by column Request 
  Then the Request applet is sorted in alphabetic order based on column Request
  And the user sorts the Request applet by column Request 
  Then the Request applet is sorted in reverse alphabetic order based on column Request
  
@US17397_request_applet_filter
Scenario: User can filter the Request applet

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And user filters the Request applet by text "Prescription"
  And Request applet table only diplays rows including text "Prescription"
  
@US17397_discontinue_request @DE7396 @DE8348
Scenario: Discontinue a request to created closed request

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And user makes sure there exists at least one request
  And user views the details of the request
  Then the detail modal for request displays 
  And user discontinues the request
  
@US17397_show_open
Scenario: Display only open requests

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  Then Request applet shows only requests that have are in "Active" state
  
@US17397_show_closed @DE7396
Scenario: Display only closed requests

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And user selects to show only "Closed" requests
  Then Request applet shows only requests that are in "Completed" or "Discontinued" state
  
@US17397_show_open_and_closed
Scenario: Display both open and closed requests

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded request applet
  And user selects to show only "Open and Closed" requests
  Then Request applet shows all requests that are in "Active", "Completed" or "Discontinued" state

@US17739_add_request_for_another_patient
Scenario: Create a request for another patient and verify in staff view screen

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed
  And the user takes note of number of existing requests
  Then user searches for and selects "eight,inpatient"
  Then Summary View is active
  And user adds a new request titled "Call Patient 2"
  And user enters a request details text "Status of medication 2"
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks
  And user navigates to the staff view screen
  Then a request is added to the applet

@US17739_staff_view_request_applet_verification
Scenario: Verify request applet in staff view screen displays multiple patients and correct assignment options

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed
  Then request applet in staff view page has headers
  | headers      |
  | Urgency      |
  | Patient Name |
  | Flag         |
  | Request       |
  Then user vrifies the requests applet has following patients listed
  | Patients            |
  | BCMA,EIGHT (0008)   |
  | EIGHT,INPATIENT (0808)|
  And user expands the assingment field of requests applet
  Then user verifies request assignments field contains options
  | options                      |
  | Related to Me                |
  | Intended for Me or My Team(s)|
  | Created by Me                |
  And user verifies request assignments field does not contain option
  | options      |
  | All Requests |