@F414 @F414-4 @DE4560 @reg3
Feature: Enter and Store A Problem List - add a Freetext problem to the patient's problem list

Background:
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet
  And the user takes note of number of existing problems
  And user attempts to add a problem from problem applet header

@F414-4_1 @UAT_script
Scenario: eHMP user can add a free text Problem
  Given user searches for a new problem with term "pea"
  When user chooses to extend the search for a new problem
  Then the user is given an option to Enter Free Text

@F414-4_2 @UAT_script
Scenario: eHMP user can add a free text Problem
  Given user searches for a new problem with term "pea"
  When user chooses to Enter Free Text
  Then the Free Text Warning Acknowledgement is displayed
  And the Free Text Warning Acknowledgement includes the free text "pea"

@F414-4_3 @UAT_script
Scenario: eHMP user can cancel adding a free text Problem
  Given user searches for a new problem with term "pea"
  And user chooses to Enter Free Text
  And the Free Text Warning Acknowledgement is displayed
  When user chooses to not proceed with a nonspecific term
  Then the New Problem search modal is displayed

@F414-4_4 @UAT_script
Scenario: eHMP user add a free text Problem
  Given user searches for a new problem with term "pea"
  And user chooses to Enter Free Text
  And the Free Text Warning Acknowledgement is displayed
  When user chooses to proceed with a nonspecific term
  Then Add Problem modal is displayed
  And Freetext Problem Name is reported as "pea"
  And user selects Responsible Provider "Anesthesiologist,One"
  And user accepts the new problem
  And user refreshes the problems applet
  Then a problem is added to the applet

@F414-4_5 @UAT_script
Scenario: eHMP user can request a new term
  Given user searches for a new problem with term "pea"
  And user chooses to Enter Free Text
  And the Free Text Warning Acknowledgement is displayed
  When the user chooses to Request New Term
  Then the user is presented with ability to add New Term Request Comment
  And the user enters a New Term Request Comment "pea free text testing" and a timestamp
  And user chooses to proceed with a nonspecific term
  Then Add Problem modal is displayed
  And Freetext Problem Name is reported as "pea"
  And the Add Problem Request New Term checkbox is selected
  And the Add Problem New Term Request Comment is populated with "pea free text testing" and the timestamp
  And user selects Responsible Provider "Anesthesiologist,One"
  And user accepts the new problem
  And user refreshes the problems applet
  Then a problem is added to the applet

