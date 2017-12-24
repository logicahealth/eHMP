@f281_medication_normalizedname @patient

Feature: F281 - Intervention Gist View

@f281_1_medication @VPR @US3729 @SITE164

Scenario: A user can request medication information in VPR format through RDK API. User is able to see normalized name of medication.
Given a patient with pid "SITE;100022" has been synced through the RDK API
When the client requests medication for the patient "SITE;100022" in RDK format
Then a successful response is returned
And the client receives 46 result(s)
And the VPR results contain

      | field                               | value                        |
      | uid                                 | urn:va:med:SITE:100022:38438    |
      | normalizedName                      | Warfarin Sodium 1 MG Oral Tablet |
	
