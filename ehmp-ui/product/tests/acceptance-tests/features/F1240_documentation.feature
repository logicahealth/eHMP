@F1240 @documentation @F1240_doc @reg4
Feature:  Verify documentaiton is updated to include assign to 

@nav_bar
Scenario: Verify ui applets page has nav bar links
  Given user has navigated to the documentation home page
  When the user selects the eHMP UI developer guide
  Then the ui applets page is displayed
  And the ui applets page has nav bar links
      | link       |
      | Applets    |
      | Contexts   |
      | Extensions |
      | Resources  |
      | Screens    |

@navigate_assignto
Scenario: Navigate to assign to documentation page
  Given user has navigated to the documentation home page
  And the user selects the eHMP UI developer guide
  And the ui applets page is displayed
  When the user expands Extensions
  And the user expands Extensions-UI
  And the user expands Extensions-Form
  And the user expands Extensions-Controls
  And the user selects Extensions-Assign to
  Then the assign to form control extension page is displayed
  And the table of contents displays
  | toc label     |
  | Overview      |
  | Field Options |
  | Code Examples |

@direct_load_assignto
Scenario: Access assign to documententation page directly
  When user navigates to assign to documentation page
  Then the assign to form control extension page is displayed
  And the table of contents displays
  | toc label     |
  | Overview      |
  | Field Options |
  | Code Examples |