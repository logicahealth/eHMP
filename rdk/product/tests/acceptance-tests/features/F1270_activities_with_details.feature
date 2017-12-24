@F1270 @JBPM @future
Feature: Activities With Details Resource

@F1270_1
Scenario: Verify mode input query is required
  When the user requests activitiesWithDetails
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "mode" is missing.'

@US18863
Scenario: Activities With Details Resource will provide server side pagination for returning data to the calling Applet. Pagination will be supported with a default value of 100 records

  When the user requests activitiesWithDetails
      | parameter_name | parameter_value |
      | mode | all |
  Then a successful response is returned
  And the activities details results itemsPerPage is 100

@US18863
Scenario: Activities With Details Resource will provide server side pagination for returning data to the calling Applet. Pagination can be changed
  When the user requests activitiesWithDetails
      | parameter_name | parameter_value |
      | mode  | all |
      | limit | 2   |
  Then a successful response is returned
  And the activities details results pageIndex is 0
  And the activities details results startIndex is 0
  And the activities details results itemsPerPage are less then or equal to 40
  And the activities details results contain a nextStartIndex field

#  | start     | 0          |  

@F1270_2
Scenario: Flagged Records: This will use the ISACTIVITYHEALTHY flag
  When the user requests activitiesWithDetails
      | parameter_name | parameter_value |
      | mode | all |
  Then a successful response is returned
  And each response contains parameter ISACTIVITYHEALTHY of value 1 or 2

@F1270_3
Scenario: Permission - This resource should use the same existing permission as the current Activity and Task Resources ("read-task").

  And the user "Nurse", "Eighteen" ("urn:va:user:SITE:20181") does not have read-task permission
  When that user without read-task permission "SITE;summer7" requests default activitiesWithDetails
    | parameter_name | parameter_value |
    | mode           | open            |
  Then a forbidden response is returned


