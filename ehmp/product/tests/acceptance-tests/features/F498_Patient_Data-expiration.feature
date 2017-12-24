@patient_data_expiration @us5871

Feature: F498 VX Cache Management and Expiration/Sync Stabilization

@forced_sync @debug
Scenario: Secondary site data expiration times rules engine should be ignored when forced sync used.
	Given a patient with pid "SITE;227" has been synced through VX-Sync API for "SITE;SITE;DoD;HDR;Vler" site(s)
	And save the stamp time for site(s) "DoD;Vler"
	When the client forced sync for patient with pid "SITE;227" at "DoD" secondary site(s)
	Then the stamp time should get updated for site(s) "DoD" but Not for "Vler"
	And save the stamp time for site(s) "DoD;Vler"
	When the client forced sync for patient with pid "SITE;227" at "Vler" secondary site(s)
	Then the stamp time should get updated for site(s) "Vler" but Not for "DoD"
	And save the stamp time for site(s) "DoD;Vler"
	When the client forced sync for patient with pid "SITE;227" at "all" secondary site(s)
	Then the stamp time should get updated for site(s) "DoD;Vler" but Not for ""