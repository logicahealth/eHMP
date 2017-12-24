# Team Europa
Feature: F946 - v2.0 Production CDS Infrastructure

@US14990_1
Scenario: Observation can be requested and filtered by new operator date in Fhir format (date=!=)
Given a patient with "observation" in multiple VistAs
When the "observation" is requested with parameter "date" value "!=2004-03-30T01:26:59" for patient "SITE;253"
Then a successful response is returned
And No resulting entry should have a date matching the passed value "2004-03-30T01:26:59"


@US14990_2
Scenario: Observation can be requested and filtered by new operator date in Fhir format (date=>=)
Given a patient with "observation" in multiple VistAs
When the "observation" is requested with parameter "date" value ">=2002-02-26T15:03:07" for patient "SITE;253"
Then a successful response is returned
And Each resulting entry should have a date equal or beyond the passed value "2000-02-26T15:03:07"


@US14990_3
Scenario: Observation can be requested and filtered by new operator date in Fhir format (date=<=)
Given a patient with "observation" in multiple VistAs
When the "observation" is requested with parameter "date" value "<=2002-02-26T15:03:07" for patient "SITE;253"
Then a successful response is returned
And Each resulting entry should have a date equal or prior to the passed value "2002-01-25T15:03:07"

