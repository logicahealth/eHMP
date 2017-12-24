@F1143_Tasks_improvements @tasks_applet @reg1

Feature: F1143 : Improve Task Management usability (Allow early response to tasks)

@task_headers_patient_view @US18232 @US18233 @US18234
Scenario: Task applet displays all the columns

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet from summary view
  And task applet displays columns
  | columns |
  | Priority|
  | Due		|
  | Earliest Date|
  | Latest Date |
  | Task Name	|
  | Description	|
  | Assigned To	|
  | Status		|
  | Activity	|
  | Created On	|
  | Go to		|
  
@task_column_format_patient_view @US18232 
Scenario: Task applet displays column Created On in proper format

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded tasks applet from summary view
  Then patient view task applet displays Created On field in the correct format
  
@task_headers_provider_view @US18232 @US18233 @US18234 
Scenario: Task applet displays all the columns

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed
  And user navigates to expanded tasks applet from staff view
  And task applet displays columns
  | columns |
  | Priority|
  | Due		|
  | Earliest Date|
  | Latest Date |
  | Patient Name|
  | Task Name	|
  | Description	|
  | Assigned To	|
  | Status		|
  | Activity	|
  | Created On	|
  | Go to		|
  
@task_column_format_provider_view @US18232 
Scenario: Task applet displays column Created On in proper format

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed
  And user navigates to expanded tasks applet from staff view
  Then user makes sure there is at least one task in the provider task applet view
  Then provider view task applet displays Created On field in the correct format

 
