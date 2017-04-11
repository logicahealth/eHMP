@F144_Lab_Results_Modal @Lab_Results @regression
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results

# Team: Andromeda, inherited by Team Venus

Background:
  Given user is logged into eHMP-UI
  When user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  Given the user has selected All within the global date picker
  And the applet displays numeric lab results

  @f144_2_numeric_lab_results_coversheet_modal @US2034 @TA5012b @DE1392 @debug @reworked_in_firefox
Scenario: Opening and closing the modal from a coversheet - non-Panel result.
  When the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  When the user closes modal by clicking the "Close" control
  Then the coversheet is displayed

  @f144_2_numeric_lab_results_coversheet_panel_modal @US2034 @TA5012a @DE387 @DE1250 @DE1392 @debug @reworked_in_firefox
Scenario: Opening and closing the modal from a coversheet - Panel result.
  When the user scrolls to the bottom of the Numeric Lab Results Applet
  Given the user has filtered the numeric lab results on the term "2988" down to 2 rows
  When the user clicks the Panel "COAG PROFILE BLOOD PLASMA WC LB #2988" in the Numeric Lab Results applet
  And the user clicks the Lab Test "PROTIME - PLASMA" in the Panel result details
  Then the modal is displayed
  And the user waits for 5 seconds
  Then take screenshot for comparison purposes with name "labresults_close_defect"
  When the user closes modal by clicking the "Close" control
  Then the coversheet is displayed

# removed Lab Result modal traversal automated tests, they are too data dependent and too order specific
@f144_numeric_lab_results_modal_traversal @US2339 @TA6893a @modal_test @future 
Scenario: Numeric Lab Results Modal - full traversal through a page of Lab Result modals from within the modal view using Previous/Next buttons.
  And the user clicks the first non-Panel result in the Numeric Lab Results applet
  Then the modal is displayed
  And the modal's title is "Sodium, Blood Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Chloride, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Glucose, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Cholesterol, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Calcium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Cholesterol, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Glucose, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Potassium, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Chloride, Serum or Plasma Quantitative - PLASMA"
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  And the modal's title is "Sodium, Blood Quantitative - PLASMA"

# removed Lab Result modal traversal automated tests, they are too data dependent and too order specific
@f144_numeric_lab_results_modal_traversal @US2339 @TA6893b @modal_test @future
Scenario: Numeric Lab Results Modal - Ensuring data within modal is updated when stepping from one modal to next/prev modal.
  #And the user clicks the first non-Panel result in the Numeric Lab Results applet
  When the user views the details for lab "Sodium, Blood Quantitative - PLASMA"
  And the user clicks the date control "All" in the "Numeric Lab Results modal"
  Then the modal is displayed
  And the modal's title is "Sodium, Blood Quantitative - PLASMA"
  And the "Lab Detail" row is
    | Date       | Lab Test                            | Flag | Result | Unit   | Ref Range | Facility |
    | 05/07/2013 | Sodium, Blood Quantitative - PLASMA |      | 139    | mmol/L | 134-146   | DOD      |
    And the "Lab History" table contains rows
    | Date             | Flag | Result     | Facility |
    | 05/07/2013 - 10:43 |      | 139 mmol/L | DOD      |
    | 04/09/2013 - 10:08 |      | 135 mmol/L | DOD      |
    | 04/03/2013 - 17:41 |      | 140 mmol/L | DOD      |
    | 03/28/2013 - 14:34 |      | 138 mEq/L  | DOD      |
    | 03/28/2013 - 14:09 |      | 135 mmol/L | DOD      |
    | 02/22/2013 - 08:28 |   L  | 135 mEq/L  | DOD      |
  When the user clicks the control "Next Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Chloride, Serum or Plasma Quantitative - PLASMA"
  And the user clicks the date control "All" in the "Numeric Lab Results modal"
  And the "Lab Detail" row is
    | Date       | Lab Test                                        | Flag | Result | Unit   | Ref Range | Facility |
    | 05/05/2013 | Chloride, Serum or Plasma Quantitative - PLASMA |      | 101    | mmol/L | 98-107    | DOD      |
  And the "Lab History" table contains rows
    | Date             | Flag | Result     | Facility |
    | 05/05/2013 - 14:10 |      | 101 mmol/L | DOD      |
    | 04/09/2013 - 10:08 |      | 99 mmol/L  | DOD      |
    | 03/28/2013 - 14:09 |   L* | 25 mmol/L  | DOD      |
  When the user clicks the control "Previous Button" in the "Numeric Lab Results modal"
  Then the modal's title is "Sodium, Blood Quantitative - PLASMA"
  And the user clicks the date control "All" in the "Numeric Lab Results modal"
  And the "Lab Detail" row is
    | Date       | Lab Test                            | Flag | Result | Unit   | Ref Range | Facility |
    | 05/07/2013 | Sodium, Blood Quantitative - PLASMA |      | 139    | mmol/L | 134-146   | DOD      |
    And the "Lab History" table contains rows
    | Date             | Flag | Result     | Facility |
    | 05/07/2013 - 10:43 |      | 139 mmol/L | DOD      |
    | 04/09/2013 - 10:08 |      | 135 mmol/L | DOD      |
    | 04/03/2013 - 17:41 |      | 140 mmol/L | DOD      |
    | 03/28/2013 - 14:34 |      | 138 mEq/L  | DOD      |
    | 03/28/2013 - 14:09 |      | 135 mmol/L | DOD      |
    | 02/22/2013 - 08:28 |   L  | 135 mEq/L  | DOD      |

@f144_3_numeric_lab_results_modal @US2034 @TA5012e @modal_test @DE1272 @debug @DE1392 @reworked_in_firefox
Scenario: The user verifies Lab History table pagination.
  Given user is logged into eHMP-UI
  And user searches for and selects "Seven,Patient"
  Then Default Screen is active
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  Then the user is viewing the expanded view of the Numeric Lab Results Applet
  When the user clicks the date control "All" in the "Numeric Lab Results applet"
  Then the applet displays numeric lab results
  Given the user is viewing the expanded view of the Numeric Lab Results Applet
  #When the user views the first non-panel lab result in a modal
  And the applet displays numeric lab results
  When the user views the "TRIGLYCERIDE - SERUM" lab result in a modal
  And the user clicks the date control "All" in the "Numeric Lab Results modal"
  Then the modal's title is "TRIGLYCERIDE - SERUM"
  And the Lab History table contains headers
    | Date | Flag | Result | Facility |
  And the "Lab History" table contains 15 rows
  And the "Lab History" first row contains
    | Date             | Flag | Result    | Facility |
    | 03/05/2010 - 12:00 |      | 162 mg/dL | TST1     |
  When the user clicks the "Next Page Arrow" for the lab history
  Then the "Lab History" table contains 7 rows
  And the "Lab History" first row contains
    | Date               | Flag | Result    | Facility |
    | 11/28/2007 - 07:00 |      | 203 mg/dL | TST2     |