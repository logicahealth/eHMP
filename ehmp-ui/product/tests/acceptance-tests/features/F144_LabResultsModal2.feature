@F144_Lab_Results_Modal @Lab_Results   @DE2903 @DE2969 @reg1
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results - Applet Single Record Modal for Lab Panels from expanded view

# Team: Andromeda, inherited by Team Venus

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Seven,Patient"
  Then Overview is active
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  Then the user is viewing the expanded view of the Numeric Lab Results Applet
  When the user clicks the date control "All" in the "Numeric Lab Results applet"
  Then the applet displays numeric lab results

@f144_1_numeric_lab_results_modal @DE6813
Scenario: The user views the modal's Lab Details and the correct title is displayed
  Given the user is viewing the expanded view of the Numeric Lab Results Applet
  And the applet displays numeric lab results
  When the user views the "03/05/2010 - 10:00 HEMOGLOBIN A1C - BLOOD (TST1)" lab result in a modal
  Then the modal's title is "HEMOGLOBIN A1C - BLOOD"

@f144_1_numeric_lab_results_modal @US2034 @TA5012c @modal_test @data_specific @DE3978
Scenario: The user views the modal's Lab Details table and verifies the appropriate flag is displayed.
  Given the user is viewing the expanded view of the Numeric Lab Results Applet
  And the applet displays numeric lab results
  When the user views the "03/05/2010 - 10:00 HEMOGLOBIN A1C - BLOOD (TST1)" lab result in a modal
  Then the modal is displayed
  And the "Lab Detail" table contains headers
    | Date       | Lab Test               | Flag | Result | Unit   | Ref Range | Facility | 
  And the "Lab Detail" row is
    | Date       | Lab Test               | Flag | Result | Unit   | Ref Range | Facility |
    | 03/05/2010 | HEMOGLOBIN A1C - BLOOD | H    | 6.2    | %      | 3.5-6     |TST1      |

# reworked in firefox except the history specific data check
@f144_2_numeric_lab_results_modal @US2034 @TA5012d @modal_test  @DE1271 @data_specific @DE3978 @DE6755
Scenario: The user views the modal's Lab History table.
  Given the user is viewing the expanded view of the Numeric Lab Results Applet
  When the user views the "03/05/2010 - 12:00 TRIGLYCERIDE - SERUM (TST1)" lab result in a modal
  And the user clicks the date control All in the Numeric Lab Results modal
  Then the modal's title is "TRIGLYCERIDE"
  And the Lab History table contains headers
    | Date | Flag | Result | Facility |
  And the Lab History table contains at least 1 row
  And the Total Tests label displays a number
  And the "Lab Graph" should be "Displayed" in the "Numeric Lab Results modal"