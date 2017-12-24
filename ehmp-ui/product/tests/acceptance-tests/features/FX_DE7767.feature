@DE7767 @reg2
Feature: de7767-skip-links

@DE7767_1
Scenario: Verify skip links menu on patient search screen
  Given staff view screen is displayed
  When the user access the skip links menu through keyboard interaction
  Then the home page skip links menu displays
  And the skip links menu displays options
      | menu text            |
      | Main Content         |
      | Workspace Navigation |
      | Patient Selection    |

@DE7767_2
Scenario: Verify skip links menu on patient screen
  Given user searches for and selects "Eight,Patient"
  Then Summary View is active 
  When the user access the patient screen skip links menu through keyboard interaction
  Then the patient screen skip links menu displays
  And the patient screen skip links menu displays options
      | menu text                     |
      | Main Content - Patient Record |
      | Workspace Navigation          |
      | Patient Information           |
      | Patient Writeback Trays       |

@DE7767_3
Scenario: Verify skip links menu on patient screen
  Given user searches for and selects "Eight,Patient"
  Then Overview is active 
  When the user access the patient screen skip links menu through keyboard interaction
  Then the patient screen skip links menu displays
  And the patient screen skip links menu displays options
      | menu text                     |
      | Main Content - Patient Record |
      | Workspace Navigation          |
      | Patient Information           |
      | Patient Writeback Trays       |

@DE7967
Scenario:
  Given user searches for and selects "Eight,Patient"
  Then Summary View is active 
  And the header displays a staff home button