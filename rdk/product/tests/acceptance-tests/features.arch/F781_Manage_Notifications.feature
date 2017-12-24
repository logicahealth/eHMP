@F781_Manage_Notifications @TeamVenus @future @debug
Feature: F781 - Receive, Display and Manage Notifications

#Implement a unified service within eHMP to receive notifications including notifications from external systems like VistA (CPRS).
#Patients used: SITE;253

@F781_1_Manage_Notifications @US12263 @future @debug
Scenario: As a system, I am able to receive communication requests, so that I can display alerts and notifications in eHMP
	Given I am able to post a persistent communication request
      | sender                  | recipient        | subject          | priority               | payload |
      | ehmp/activity/45/task/9 | SITE;10000000270 | patient/SITE;253 | ehmp/msg/priority/high | {"title": "Notification title", "content": "Notification content"} |
	Then I am able to retrieve comm requests for provider "SITE;10000000270"
	And the communication request contains
     	| field 			| value                 |
      	| resourceType      | CommunicationRequest  |
      	| status            | received              |
	Then I am able to retrieve comm requests for patient "SITE;253" of provider "SITE;10000000270"
	And the communication request contains
     	| field 			| value                 |
      	| resourceType      | CommunicationRequest  |
      	| subject.reference | patient/SITE;253      |
	Then I am able to retrieve counters for unread notifications for provider "SITE;10000000270"
	Then I am able to retrieve lists of unread notifications for provider "SITE;10000000270"
	And the communication request contains
     	| field 			| value                 |
      	| resourceType      | CommunicationRequest  |
      	| status            | received              |
	Then I am able to mark a notification as read as provider "SITE;10000000270"
  Then a successful response is returned
	Then I am able to mark a notification as completed as provider "SITE;10000000270"
  Then a successful response is returned
  And remove all communication requests for recipient "SITE;10000000270"
  And a no-content response is returned
