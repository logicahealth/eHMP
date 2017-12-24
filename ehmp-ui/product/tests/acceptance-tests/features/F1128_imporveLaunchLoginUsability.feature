@F1128 @regression @reg2
Feature: Improve eHMP launch/login usability:

#Team Application
  
@US17092_DefaultFacility @US17091_FacilityLabel
Scenario: Login secreen defaults to the most recent facility selected
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  And staff view screen is displayed
  And user logs out
  Then default facility is dislayed as "panorama"
  And user closes eHMP-UI
  And user launches eHMP-UI
  Then default facility is dislayed as "panorama"
  And the facility field's label is "Facility *"

@US17173_FacilityTypeahead 
Scenario: User has ability to type-ahead in the facility field 
  Given user launches eHMP-UI
  And user searches for a facility with term "pan"
  Then the facility list only diplays facilities including text "pan"
  And user selects the above facility
  And user searches for a facility with term "nor"
  Then the facility list only diplays facilities including text "nor"
  And user selects the above facility
  And user searches for a facility with term "panorama"
  And the facility "panorama" is highlighted
  And user selects the above facility
  And user searches for a facility with term "abcd"
  Then then search result displays message "No results found"
