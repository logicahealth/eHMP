@F1135
Feature: F1135 - Improve Document applet data load times with server side Pagination

@US17130 @TC6568
Scenario: Verify server side infinite scroll
  Given a patient with pid "9E7A;8" has been synced through the RDK API
  And the client requests sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | start     | 0          |  
  | order     | dateTime ASC, referenceDateTime ASC   |
  And the document results pageIndex is 0
  And the document results startIndex is 0
  And the document results itemsPerPage are less then or equal to 40
  And the document results contain a nextStartIndex field
  
  When the client requests sorted DOCUMENTS for the patient "9E7A;8" starting with the nextStartIndex
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | order     | dateTime ASC, referenceDateTime ASC   |
  Then the document results pageIndex is 1
  And the document results startIndex is equal to the last nextStartIndex
  And the document results contain a nextStartIndex field

