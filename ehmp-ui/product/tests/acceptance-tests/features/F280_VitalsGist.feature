@F280_VitalsGist @vitals_applet  @DE6991 @DE6976 @reg2

Feature: F280 - Vitals Applet

@F280_2_vitalsGist_View  @US4259 @DE2875 
Scenario: Verfy vitals for patient using Overview Sheet - verify data
  And user searches for and selects "Five,Patient"
  Then Overview is active
  And the user has selected All within the global date picker
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
  Then the Vitals gist displays no records for
      | CG    | CG           |

@F280_3_vitalsGist_View  @US4259 @DE7233
Scenario: Verfy vitals for patient using Overview Sheet - verify no data display
  And user searches for and selects "Ninetynine,Patient"
  Then Overview is active
  When the user changes the global date filter to 24HR
  Then the "Vitals" applet is finished loading
  And user sees Vitals Gist
  Then the Vitals gist displays no records for
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
      | CG    | CG           |
      
@f280_vitals_gist_applet_refresh 
Scenario: Vitals Gist applet displays all of the same details after applet is refreshed
  And user searches for and selects "Ninetynine,Patient"
  Then Overview is active
  Then the "Vitals" applet is finished loading
  And user sees Vitals Gist
  And the user has selected All within the global date picker
  And the Vitals Gist Applet contains data rows
  When user refreshes Vitals Gist Applet
  Then the message on the Vitals Gist Applet does not say "An error has occurred"
  
@f280_vitals_gist_applet_expand_view_refresh 
Scenario: Vitals expand view applet displays all of the same details after applet is refreshed
  And user searches for and selects "Ninetynine,Patient"
  Then Overview is active
  Then the "Vitals" applet is finished loading
  And user sees Vitals Gist
  And the user has selected All within the global date picker
  Then the user expands the vitals applet
  And the Vitals Applet contains data rows
  When user refreshes Vitals Applet
  Then the message on the Vitals Applet does not say "An error has occurred"

@f280_vitals_type_sort 
Scenario: Verify that Type column header can be sorted in ascending when clicked first time
  And user searches for and selects "Ten,Patient"
  Then Overview is active
  And the user has selected All within the global date picker
  Then the "Vitals" applet is finished loading
  When the user sorts the Vitals Gist grid by Type 
  Then the Vitals gist is sorted in alphabetic order based on Type
  When the user sorts the Vitals Gist grid by Type 
  Then the Vitals gist is sorted in reverse alphabetic order based on Type
   
@F280_VitalsGist_detail_view @DE6010 @DE6897
Scenario: Verfy details for Vitals for patient using Gist view applet
  And user searches for and selects "Ten,Patient"
  Then Overview is active
  And the user has selected All within the global date picker
  Then the "Vitals" applet is finished loading
  When the user views the first Vitals Gist detail view
  Then the modal is displayed
  And the Vital Detail modal displays 
      | modal item     |
      | Vital          | 
      | Result         | 
      | Observed       | 
      | Facility       | 
      | Type		   |
      | Entered        |
    
@F280_VitalsGist_detail_from_expand_view @DE6010
Scenario: Verfy details for Vitals for patient using expand view applet
  And user searches for and selects "Ten,Patient"
  Then Overview is active
  And the user has selected All within the global date picker
  Then the "Vitals" applet is finished loading
  Then the user expands the vitals applet
  When the user views the first Vital detail view
  Then the modal is displayed
  And the Vital Detail modal displays 
      | modal item     |
      | Vital          | 
      | Result         | 
      | Observed       | 
      | Facility       | 
      | Type		   |
      | Entered        |

