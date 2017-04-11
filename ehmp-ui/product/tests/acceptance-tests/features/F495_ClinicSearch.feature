@F495 @regression
Feature: Enhance the Patient Selection Process - Clinic time frame search

Background: 
	Given user is logged into eHMP-UI
    When the patient search screen is displayed

@TC774
Scenario: Verify entering filter text is filtering the clinic location results
	 Given the call to my cprs list is completed
	 When the user clicks the Clinics pill
	 Then the Clinics search input displays "Filter clinics"
	 And a list of Clinics is displayed
	 When the user filters the Clinics by text "Diabetic"
     Then the Clinics table only diplays rows including text "Diabetic"

@TC772
Scenario: Verify the default selected is Today
    Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	Then the Today button is selected

@TC3771
Scenario:  Verify none of the Predefined date filters are selected while a custom date range is selected 
 	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user enters Clinic start date "12/06/2013"
	And the user enters Clinic end date "12/06/2013"
	And the user selects Clinic "Cardiology"
	Then none of the Predefined date filters are selected 

# there are appears to be hidden columns
# the original rspec didn't actually check order
@TC986 @debug
Scenario: Verify order of the colomn heading When the user clicks on the Clinics tab
	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user enters Clinic start date "12/11/2014"
	And the user enters Clinic end date "04/11/2015"
	And the user selects Clinic "Cardiology"
	Then the order of the Clinic headers is
    # |Patient Name | SSN | Clinic Name| Appt Date/Time  | Date of Birth | Gender |
    | Appt Date/Time| Clinic Name|Patient Name|SSN | Date of Birth | Gender |

@US7830 @TC399 @TC985 
Scenario: Verify the Custom date Clinic search displays correct results
	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user enters Clinic start date "12/11/2014"
	And the user enters Clinic end date "04/11/2015"
	And the user selects Clinic "Cardiology"
	And a list of clinic results is displayed
	Then the clinic results displays appointments in correct format
	Then the clinic results displays appointments between "12/11/2014 00:00" and "04/11/2015 23:59"
	And the clinic results displays appointments for clinic "Cardiology"

@TC985 @DE3774 @debug
Scenario: Verify that *SENSITIVE* is in place of SSN and DOB for sensitive patients
	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user enters Clinic start date "12/05/2013"
	And the user enters Clinic end date "12/07/2013"
	And the user selects Clinic "Audiology"
	Then the Clinic patient name "EHMP, SIX" is displayed
    And the Clinic patient ssn is "*SENSITIVE*"
    And the Clinic patient DOB is "*SENSITIVE*"

@TC399b
Scenario: Verify the Custom date Clinic search displays no results for different Clinic
	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user clicks Today
	And the user selects Clinic "Cwt Clinic"
	Then the clinic results displays No results found.

@TC770 @DE2304
Scenario: Verify the Apply button is always enabled
	Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	Then the Apply button is enabled
	When the user enters Clinic start date "12/05/2013"
	And the user enters Clinic end date "12/07/2013"
	Then the Apply button is enabled
	And the user enters Clinic end date ""
	Then the Apply button is enabled


@TC773
Scenario: Verify the custom filter resets when a user clicks on one of the other date range button
   Given the call to my cprs list is completed
	When the user clicks the Clinics pill
	And the user enters Clinic start date "12/05/2013"
	And the user enters Clinic end date "12/07/2013"
	And the user clicks Tomorrow
	Then the Clinic start date is ''
	And the Clinic end date is ''
