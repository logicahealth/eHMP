@F414 @f414_problem_list  @reg2 @DE7348

Feature: Enter and Store A Problem List

@F414_3 @UAT_script @DE5179 @DE7348 @reg2
Scenario: eHMP user can add a Problem for an inpatient initiated from applet
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet
  And the user takes note of number of existing problems
  
  When user attempts to add a problem from problem applet header
  And user searches and selects a unique new problem 
  And Add Problem modal is displayed
  And user selects a unique Responsible Provider
  And user accepts the new problem
  Then a problem is added to the applet