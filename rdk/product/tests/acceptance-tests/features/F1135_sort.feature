@F1135
Feature: Improve Document applet data load times with server side Pagination


@US17106 @US17106_date @US17106_date_asc
Scenario:  Client recives documents sorted in ascending order by dateTime field
  When the client requests sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | start     | 0          |  
  | order     | dateTime ASC   |
  Then the document results are in ascending sort order by dateTime
  And the document results pageIndex is 0
  And the document results startIndex is 0
  And the document results itemsPerPage are less then or equal to 40
  And the document results contain a nextStartIndex field

@US17106 @US17106_date @US17106_date_desc
Scenario: Client recives documents sorted in descending order by dateTime field
  When the client requests sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | start     | 0          |  
  | order     | dateTime desc |
  Then the document results are in descending sort order by dateTime
  And the document results pageIndex is 0
  And the document results startIndex is 0
  And the document results itemsPerPage are less then or equal to 40
  And the document results contain a nextStartIndex field


@US17106 @US17106_type @US17106_type_asc
Scenario: Client recives documents sorted in ascending order by Type field, then descending order by dateTime (descending datetime order is the way 2.0 documents functions)
  When the client requests sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | start     | 0          |  
  | range     | 20170615235959..19350407 |
  | order     | kind ASC, dateTime DESC  |
  Then the document results are in ascending sort order by "kind" ( then descending dateTime )
  And the document results pageIndex is 0
  And the document results startIndex is 0
  And the document results itemsPerPage are less then or equal to 40
  And the document results contain a nextStartIndex field

@US17106 @US17106_type @US17106_type_asc
Scenario: Verify secondary dateTime sort can be ascending
  When the client requests sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | start     | 0          |  
  | range     | 20170615235959..19350407 |
  | order     | kind ASC, dateTime ASC  |
  Then the document results are in ascending sort order by "kind" ( then ascending dateTime )
  And the document results pageIndex is 0
  And the document results startIndex is 0
  And the document results itemsPerPage are less then or equal to 40
  And the document results contain a nextStartIndex field


@US17106 @US17106_type @US17106_type_desc
Scenario: Client recives documents sorted in descending order by Type field, then descending order by dateTime (descending datetime order is the way 2.0 documents functions)
  When the client requests sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | range     | 20170615235959..19350407 |
  | order     | kind DESC, dateTime DESC |
  Then the document results are in descending sort order by "kind" ( then descending dateTime )
  And the document results pageIndex is 0
  And the document results startIndex is 0
  And the document results itemsPerPage are less then or equal to 40
  And the document results contain a nextStartIndex field

@US17106 @US17106_facility_asc
Scenario: Client recives documents sorted in ascending order by facilityName field, then descending order by dateTime (descending datetime order is the way 2.0 documents functions)
  When the client requests sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | start     | 0          |  
  | range     | 19350407..20170615235959         |
  | order     | facilityName ASC, dateTime DESC  |

  Then the document results are in ascending sort order by "facilityName" ( then descending dateTime )
  And the document results pageIndex is 0
  And the document results startIndex is 0
  And the document results itemsPerPage are less then or equal to 40
  And the document results contain a nextStartIndex field

@US17106 @US17106_facility_desc
Scenario: Client recives documents sorted in descending order by facilityName field, then descending order by dateTime (descending datetime order is the way 2.0 documents functions)
  When the client requests sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 45        |
  | start     | 0          |  
  | range     | 19350407..20170615235959         |
  | order     | facilityName DESC, dateTime DESC |
  Then the document results are in descending sort order by "facilityName" ( then descending dateTime )
  And the document results pageIndex is 0
  And the document results startIndex is 0
  And the document results itemsPerPage are less then or equal to 45
  And the document results contain a nextStartIndex field

@US17106 @US17106_facility_desc_error
Scenario: Client receives error when missing sort order
  When the client attempts to request sorted DOCUMENTS for the patient "9E7A;8"
  | parameter | value      |
  | template  | notext     |
  | limit     | 40         |
  | start     | 0          |  
  | range     | 19350407..20170615235959 |
  | order     |facilityName, dateTime    |
  Then a bad request response is returned

@sort_with_infinite_scroll
Scenario: Client receives documents filtered with scrolling
  Given a patient with pid "9E7A;3" has been synced through the RDK API
  When the client requests sorted DOCUMENTS for the patient "9E7A;3"
  | parameter | value      |
  | template  | notext     |
  | limit     | 2000       |
  | start     | 0          |  
  | range     | 19350407..20170615235959         |
  | order     | facilityName ASC, dateTime DESC  |
  And the client notes the returned documents non-scrolled results
  When the client requests sorted DOCUMENTS by scrolling for the patient "9E7A;3"
  | parameter | value      |
  | template  | notext     |

  | range     | 19350407..20170615235959         |
  | order     | facilityName ASC, dateTime DESC  |
  Then the document results are the same as non-scrolled results



