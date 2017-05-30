@F414 @add_problem_comments  @DE4560 @reg3 

# same problem can't be added repeatedly.  Tagging as future

Feature: Enter and Store A Problem List - with comments

Background:
  Given user searches for and selects "TWENTY,INPATIENT"
  And Overview is active
  And the user navigates to expanded problems applet

  And user opens observation tray
  And user attempts to create a new "Problem" observation
  And user searches and selects new problem "Allergy to peanuts"

@F414_comment_1
Scenario: eHMP user can add new comment after defining problem section within “Add problem” form.
  Given Add Problem modal is displayed
  When user enters a comment "test comment" and a timestamp
  Then the comment character count is updated
  And the Add Problem comment add button is enabled
  And the Add Problem accept button is disabled

  When user adds the problem comment
  Then the Add Problem comment add button is disabled
  And the Add Problem accept button is enabled
  And a Add Problem comment row is displayed with "test comment" and a timestamp

@F414_comment_2
Scenario: eHMP user can edit (cancel) comment 
  Given Add Problem modal is displayed
  And user enters a comment "test comment" and a timestamp
  And user adds the problem comment
  And a Add Problem comment row is displayed with "test comment" and a timestamp
  When user chooses to edit the "test comment" comment
  Then a comment cancel button is enabled
  And a comment save button is disabled
  When user updates comment text to "edit comment" and a timestamp
  And user chooses to cancel the comment edit
  And a Add Problem comment row is displayed with "test comment" and a timestamp

@F414_comment_3
Scenario: eHMP user can edit (save) comment 
  Given Add Problem modal is displayed
  And user enters a comment "test comment" and a timestamp
  And user adds the problem comment
  And a Add Problem comment row is displayed with "test comment" and a timestamp
  When user chooses to edit the "test comment" comment
  When user updates comment text to "edit comment" and a timestamp
  And user chooses to save the comment edit
  Then a Add Problem comment row is displayed with "edit comment" and a timestamp

@F414_comment_delete_ok
Scenario: eHMP user can delete (okay) a comment
  Given Add Problem modal is displayed
  And user enters a comment "test comment" and a timestamp
  And user adds the problem comment
  And a Add Problem comment row is displayed with "test comment" and a timestamp
  When user chooses to delete the "test comment" comment
  Then Comment delete alert is displayed
  And user chooses Okay to approve comment deletion
  And a Add Problem comment row is not displayed with "test comment" and a timestamp

@F414_comment_delete_restore
Scenario: eHMP user can delete (restore) a comment
  Given Add Problem modal is displayed
  And user enters a comment "test comment" and a timestamp
  And user adds the problem comment
  And a Add Problem comment row is displayed with "test comment" and a timestamp
  When user chooses to delete the "test comment" comment
  Then Comment delete alert is displayed
  When user chooses to Restore the comment
  Then a Add Problem comment row is displayed with "test comment" and a timestamp

@F414_comment_chronilogical
Scenario: :  eHMP user is able to add new comments after defining problem section within “add problem” form. As these comments are added, the comments should appear in chronological order.
  Given Add Problem modal is displayed
  When user enters a comment "test comment 1" and a timestamp
  And user adds the problem comment
  And a Add Problem comment row is displayed with "test comment 1" and a timestamp
  And user enters a comment "test comment 2" and a timestamp
  And user adds the problem comment
  And a Add Problem comment row is displayed with "test comment 2" and a timestamp
  And user enters a comment "test comment 3" and a timestamp
  And user adds the problem comment
  And a Add Problem comment row is displayed with "test comment 3" and a timestamp
  And user enters a comment "test comment 4" and a timestamp
  And user adds the problem comment
  And a Add Problem comment row is displayed with "test comment 4" and a timestamp
  Then the Add Problem comments are in order
   | comment text   |
   | test comment 1 |
   | test comment 2 |
   | test comment 3 |
   | test comment 4 |

