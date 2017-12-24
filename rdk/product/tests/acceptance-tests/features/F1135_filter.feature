@F1135 @US17105
Feature: Improve Document applet data load times with server side Pagination - Implement server side filtering


# marked future because I could not find a patient in the presync list who had this field populated
@filter_amended @future
Scenario: Client receives documents filterd by amended
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "amended" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a "amended"
  Then document results are filtered on field "amended"

@filter_referenceDateTime
Scenario: Client receives documents filterd by referenceDateTime
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "referenceDateTime" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a "referenceDateTime"
  Then document results are filtered on field "referenceDateTime"

@filter_dateTime
Scenario: Client receives documents filterd by dateTime
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "dateTime" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a "dateTime"
  Then document results are filtered on field "dateTime"

@filter_localTitle
Scenario Outline: Client receives documents filterd by filterField localTitle
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "<jds_field>" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a "<jds_field>"
  Then document results are filtered on field "<jds_field>"

Examples:
  | jds_field  |
  | localTitle |
  | typeName   |
  | summary    |
  | name       |

@filter_kind
Scenario: Client receives documents filtered by kind
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "kind" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a "kind"
  Then document results are filtered on field "kind"

@filter_authorDisplayName
Scenario Outline: Client receives documents filtered by filterField authorDisplayName
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "<saved_field_value>" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a "<jds_field>"
  Then document results are filtered on field "<saved_field_value>"
  Examples:
  | saved_field_value      | jds_field                 |
  | authorDisplayName      | authorDisplayName         |
  | authorDisplayName      | authorDisplayName         |
  | providerDisplayName    | providerDisplayName       |
  | clinicians.displayName | clinicians[].displayName  |
  | activity.responsible   | activity[].responsible    |

@filter_case
Scenario: Filter is case-insensitive
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "authorDisplayName" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a upcase "authorDisplayName"
  Then document results are filtered on field "authorDisplayName"

  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a downcase "authorDisplayName"
  Then document results are filtered on field "authorDisplayName"


@filter_facility
Scenario: Client receives documents filtered by facility
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "facilityName" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a "facilityName"
  Then document results are filtered on field "facilityName"


@filter_orderName
Scenario: Client receives documents filtered by orderName
  Given a patient with pid "SITE;722" has been synced through the RDK API
  And the client has noted the first document "orderName" for pid "SITE;722"
  And the client requests sorted DOCUMENTS for the patient "SITE;722" filtered by a "orderName"
  Then document results are filtered on field "orderName"

@filter_reason
Scenario: Client receives documents filtered by reason
  Given a patient with pid "SITE;8" has been synced through the RDK API
  And the client has noted the first document "reason" for pid "SITE;8"
  And the client requests sorted DOCUMENTS for the patient "SITE;8" filtered by a "reason"
  Then document results are filtered on field "reason"

@filter_imageLocation 
Scenario: Client receives documents filtered by imageLocation
  Given a patient with pid "SITE;253" has been synced through the RDK API
  And the client has noted the first document "imageLocation" for pid "SITE;253"
  And the client requests sorted DOCUMENTS for the patient "SITE;253" filtered by a "imageLocation"
  Then document results are filtered on field "imageLocation"

@filter_2_terms
Scenario: Client receives documents filter by 2 different terms
  Given a patient with pid "SITE;3" has been synced through the RDK API
  And the client requests sorted DOCUMENTS for the patient "SITE;3" filtered by terms
  | term     |
  | Provider |
  | Eight    |
  Then the document results are filtered on terms
  | term     |
  | Provider |
  | Eight    |



@filter_with_infinite_scroll
Scenario: Client receives documents filtered with scrolling
  Given a patient with pid "SITE;301" has been synced through the RDK API
  And the client requests unlimited documents for the patient "SITE;301" filtered by terms
  | term     |
  | Provider |
  And the client notes the returned documents non-scrolled results
  When the client requests documents by scrolling for the patient "SITE;301" filtered by terms
  | term     |
  | Provider |
  Then the document results are the same as non-scrolled results

