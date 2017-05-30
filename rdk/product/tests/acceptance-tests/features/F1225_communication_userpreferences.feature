@F1225 @JBPM @future
Feature: Communication Platform to support announcements - user preferences

@US18099 @US18099_required_category_code
Scenario: Verify input parameter category.code is required
  When client requests preferences 
      | parameter       | value                                |
      | userId          | urn:va:user:9E7A:10000000270         |
  Then a bad request response is returned
  And the response message is "body.category.code is a required property"

@US18099 @US18099_required_category_system
Scenario: Verify input parameter category.system is required
  When client requests preferences 
      | parameter       | value                                |
      | category.code   | announcements-promotions             |
      | userId          | urn:va:user:9E7A:10000000270         |
  Then a bad request response is returned
  And the response message is "body.category.system is a required property"

@US18099 @US18099_required_enabled
Scenario: Verify input parameter enabled is required
  When client requests preferences 
    | parameter       | value                                |
    | category.code   | announcements-promotions             |
    | category.system | http://ehmp.DNS   /messageCategories |
    | userId          | urn:va:user:9E7A:10000000270         |
  Then a bad request response is returned
  And the response message is "body.enabled is a required property"

@US18099 @US18099_required_userId
Scenario: Verify input parameter userId is required
  When client requests preferences 
    | parameter       | value                                |
    | category.code   | announcements-promotions             |
    | category.system | http://ehmp.DNS   /messageCategories |
    | enabled         | false                                |

  Then a bad request response is returned
  And the response message is "body.userId is a required property"

@US18099 @US18099_overridePreferences_terms
Scenario: Verify client cannot override Preferences for terms
  When the client updates user preferences
      | parameter       | value                                |
      | category.code   | announcements-terms                  |
      | category.system | http://ehmp.DNS   /messageCategories |
      | enabled         | true                                 |
      | userId          | urn:va:user:9E7A:10000000270         |
  Then a bad request response is returned
  And the response message is "Invalid category.system and category.code combination."

@US18099 @US18099_overridePreferences_system
Scenario: Verify client cannot override Preferences for system
  When the client updates user preferences
      | parameter       | value                                |
      | category.code   | announcements-system                 |
      | category.system | http://ehmp.DNS   /messageCategories |
      | enabled         | true                                 |
      | userId          | urn:va:user:9E7A:10000000270         |
  Then a bad request response is returned
  And the response message is "Invalid category.system and category.code combination."

@US18099 @US18099_overridePreferences
Scenario: Verify client can override Preferences
  When the client updates user preferences
      | parameter       | value                                |
      | category.code   | announcements-promotions             |
      | category.system | http://ehmp.DNS   /messageCategories |
      | enabled         | true                                 |
      | userId          | urn:va:user:9E7A:10000000270         |
  Then a successful response is returned
  When client requests communications for
      | parameter                | value                                                         |
      | requester.userId         | urn:va:user:9E7A:10000000270                                  |
      | requester.ehmpAppVersion | sample.data                                                   |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-promotions |
  Then a successful response is returned
  And the terms are returned

  When the client updates user preferences 
      | parameter       | value                                |
      | category.code   | announcements-promotions             |
      | category.system | http://ehmp.DNS   /messageCategories |
      | enabled         | false                                |
      | userId          | urn:va:user:9E7A:10000000270         |
  Then a successful response is returned

  When client requests communications for
      | parameter                | value                                                         |
      | requester.userId         | urn:va:user:9E7A:10000000270                                  |
      | requester.ehmpAppVersion | sample.data                                                   |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-promotions |

  Then a successful response is returned
  And the terms are not returned

  When client requests communications for
      | parameter                | value                                                         |
      | requester.userId         | urn:va:user:9E7A:10000000270                                  |
      | requester.ehmpAppVersion | sample.data                                                   |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-promotions |
      | overridePreferences      | true                                                          |
  Then a successful response is returned
  And the terms are returned

@US18099 @US18099_updatepreferences_other
Scenario: Verify client cannot update preferences for different user
  When client requests preferences 
      | parameter       | value                                |
      | category.code   | announcements-promotions             |
      | category.system | http://ehmp.DNS   /messageCategories |
      | enabled         | false                                |
      | userId          | urn:va:user:9E7A:10000000272         |
  Then a bad request response is returned

@US18099 @US18099_updatepreferences
Scenario: Verify client can update preferences
  When the client updates user preferences
      | parameter       | value                                |
      | category.code   | announcements-promotions             |
      | category.system | http://ehmp.DNS   /messageCategories |
      | enabled         | false                                |
      | userId          | urn:va:user:9E7A:10000000270         |
  Then a successful response is returned
  When client requests communications for
      | parameter                | value                                                         |
      | requester.userId         | urn:va:user:9E7A:10000000270                                  |
      | requester.ehmpAppVersion | sample.data                                                   |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-promotions |
  Then a successful response is returned
  And the terms are not returned
  When the client updates user preferences
      | parameter       | value                                |
      | category.code   | announcements-promotions             |
      | category.system | http://ehmp.DNS   /messageCategories |
      | enabled         | true                                 |
      | userId          | urn:va:user:9E7A:10000000270         |
  Then a successful response is returned
  When client requests communications for
      | parameter                | value                                                         |
      | requester.userId         | urn:va:user:9E7A:10000000270                                  |
      | requester.ehmpAppVersion | sample.data                                                   |
      | category[]               | http://ehmp.DNS   /messageCategories/announcements-promotions |
  Then a successful response is returned
  And the terms are returned