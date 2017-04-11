@F414 @f414_problem_list  @reg2
Feature: Enter and Store A Problem List

@F414_3 @UAT_script @DE5179
Scenario: eHMP user can add a Problem for an inpatient initiated from applet
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet
  And the user takes note of number of existing problems
  
  When user attempts to add a problem from problem applet header
  And user searches and selects new problem "Allergy to peanuts"
  And Add Problem modal is displayed
  And user selects Responsible Provider "Anesthesiologist,One"
  And user accepts the new problem
  Then a problem is added to the applet