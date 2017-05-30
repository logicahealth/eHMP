@F1230_problems @reg2

Feature: F1230 - Problems Domain Improvements

Background: 
  When user searches for and selects "Eight,Patient"
  
@US18209_summary_view @US18210 @US18213
Scenario: Verify problem table headers in Summary View
    Then Cover Sheet is active
    And problems summary view is loaded successfully
    And problem applet table displays headers
    | headers |
    | Problem |
    | Onset Date|
    | Status   |
    | Comments |
    
@US18209_trend_view @US18210 @US18212 @US18213
Scenario: Verify problem table headers in Trend View
    Then Overview is active
    And problems gist is loaded successfully
    And problem applet table displays headers
    | headers |
    | Problem |
    | Status  |
    | Onset Date|
    
@US2411_c @US18209_exapnd_view @US18210
Scenario: User views the expanded Active Problems
  When the user expands the Problems Applet
  And problem applet table displays headers
	 | Headers |
	 | Problem |
	 | Standardized Description |
	 | Acuity |
	 | Status |
	 | Onset Date | 
	 | Last Updated| 
	 | Provider| 
	 | Facility | 
	 | Comments | 

	