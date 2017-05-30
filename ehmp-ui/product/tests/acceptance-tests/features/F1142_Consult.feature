@F1142_consult @reg1

Feature: F1142 : Home Page usability  (Staff View)

@US18353_flagged_checkbox_consult
Scenario: Verify that by default the flagged checkbox is unchecked 

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And flagged checkbox is unchecked by default in Consult Applet
  
@US17396_add_consult_physical_therapy
Scenario: Create a physical therapy consult order and review it in cosnult applet expanded view

  When user searches for and selects "bcma,eight"
  # Then Summary View is active
  And user navigates to expanded consult applet
  And the user takes note of number of existing consults
  And user adds a new consult
  And user selects "Physical Therapy" consult
  And user enters a request reason text "Test request reason"
  And user accepts the consult
  Then a consult is added to the applet
  
@US17396_add_consult_Neurosurgery
Scenario: Create a Neurosurgery consult order and review it in cosnult applet expanded view

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And the user takes note of number of existing consults
  And user adds a new consult
  And user selects "Neurosurgery" consult
  And user answers all Neurosurgery questions with a "Yes"
  And user overrides the BMI 
  And user provides a override reason "Overriding BMI"
  And user enters a request reason text "Test request reason"
  And user accepts the consult
  Then a consult is added to the applet
  
@US17396_add_consult_Rheumatology
Scenario: Create a Rheumatology consult order and review it in cosnult applet expanded view

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And the user takes note of number of existing consults
  And user adds a new consult
  And user selects "Rheumatology" consult
  And user answers all Rheumatology questions with a "Yes"
  And user overrides orders and results
  And user provides a override reason "Overriding orders and results"
  And user enters a request reason text "Test request reason"
  And user accepts the consult
  Then a consult is added to the applet
  
@US17396_consult_view_details @DE7396
Scenario: View consult detail view

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And user makes sure there exists at least one consult
  And user views the details of the consult
  Then the detail modal for consult displays 
  And user closes the consult detail modal
  
@US17396_consult_sort
Scenario: Sorts the consult applet based on column Consult

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And the user sorts the Consult applet by column Consult 
  Then the Consult applet is sorted in alphabetic order based on column Consult
  And the user sorts the Consult applet by column Consult 
  Then the Consult applet is sorted in reverse alphabetic order based on column Consult
  
@US17396_consult_applet_filter
Scenario: User can filter the Consult applet

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And user filters the Consult applet by text "Physical"
  And Consult applet table only diplays rows including text "Physical"
  
@US17396_discontinue_consult @DE7396
Scenario: Discontinue a consult to create closed consult

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And user makes sure there exists at least one consult
  And user views the details of the consult
  Then the detail modal for consult displays 
  And user discontinues the consult
  
@US17396_show_open
Scenario: Display only open consults

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  Then Consult applet shows only consults that have are in "Open" mode
  
@US17396_show_closed @DE7396
Scenario: Display only closed consults

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And user selects to show only "Closed" consults
  Then Consult applet shows only consults that have are in "Closed" mode
  
@US17396_show_open_and_closed
Scenario: Display both open and closed consults

  When user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded consult applet
  And user selects to show only "Open and Closed" consults
  Then Consult applet shows either Open or Closed consults

@US17739_add_consult_for_another_patient
Scenario: Create a physical therapy consult for another patient and verify in staff view screen

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed
  And the user takes note of number of existing consults
  Then user searches for and selects "eight,inpatient"
  Then Summary View is active
  And user adds a new consult
  And user selects "Physical Therapy" consult
  And user enters a request reason text "Requesting to contact the second patient"
  And user accepts the consult
  And user navigates to the staff view screen
  Then a consult is added to the applet

@US17739_staff_view_consults_applet_verification 
Scenario: Verify consult applet in staff view screen displays multiple patients and correct assignment options

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "two1234" verifycode as  "two1234!!"
  And staff view screen is displayed
  Then consults applet in staff view page has headers
  | headers      |
  | Urgency      |
  | Patient Name |
  | Flag         |
  | Consult       |
  Then user verifies the consults applet has following patients listed
  | Patients            |
  | BCMA,EIGHT (0008)   |
  | EIGHT,INPATIENT (0808)|
  And user expands the assignment field of consults applet
  Then user verifies consult assignments field contains options
  | options                      |
  | Related to Me                |
  | Intended for Me or My Team(s)|
  | Created by Me                |
  And user verifies consult assignments field does not contain option
  | options      |
  | All Consults |
 




 

  