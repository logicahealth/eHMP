@f295_encounters_gist

Feature: F295 - Encounters Applet

@F295_multioption_menu_admission_detail_view
Scenario: Scenario: Encounters Applet Gist - detail view of admission thro' multi option menu
 Given a patient with pid "9E7A;100022" has been synced through the RDK API
 When the client requests the Encounters Admission for the patient "9E7A;100022"
 Then a successful response is returned
 And the VPR results contain
      | field               | value           	|
      | dateTime            | 20140115123828    |
      | typeDisplayName     | Hospitalization 	|
      | kind                | Admission       	|
      | patientClassName    | Inpatient       	|
      | locationDisplayName | Icu/ccu        	|
      | stopCodeName		| HOMELESS VT COM EMP SVC INDIV	|
