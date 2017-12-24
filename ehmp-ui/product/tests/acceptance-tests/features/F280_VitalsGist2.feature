@F280_VitalsGist @vitals_applet  @reg2
Feature: F280 - Vitals Applet

#"As an eHMP  user, I need to view a complete operation gist view to include the Vitals domain that displays all defined panels and data; so that I can access Vitals information for a given patient."

Background:
	# Given user is logged into eHMP-UI
	And user searches for and selects "Ten,Patient"
	Then Overview is active
	And the user has selected All within the global date picker

@F280_a_vitalsGist_view @US4259
Scenario: Verify vitals for patient using Overview Sheet
  Then the "Vitals" applet is finished loading
  And the Vitals applet contains headers
  | header |
  | Result |
  | Last   |
  | Type   |

@F280_VitalsGist_buttons @US4005
Scenario: Verify Vitals Gist View has expected applet buttons
  Then the "Vitals" applet is finished loading
  Then the Vitals Gist Applet contains buttons Refresh, Help and Expand
  And the Vitals Gist Applet does not contain buttons
    | buttons |
    | Filter Toggle |

#POC: Team Venus
@F280_1_vitalsGist_View @vimm @US4259 @DE2875 
Scenario: Verify vitals for patient using Overview Sheet
  
  Then the "Vitals" applet is finished loading
  And user sees Vitals Gist
  Then the Vitals gist contains the data for rows
      | name  | display_name |
      | BPS   | BPS          |
      | BPD   | BPD          |
      | Pulse | P            |
      | RR    | R            |
      | Temp  | T            |
      | SpO2  | PO2          |
      | Pain  | PN           |
      | Wt    | WT           |
      | Ht    | HT           |
      | BMI   | BMI          |

