@F1236 @reg3
Feature: Medication Applets Enhancements

#Team Application
  
@f1236_display_notice @US18298
Scenario: Detail view pop-up window displays notice banner

  Given user searches for and selects "Onehundredninetysix,Patient"
  When Cover Sheet is active
  And active meds summary view is loaded successfully
  And user opens the first active medication summary item
  And user views first active medication details
  Then the modal is displayed
  Then the modal title starts with "Medication"
  And the detail view displays the notice banner

@f1236_display_notice_1 @US18298
Scenario: Meds Review detail view displays notice banner
  Given user searches for and selects "fourteen,Patient"
  And user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And the Meds Review applet displays at least 1 outpatient medication
  When the user views the details of an outpatient med
  And the detail view displays the notice banner

@f1236_medication_applet_workspace_category_groups_texts @US18293
Scenario: Med Review Applet displays correct texts for category gourp and workspace 
  Given user searches for and selects "FOURTEEN,PATIENT"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  And user expands "Outpatient Meds Group" in Meds Review Applet
  And user sees "Outpatient Meds Group" and "Inpatient Meds Group" and "Clinic Order Meds Group" in Meds Review Applet
  And the workspace title and category group texts are displayed correctly

@f1236_expand_more_than_one_category @US18295
Scenario: User can expande more than one category group simultaneously  
  And user searches for and selects "Eight,Patient"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  And Inpatient Meds Group summary view displays medications
  And user expands "Outpatient Meds Group" in Meds Review Applet
  And Outpatient Meds Group summary view displays medications
  And Inpatient Meds Group summary view displays medications
  
@1236_medication_sorting_facility @US18296
Scenario: Med Review Applet can be sorted by column Facility.
  Given user searches for and selects "fourteen,patient"
  When user navigates to Meds Review Applet
  And the user has selected All within the global date picker
  And Medication Review applet is loaded successfully
  And Outpatient Meds Group summary view displays medications
  When user sorts the Medication Review applet by column header Facility
  Then the Medication Review applet is sorted in alphabetic order based on column Facility
  When user sorts the Medication Review applet by column header Facility
  Then the Medication Review applet is sorted in reverse alphabetic order based on column Facility

 

