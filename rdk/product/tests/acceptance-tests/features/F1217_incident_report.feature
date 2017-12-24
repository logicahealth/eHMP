@F1217
Feature: Incident Reports

  @US17915 @US17916 @future
  Scenario: Submit single incident report
    Given an incident report
      | field                | value                                                               |
      | pid                  | SITE;3                                                              |
      | comment              | Hello world                                                         |
      | simpleSyncStatus     | {}                                                                  |
      | tracker.screenName   | provider-centric-view                                               |
      | tracker.hash         | #/staff/prodiver-centric-view                                       |
      | tracker.hostname     | ehmp.local                                                          |
      | tracker.url          | https://ehmp.local/#/staff/provider-centric-view                    |
      | tracker.appCodeName  | Mozilla                                                             |
      | tracker.appName      | Netscape                                                            |
      | tracker.appVersion   | 5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; rv:11.0) like Gecko |
      | tracker.platform     | Win32                                                               |
      | tracker.facility     | PANORAMA                                                            |
      | tracker.duz          | {"SITE": "3"}                                                       |
      | tracker.site         | SITE                                                                |
      | tracker.title        | Clinician                                                           |
      | tracker.history      | ["/staff/provider-centric-view"]                                    |
      | tracker.historyTimes | [1484762636811]                                                     |
    And the incident report has an incident
      | field             | value                                |
      | errorTimestamp    | 2017-01-17T20:28:49.752Z             |
      | message           | Some console info                    |
      | trace             | ReferenceError: foo is not defined   |
      | errorLogId        |                                      |
      | requestId         | cd229052-a3ea-49c4-b0e2-4de0e2863734 |
      | route             | #/patient/summary                    |
      | routeHistory      | ["/staff/provider-centric-view"]     |
      | routeHistoryTimes | [1484762636811]                      |
      | simpleSyncStatus  | {}                                   |

    When an incident report creation is requested
    Then a successful response is returned
    And the response contains
      | field            | value             |
      | incidentReportId | CONTAINS eHMP-IR- |


  @US17916 @future
  Scenario: Submit multiple incident reports
    Given an incident report
      | field            | value                                          |
      | pid              | SITE;3                                         |
      | comment          | This happened when I tried clicking the button |
      | simpleSyncStatus | {}                                             |
    And the incident report has an incident
      | field          | value                                |
      | errorTimestamp | 2017-01-17T20:28:49.752Z             |
      | message        | loaded the object                    |
      | trace          |                                      |
      | errorLogId     |                                      |
      | requestId      | cd229052-a3ea-49c4-b0e2-4de0e2863734 |
    And the incident report has an incident
      | field                | value                                                            |
      | simpleSyncStatus     | {}                                                               |
      | errorTimestamp       | 2017-01-17T23:36:40.190Z                                         |
      | message              |                                                                  |
      | tracker.history      | ["/staff/provider-centric-view", "/staff/provider-centric-view"] |
      | tracker.historyTimes | [1484755321969, 1484762636811]                                   |
    When an incident report creation is requested
    Then a successful response is returned
    And the response contains
      | field            | value             |
      | incidentReportId | CONTAINS eHMP-IR- |
