@f893_immunization_enhanced_detail_view  @DE4560 @reg3 @future 

Feature: F893 : Enhanced Immunization Detail View with VIMM Fields

@893_1_add_administered @UAT_script  @debug @DE7023 @DE6768
Scenario: Add administered immunization and verify detail view and note object creation

  Given user searches for and selects "twentythree,inpatient"
  And Overview is active
  And user navigates to Immunization expanded view
  And POB user adds a new immunization
  When POB user adds administered immunization "PNEUMOCOCCAL CONJUGATE"
  Then the immunization "PNEUMOCOCCAL CONJUGATE" is added to the applet
  And user opens the first immunization row
  And POB user verifies the immunization detail modal fields
  | field									|	value							|
  | Name									| PNEUMOCOCCAL CONJUGATE VACCINE	|
  | Series									| COMPLETE							|
  | Lot #									| EHMP00012							|
  | Admin route/site						| INTRAMUSCULAR LEFT UPPER ARM		|
  | Administered by							| USER,PANORAMA						|
  | Vaccine Information Statement(s) (VIS)	| MULTIPLE VACCINES VIS 			|
  | Vaccine Information Statement(s) (VIS)	| PNEUMOCOCCAL CONJUGATE 			|
#  | Comment									| Immunization added by automation test|
  And POB user closes the modal window
  And POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user opens note objects button
  Then POB new immunization "PNEUMOCOCCAL CONJUGATE" is added to the note objects
 
@893_2_add_historical @UAT_script
Scenario: Add administered immunization and verify detail view.

  Given user searches for and selects "twentythree,inpatient"
  And Overview is active
  And user navigates to Immunization expanded view
  And the user takes note of number of existing immunizations
  And POB user adds a new immunization
  When POB user adds historical immunization "PNEUMOCOCCAL, UNSPECIFIED FORMULATION"
  And user refreshes the immunization applet
  Then the immunization "PNEUMOCOCCAL, UNSPECIFIED FORMULATION" is added to the applet
  And user opens the first immunization row
  And POB user verifies the immunization detail modal fields
  | field									|	value											|
  | Name									| PNEUMOCOCCAL, UNSPECIFIED FORMULATION				|
  | Information source						| HISTORICAL INFORMATION - FROM BIRTH CERTIFICATE 	|
#  | Comment									| Immunization added by automation test				|
