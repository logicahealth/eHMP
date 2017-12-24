@F1240
Feature: Multi user permission

@Remove_all_Permission_Sets_Individual
Scenario: Remove permission sets
  Given client is single updating permissions for 
      | firstname | lastname | uid                          |
      | uatthree  | ehmp     | urn:va:user:SITE:10000000237 |
  Given a user has at least 1 permission set and 1 additional permission for user "ehmp", "uatthree"
  When client updates single user to remove all permissions
      | path             | value                        |
      | fname            | UATTHREE                     |
      | lname            | EHMP                         |
      | uid              | urn:va:user:SITE:10000000237 |
  Then a successful response is returned
  Then user "ehmp", "uatthree" has no permissions


@multi_user_add
Scenario: Add permission for more then 1 user
  Given client is bulk updating permissions for 
      | firstname | lastname | uid                          |
      | uateight  | ehmp     | urn:va:user:SITE:10000000242 |
      | uatfive   | ehmp     | urn:va:user:SITE:10000000239 |
  Given user "ehmp", "uateight" does not have permission set "dentist"
  And user "ehmp", "uatfive" does not have permission set "dentist"
  When client updates users to add permission set "dentist"
      | firstname | lastname | uid                          |
      | uateight  | ehmp     | urn:va:user:SITE:10000000242 |
      | uatfive   | ehmp     | urn:va:user:SITE:10000000239 |
  Then a successful response is returned
  And user "ehmp", "uateight" has permission set "dentist"
  And user "ehmp", "uatfive" has permission set "dentist"

@multi_user_remove
Scenario: Remove permission for more then 1 user
  Given client is bulk updating permissions for 
      | firstname | lastname | uid                          |
      | uateight  | ehmp     | urn:va:user:SITE:10000000242 |
      | uatfive   | ehmp     | urn:va:user:SITE:10000000239 |
  Given user "ehmp", "uateight" has permission set "dentist"
  And user "ehmp", "uatfive" has permission set "dentist"

  When client updates users to remove permission set "dentist"
      | firstname | lastname | uid                          |
      | uateight  | ehmp     | urn:va:user:SITE:10000000242 |
      | uatfive   | ehmp     | urn:va:user:SITE:10000000239 |
  Then a successful response is returned
  Then user "ehmp", "uateight" does not have permission set "dentist"
  And user "ehmp", "uatfive" does not have permission set "dentist"

@mutli_user_remove_all
Scenario: Remove all permissions for more then 1 user
  Given client is bulk updating permissions for 
      | firstname | lastname | uid                          |
      | uateight  | ehmp     | urn:va:user:SITE:10000000242 |
      | uatfive   | ehmp     | urn:va:user:SITE:10000000239 |
 Given user "ehmp", "uateight" has at least one permission ( set or individual )
 And user "ehmp", "uatfive" has at least one permission ( set or individual )
  When client updates users to remove all permissions
      | firstname | lastname | uid                          |
      | uateight  | ehmp     | urn:va:user:SITE:10000000242 |
      | uatfive   | ehmp     | urn:va:user:SITE:10000000239 |
  Then a successful response is returned
  And print response
  And user "ehmp", "uateight" has no permissions
  And user "ehmp", "uatfive" has no permissions



