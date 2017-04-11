@F414 @regression @future @DE4560
Feature: Enter and Store A Problem List

@F414_1 @UAT_script 
Scenario:  eHMP user should not be able to add a problem without appropriate permissions
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "PUT1234" verifycode as  "PUT1234!!"
  And staff view screen is displayed
  And Navigate to Patient Search Screen
  And user searches for and selects "TWENTY,PATIENT"
  When Overview is active
  And user sees Problems Gist
  Then the add problems button is not displayed

@F414_2 @F414-1 @F414-2 @UAT_script @US6701 @US12012 @US6723 @TC3061 @DE5179
Scenario: eHMP user with appropriate permissions is able to Add and Create Another problem
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "pu1234" verifycode as  "pu1234!!"
  And staff view screen is displayed
  And Navigate to Patient Search Screen
  Given user searches for and selects "TWENTY,PATIENT"
  And Overview is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Anesthesiologist,One"
  And the user navigates to expanded problems applet
  And the user takes note of number of existing problems
  
  When user attempts to add a problem from problem applet header
  And user searches and selects new problem "Allergy to peanuts"
  And Add Problem modal is displayed
  And user selects Responsible Provider "Anesthesiologist,One"
  And user accepts the new problem
  Then a problem is added to the applet

@F414_3 @UAT_script @DE5179
Scenario: eHMP user can add a Problem for an inpatient initiated from applet
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet
  And the user takes note of number of existing problems
  
  When user attempts to add a problem from problem applet header
  And user searches and selects new problem "Allergy to peanuts"
  And Add Problem modal is displayed
  And user selects Responsible Provider "Anesthesiologist,One"
  And user accepts the new problem
  Then a problem is added to the applet

@F414_4 @UAT_script
Scenario: eHMP user can add a Problem for an inpatient initiated from observations tray
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet

  When user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Allergy to peanuts"
  Then Add Problem modal is displayed

@F414_5 @UAT_script
Scenario: eHMP user can change a problem name(SNOMED term) to another problem name(SNOMED term) without entering data on the Add problem form
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet

  When user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Allergy to peanuts"
  And Add Problem modal is displayed
  And Problem Name is reported as "Allergy to peanuts"
  And user chooses to select a new problem
  And user searches and selects new problem "Broken tooth with complication"

  Then Add Problem modal is displayed
  And Problem Name is reported as "Broken tooth with complication"

@F414_6 @UAT_script
Scenario: eHMP user can cancel changing a problem name
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet

  When user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Allergy to peanuts"
  And Add Problem modal is displayed
  And Problem Name is reported as "Allergy to peanuts"
  And user chooses to select a new problem
  And user chooses to keep previous problem name

  Then Add Problem modal is displayed
  And Problem Name is reported as "Allergy to peanuts"

@F414-2 @F414-2a @US6701 @US12012
Scenario: eHMP user can search for a problem in the Lexicon using SNOMED CT codes
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet
  
  When user attempts to add a problem from problem applet header
  And user searches for a new problem with term "91935009"
  Then the Add Problem model displays a result for "Allergy to peanuts"

@F414-2 @F414-2b @UAT_script
Scenario: eHMP user can search for a problem in the Lexicon using SNOMED CT codes
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet
  
  When user attempts to add a problem from problem applet header
  And user searches for a new problem with term "91935"
  Then the Add Problem model displays a message "An unexpected error occurred during your search. Please try again"

@F414-3 @F414-3a @US11634 @US3592 @US6704
Scenario: As an authorized user adding a problem to a patient's problem list, I need to be prompted to set the visit context if I haven't already done this
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "pu1234" verifycode as  "pu1234!!"
  And staff view screen is displayed
  And Navigate to Patient Search Screen
  And user searches for and selects "TWENTY,PATIENT"
  And Overview is active
  And user does not have an encounter set
  When user opens observation tray
  And user attempts to create a new "Problem" observation
  Then Encounter modal is displayed

@F414-3 @F414-3b @US11634 @US3592 @US6704
Scenario: As an authorized user adding a problem to a patient's problem list, I need to be prompted to set the visit context if I haven't already done this
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "pu1234" verifycode as  "pu1234!!"
  And staff view screen is displayed
  And Navigate to Patient Search Screen
  And user searches for and selects "TWENTY,PATIENT"
  And Overview is active
  And user sees Problems Gist
  And user does not have an encounter set
  When user attempts to add a problem from problem applet header
  Then Encounter modal is displayed

@F414_7 @UAT_script
Scenario: Verify default fields are set

  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet

  And user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Allergy to peanuts"
  When Add Problem modal is displayed
  Then Problem Status is set to Active by default
  And Problem Acuity is set to Unknown by default
  And Problem Onset Date is prepopulated to Today
  And Required fields have a visual indication

@US12784 @US12784_inpatient
Scenario: Verify Clinic field label text is Service for inpatients
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet

  And user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Allergy to peanuts"
  When Add Problem modal is displayed
  Then the clinic field's label is "Service"
  And the clinic field's value is not set

@US12784 @US12784_outpatient
Scenario: Verify Clinic field label text is Clinic for outpatients
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "pu1234" verifycode as  "pu1234!!"
  And staff view screen is displayed
  And Navigate to Patient Search Screen
  Given user searches for and selects "TWENTY,PATIENT"
  And Overview is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Anesthesiologist,One"
  And the user navigates to expanded problems applet

  And user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Allergy to peanuts"
  When Add Problem modal is displayed
  Then the clinic field's label is "Clinic"
  And the clinic field's value is default to "Cardiology"

@F414_8
Scenario: :  eHMP user can add new comment after defining problem section within “Add problem” form.
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet

  And user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Allergy to peanuts"
  And Add Problem modal is displayed
  When user enters a comment "test comment" and a timestamp
  Then the comment character count is updated
  And the Add Problem comment add button is enabled
  And the Add Problem accept button is disabled

  When user adds the problem comment
  Then the Add Problem comment add button is disabled
  And the Add Problem accept button is enabled
  And a Add Problem comment row is displayed with "test comment" and a timestamp

@F414_9 @US12786 @TC3377
Scenario: Verify Treatment factors
  Given user searches for and selects restricted patient "zzzretiredseventysix,patient"
  And Overview is active
  And POB user selects and sets new encounter with location "Cardiology" and provider "Anesthesiologist,One"
  And the user navigates to expanded problems applet
  When user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Broken tooth with complication"
  Then Add Problem modal is displayed
  And Treatment Factors are displayed on the Add Problem modal
  And the default selection for Treatment Factors is No
