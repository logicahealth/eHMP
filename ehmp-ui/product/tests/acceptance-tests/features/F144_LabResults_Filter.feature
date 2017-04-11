@F144_Lab_Results_Base_Applet_Filter @Lab_Results @regression @triage
Feature: F144 - eHMP Viewer GUI - Numeric Lab Results - Filtering

# Team: Andromeda

Background:
  Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

@f144_numeric_lab_results_applet_filter_by_panel_pass @US2313 @TA6537a 
Scenario: Numeric Lab Results Applet - Filter numeric lab results outside of the panel.
  Given the user has selected All within the global date picker
  And the applet displays numeric lab results
  When the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
  And the user inputs "LDL" in the "Text Filter" control in the "Numeric Lab Results applet"
 # Then the "Numeric Lab Results Applet" table contains 22 rows
  Then the Lab Test column in the Numeric Lab Results Applet contains "LDL"

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

