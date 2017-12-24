@F1240 @JBPM @future
Feature:

@write-pick-list-people-for-facility-error1
Scenario: People/Staff for facility - error checking
  When the user requests people for facility
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "site" is missing.'

@write-pick-list-people-for-facility-error2
Scenario: People/Staff for facility - error checking
  When the user requests people for facility
      | parameter_name | parameter_value |
      | site           | SITE            |
  Then a bad request response is returned
  And the response message is 'The required parameter "facilityID" is missing.'

@write-pick-list-people-for-facility-error3
Scenario: People/Staff for facility - error checking
  When the user requests people for facility
      | parameter_name | parameter_value |
      | site           | bad_site        |
      | facilityID     | 500             |      
  Then a internal server error response is returned
  And the response message is "The site (BAD_SITE) was not found in the configuration"

@write-pick-list-people-for-facility-error4
Scenario: People/Staff for facility - error checking
  Given the user has requested people for facility
      | parameter_name | parameter_value |
      | site           | SITE            |
      | facilityID     | bad_facility    |
  When a successful response is returned
  Then the picklist response contains 0 items

@write-pick-list-teams-for-user-error1
Scenario: Teams for user - error checking
  When the user requests teams for user
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "site" is missing.'

@write-pick-list-teams-for-user-error2
Scenario: Teams for user - error checking
  When the user requests teams for user
      | parameter_name | parameter_value |
      | site           | SITE            |
      # | staffIEN       | 991             |
  Then a bad request response is returned
  And the response message is 'The required parameter "staffIEN" is missing.'

@write-pick-list-teams-for-user-error3
Scenario: Teams for user - error checking
  When the user requests teams for user
      | parameter_name | parameter_value |
      | site           | bad_site        |
      | staffIEN       | 991             |
  Then a internal server error response is returned
  And the response message is "The site (BAD_SITE) was not found in the configuration"

@write-pick-list-teams-for-user-error4
Scenario: Teams for user - error checking
  Given the user has requested teams for user
      | parameter_name | parameter_value |
      | site           | SITE            |
      | staffIEN       | bad_ien         |
  When a successful response is returned
  Then the picklist response contains 0 items

@write-pick-list-roles-for-team-error1
Scenario: Roles for team - error checking
  When the user requests roles for team
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "site" is missing.'

@write-pick-list-roles-for-team-error2
Scenario: Roles for team - error checking
  When the user requests roles for team
      | parameter_name | parameter_value |
      | site           | SITE            |
  Then a bad request response is returned
  And the response message is 'The required parameter "teamID" is missing.'

@write-pick-list-roles-for-team-error3
Scenario: Roles for team - error checking
  When the user requests roles for team
      | parameter_name | parameter_value |
      | site           | bad_site        |
      | teamID         | 11131           |
  Then a internal server error response is returned
  And the response message is "The site (BAD_SITE) was not found in the configuration"

@write-pick-list-roles-for-team-error4
Scenario: Roles for team - error checking
  When the user requests roles for team
      | parameter_name | parameter_value |
      | site           | SITE            |
      | teamID         | bad_team_id     |
  Then a internal server error response is returned

@write-pick-list-teams-for-facility-error1
Scenario: Teams for facility - error checking
  When the user requests teams for facility
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "site" is missing.'

@write-pick-list-teams-for-facility-error2
Scenario: Teams for facility - error checking
  When the user requests teams for facility
      | parameter_name | parameter_value |
      | site           | SITE            |
  Then a bad request response is returned
  And the response message is 'The required parameter "facilityID" is missing.'

@write-pick-list-teams-for-facility-error3
Scenario: Teams for facility - error checking
  When the user requests teams for facility
      | parameter_name | parameter_value |
      | site           | bad_site        |
      | facilityID     | 500             |
  Then a internal server error response is returned
  And the response message is "The site (BAD_SITE) was not found in the configuration"

@write-pick-list-teams-for-facility-error4
Scenario: Teams for facility - error checking
  Given the user has requested teams for facility
      | parameter_name | parameter_value |
      | site           | SITE            |
      | facilityID     | bad_fac         |
  When a successful response is returned
  Then the picklist response contains 0 items

@write-pick-list-teams-for-patient-error1
Scenario: Teams for patient - error checking
  When the user requests teams for patient
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "site" is missing.'

@write-pick-list-teams-for-patient-error2
Scenario: Teams for patient - error checking
  When the user requests teams for patient
      | parameter_name | parameter_value |
      | site           | SITE            |
  Then a bad request response is returned
  And the response message is 'The required parameter "pid" is missing.'

@write-pick-list-teams-for-patient-error3 
Scenario: Teams for patient - error checking
  When the user requests teams for patient
      | parameter_name | parameter_value |
      | site           | bad_site        |
      | pid            | 10108V420871    |
  Then a internal server error response is returned
  And the response message is "The site (BAD_SITE) was not found in the configuration"

@write-pick-list-teams-for-patient-error4
Scenario: Teams for patient - error checking
  When the user requests teams for patient
      | parameter_name | parameter_value |
      | site           | SITE            |
      | pid            | bad_pid         |
  Then a bad request response is returned
  And the response message is "Invalid Pid. Please pass either ICN, Primary Site PID or Secondary Site PID."

@write-pick-list-teams-for-patient-error5
Scenario: Teams for patient - error checking
  When the user requests teams for patient
      | parameter_name | parameter_value |
      | site           | SITE            |
      | pid            | SITE;3          |
  Then a bad request response is returned

@write-pick-list-teams-for-facility-patient-related-error1
Scenario: Teams for facility patient related - error checking
  When the user requests teams for facility patient related
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "site" is missing.'

@write-pick-list-teams-for-facility-patient-related-error2
Scenario: Teams for facility patient related - error checking
  When the user requests teams for facility patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
  Then a bad request response is returned
  And the response message is 'The required parameter "facilityID" is missing.'

@write-pick-list-teams-for-facility-patient-related-error3
Scenario: Teams for facility patient related - error checking
  When the user requests teams for facility patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | facilityID     | 500             |
      #| pid            | 10108V420871    |
  Then a bad request response is returned
  And the response message is 'The required parameter "pid" is missing.'

@write-pick-list-teams-for-facility-patient-related-error4 
Scenario: Teams for facility patient related - error checking
  When the user requests teams for facility patient related
      | parameter_name | parameter_value |
      | site           | bad_site        |
      | facilityID     | 500             |
      | pid            | 10108V420871    |
  Then a internal server error response is returned
  And the response message is "The site (BAD_SITE) was not found in the configuration"

@write-pick-list-teams-for-facility-patient-related-error5
Scenario: Teams for facility patient related - error checking
  Given the user has requested teams for facility patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | facilityID     | bad_facility    |
      | pid            | 10108V420871    |
  When a successful response is returned
  Then the picklist response contains 0 items

@write-pick-list-teams-for-facility-patient-related-error6
Scenario: Teams for facility patient related - error checking
  When the user requests teams for facility patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | facilityID     | 500             |
      | pid            | bad_bid         |
  Then a bad request response is returned
  And the response message is "Invalid Pid. Please pass either ICN, Primary Site PID or Secondary Site PID."

@write-pick-list-teams-for-user-patient-related-error1
Scenario: Teams for user patient related - error checking
  When the user requests teams for user patient related
      | parameter_name | parameter_value |
  Then a bad request response is returned
  And the response message is 'The required parameter "site" is missing.'

@write-pick-list-teams-for-user-patient-related-error2
Scenario: Teams for user patient related - error checking
  When the user requests teams for user patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
  Then a bad request response is returned
  And the response message is 'The required parameter "staffIEN" is missing.'




@write-pick-list-teams-for-user-patient-related-error4
Scenario: Teams for user patient related - error checking
  When the user requests teams for user patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | staffIEN       | 991             |
  Then a bad request response is returned
  And the response message is 'The required parameter "pid" is missing.'

@write-pick-list-teams-for-user-patient-related-error5 
Scenario: Teams for user patient related - error checking
  When the user requests teams for user patient related
      | parameter_name | parameter_value |
      | site           | bad_site        |
      | staffIEN       | 991             |
      | pid            | 10108V420871    |
  Then a internal server error response is returned
  And the response message is "The site (BAD_SITE) was not found in the configuration"

@write-pick-list-teams-for-user-patient-related-error6 @debug @DE7973
Scenario: Teams for user patient related - error checking
  Given the user has requested teams for user patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | staffIEN       | 991             |
      | pid            | 10108V420871    |
  When a successful response is returned
  Then the picklist response contains 0 items

@write-pick-list-teams-for-user-patient-related-error7
Scenario: Teams for user patient related - error checking
  Given the user has requested teams for user patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | staffIEN       | bad_ien         |
      | pid            | 10108V420871    |
  When a successful response is returned
  Then the picklist response contains 0 items

@write-pick-list-teams-for-user-patient-related-error8
Scenario: Teams for user patient related - error checking
  When the user requests teams for user patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | staffIEN       | 991             |
      | pid            | bad_pid         |
  Then a bad request response is returned
  And the response message is "Invalid Pid. Please pass either ICN, Primary Site PID or Secondary Site PID."

#################################
# valid requests/response checks

@write-pick-list-people-for-facility
Scenario: People/Staff for facility - Assigned to Person [ List of staff associated with facility ]
  Given the user has requested people for facility
      | parameter_name | parameter_value |
      | site           | SITE            |
      | facilityID     | 500             |
  When a successful response is returned
  Then picklist response contains
      | key_name | key_value                   |
      | personID | SITE;991                    |
      | name     | PROVIDER, EIGHT (Physician) |

@write-pick-list-teams-for-user
Scenario: Teams for user - Assigned to My Teams [ List of teams Provider, Eight(991) is on ]
  Given the user has requested teams for user
      | parameter_name | parameter_value |
      | site           | SITE            |
      | staffIEN       | 991             |
  When a successful response is returned
  # the following are teams that will be expected in other tests
  Then picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11131     | 
  And picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11132     | 

@write-pick-list-roles-for-team
Scenario: Roles for team - Assigned to My Teams, Assigned to Any Team [ List of roles for a team Provider, Eight(991) is on ]
  Given the user has requested roles for team
      | parameter_name | parameter_value |
      | site           | SITE            |
      | teamID         | 11131           |
  Then a successful response is returned
  And the picklist reponse contains at least 1 roleID and name

@write-pick-list-teams-for-facility
Scenario: Teams for facility - Assigned to Any Team [ List of teams associated with facility ]
  Given the user has requested teams for facility
      | parameter_name | parameter_value |
      | site           | SITE            |
      | facilityID     | 500             |
  Then a successful response is returned
  # As of right now panorama has 4 teams
  And picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11131     | 
  And picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11132     | 


@write-pick-list-teams-for-patient
#Eight,Patient has 3 teams, 2 facility pano and 1 facility kodak
Scenario: Teams for patient - Assigned to Patient's teams
  Given the user has requested teams for patient
      | parameter_name | parameter_value |
      | site           | SITE            |
      | pid            | 10108V420871    |
  Then a successful response is returned
  And the picklist response contains 3 items
  And the picklist teams response contains
      | key               |
      | teamID            |
      | teamName          |
      | teamPrimaryFoci   |
      | teamSecondaryFoci |
    And picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11131     | 
  And picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11132     | 
  # The following team is not a panorama team
  And picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11134     | 

@write-pick-list-teams-for-facility-patient-related
# Eight,Patient has 3 teams, only 2 are pano
Scenario: Teams for facility patient related [ List of teams, from facility, assocated with my patient ]
  Given the user has requested teams for facility patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | facilityID     | 500             |
      | pid            | 10108V420871    |
  Then a successful response is returned
  And the picklist teams response contains
      | key               |
      | teamID            |
      | teamName          |
      | teamPrimaryFoci   |
      | teamSecondaryFoci |
    And picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11131     | 
  And picklist response contains teamIDs
      | key_name | key_value |
      | teamID   | 11132     | 
  And the picklist response contains 2 items


@write-pick-list-teams-for-user-patient-related
Scenario: Teams for user patient related - Assigned to My Teams
  Given the user has requested teams for user
      | parameter_name | parameter_value |
      | site           | SITE            |
      | staffIEN       | 991             |
  And the user has requested teams for patient
      | parameter_name | parameter_value |
      | site           | SITE            |
      | pid            | 10108V420871    |
  When the user requests teams for user patient related
      | parameter_name | parameter_value |
      | site           | SITE            |
      | staffIEN       | 991             |
      | pid            | 10108V420871    |
  Then a successful response is returned
  And the picklist response contains the teams common to user teams and patient teams

