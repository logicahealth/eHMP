@F1286 @debug @DE8513
Feature: Telehealth Integration

Background:
  #Given a patient with pid "SITE;3" has been synced through the RDK API

@video_list
Scenario: New Resource that provides list of appointments

  When the client requests a list of video visit appointments for patient "SITE;3" for the next 90 days
  Then a successful response is returned
  And the video visit response contains only appointents for the next 90 days

@video_provider_contact
Scenario: Video Visit Provider Contact

When the client requests a video visit provider contact for patient "SITE;3"
Then a successful response is returned

@video_timezone
Scenario: Video Visit Facility timezone
When the client requests a video visit facility timezone for patient "SITE;3"
Then a successful response is returned
And the video visit response contains
      | element      | value  |
      | facilityCode | IS_SET |
      | timeZoneName | IS_SET |
      | timezone     | IS_SET |

@video_instructions
Scenario: Video Visit instructions
  When the client requests a video visit instructions for patient "SITE;3"
  Then a successful response is returned
  And the response contains at least 1 item
  And the video visit response contains
      | element     | value  |
      | instruction | IS_SET |
      | title       | IS_SET |

@video_demographics
Scenario: Request Video Visit demographics
  When the client requests a video visit patient demographics for patient "SITE;3"
  Then a successful response is returned
  And the video visit response contains
      | element           | value  |
      | createdDate       | IS_SET |
      | emailAddress      | IS_SET |
      | patientIdentifier | IS_SET |
      | phones            | IS_SET |

@video_demographics_set
Scenario: Set Video Visit demographics
  Given the client requests a video visit patient demographics for patient "SITE;3"
  And the client notes the current patient demographics
  When the client changes the video visit patient demographics for patient "SITE;3"
  And a successful response is returned
  And the client requests a video visit patient demographics for patient "SITE;3"
  Then the video visit patient demographics were updated

@video_emergency
Scenario: Video Visit Emergency contact
  When the client requests a video visit patient emergency contact for patient "SITE;3"
  Then a successful response is returned
    And the video visit response contains
      | element            | value     |
      | contacts.type      | Emergency |
      | contacts.firstName | IS_SET    |
      | contacts.lastName  | IS_SET    |
      | contacts.phones    | IS_SET    |

@video_create
Scenario: Video Visit instructions
  When the client requests a video visit instructions for patient "SITE;8"
  Then a successful response is returned
  And the response contains at least 2 item
  When the client creates a video visit
      | key            | value                                         |
      | comment        | auto test genereated                          |
      | duration       | 20                                            |
      | provider email | test_nondefault.provider@accenturefederal.com |
      | provider phone | 1231234567                                    |
      | patient email  | test_nondefault.patient@accenturefederal.com  |
      | patient phone  | 3213219876                                    |
  Then a successful response is returned
  When the client requests a list of video visit appointments for patient "SITE;8" for the next 90 days
  Then the video visit response contains the newly created video visit
  | verify |
  | bookingNotes |
  | duration |
  | dateTime |
  | providers.provider.contactInformation.preferredEmail |
  | providers.provider.contactInformation.mobile |
  | patients.patient.contactInformation.preferredEmail |
  | patients.patient.contactInformation.mobile   |

@video_create_instructions @future
Scenario: Video Visit instructions - additional instructions
  When the client requests a video visit instructions for patient "SITE;8"
  Then a successful response is returned
  And the response contains at least 2 item
  When the client creates a video visit
      | key            | value                                         |
      | comment        | auto test genereated                          |
      | duration       | 20                                            |
      | provider email | test_nondefault.provider@accenturefederal.com |
      | provider phone | 1231234567                                    |
      #| patient email  | test_nondefault.patient@accenturefederal.com  |
      | patient phone  | 1231234567                                    |
      # | instruction    | Video Visit Preparation Text|
      # | instructionsOther | false |
      # | instructionsTitle | Video Visit Preparation|
  Then a successful response is returned
  When the client requests a list of video visit appointments for patient "SITE;8" for the next 90 days
  Then the video visit response contains the newly created video visit
      | verify |
      | bookingNotes |
      # | instruction    | 
      # | instructionsOther |
      # | instructionsTitle | 
