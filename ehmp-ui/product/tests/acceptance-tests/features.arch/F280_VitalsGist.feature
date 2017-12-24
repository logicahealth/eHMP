@F280_VitalsGist   @DE6991 @DE6976 @reg2

Feature: F280 - Vitals Applet

#archived tests are in F1238

@f280_vitals_toolbar  
Scenario: Verify the vital toolbar
  And user searches for and selects "Ten,Patient"
  Then Overview is active
  And the user has selected All within the global date picker
  Then the "Vitals" applet is finished loading
  When the user clicks "Blood pressure Sistolic" vital column
  Then a popover toolbar displays buttons
   | button |
   | Quick View Button |
   | Detail View Button|
   | Info Button       |

@f280_vitals_quickview_resultcol @DE3242 @DE6037 @DE6842
Scenario: Verify the vital quick
  And user searches for and selects "Ten,Patient"
  Then Overview is active
  And the user has selected All within the global date picker
  Then the "Vitals" applet is finished loading
  When the user clicks "Blood pressure Sistolic" vital result column
  Then a quickview displays a vitals table with expected headers

@f280_vitals_quickview_button @DE3242 @DE6037 @DE6842
Scenario: Verify the vital quick
  Given user searches for and selects "Ten,Patient"
  And Overview is active
  And the user has selected All within the global date picker
  And the "Vitals" applet is finished loading
  When the user views the first Vitals Gist quicklook table via the toolbar
  Then a quickview displays a vitals table with expected headers


