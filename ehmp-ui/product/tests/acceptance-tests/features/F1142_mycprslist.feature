@F1142 @US17400
Feature: Home Page Usability (Staff View) - Implement My CPRS list tray

@US17400_1
Scenario: User has option to view My CPRS list
   Then the staff view screen displays My CPRS list in the sidebar tray

@US17400_2 @DE7713
Scenario: Verify My CPRS list tray elements
    When the user opens the My CPRS list tray
    And the My CPRS list tray displays a close x button
    And the My CPRS list tray displays a help button
    And the My CPRS list Tray table headers are 
      | header           |
      | Appt Date/Time   |
      | Location (Rm-Bd) |
      | Patient Name     |
      | Date of Birth    |
      | Gender           |
