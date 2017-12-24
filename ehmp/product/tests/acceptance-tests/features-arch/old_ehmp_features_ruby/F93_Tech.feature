Feature: F93 Extra, tester specific tests


#This feature item verifies the ability to return the correct marital status in FHIR format.



@marital
Scenario Outline: Verify different marital status
	Given a patient with pid "<patient_id>" has been synced through Admin API
	When the client requests demographics for that patient "<patient_id>"
	Then the results contain
	  |demographics_supplemental_list        	| value               | 
      | entry.content.maritalStatus.coding.code | "<marital_code>"   |
	  | entry.content.maritalStatus.coding.display | "<marital_display>"|
Examples:
      | patient_id | marital_code | marital_display |
#      | SITE;35    | UNK          | unknown         |
      | SITE;11    | D            | Divorced        |
      |	SITE;13    |L			  | Legally Separated   |
#      | SITE;1     | M            | Married         |
      | SITE;4     | S            | Never Married       |
#      | SITE;50    | W            | Widowed         |
	 
