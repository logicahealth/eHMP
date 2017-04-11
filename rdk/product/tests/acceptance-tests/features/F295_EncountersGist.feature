 Feature: F295 - Encounters Applet

@F295_multioption_menu_admission_detail_view
Scenario: Scenario: Encounters Applet Gist - detail view of admission thro' multi option menu
 Given a patient with pid "9E7A;164" has been synced through the RDK API
 When the client requests the Encounters Admission for the patient "9E7A;164"
 Then a successful response is returned
 And the VPR results contain
      | field               | value           |
      | dateTime            | 199305201000    |
      | typeDisplayName     | Hospitalization |
      | kind                | Admission       |
      | patientClassName    | Inpatient       |
      | locationDisplayName | Drugster        |
      #| Stop Code			| Blank					|

@F295_encounters_initial_view @F295-1.1 @F295-1.2 @F295-1.3 @F295_4 @F295-1.5 @F295-1.7 @US3706 @US4001 @US4154 @US5126
Scenario: User views the encounters gist view
# 9E7A;100599 = Sixhundred,Patient
  Given a patient with pid "9E7A;100599" has been synced through the RDK API
  When the client requests the Encounters Admission for the patient "9E7A;100599"
  Then a successful response is returned
  And the client recieves 4 data points of type "visit"
  And the client recieves 10 data points of type "appointment"
  And the client recieves 14 data points of kind "visit"

  And the client recieves 0 data points of kind "admission"
  
  And the client recieves 1 data points of type "procedure"
  And the client recieves 1 data points of type "consult"
  And the client recieves 2 data points of kind "procedure"