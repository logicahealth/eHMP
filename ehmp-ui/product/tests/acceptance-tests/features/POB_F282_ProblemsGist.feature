@F282_problems_gist @regression @triage
Feature: F82 - Problems Gist View

@f282_problems_initial_view @F282-1.1 @F282-2.1 @US3390 @US4317
Scenario: User views the problems gist view
  When user searches for and selects "ZZZRETFOURFIFTYEIGHT,Patient"
  And Overview is active
  Then user verifies Problems trend view applet is present
  And Problems trend view applet has headers
      | Headers 	  |
      | Problem       |
      | Acuity        |
      | Status        |
      | Facility      |
  And Problems trend view has data rows
  And Problems trend view facility column displays valid facility
    
@f282_problems_expand_view_from_trend_view
Scenario: User can expand Problems applet from trend view
  When user searches for and selects "ZZZRETFOURFIFTYEIGHT,Patient" 
  Then Overview is active
  And Problems trend view has data rows
  When user can expand the Problems trend view applet
  Then Problems expand view applet contains data rows
  When user closes the Problems Applet expand view
  Then user is navigated back to overview page from problems expand view
  
@f282_problems_trend_view_display_buttons
Scenario: Problems trend view displays buttons
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,Patient" 
  Then Overview is active
  And Problems trend view has data rows
  And Problems trend view applet displays Refresh button
  And Problems trend view applet displays Expand View button
  And Problems trend view applet displays Help button
  And Problems trend view applet displays Filter Toggle button  
  
@f282_problems_trend_view_filter
Scenario: User can filter Problems trend view applet
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,Patient" 
  Then Overview is active
  And Problems trend view has data rows
  And user opens Problems trend view applet search filter
  And user filters the Problems trend view applet by text "hypertension"
  Then Problems trend view applet table only diplays rows including text "hypertension"
  
@f282_problems_trend_view_refresh
Scenario: Problems applet displays all of the same details after applet is refreshed
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,Patient" 
  Then Overview is active
  And Problems trend view has data rows
  When user refreshes Problems trend view applet
  Then the message on the Problems trend view applet does not say an error has occurred
  
@f282_problems_Column_Sorting_Problem @F282-9.1 @US4684 @DE1371
Scenario: Problems Trend view Applet is sorted by the column header Problems
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And Problems trend view has data rows
  When the user sorts the Problems trend view applet by column Problem
  Then the Problems trend view applet is sorted in alphabetic order based on Problem
  And the user sorts the Problems trend view applet by column Problem
  Then the Problems trend view applet is sorted in reverse alphabetic order based on Problem
  
@f282_problems_Column_Sorting_Acuity @F282-9.1 @US4684
Scenario: Problems trend view Applet is sorted by the column header Acuity
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And Problems trend view has data rows
  When the user sorts the Problems trend view applet by column Acuity
  Then the Problems trend view applet is sorted in alphabetic order based on Acuity
  And the user sorts the Problems trend view applet by column Acuity
  And the Problems trend view applet is sorted in reverse alphabetic order based on Acuity
  
@f282_problems_Column_Sorting_facility @F282-9.1 @US4684
Scenario: Problems Gist Applet is sorted by the column header Last
  And user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And Problems trend view has data rows
  And the user sorts the Problems trend view applet by column Facility
  Then the Problems trend view applet is sorted in alphabetic order based on Facility
  And the user sorts the Problems trend view applet by column Facility
  And the Problems trend view applet is sorted in reverse alphabetic order based on Facility  
  
@f282_problems_quick_view_not_through_toolbar @F282-7.1 @US4155 @4317 @DE1321
Scenario: Problems Applet Trend view - quick view of problems
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"  
  Then Overview is active
  And Problems trend view has data rows
  And hovering over the right side of problem trend view and selecting the facility field
  Then the problems quick look table is displayed
  And problems quick look table contains headers
    |Headers 		|
    | Date   		|
    | Description 	| 
    | Facility 		|

@f282_problems_quick_view_through_toolbar @F282-7.1 @US4317 @US4805
Scenario: Problems Applet Trend view - quick view of problems
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"  
  Then Overview is active
  And Problems trend view has data rows
  When user opens the first problems gist item
  And user selects the quick look view toolbar
  Then the problems quick look table is displayed
  And problems quick look table contains headers
    |Headers 		|
    | Date   		|
    | Description 	| 
    | Facility 		|

@f282_problems__detail_view_through_toolbar @F282-6.1 @US4317 @US4805 @DE1400 @DE6551
Scenario: Problems Applet Gist - detail view of most recent problem 
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"  
  Then Overview is active
  And Problems trend view has data rows
  When user opens the first problems gist item
  And user selects the detail view toolbar
  Then the detail modal is displayed
  And the detail modal title is set
  And problems detail view contain fields
  | fields				|
  | Primary ICD-9-CM	|
  | Primary ICD-10-CM	|
  | SNOMED CT			|

