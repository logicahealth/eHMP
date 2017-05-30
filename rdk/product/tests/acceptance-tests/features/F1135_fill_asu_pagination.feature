@F1135
Feature: Respond with the number of items that were requested after filtering

@US17184_1
Scenario:
 Given a patient with pid "9E7A;229" has been synced through the RDK API
 And the client requests documents through jds for patient "9E7A;229"
 And the jds response contains an item 
   | key    | value |
   | kind   | Advance Directive |
   | status | COMPLETED|
   | facilityCode | 561 |
  When the client requests documents through rdk "9E7A;229"
  Then the response does not contain the asu-filtered document

@US17184_2
Scenario:
  Given a patient with pid "9E7A;100125" has been synced through the RDK API
  When the client requests documents by scrolling for the patient "9E7A;100125" limited by
      | parameter | value       |
      | start     | 0           |
      | limit     | 2           |
  Then the document response maintains minimum page size

@US17184_3
Scenario:
  Given a patient with pid "9E7A;229" has been synced through the RDK API
  When the client requests documents by scrolling for the patient "9E7A;229" limited by
      | parameter | value       |
      | start     | 0           |
      | limit     | 2           |
  Then the document response maintains minimum page size

@US17184a @future
Scenario Outline: ASU
  Given a patient with pid "<pid>" has been synced through the RDK API
  When the client requests documents through rdk "<pid>"
  And the client requests documents through vx-sync "<pid>"
  # And the client requests documents through rdk as pathology,one "<pid>"
  Then compare documents

Examples:
  | pid |
  # |9E7A;227|
  # |9E7A;100608|
  # |9E7A;71|  # has 1 
  # |9E7A;253| # has 1
  # |9E7A;164| # has 1
  # |9E7A;239| # has 1
  # |9E7A;100599|
  # |9E7A;100001| # 1 progress note
  # |9E7A;231| # 1 progress note
  # |9E7A;3| # 1 discharge summary
  # |9E7A;9|
  # |9E7A;18| # 1 AD, 1 Progress Note
  # |9E7A;722| 
  # |9E7A;100716|
  # |9E7A;100840|
  # |9E7A;100731|
  # |9E7A;65|
  # |9E7A;8|
  # |9E7A;230| # discharge summary - retracted
  # |9E7A;17|
  # |9E7A;100125|# discharge summary - retracted
  # |9E7A;229| # Advance directive - completed
  # |9E7A;420|
  # |9E7A;100022|
  # |9E7A;100012|
  # |9E7A;271|
  # |C877;1|
  # |9E7A;428|
  # |9E7A;1|
  # |9E7A;100184|
  # |9E7A;167|
  # |9E7A;100615|
  # |9E7A;301|
  # |9E7A;100033|
  # |9E7A;100817|
  # |9E7A;149|
  # |9E7A;204|
