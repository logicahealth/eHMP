@F781_Manage_Notifications @TeamVenus
Feature: F781 - Receive, Display and Manage Notifications

#Implement a unified service within eHMP to receive notifications including notifications from external systems like VistA (CPRS).
#Patients used: 9E7A;253

@F781_1_Manage_Notifications @US12263
Scenario: As a system, I am able to receive communication requests, so that I can display alerts and notifications in eHMP
	Given I am able to post a persistent communication request
      | sender                  | recipient        | subject          | priority               | payload |
      | ehmp/activity/45/task/9 | 9E7A;10000000270 | patient/9E7A;253 | ehmp/msg/priority/high | {"title": "Notification title", "content": "Notification content"} |
	Then I am able to retrieve comm requests for provider "9E7A;10000000270"
	And the communication request contains
     	| field 			| value                 |
      	| resourceType      | CommunicationRequest  |
      	| status            | received              |
	Then I am able to retrieve comm requests for patient "9E7A;253" of provider "9E7A;10000000270"
	And the communication request contains
     	| field 			| value                 |
      	| resourceType      | CommunicationRequest  |
      	| subject.reference | patient/9E7A;253      |
	Then I am able to retrieve counters for unread notifications for provider "9E7A;10000000270"
	Then I am able to retrieve lists of unread notifications for provider "9E7A;10000000270"
	And the communication request contains
     	| field 			| value                 |
      	| resourceType      | CommunicationRequest  |
      	| status            | received              |
	Then I am able to mark a notification as read as provider "9E7A;10000000270"
	And the communication request contains
     	| field 			| value                 |
      	| resourceType      | CommunicationRequest  |
      	| status            | accepted              |
	Then I am able to mark a notification as completed as provider "9E7A;10000000270"
	And the communication request contains
     	| field 			| value                 |
      	| resourceType      | CommunicationRequest  |
      	| status            | completed             |
