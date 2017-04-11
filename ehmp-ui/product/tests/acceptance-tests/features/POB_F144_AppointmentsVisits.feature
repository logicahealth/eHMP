#Team Neptune
#@US1847  @appointmentsandvisits 
@future
Feature:F144-eHMP Viewer GUI - Appointments & Visits

Background:
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "Eight, Patient" and confirms selection
  And POB user clicks on confirm Flagged Patient Button
  When POB Cover Sheet is active

@US1847d
Scenario: Users will be able to use the date filter on the expanded view
  And POB the "Appointments & Visits" Coversheet applet is displayed
  And POB the Appointments coversheet table contains headers
       | Headers     |
       | Date        | 
       | Description | 
       | Location    |
       | Status      |
       | Facility    |
  When POB the user clicks the Appointments Expand Button
  And POB Appointments applet loaded successfully
  And POB the user clicks the 24 hr Appointments Range
  Then POB Appointments data table display "Date" and "No Records Found"

