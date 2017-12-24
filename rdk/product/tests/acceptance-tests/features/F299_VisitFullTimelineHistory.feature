Feature: F299 - Global Timeline Date Filter

#This is to complete the full timeline resource to support the full timeline and sparkline for encounters.
#http://IP             /resource/globaltimeline?pid=SITE;100022
#test patient is BCMA,EIGHT, patient has one admission and one Visit

@F299_global_timeline_history @US4119 @TA13943 @patient @SITE100022 @F299-3.8
Scenario: For a patient full history of encounters is returned correctly

	Given the client requests visits for the patient "SITE;100022"
	Then a successful response is returned
  And the results contain

      | name                            | value                   |
      | inpatient.kind                  | Admission               |
      | inpatient.stay.arrivalDateTime  | 20020130114524          |
      | inpatient.dateTime              | 20020130114524          |

	And the results contain

      | name                           | value                      |
      | inpatient.kind                 | Visit                      |
      | inpatient.dateTime             | 20020415111400             |
