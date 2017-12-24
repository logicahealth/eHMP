@F144 @US1847
Feature:F144-eHMP Viewer GUI - Appointments & Visits

@US1847
Scenario: Verify Appointment/Visits data call without a date filter
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests the APPOINTMENTS for the patient "SITE;3" with parameters
   | PARAMETER | VALUE |
   | filter    | and(ne(categoryName,"Admission"),ne(locationOos,true))|
   | customFilter | and(ne(categoryName,"Admission"),ne(locationOos,true)) |
  Then a successful response is returned
  #And the results contain 242 totalItems
  And the VPR results contain
      | field             | value            |
      | dateTime          | 20131202130000   |
      | kind              | Visit            |
      | locationName      | GENERAL MEDICINE |
      | appointmentStatus | NO ACTION TAKEN  |
      | facilityCode      | 500              |


 @US1847 @US1847_all
Scenario: Verify Appointment/Visits data call with a global date filter all set
  Given a patient with pid "SITE;3" has been synced through the RDK API
  When the client requests the APPOINTMENTS for the patient "SITE;3" with parameters
   | PARAMETER | VALUE |
   | filter    | and(ne(categoryName,"Admission"),ne(locationOos,true),between(dateTime,"19930716","TODAY"))|
   | customFilter | and(ne(categoryName,"Admission"),ne(locationOos,true)) |
  Then a successful response is returned
  #And the results contain 242 totalItems
  And the VPR results contain
      | field             | value            |
      | dateTime          | 20131202130000   |
      | kind              | Visit            |
      | locationName      | GENERAL MEDICINE |
      | appointmentStatus | NO ACTION TAKEN  |
      | facilityCode      | 500              |
