@F144_Lab_Results_Base_Applet_Filter @Lab_Results @regression
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results - Filtering

# Team: Andromeda

Background:
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  @f144_2_numeric_lab_results_base_applet_single_page_filter @US2033 @DE206 @reworked_in_firefox
Scenario: Opening and closing filter controls of Numeric Lab Results Single Page View
  Given the user is viewing the expanded "Numeric Lab Results" applet
  Then the "Date Filter" should be "Displayed" in the "Numeric Lab Results applet"
  And the "Text Filter" should be "Displayed" in the "Numeric Lab Results applet"
  And the following choices should be displayed for the "Numeric Lab Results applet" Date Filter
    | Any | 2yr | 1yr | 3mo | 1mo | 7d | 72hr | 24hr |
  And the "Text Filter" should be "Displayed" in the "Numeric Lab Results applet"
  When the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
  Then the "Date Filter" should be "Hidden" in the "Numeric Lab Results applet"
  And the "Text Filter" should be "Hidden" in the "Numeric Lab Results applet"

  @f144_numeric_lab_results_applet_filter_by_panel_fail @US2313 @TA6537b @reworked_in_firefox
Scenario: Numeric Lab Results Applet - Filter numeric lab results outside of the panel.
  Given the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
  And the user inputs "noResults" in the "Text Filter" control in the "Numeric Lab Results applet"
  When the user has selected All within the global date picker
  Then no results should be found in the "Numeric Lab Results applet"
    

@f144_numeric_lab_results_text_filtering_ref_range @US2552 @TA7994b @DE947 @triage @reworked_in_firefox
Scenario: Numeric Lab Results Applet - Filtering by Ref Range.
  Given the user is viewing the expanded "Numeric Lab Results" applet
  When the user inputs "134-146" in the "Text Filter" control in the "Numeric Lab Results applet"
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  Then the Numeric Lab Results Applet table contains specific rows
    | row | Date               | Lab Test                            | Flag | Result | Unit   | Ref Range | Facility |
    | 1   | 05/07/2013 - 10:43 | Sodium, Blood Quantitative - PLASMA |      | 139    | mmol/L | 134-146   | DOD      |
    | 2   | 04/09/2013 - 10:08 | Sodium, Blood Quantitative - PLASMA |      | 135    | mmol/L | 134-146   | DOD      |
    | 3   | 04/03/2013 - 17:41 | Sodium, Blood Quantitative - PLASMA |      | 140    | mmol/L | 134-146   | DOD      |
    | 4   | 03/28/2013 - 14:09 | Sodium, Blood Quantitative - PLASMA |      | 135    | mmol/L | 134-146   | DOD      |


@f144_numeric_lab_results_text_filtering_facility @US2552 @TA7994d @triage @reworked_in_firefox
Scenario: Numeric Lab Results Applet - Filtering by Facility.

  Given the user is viewing the expanded "Numeric Lab Results" applet
  When the user inputs "DOD" in the "Text Filter" control in the "Numeric Lab Results applet"
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  Then the Numeric Lab Results Applet table contains rows
    | Date             | Lab Test                                           | Flag | Result | Unit   | Ref Range | Facility |
    | 05/07/2013 - 10:43 | Sodium, Blood Quantitative - PLASMA                |      | 139    | mmol/L | 134-146   | DOD      |
    | 05/05/2013 - 14:10 | Chloride, Serum or Plasma Quantitative - PLASMA    |      | 101    | mmol/L | 98-107    | DOD      |
    | 05/05/2013 - 14:10 | Potassium, Serum or Plasma Quantitative - PLASMA   |   H  | 5.4    | mmol/L | 3.5-4.7   | DOD      |
    | 05/04/2013 - 08:25 | Glucose, Serum or Plasma Quantitative - PLASMA     |   H  | 100    | mg/dL  | 70-99     | DOD      |
    | 05/04/2013 - 08:25 | Potassium, Serum or Plasma Quantitative - PLASMA   |   H  | 5.1    | mmol/L | 3.5-4.7   | DOD      |
    | 05/03/2013 - 12:28 | Potassium, Serum or Plasma Quantitative - PLASMA   |   L* | 2.2    | mmol/L | 3.5-4.7   | DOD      |
    | 05/03/2013 - 11:37 | Cholesterol, Serum or Plasma Quantitative - PLASMA |      | 160    | mg/dL  | 0-240     | DOD      |
    | 04/11/2013 - 14:05 | Potassium, Serum or Plasma Quantitative - PLASMA   |   H  | 5.4    | mmol/L | 3.5-4.7   | DOD      |
    | 04/11/2013 - 08:49 | Potassium, Serum or Plasma Quantitative - PLASMA   |   H  | 5.3    | mmol/L | 3.5-4.7   | DOD      |
    | 04/11/2013 - 08:23 | Calcium, Serum or Plasma Quantitative - PLASMA     |   H  | 10.5   | mg/dL  | 8.5-10.1  | DOD      |

@f144_numeric_lab_results_text_filter_not_persisting @DE185 @reworked_in_firefox
Scenario: Numeric Lab Results Applet - Text Filter should not persist after switching patients.
  When the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
  And the user inputs "Sodium" in the "Text Filter" control in the "Numeric Lab Results applet"
  Given user searches for and selects "Seven,Patient"
  Then Cover Sheet is active
  When the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
  Then the "Text Filter" input should have the value "" in the "Numeric Lab Results applet"

@f144_numeric_lab_results_date_filter_not_persisting @DE185 @reworked_in_firefox
Scenario: Numeric Lab Results Applet - Date Filter should not persist after switching patients.
  Given the user is viewing the expanded "Numeric Lab Results" applet
  When the user clicks the date control "3mo" in the "Numeric Lab Results applet"
  Given user searches for and selects "Seven,Patient"
  Then Cover Sheet is active
  When the user clicks the control "Expand View" in the "Numeric Lab Results applet"
  Then there is no active date control in the "Numeric Lab Results applet"

  @f144_numeric_lab_results_text_filtering_date @US2552 @TA7994e @future @obe
Scenario: Numeric Lab Results Applet - Filtering by Date.
  Given the user is viewing the expanded "Numeric Lab Results" applet
  And no results should be found in the "Numeric Lab Results applet"
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  When the applet displays numeric lab results
  And the user inputs "04/17/2009+12" in the "Text Filter" control in the "Numeric Lab Results applet"
  Then the Numeric Lab Results Applet table contains specific rows
    | row | Date               | Lab Test            | Flag | Result | Unit   | Ref Range | Facility |
    | 1   | 04/17/2009 - 12:00 | CHOLESTEROL - SERUM |      | 189    | mg/dL  | 0-199     | TST1     |
    | 2   | 04/17/2009 - 12:00 | CHOLESTEROL - SERUM |      | 189    | mg/dL  | 0-199     | TST2     |

@f144_numeric_lab_results_text_filter_all_criteria @US2752 @TA8873a @future 
Scenario: Numeric Lab Results Applet - Ensure text filter criteria are used in an 'ALL' rather than an 'ANY' manner.
  Given the user is viewing the expanded "Numeric Lab Results" applet
  And no results should be found in the "Numeric Lab Results applet"
  And the user inputs "Sodium" in the "Text Filter" control in the "Numeric Lab Results applet"
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  When the applet displays numeric lab results
  Then the "Numeric Lab Results Applet" table contains 30 rows
  And the user inputs "Sodium+Blood" in the "Text Filter" control in the "Numeric Lab Results applet"
  Then the "Numeric Lab Results Applet" table contains 6 rows
  And the "Numeric Lab Results Applet" table contains rows
    | Date             | Lab Test                            | Flag | Result | Unit   | Ref Range | Facility |
    | 05/07/2013 - 10:43 | Sodium, Blood Quantitative - PLASMA |      | 139    | mmol/L | 134-146   | DOD      |
    | 04/09/2013 - 10:08 | Sodium, Blood Quantitative - PLASMA |      | 135    | mmol/L | 134-146   | DOD      |
    | 04/03/2013 - 17:41 | Sodium, Blood Quantitative - PLASMA |      | 140    | mmol/L | 134-146   | DOD      |
    | 03/28/2013 - 14:34 | Sodium, Blood Quantitative - PLASMA |      | 138    | mEq/L  | 136-145   | DOD      |
    | 03/28/2013 - 14:09 | Sodium, Blood Quantitative - PLASMA |      | 135    | mmol/L | 134-146   | DOD      |
    | 02/22/2013 - 08:28 | Sodium, Blood Quantitative - PLASMA |   L  | 135    | mEq/L  | 136-145   | DOD      |

@f144_numeric_lab_results_text_filter_all_criteria @US2752 @TA8873b @future @obe
Scenario: Numeric Lab Results Applet - Ensure text filter criteria are used in an 'ALL' rather than an 'ANY' manner.

  Given the user is viewing the expanded "Numeric Lab Results" applet
  And the user inputs "Erythrocyte+Mean" in the "Text Filter" control in the "Numeric Lab Results applet"
  And the user clicks the date control "All" in the "Numeric Lab Results applet"
  Then the "Numeric Lab Results Applet" table contains 2 rows
  And the "Numeric Lab Results Applet" table contains rows
    | Date             | Lab Test                                                                                        | Flag | Result | Unit   | Ref Range | Facility |
    | 06/21/2007 - 10:26 | Erythrocyte Mean Corpuscular Hemoglobin, RBC Quantitative Automated Count - BLOOD               |   L  | 26.0   | pg     | 27.9-34.3 | DOD      |
    | 06/21/2007 - 10:26 | Erythrocyte Mean Corpuscular Hemoglobin Concentration, RBC Quantitative Automated Count - BLOOD |  L   | 27.0   | g/dL   | 33.4-35.8 | DOD      |
