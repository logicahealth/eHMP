@F1285
Feature: Edit Permission Set thru UI - permission set add and edit and update

@US18964_1_add_update
Scenario:  Add a new permission set, edit permission set and set it to deprecate.
  When the user "SITE;USER  " attempts to add a new permission set with parameters
      | parameters        | value                             |
      | nationalAccess    | false                             |
      | status            | active                            |
      | sub-sets          | Clinician                         |
      | description       | Testing add permission set        |
      | permissions       | add-active-medication,add-consult-order,discontinue-active-medication,edit-active-medication,read-active-medication                     |
      | label             | AFS Permission set added by RDK   |
      | version           | 1.2.x                             |
  Then a created response is returned
  And the user retrieves the uid of the added permission set
  And the user "SITE;USER  " attempts to update above permission set with parameters
      | parameters        | value                             |
      | status            | active                            |
      | sub-sets          | Clinician,Clerk                   |
      | description       | Testing add permission set        |
      | label             | AFS Permission set added by RDK   |
      | version           | 1.2.x                             |
  Then a successful response is returned
  And the user "SITE;USER  " deprecates the above permission set with parameters
      | parameters        | value                             |
      | deprecatedVersion | 1.2.x                             |
      | deprecate         | true                              |
  Then a successful response is returned
