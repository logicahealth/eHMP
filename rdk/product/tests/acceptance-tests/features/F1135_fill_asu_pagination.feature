@F1135
Feature: Respond with the number of items that were requested after filtering

@US17184_1
Scenario:
 Given a patient with pid "SITE;229" has been synced through the RDK API
 And the client requests documents through jds for patient "SITE;229"
 And the jds response contains an item 
   | key    | value |
   | kind   | Advance Directive |
   | status | COMPLETED|
   | facilityCode | 561 |
  When the client requests documents through rdk "SITE;229"
  Then the response does not contain the asu-filtered document

@US17184_2
Scenario:
  Given a patient with pid "SITE;100125" has been synced through the RDK API
  When the client requests documents by scrolling for the patient "SITE;100125" limited by
      | parameter | value       |
      | start     | 0           |
      | limit     | 2           |
  Then the document response maintains minimum page size

@US17184_3
Scenario:
  Given a patient with pid "SITE;229" has been synced through the RDK API
  When the client requests documents by scrolling for the patient "SITE;229" limited by
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
  # |SITE;227|
  # |SITE;100608|
  # |SITE;71|  # has 1 
  # |SITE;253| # has 1
  # |SITE;164| # has 1
  # |SITE;239| # has 1
  # |SITE;100599|
  # |SITE;100001| # 1 progress note
  # |SITE;231| # 1 progress note
  # |SITE;3| # 1 discharge summary
  # |SITE;9|
  # |SITE;18| # 1 AD, 1 Progress Note
  # |SITE;722| 
  # |SITE;100716|
  # |SITE;100840|
  # |SITE;100731|
  # |SITE;65|
  # |SITE;8|
  # |SITE;230| # discharge summary - retracted
  # |SITE;17|
  # |SITE;100125|# discharge summary - retracted
  # |SITE;229| # Advance directive - completed
  # |SITE;420|
  # |SITE;100022|
  # |SITE;100012|
  # |SITE;271|
  # |SITE;1|
  # |SITE;428|
  # |SITE;1|
  # |SITE;100184|
  # |SITE;167|
  # |SITE;100615|
  # |SITE;301|
  # |SITE;100033|
  # |SITE;100817|
  # |SITE;149|
  # |SITE;204|
