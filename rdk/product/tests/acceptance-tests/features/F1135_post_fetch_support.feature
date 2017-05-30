@F1135
Feature: Improve Document applet data load times with server side Pagination

@US17218 @TC6650 @TC6657
Scenario: Add POST fetch support to patient record resource
  Given a patient with pid "9E7A;8" has been synced through the RDK API
  When the client gets a document-view request with parameters
  | parameter | value  |
  | pid       | 9E7A;8 |
  | filter    | or(between(referenceDateTime,"20140701","20170417235959"),between(dateTime,"20140701","20170417235959")),not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE")))       |
  And the client notes documents GET results 

  When the client posts a document-view GET request with parameters
  | parameter | value  |
  | pid       | 9E7A;8 |
  | filter    | or(between(referenceDateTime,"20140701","20170417235959"),between(dateTime,"20140701","20170417235959")),not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE")))       |
  Then a successful response is returned
  And the documents POST fetch results are the same as the GET results

@US17218_errorcheck_1
Scenario: Add POST fetch support to patient record resource
  Given a patient with pid "9E7A;8" has been synced through the RDK API
  When the client posts a document-view GET request with parameters
  | parameter | value  |
  | filter    | or(between(referenceDateTime,"20140701","20170417235959"),between(dateTime,"20140701","20170417235959")),not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE")))       |
  Then a forbidden response is returned
  And the response message is "PEP: Unable to process request. Pid not found."

@US17218_errorcheck_2
Scenario: Add POST fetch support to patient record resource
  Given a patient with pid "9E7A;8" has been synced through the RDK API
  When the client posts a document-view GET request with a query parameter for patient "9E7A;8" and a body parameter for "9E7A;3"
  | parameter | value  |
  | filter    | or(between(referenceDateTime,"20140701","20170417235959"),between(dateTime,"20140701","20170417235959")),not(and(in(kind,["Consult","Imaging","Procedure"]),ne(statusName,"COMPLETE")))       |
  Then a bad request response is returned
  And the response message is "Query parameters must not conflict with body fields. All query parameters must be present as body fields."
