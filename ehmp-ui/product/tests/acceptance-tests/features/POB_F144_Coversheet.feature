@future
Feature: F140 – All Patient Search
  This feature will allow a user to search for patients globally in eHMP through a global patient search feature MVI.
  Once the search criteria is entered, a maximum of 10 results will be shown. If there are more than 10 results,
  than no results will be returned.  This also searches for sensitive patient.

# POC: Team EnterPrise
# Updated by Saikat Barua on Dec, 10th 2015

Scenario: User can view community health summaires on the coversheet
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "BCMA, EIGHT" and confirms selection
  When POB Cover Sheet is active
  Then POB the CommunityHealthSummaries coversheet table contains headers
    | Headers                |
    | Date                   |
    | Authoring Institution  |

