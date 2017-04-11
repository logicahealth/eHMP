@writeback @future
Feature: F360 - Enter and Store Immunizations

@writeback_immunization 
Scenario: Client can write to the VistA and add Immunizations records
  Given a patient with pid "9E7A;419" has been synced through VX-Sync API for "9E7A;C877;2939;FFC7;VLER" site(s)
  And the client requests "Immunizations" for the patient "9E7A;419" in VPR format
  And save the totalItems
  And a client connect to VistA using "Panorama"
  When new the client add new Immunization record for patient with DFN "419" enter
    | field                     | desc                                    | value                                           |
    | inpatient                 |                                         | 1                                               |
    | location                  | CENTRAL OFFICE                          | 2                                               |
    | date_time                 |                                         | 3151012.151515                                  |
    | service_category          | AMBULATORY                              | A                                               |
    | provider_ien              |                                         | 991                                             |
    | immunization_ien          | MUMPS VACCINE SC                        | 15                                              |
    | category                  |                                         |                                                 |
    | narrative_of_immunization | 29                                      | DTAP                                            |
    | series                    | SERIES 3                                | 3                                               |
    | encounter_provider        |                                         | 991                                             |
    | reaction                  |                                         | FEVER                                           |
    | contraindicated           | false                                   | 0                                               |
    | non_know                  |                                         |                                                 |
    | next_comment_sequence     |                                         | COMMENTTest                                     |
    | cvx_code                  | DTP                                     | 1                                               |
    | event                     | EventInfoSource;HL7Code;IEN             | Historical information -source unspecified;ID;1 |
    | dose                      | Dose;Units;UnitsIEN                     | DOSE1                                           |
    | route                     | RouteName;HL7Code;IEN                   | ORAL                                            |
    | admin_site                | LEFT DELTOID                            | LD                                              |
    | lot                       | LotNumber;IEN                           | EHMP0001                                        |
    | manufacturer              |                                         | ABBOTT LABORATORIES                             |
    | expiration_date           |                                         | OCT 20,2015                                     |
    | event_date                |                                         | 3151013.141414                                  |
    | ordering_provider         |                                         | 119                                             |
    | vis                       |                                         | ADENOVIRUS VIS                                  |
    | remarks                   |                                         | OneRemark                                       |
    
  Then the client receive the VistA write-back response
  And the new "Immunization" record added for the patient "9E7A;419" in VPR format
  And save the local id from VistA write-back response
  And VistA write-back generate a new localId with values record dispaly in VPR format
    | field           | value                                               |
    | cptName         | MUMPS VACCINE SC                                    |
    | seriesName      | SERIES 3                                            |
    | reactionName    | FEVER                                               |
    | contraindicated | false                                               |
    | lastUpdateTime  | CONTAINS 2015101314141                              |
    | eventDete       | 3151013.141414                                      |
    | manuFacturer    | ABBOTT LABORATORIES                                 |
    | lotNumber       | EHMP0001                                            |
    | name            | MUMPS                                               |
    | performerName   | PROVIDER,EIGHT                                      |
    | comment         | CONTAINS COMMENTTest                                |
    | comment         | CONTAINS Dosage: DOSE1                              |
    | comment         | CONTAINS Expiration Date: OCT 20,2015               |
      
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  And VistA write-back generate a new localId with values record dispaly in VPR format
    | field              | value                                           |
    | locationName       | CENTRAL OFFICE                                  |
    | date_time          | 3151025.151515                                  |
    | service_category   | AMBULATORY                                      |
    | category           |                                                 |
    | encounter_provider |                                                 |
    | cvxCode            | 1                                               |
    | event              | Historical information -source unspecified;ID;1 |
    | route              | ORAL                                            |
    | ordering_provider  | 86                                              |
    | admin_site         | AdminSiteName;HL7Code;IEN^LotNumber;IEN         |
    | vis                | ADENOVIRUS VIS                                  |
    | remarks            | OneRemark                                       |


@writeback_immunization @future
Scenario: Client can write to the VistA and add Immunizations records
  Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  And the client requests "Immunizations" for the patient "C877;66" in VPR format
  And save the totalItems
  And a client connect to VistA using "Kodak"
  When new the client add new Immunization record for patient with DFN "66" enter
    | field                     | desc                        | value                                           |
    | inpatient                 |                             | 1                                               |
    | location                  | BOSTON-RO                   | 3                                               |
    | date_time                 |                             | 3151015.151515                                  |
    | service_category          | IN HOSPITAL                 | I                                               |
    | provider_ien              |                             | 888                                             |
    | immunization_ien          | ANTHRAX VACCINE SC OR IM    | 41                                              |
    | category                  |                             |                                                 |
    | narrative_of_immunization | 29                          | DTAP                                            |
    | series                    | BOOSTER                     | B                                               |
    | encounter_provider        |                             | 991                                             |
    | reaction                  |                             | VOMITING                                        |
    | contraindicated           | True                        | 1                                               |
    | non_know                  |                             |                                                 |
    | next_comment_sequence     |                             | COMMENT_Test                                    |
    | cvx_code                  | HEP A                       | 31                                              |
    | event                     | EventInfoSource;HL7Code;IEN | Historical information -source unspecified;ID;1 |
    | dose                      | Dose;Units;UnitsIEN         | .5;;488                                         |
    | route                     | RouteName;HL7Code;IEN       | ORAL                                            |
    | admin_site                | LEFT DELTOID                | LD                                              |
    | lot                       | LotNumber;IEN               | L6802KP                                         |
    | manufacturer              |                             | SOLVAY PHARMACEUTICALS                          |
    | expiration_date           |                             | OCT 25,2015                                     |
    | event_date                | 20151016141414              | 3151016.141414                                  |
    | ordering_provider         |                             | 11720                                           |
    | vis                       |                             | ADENOVIRUS VIS                                  |
    | remarks                   |                             | OneRemark_test                                  |
    
  Then the client receive the VistA write-back response
  And the new "Immunization" record added for the patient "C877;66" in VPR format
  And VistA write-back generate a new localId with values record dispaly in VPR format
    | field           | value                                 |
    | cptName         | ANTHRAX VACCINE SC OR IM              |
    | seriesName      | BOOSTER                               |
    | reactionName    | VOMITING                              |
    | contraindicated | true                                  |
    | lastUpdateTime  | IS_SET                                |
    | eventDete       | 3151016.141414                        |
    | lotNumber       | L6802KP                               |
    | name            | ANTHRAX                               |
    | performerName   | PROGRAMMER,TWENTYSIX                  |
    | comment         | CONTAINS COMMENT_Test                 |
    | comment         | CONTAINS Expiration Date: OCT 25,2015 |
      
  When the client use the vx-sync write-back to save the record
  Then the responce is successful
  And VistA write-back generate a new localId with values record dispaly in VPR format
    | field              | value                                           |
    | manuFacturer       | SOLVAY PHARMACEUTICALS                          |
    | locationName       | CENTRAL OFFICE                                  |
    | date_time          | 3151025.151515                                  |
    | service_category   | IN HOSPITAL                                     |
    | category           |                                                 |
    | encounter_provider |                                                 |
    | cvxCode            | 31                                              |
    | event              | Historical information -source unspecified;ID;1 |
    | route              | ORAL                                            |
    | ordering_provider  | 11720                                           |
    | admin_site         | AdminSiteName;HL7Code;IEN^LotNumber;IEN         |
    | vis                | ADENOVIRUS VIS                                  |
    | remarks            | OneRemark_test                                  |
    
    
#     
    # @writeback 
# Feature: F413 - Enter, Store Encounter Form - Immunizations
# 
# @writeback_immunization @debug
# Scenario: Client can write to the VistA and add Immunizations records
  # Given a patient with pid "C877;253" has been synced through VX-Sync API for "9E7A;C877;2939;FFC7;VLER" site(s)
  # And the client requests "Immunizations" for the patient "C877;253" in VPR format
  # And save the totalItems
  # And a client connect to VistA using "Kodak"
  # When the client add new Immunization record using Encounter Form for patient with DFN "253" enter
    # | field           | desc                      | value |
    # | contra          | ANTHRAX VACCINE SC OR IM  | 41    |
    # | series          | booster                   | b     |
    # | reaction        |                           | Fever |
    # | contraindicated | true                      | 1     |
    # | comment         |                           | Test: this patient got ANTHRAX |
#     
  # Then the client receive the VistA write-back response
  # And the new "Immunization" record added for the patient "C877;253" in VPR format
  # And the new write back record dispaly in VPR format with value of
    # | field             | value                    |
    # | cptName           | ANTHRAX VACCINE SC OR IM |
    # | seriesName        | BOOSTER                  |
    # | reactionName      | FEVER                    |
    # | contraindicated   | true                     |
    # | comment           | CONTAINS Test: this patient got ANTHRAX |
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
#   
#   
# @writeback_immunization 
# Scenario: Client can write to the VistA and add Immunizations records
  # Given a patient with pid "9E7A;66" has been synced through VX-Sync API for "9E7A" site(s)
  # And the client requests "Immunizations" for the patient "9E7A;66" in VPR format
  # And save the totalItems
  # And a client connect to VistA using "Panorama"
  # When the client add new Immunization record using Encounter Form for patient with DFN "66" enter
    # | field           | desc             | value    |
    # | contra          | MUMPS VACCINE SC | 15       |
    # | series          | SERIES 3         | 3        |
    # | reaction        |                  | Vomiting |
    # | contraindicated | false            | 0        |
    # | comment         |                  | Test: this patient got MUMPS VIRUS VACCINE |
#     
  # Then the client receive the VistA write-back response
  # And the new "Immunization" record added for the patient "9E7A;66" in VPR format
  # And the new write back record dispaly in VPR format with value of
    # | field           | value             |
    # | cptName         | MUMPS VACCINE SC  |
    # | seriesName      | SERIES 3          |
    # | reactionName    | VOMITING          |
    # | contraindicated | false             |
    # | comment         | CONTAINS Test: this patient got MUMPS VIRUS VACCINE |
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
#   
#   
  # # Using the same patient with different encounter code
  # When the client add new Immunization record using Encounter Form for patient with DFN "66" enter
    # | field           | desc                      | value    |
    # | contra          | ANTHRAX VACCINE SC OR IM  | 41       |
    # | series          | SERIES 3                  | 3        |
    # | reaction        |                           | Vomiting |
    # | contraindicated | false                     | 0        |
    # | comment         |                           | Test: this patient got ANTHRAX |
#     
  # Then the client receive the VistA write-back response
  # And the new "Immunization" record added for the patient "9E7A;66" in VPR format
  # And the new write back record dispaly in VPR format with value of
    # | field           | value                     |
    # | cptName         | ANTHRAX VACCINE SC OR IM  |
    # | seriesName      | SERIES 3                  |
    # | reactionName    | VOMITING                  |
    # | contraindicated | false                     |
    # | comment         | CONTAINS Test: this patient got ANTHRAX |
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
# 
# 
# @writeback_immunization 
# Scenario: Client can not duplicate the same Immunizations to the same patient in VistA
  # Given a patient with pid "C877;66" has been synced through VX-Sync API for "C877" site(s)
  # And the client requests "Immunizations" for the patient "C877;66" in VPR format
  # And save the totalItems
  # And a client connect to VistA using "Kodak"
  # When the client add new Immunization record using Encounter Form for patient with DFN "66" enter
    # | field           | desc             | value    |
    # | contra          | MUMPS VACCINE SC | 15       |
    # | series          | SERIES 3         | 3        |
    # | reaction        |                  | Vomiting |
    # | contraindicated | false            | 0        |
    # | comment         |                  | Test: this patient got MUMPS VIRUS VACCINE |
#     
  # Then the client receive the VistA write-back response
  # And the new "Immunization" record added for the patient "C877;66" in VPR format
  # And the new write back record dispaly in VPR format with value of
    # | field           | value             |
    # | cptName         | MUMPS VACCINE SC  |
    # | seriesName      | SERIES 3          |
    # | reactionName    | VOMITING          |
    # | contraindicated | false             |
    # | comment         | CONTAINS Test: this patient got MUMPS VIRUS VACCINE |
  # When the client use the vx-sync write-back to save the record
  # Then the responce is successful
#   
  # Given the client requests "Immunizations" for the patient "C877;66" in VPR format
  # When the client add same Immunization record using Encounter Form for patient with DFN "66" enter
    # | field           | desc             | value    |
    # | contra          | MUMPS VACCINE SC | 15       |
    # | series          | SERIES 3         | 3        |
    # | reaction        |                  | Vomiting |
    # | contraindicated | false            | 0        |
    # | comment         |                  | Test: this patient got MUMPS VIRUS VACCINE |
  # Then the client receive the VistA write-back response
  # Then the client receive the error message

