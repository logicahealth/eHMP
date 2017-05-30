@F1175_Tasks @reg1

Feature: F1175 : Use serializeData instead of collection manipulation

@US17636_display_buttons
Scenario: Task applet displays all the buttons

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet from summary view
  And task applet displays the Tasks Date Filter
  And task applet displays refresh button
  And task applet displays filter button
  And task applet displays help button
  And task applet displays minimize button
 
@US17636_1_add_new_task
Scenario: Create a new task

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And the user takes note of number of existing tasks
  And user adds a new request titled "Request-1 created by Automated Testing"
  And user enters a request details text "Detail created by Automated Testing"
  And user accepts the request
  Then a task is added to the applet
  
@US17636_assigned_to_option
Scenario: Assigned to options are listed as Me, My Teams and Anyone

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And user verifies that the task applet assigned to options are listed as
  | Assigned To Options |
  | Me					|
  | My Teams			|
  | Anyone				|
  And task applet selects Me as the default Assigned To option
  And task applet displays only tasks that are Assigned To "EHMP,UATTWO"
    
@US17636_display_option
Scenario: Display options are listed as Active, Inactive and All

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And user verifies that the task applet display options are listed as
  | Display Options |
  | Active			|
  | Inactive		|
  | All				|
  And task applet selects active as the default display option
  
@US17636_task_name_sort
Scenario: Sorts the task applet based on column Task Name

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And the user sorts the Task applet by column Task Name 
  Then the Task applet is sorted in alphabetic order based on column Task Name
  And the user sorts the Task applet by column Task Name 
  Then the Task applet is sorted in reverse alphabetic order based on column Task Name
  
@US17636_task_applet_filter
Scenario: User can filter the task applet

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And user filters the Task applet by text "Request-1"
  And task applet table only diplays rows including text "Request-1"
  
@US17636_verify_locked_task
Scenario: Verify that the task created by user REDACTED appears as locked to user REDACTED

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "REDACTED" verifycode as  "REDACTED"
  And staff view screen is displayed
  When user searches for and selects "bcma,eight"
  And user navigates to expanded tasks applet
  And user chooses "Anyone" from assigned to dropdown
  And user selects the task name "Request-1 created by Automated Testing"
  Then the modal is displayed
  And the modal's title is "Task is Currently Locked"
  And task modal has buttons "Unlock", "View Activity Detail" and "Close"
  
@US17636_complete_task @DE7471
Scenario: Complete a task

  When user searches for and selects "bcma,eight"
  Then Summary View is active
#  And user navigates to expanded tasks applet
#  And user makes sure there exists at least one task
  And user navigates to expanded tasks applet
  And the user takes note of number of existing tasks
  And user adds a new request titled "Request-3 created by Automated Testing"
  And user enters a request details text "Detail created by Automated Testing"
  And user accepts the request
  Then a task is added to the applet
  And user selects the task name "Request-3 created by Automated Testing"
  And user completes the task
  
@US17636_show_active
Scenario: Display only active tasks

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet
  Then Task applet shows only tasks that have are in "Active" state
  
@US17636_show_inactive
Scenario: Display only inactive tasks

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And user selects to show "Inactive" tasks
  Then Task applet shows only tasks that have are in "Inactive" state
  
@US17636_show_active_and_inactive
Scenario: Display both active and inactive tasks

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet
  And user selects to show "All" tasks
  Then Task applet shows either active or inactive tasks


