
@F586_Notifications_Alerts @F586
Feature: F586 - Notifications and Alerts

@US10086 @US10556 @Communication_Request_Get_All @DE3855 @future @DE6042
Scenario: retrieve all requests for a recipient
    Given the system knows about the following communication requests for the "patient%2F9E7A;10045" recipient
    | category                      | sender                   | medium                     | recipient          | payload                    | status    | reason                      | subject            | priority               |
    | ehmp/msg/category/clinical    | ehmp/activity/123/task/1 | ehmp/msg/medium/ui/inline  | patient/9E7A;10045 | patient/9E7A;10045/lab/123 | requested | ehmp/msg/reason/decision    | patient/9E7A;10045 | ehmp/msg/priority/high |
    | ehmp/msg/category/operational | ehmp/activity/45/task/3  | ehmp/msg/medium/ui/overlay | patient/9E7A;10045 | patient/9E7A;data/543      | requested | ehmp/msg/reason/information | patient/9E7A;10045 | ehmp/msg/priority/low  |
    When the client retrieves all communication requests for recipient "patient%2F9E7A;10045"
    And one of the communication request has the following data:
     	| field 					       	    | value                    				     |
      	| resourceType                          | CommunicationRequest                       |
       	| category.coding.code                  | ehmp/msg/category/clinical                 |
      	| sender.reference                      | ehmp/activity/123/task/1                   |
       	| medium.coding.code                    | ehmp/msg/medium/ui/inline               	 |
       	| recipient.reference                   | patient/9E7A;10045                         |
       	| payload.contentReference.reference    | patient/9E7A;10045/lab/123                 |
       	| status                                | requested                                  |
       	| reason.coding.code                    | ehmp/msg/reason/decision                   |
       	| subject.reference                     | patient/9E7A;10045                         |
       	| priority.coding.code                  | ehmp/msg/priority/high                     |
    And one of the communication request has the following data:
     	| field 					       	    | value                    				     |
      	| resourceType                          | CommunicationRequest                       |
       	| category.coding.code                  | ehmp/msg/category/operational              |
      	| sender.reference                      | ehmp/activity/45/task/3                    |
       	| medium.coding.code                    | ehmp/msg/medium/ui/overlay              	 |
       	| recipient.reference                   | patient/9E7A;10045                         |
       	| payload.contentReference.reference    | patient/9E7A;data/543                      |
       	| status                                | requested                                  |
       	| reason.coding.code                    | ehmp/msg/reason/information                |
       	| subject.reference                     | patient/9E7A;10045                         |
       	| priority.coding.code                  | ehmp/msg/priority/low                      |
    And remove all communication requests for recipient "patient%2F9E7A;10045"

 @US10086 @US10556 @Communication_Request_No_Requests_For_Recipient @future @DE6042
Scenario: not found when retrieving all requests for a recipient that does have any requests
    Given no communication request for a recipient
    When the client retrieves all communication requests for recipient "patient%2F9E7A;10045"
    Then a successful response is returned

@US10089 @US10556 @Communication_Request_Delete_All @future @DE6042
Scenario: delete all requests for a recipient
    Given the system knows about the following communication requests for the "patient%2F9E7A;10045" recipient
    | category                      | sender                   | medium                     | recipient          | payload                    | status    | reason                      | subject            | priority               |
    | ehmp/msg/category/clinical    | ehmp/activity/123/task/1 | ehmp/msg/medium/ui/inline  | patient/9E7A;10045 | patient/9E7A;10045/lab/123 | requested | ehmp/msg/reason/decision    | patient/9E7A;10045 | ehmp/msg/priority/high |
    | ehmp/msg/category/operational | ehmp/activity/45/task/3  | ehmp/msg/medium/ui/overlay | patient/9E7A;10045 | patient/9E7A;data/543      | requested | ehmp/msg/reason/information | patient/9E7A;10045 | ehmp/msg/priority/low  |
    Then remove all communication requests for recipient "patient%2F9E7A;10045"

@US10088 @US10089 @US100091 @US10556 @Communication_Request_Get_By_Id @future @DE6042
Scenario: retrieve a single request for a recipient
    Given the system knows about the following communication requests for the "provider%2Fpu1234" recipient
    | category                      | sender                   | medium                     | recipient          | payload                    | status    | reason                      | subject            | priority           |
    | ehmp/msg/category/clinical    | ehmp/activity/123/task/5 | ehmp/msg/medium/ui/inline  | provider/pu1234    | patient/9E7A;10045/lab/123 | requested | ehmp/msg/reason/decision    | patient/9E7A;10045 | ehmp/msg/priority/high |
    When the client retrieves a communication request for recipient "provider%2Fpu1234" with the resource id
    Then a successful response is returned
    And the communication request contains
     	| field 					       	    | value                    				     |
      	| resourceType                          | CommunicationRequest                       |
      	| sender.reference                      | ehmp/activity/123/task/5                   |
       	| category.coding.code                  | ehmp/msg/category/clinical                 |
       	| medium.coding.code                    | ehmp/msg/medium/ui/inline             		 |
       	| recipient.reference                   | provider/pu1234                            |
       	| payload.contentReference.reference    | patient/9E7A;10045/lab/123                 |
       	| status                                | requested                                  |
       	| reason.coding.code                    | ehmp/msg/reason/decision                   |
       	| subject.reference                     | patient/9E7A;10045                         |
       	| priority.coding.code                  | ehmp/msg/priority/high                     |
    And remove all communication requests for recipient "provider%2Fpu1234"

@US10089 @US10556 @Communication_Request_Delete_By_Id @future @DE6042
Scenario: delete a single request for a recipient
    Given the system knows about the following communication requests for the "provider%2Fpu1234" recipient
    | category                      | sender                   | medium                     | recipient          | payload                    | status    | reason                      | subject            | priority           |
    | ehmp/msg/category/clinical    | ehmp/activity/123/task/5 | ehmp/msg/medium/ui/inline  | provider/pu1234    | patient/9E7A;10045/lab/123 | requested | ehmp/msg/reason/decision    | patient/9E7A;10045 | ehmp/msg/priority/high |
    When the client deletes the communication request for recipient "provider%2Fpu1234" with a resource id

@US10088 @US100091 @US10556 @Communication_Request_Get_By_Id_No_Request @future @DE6042
Scenario: not found when retrieving a single request for a recipient that does not exist
    Given communication request with an unknown resource id
    When the client retrieves a communication request for recipient "provider%2Fpu1234" with an unknown resource id
    Then a not-found response is returned

@US10089 @US10556 @Communication_Request_Add_Bad_Request @future @DE6042
Scenario: try to add a bad request
    Given an invalid communication request
    When trying to add an invalid communication requests
    | category                      | sender                   | medium                     | payload                    | status    | reason                      | subject            | priority               |
    | ehmp/msg/category/clinical    | ehmp/activity/123/task/1 | ehmp/msg/medium/ui/inline  | patient/9E7A;10045/lab/123 | requested | ehmp/msg/reason/decision    | patient/9E7A;10045 | ehmp/msg/priority/high |
    Then a bad request response is returned

@US10089 @US10556 @Communication_Request_Add_Unprocessible_Request @future @DE6042
Scenario: try to add a unprocessible request
    Given an invalid communication request
    When trying to add an invalid communication requests
    | category                      | sender                   | medium                     | recipient          | payload                    | status    | reason                      | subject            | priority                |
    | ehmp/msg/category/clinical    | ehmp/activity/123/task/1 | ehmp/msg/medium/ui/inline  | patient/9E7A;10045 | patient/9E7A;10045/lab/123 | requested | ehmp/msg/reason/decision    | patient/9E7A;10045 | ehmp/msg/priority/alert |
    Then a accepted response is returned
    And remove all communication requests for recipient "patient%2F9E7A;10045"

