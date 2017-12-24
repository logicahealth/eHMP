@F1285
Feature: Edit Permission Set thru UI - permission set features list

@US19024_1 @US18969
Scenario: Verify permission set features list request is included in the resource directory
    When client requests the patient resource directory in RDK format
    Then a successful response is returned
	  And the RDK response contains
      | field | value                                 |
      | title | permission-sets-features              |
      | href  | CONTAINS permission-sets/features-list|

@US19024_2 @US18969
Scenario: Verify request returns success and hash containing the following tags
    When the client requests the permission set features list
    Then a successful response is returned
    And the permission set features list contain the attributes
      | attribute                  |
      | items.uid                  |
      | items.label                |
      | items.description          |
      | items.status               |
      | items.permissions          |

@US19024_3 @US18969
Scenario: Verify request returns success and hash containing the following tags and values
  When the client requests the permission set features list
  Then a successful response is returned
  Then the VPR results contain
    | field             | value                                |
    | uid               | active-medications                   |
    | description       | Active medications feature category  |
    | label             | Active Medications                   |
    | status            | active                               |
    | permissions       | add-active-medication                |
    | permissions       | discontinue-active-medication        |
    | permissions       | edit-active-medication               |
    | permissions       | read-active-medication               |
  And the VPR results contain
    | field             | value                                |
    | uid               | allergy                              |
    | description       | Allergy feature category             |
    | label             | Allergy                              |
    | status            | active                               |
    | permissions       | add-allergy                          |
    | permissions       | edit-allergy                         |
    | permissions       | read-allergy                         |
