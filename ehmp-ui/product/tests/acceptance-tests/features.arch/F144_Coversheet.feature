@F144 @coversheet @reg1
Feature: F144 - eHMP viewer GUI: verify elements on coversheet screen 

Background:
#   Given user is testing functionality

# @f144_coversheet_prestep
# Scenario: User performs pre steps
	# Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	Then Cover Sheet is active

@US2411_a
Scenario: User views Active Problems on the coversheet
  When the Problems applet displays
  Then the Problems applet is titled "PROBLEMS"
  And the Problems applet contains buttons
    | buttons  |
    | Refresh  |
    | Help     |
    | Filter Toggle   |
    | Expand View |
  And the Problems coversheet headers are
	 | Headers |
	 | Description |
	 | Acuity |
	 | Status |

@f144_problems_on_coversheet_refresh 
Scenario: Problems Summary view displays all of the same details after applet is refreshed
  When the Problems applet displays
  Then the Problems applet is titled "PROBLEMS"
  And the Problems Applet contains data rows
  When user refreshes Problems Applet
  Then the message on the Problems Applet does not say "An error has occurred"

@US2800f @DE1068
Scenario: User view vitals on coversheet
  Then the Vitals applet is titled "Vitals"
  And the Vitals applet contains buttons
    | buttons  |
    | Refresh  |
    | Help     |
    | Expand View |
  And the Vitals Applet does not contain buttons
    | buttons |
    | Filter Toggle |

@F285_1c_AllergiesDisplay @US4005
Scenario: Verify applet displays expected buttons
#  And user sees the allergy applet on the coversheet page
  And The applet "ALLERGIES" on the coversheet page has been displayed
  Then the Allergies Applet contains buttons
    | buttons  |
    | Refresh  |
    | Help     |
    | Expand View |
  And the Allergies Applet does not contain buttons
    | buttons |
    | Filter Toggle |

@appointment_base @DE1600
Scenario: User views appointments and visits on coversheet
  And the Appointment applet contains buttons
    | buttons  |
    | Refresh  |
    | Help     |
    | Filter Toggle   |
    | Expand View |
  Then the Appointments coversheet table contains headers
       | Headers     |
       | Date        | 
       | Description | 
       | Location    |
       | Status      |
       | Facility    |

#@base_commhealth
Scenario: User can view community health summaires on the coversheet
    Then the Community Health Summary finishes loading
    Then the CommunityHealthSummaries coversheet table contains headers
       | Headers                |
       | Date                   | 
       | Authoring Institution  | 
    Then the Community Health Summaries Applet contains buttons
      | buttons  |
      | Refresh  |
      | Help     |
      | Expand View |
      | Filter Toggle |

@US2171_coversheet_only
Scenario: User views the immunizations grid applet on the coversheet
    Then the Immunizations applet displays 
    Then the Immunizations applet title is "IMMUNIZATIONS"
    And the Immunizations applet contains butons
        | buttons  |
	    | Refresh  |
	    | Help     |
	    | Filter Toggle   |
	    | Expand View |
    Then the immunizations coversheet table contains headers
		 | Headers |
		 | Vaccine Name |
		 | Reaction |
		 | Date | 
		 | Facility |
    And the immunizations applet finishes loading

@f144_orders_applet_inclusion @US1775 @TA5345a @DE511 
Scenario: Inclusion of the Orders Applet into the coversheet.
  Then the "Orders" Applet is displayed
  And the "Orders Applet" table contains headers
    | Order Date | Flag | Status | Order | Facility |

@f144_1_numeric_lab_results_base_applet_cover_sheet @US2038 @TA5030a 
Scenario: View Numeric Lab Results Base Applet Cover Sheet
  Then the numeric lab results applet title is "LAB RESULTS"
  And the "Numeric Lab Results Applet" table contains headers
    | Date | Lab Test | Flag | Result |

# @f144_coversheet
# Scenario: User reports test results
#     Given user is done testing functionality
#     Then user reports results