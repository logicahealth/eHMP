@F144_labs_by_panel @vxsync @enrich
Feature: F144 - eHMP Viewer GUI

#As a user viewing labs inside of a panel the labs will be sorted in a given order as specified by the displayorder

#Andromeda

@f144_labsByPanel_start_limit_filter @US2523
Scenario: Limiting the number of results with the 'start', 'limit', 'observedFrom' and 'observedTo' parameters.
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests a response in VPR format from RDK API with the labsbypanel parameters
    | pid              | _ack     | observedFrom | observedTo | start | limit |
    | SITE;3     | true     |              |            |       |       |
    Then a successful response is returned
  When the client requests a response in VPR format from RDK API with the labsbypanel parameters
    | pid              | _ack     | observedFrom | observedTo | start | limit |
    | SITE;3     | true     | 2007         | 2008       | 10    | 14    |
    Then a successful response is returned
    And the client receives "453" total items but only "14" current items with a start index of "10"

@US2034 @DE377 @labsByPanel_anatomic_pathology
Scenario: Show the anatomic pathology results from labs applet
  Given a patient with pid "SITE;239" has been synced through the RDK API
  When the client requests a response in VPR format from RDK API with the labsbypanel parameters
    | pid              | _ack     | observedFrom | observedTo | start | limit |
    | SITE;239     | true     |              |            |       |       |
  Then a successful response is returned
  And the VPR results contain
      | field           | value              |
      | pid             | SITE;239           |
      | observed        | 19951205           |
      | kind            | Surgical Pathology |
      | specimen        | LYMPH NODES        |
  And the VPR results contain
      | field           | value              |
      | pid             | SITE;239           |
      | observed        | 19951205           |
      | kind            | Surgical Pathology |
      | specimen        | LYMPH NODES        |
  And the VPR results contain
      | field           | value              |
      | pid             | SITE;239           |
      | observed        | 19951116           |
      | kind            | Surgical Pathology |
      | specimen        | BONE MARROW BIOPSY |
  And the VPR results contain
      | field           | value              |
      | pid             | SITE;239           |
      | observed        | 19951116           |
      | kind            | Surgical Pathology |
      | specimen        | BONE MARROW BIOPSY |

@US2034 @DE377 @labsByPanel_microbiology
Scenario: Show the microbiology results from labs applet
  Given a patient with pid "SITE;9" has been synced through the RDK API
   When the client requests a response in VPR format from RDK API with the labsbypanel parameters
    | pid              | _ack     | observedFrom | observedTo | start | limit |
    | SITE;9           | true     |              |            |       |       |
  Then a successful response is returned
  And the VPR results contain
      | field           | value        |
      | pid             | SITE;9       |
      | observed        | 19930911231500 |
      | kind            | Microbiology |
      | sample          | URINE        |
      | specimen        | URINE        |
