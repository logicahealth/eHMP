@F1274 @reg1
Feature: Global Header Navigation Optimization

@US18887
Scenario: Move CCOW from Global Header to Footer
  Given staff view screen is displayed 
  Then the CCOW status icon is in the footer
  And CCOW status text is in the footer 
  And the CCOW status text is "Clinical link unavailable"

@US18890
Scenario: Verify that the Current Patient button appears in the list of buttons in the left margin.
  Then the staff view screen displays Current Patient in the sidebar tray

@US18890 @current_patient_tooltip_none
Scenario: Verify that 'None' appears in the tooltip when mouse hovering over the Current Patient button and no patient context has been set.
  When the user hovers over the Current Patient button
  Then the tool tip displays "None"

@US18890 @current_patient_tooltip_set
Scenario: Verify that the Patient Name and SSN data appear in the tooltip when mouse hovering over the Current Patient button.
  Given user searches for and selects "Bcma,Eight"
  And Summary View is active
  When user navigates to the staff view screen
  And the user hovers over the Current Patient button
  Then the tool tip displays "Bcma, Eight (B0008)"

@US18890 @current_patient_confirmation
Scenario: Verify that the Current Patient button starts the Patient Confirmation workflow when clicked.
  Given user searches for and selects "Bcma,Eight"
  And Overview is active
  When user navigates to the staff view screen
  And the user selects the Current Patient button
  Then the patient selection confirmation modal displays
  And the patient selection confirmation modal is for patient "Bcma, Eight"

@US18884_1
Scenario: Verify that the recent patient tray is open when user selects patients button and p tab is active 
  When the user selects Patients header button
  Then the Recent Patients tray is open
  And the patient button is active 
  