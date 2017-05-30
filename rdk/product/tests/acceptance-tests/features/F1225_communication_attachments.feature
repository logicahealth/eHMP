@F1225 @US18156 @JBPM @future
Feature: Communication Platform to support announcements - attachments

@US18156_1
Scenario: Verify error if provided identifier does not match an existing message identifier
  When client requests attachment for invalid identifier
  Then a non-found response is returned
  And the response message is "Not Found"

@US18156_2
Scenario:
    Given client requests communications for
      | parameter                | value                                                     |
      | requester.userId         | urn:va:user:9E7A:10000000270                              |
      | requester.ehmpAppVersion | sample.data                                               |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms  |
    And a successful response is returned
    And the response contains at least 1 term announcement with an attachment
    When the client requests the attachment for the first returned term using substitution
    Then a successful response is returned
    And the attachment response contains populated 
      | field       |
      | contentType |
      | src         |

@US18156_3
Scenario:
    Given client requests communications for
      | parameter                | value                                                     |
      | requester.userId         | urn:va:user:9E7A:10000000270                              |
      | requester.ehmpAppVersion | sample.data                                               |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-terms  |
    And a successful response is returned
    And the response contains at least 1 term announcement with an attachment
    When the client requests the attachment for the first returned term using the link
    Then a successful response is returned
    And the attachment response contains populated 
      | field       |
      | contentType |
      | src         |
