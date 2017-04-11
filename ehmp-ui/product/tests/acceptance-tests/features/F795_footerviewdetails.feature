@F795_FooterViewDetails  @reg2
Feature: Testing "ViewDetails" button which is on the footer  

Background:
# Given user is logged into eHMP-UI
  And user searches for and selects "Eight, Patient"
  And Overview is active
  And the user has selected View Details button from the footer


@FooterViewDetails
Scenario: Select View Details button in the footer, make sure all the fields are loaded properly and also user should be able to close the modal
  And EHMP Data Source model is displayed with following header
  | header      |
  | My Site     |
  | All VA        |
  | DOD         |
  | Communities    |
  Then user selects close button to close the modal 

@FooterViewDetails_MySite
Scenario: Select my site in EHMP Data Source modal and make sure all the fields are present and also user selects x button to close the modal 
 And user Selects mysite from EHMP Data Source model
 And the my site table contain headers
  | headers      |
  | Domain      |
  | Last Refresh |
  | New Data Since  |
 And user makes sure there is data in results row
 Then user selects x button to close the modal 
  
@FooterViewDetails_AllVA 
Scenario: Select my All VA in EHMP Data Source modal and make sure all the fields are present 
 Then user Selects All VA  from EHMP Data Source model
 And the All VA table contain headers
  | headers      |
  | Site         |
  | Domain       |
  | Last Refresh  |
  | New Data Since  |
 And user makes sure there is data in results row

@FooterViewDetails_DOD 
Scenario: Select my DOD in EHMP Data Source modal and make sure all the fields are present 
 Then user Selects DOD from EHMP Data Source model
 And the DOD table contain headers
  | headers      |
  | Domain       |
  | Last Refresh  |
 And user makes sure there is data in results row 
 
@FooterViewDetails_Communities
Scenario: Select my Communities in EHMP Data Source modal and make sure all the fields are present 
 Then user Selects Communities from EHMP Data Source model
 And the Communities table contain headers
  | headers      |
  | Domain       |
  | Last Refresh  |
 And user makes sure there is data in results row 
