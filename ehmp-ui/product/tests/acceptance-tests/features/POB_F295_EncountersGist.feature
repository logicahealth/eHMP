@F295_encounters_trend_view  @reg1
Feature: F295 - Encounters Applet

@pob_f295_encounters_initial_view @F295-1.1 @F295-1.2 @F295-1.3 @F295_4 @F295-1.5 @F295-1.7 @US3706 @US4001 @US4154 @US5126
Scenario: User views the encounters gist view
  When user searches for and selects "Sixhundred,Patient"
  And Overview is active
  And the user has selected All within the global date picker
  Then POB user verifies Encounters trend view applet is present
  And POB Encounters trend view applet has headers
      | Headers 	  |
      | Encounter     |
      | Hx Occurrence |
      | Last          |
  And POB Encounters trend view has data rows

@pob_f295_encounters_expand_view_from_trend_view @debug @DE6991 @DE6976
Scenario: User can expand Encounters applet from trend view
  When user searches for and selects "Sixhundred,Patient" 
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  When POB user can expand the Encounters trend view applet
  Then POB Encounters expand view(timeline) applet contains data rows
  When POB user closes the Encounters Applet expand view
  Then POB user is navigated back to overview page from encounters expand view
  
@pob_f295_encounters_trend_view_display_buttons
Scenario: Encounters trend view displays buttons
  Given user searches for and selects "Sixhundred,Patient" 
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  And POB Encounters trend view applet displays Refresh button
  And POB Encounters trend view applet displays Expand View button
  And POB Encounters trend view applet displays Help button
  And POB Encounters trend view applet displays Filter Toggle button
  
@pob_f295_encounters_trend_view_filter
Scenario: User can filter Encounters trend view applet
  Given user searches for and selects "Sixhundred,Patient" 
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  And POB user opens Encounters trend view applet search filter
  And POB user filters the Encounters trend view applet by text "pulmonary"
  Then POB Encounters trend view applet table only diplays rows including text "pulmonary"
  
@pob_f295_encounters_trend_view_refresh
Scenario: Encounters applet displays all of the same details after applet is refreshed
  Given user searches for and selects "Sixhundred,Patient" 
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  When user refreshes Encounters trend view applet
  Then the message on the Encounters trend view applet does not say an error has occurred
  
@pob_f295_encounter_trend_view_column_sort_Visit @F295-13.1 @F295-13.2 @US4684 @US4154 @US5126 @DE6843
Scenario: Encounter Trend view Applet is sorted by the column header Visit Type under Visit.
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  When the user expands type Visits in Encounters trend view applet
  And the user sorts the Encounters trend view applet by column Visit Type
  Then the Encounters trend view applet is sorted in alphabetic order based on Visit Type
  And the user sorts the Encounters trend view applet by column Visit Type
  Then the Encounters trend view applet is sorted in reverse alphabetic order based on Visit Type  
  
@pob_f295_encounter_trend_view_column_sort_Hx_Occurrence @F295-13.1 @F295-13.2 @US4684 @US4154 @US5126 @DE6843
Scenario: Encounters trend view Applet is sorted by the column header Hx Occrrence
  Given user searches for and selects "ZZZRETFOURFIFTYEIGHT,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  When the user expands type Visits in Encounters trend view applet
  And the user sorts the Encounters trend view applet by column HxOccurrence
  Then the Encounters trend view applet is sorted in alphabetic order based on column HxOccurrence
  And the user sorts the Encounters trend view applet by column HxOccurrence
  Then the Encounters trend view applet is sorted in reverse alphabetic order based on column HxOccurrence  

@pob_f295_encounter_trend_view_column_sorting_last @F295-13.1 @F295-13.2 @US4684 @US4154 @US5126
Scenario: Encounters trend view Applet is sorted by the column header Last
  Given user searches for and selects "Nine,PATIENT"
  Then Overview is active
  And the user has selected All within the global date picker
  And POB Encounters trend view has data rows
  When the user expands type Visits in Encounters trend view applet
  And the user sorts the Encounters trend view applet by column Last
  Then the Encounters trend view applet is sorted in reverse alphabetic order based on column Last
  And the user sorts the Encounters trend view applet by column Last
  Then the Encounters trend view applet is sorted in alphabetic order based on column Last


