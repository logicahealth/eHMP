@F1225 @JBPM @future
Feature: Communication Platform to support announcements

@US18098 @US18098_1
Scenario: Communication Platform endpoints are included in the resource directory
	When client requests the patient resource directory in RDK format
	Then a successful response is returned
	And the RDK response contains
      | field      | value                            |
      | title      | ehmp-announcements               |
    And the RDK response contains
      | field      | value                            |
      | title      | ehmp-announcements-attachment    |
    And the RDK response contains
      | field      | value                            |
      | title      | ehmp-announcements-preferences   |

@US18098 @US18098_userid_req
Scenario: Verify input parameter userId is required
    When client requests communications for
      | parameter                | value                   |
      | requester.ehmpAppVersion | sample.data             |
      | category.code[]          | http://ehmp.DNS   /messageCategories/announcements-terms     |
      | category.code[]          | http://ehmp.DNS   /messageCategories/announcements-system    |
    Then a bad request response is returned
    And the response message is 'The required parameter "requester.userId" is missing.'

@US18098 @US18098_appversion_req
Scenario: Verify input parameter ehmpAppVersion is required
    When client requests communications for
      | parameter        | value                        |
      | requester.userId | urn:va:user:9E7A:10000000270 |
      | category.code[]  | http://ehmp.DNS   /messageCategories/announcements-terms          |
      | category.code[]  | http://ehmp.DNS   /messageCategories/announcements-system         |
    Then a bad request response is returned
    And the response message is 'The required parameter "requester.ehmpAppVersion" is missing.'

@US18098 @US18098_category_req
Scenario: Verify input parameter category is required
    When client requests communications for
      | parameter                | value                        |
      | requester.userId         | urn:va:user:9E7A:10000000270 |
      | requester.ehmpAppVersion | sample.data                  |

    Then a bad request response is returned
    And the response message is 'The required parameter "category" is missing.'

@US18098 @US18098_other_user
Scenario: Verify userId must match currently logged on user
    When client requests communications for
      | parameter                | value                        |
      | requester.userId         | urn:va:user:9E7A:10000000272 |
      | requester.ehmpAppVersion | sample.data                    |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms          |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-system         |
    Then a bad request response is returned


@US18098 @US18098_status_default
Scenario: Verify client receives only completed messages when does not specify a status
    When client requests communications for
      | parameter                | value                        |
      | requester.userId         | urn:va:user:9E7A:10000000270 |
      | requester.ehmpAppVersion | sample.data                    |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms          |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-system         |
    Then a successful response is returned
    And the response only contains messages with a completed status

@US18098 @US18098_request_status_complete
Scenario: Verify client recieves only completed messages when specifies a status of completed
    When client requests communications for
      | parameter                | value                                                       |
      | requester.userId         | urn:va:user:9E7A:10000000270                                |
      | requester.ehmpAppVersion | sample.data                                                   |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms                                         |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-system                                        |
      | status                   | http://hl7.org/fhir/ValueSet/communication-status/completed |
    Then a successful response is returned
    And the response only contains messages with a completed status

@US18098 @US18098_request_status_delete
Scenario: Verify client recieves only deleted messages when specifies a status of delete
    When client requests communications for
      | parameter                | value                                    |
      | requester.userId         | urn:va:user:9E7A:10000000270             |
      | requester.ehmpAppVersion | sample.data                                |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms                      |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-system                     |
      | status                   | http://ehmp.DNS   /messageStatus/deleted |
    Then a successful response is returned
    And the response only contains messages with a delete status

@US18098 @US18098_requested_category
Scenario: Verify client recieves only rquested categories
    When client requests communications for
      | parameter                | value                                    |
      | requester.userId         | urn:va:user:9E7A:10000000270             |
      | requester.ehmpAppVersion | sample.data                                |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms                      |
    Then a successful response is returned
    And the response only contains messages of type terms "announcements-terms"

@US18089 @US18089_term_descend
Scenario: Verify term announcements are returned in descending order
    When client requests communications for
      | parameter                | value                                                    |
      | requester.userId         | urn:va:user:9E7A:10000000270                             |
      | requester.ehmpAppVersion | sample.data                                              |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms |
    Then a successful response is returned
    And the term announcements are returned in descending order

@US18089 @US18089_system_descend
Scenario: Verify system announcements are returned in descending order
    When client requests communications for
      | parameter                | value                                    |
      | requester.userId         | urn:va:user:9E7A:10000000270             |
      | requester.ehmpAppVersion | sample.data                                |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-system                      |
    Then a successful response is returned
    And the system announcements are returned in descending order

@US18098 @US18098_requestversion
Scenario: Verify client recieves only rquested versions and announcements for all versions
    When client requests communications for
      | parameter                | value                                    |
      | requester.userId         | urn:va:user:9E7A:10000000270             |
      | requester.ehmpAppVersion | sample.data                            |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms                      |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-system                     |
    Then a successful response is returned
    And the response only contains messages of requested version "sample.data"

