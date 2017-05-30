@F312 @patientphotos @vhic

Feature: F312 - Patient Photos

#POC:Team Pluto

@F312-1.1 @US5654 @eightPatient @de4116 @debug
Scenario: A request for a Eight,Patient's photo is sucessfully returns data for photo associated with Eight,Patient
	When the client requests patient photo with user "REDACTED" and ICN "9E7A;3"
	Then a successful response is returned

@F312-2.1 @US5654 @otherPatient
Scenario: A request for a patient photo for a patient other than Eight,Patient returns the gender-neutral photo data
    When the client requests patient photo with user "REDACTED" and ICN "4325678V4325"
    Then a successful response is returned

@F312-2.1 @US5654 @incorrect_icn
Scenario: A request for a patient photo with an ICN that does not exist will return the gender-neutral photo data
    When the client requests patient photo with user "REDACTED" and ICN "9E7A;0000"
    Then a successful response is returned
