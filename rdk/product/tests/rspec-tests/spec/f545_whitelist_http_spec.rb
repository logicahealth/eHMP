# encoding: utf-8

require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative '../../shared-test-ruby/WebDriverFactory'
require_relative '../lib/helper/QueryRDK'
require_relative '../lib/helper/HTTPartyWithBasicAuth'
require_relative '../lib/helper/HTTPartyWithAuthorization'
require_relative '../lib/helper/FetchResourceDirectory'
require_relative '../lib/helper/HTTPartyWithCookies'
require_relative '../lib/module/vxapi_utility'
require_relative '../lib/module/json_utilities'

describe 'Story#US7278: f545_whitelist_http_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @test_pid = '10108V420871'
    @test_uid = 'urn%3Ava%3Avisit%3ASITE%3A3%3AH4612'

    rdk_sync(@test_pid)
    # fetch_base_url = DefaultLogin.rdk_fetch_url

    @expected_body_all = {
      'data' => {
        'totalItems' => 11,
        'currentItemCount' => 11,
        'items' => [
          {
            'categoryCode' => 'urn:va:encounter-category:AD',
            'categoryName' => 'Admission',
            'current' => true,
            'dateTime' => '20140814130730',
            'facilityCode' => '998',
            'facilityName' => 'ABILENE (CAA)',
            'kind' => 'Admission',
            'lastUpdateTime' => '20140814130730',
            'localId' => 'H4612',
            'locationDisplayName' => '7A Gen Med',
            'locationName' => '7A GEN MED',
            'locationUid' => 'urn:va:location:SITE:158',
            'patientClassCode' => 'urn:va:patient-class:IMP',
            'patientClassName' => 'Inpatient',
            'pid' => 'SITE;3',
            'primaryProvider' => {
              'primary' => true,
              'providerDisplayName' => 'Provider,Twenty',
              'providerName' => 'PROVIDER,TWENTY',
              'providerUid' => 'urn:va:user:SITE:1005',
              'role' => 'P',
              'summary' => "EncounterProvider{uid=\'\'}"
            },
            'providers' => [
              {
                'providerDisplayName' => 'Provider,Thirty',
                'providerName' => 'PROVIDER,THIRTY',
                'providerUid' => 'urn:va:user:SITE:1057',
                'role' => 'A',
                'summary' => "EncounterProvider{uid=\'\'}"
              },
              {
                'primary' => true,
                'providerDisplayName' => 'Provider,Twenty',
                'providerName' => 'PROVIDER,TWENTY',
                'providerUid' => 'urn:va:user:SITE:1005',
                'role' => 'P',
                'summary' => "EncounterProvider{uid=\'\'}"
              }
            ],
            'reasonName' => '',
            'reasonUid' => 'urn:icd:410.00^',
            'roomBed' => '722-B',
            'service' => 'MEDICINE',
            'shortLocationName' => '7A GM',
            'specialty' => 'GENERAL MEDICINE',
            'stampTime' => '20140814130730',
            'stay' => {
              'arrivalDateTime' => '20140814130730'
            },
            'typeDisplayName' => 'Hospitalization',
            'typeName' => 'HOSPITALIZATION',
            'uid' => 'urn:va:visit:SITE:3:H4612',
            'activityDateTime' => '20140814130730'
          }
        ]
      },
      # 'apiVersion' => '1.0'
      'status' => 200
    }

    @expected_body1 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'primaryProvider' => {
              'primary' => true,
              'providerDisplayName' => 'Provider,Twenty',
              'providerName' => 'PROVIDER,TWENTY',
              'providerUid' => 'urn:va:user:SITE:1005',
              'role' => 'P',
              'summary' => "EncounterProvider{uid=\'\'}"
            },
            'roomBed' => '722-B',
            'specialty' => 'GENERAL MEDICINE'
          }
        ]
      },
      'status' => 200
    }

    @expected_body2 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'primaryProvider' => {
              'primary' => true,
              'providerDisplayName' => 'Provider,Twenty',
              'providerName' => 'PROVIDER,TWENTY',
              'providerUid' => 'urn:va:user:SITE:1005',
              'role' => 'P',
              'summary' => "EncounterProvider{uid=\'\'}"
            },
            'roomBed' => '722-B'
          }
        ]
      },
      'status' => 200
    }

    @expected_body3 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'facilityCode' => '998',
            'facilityName' => 'ABILENE (CAA)',
            'providers' => [
              {
                'providerDisplayName' => 'Provider,Thirty'
              },
              {
                'providerDisplayName' => 'Provider,Twenty'
              }
            ]
          }
        ]
      },
      'status' => 200
    }

    @expected_body4 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'facilityCode' => '998',
            'facilityName' => 'ABILENE (CAA)',
            'providers' => [
              {
                'providerName' => 'PROVIDER,THIRTY'
              },
              {
                'providerName' => 'PROVIDER,TWENTY'
              }
            ]
          }
        ]
      },
      'status' => 200
    }

    @expected_body5 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'stay' => {
              'arrivalDateTime' => '20140814130730'
            }
          }
        ]
      },
      'status' => 200
    }

    @expected_body6 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'providers' => [
              {
                'role' => 'A',
                'summary' => "EncounterProvider{uid=\'\'}"
              },
              {
                'role' => 'P',
                'summary' => "EncounterProvider{uid=\'\'}"
              }
            ]
          }
        ]
      },
      'status' => 200
    }

    @expected_body7 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'providers' => [
              {
                'role' => 'A'
              },
              {
                'role' => 'P'
              }
            ]
          }
        ]
      },
      'status' => 200
    }

    @expected_body8 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'providers' => [
              {
                'primary' => true
              }
            ]
          }
        ]
      },
      'status' => 200
    }

    @expected_body9 = {
      'data' => {
        'totalItems' => 1,
        'currentItemCount' => 1,
        'items' => [
          {
            'facilityCode' => '998',
            'facilityName' => 'ABILENE (CAA)',
            'providers' => [
              {
                'providerDisplayName' => 'Provider,Thirty',
                'providerName' => 'PROVIDER,THIRTY'
              },
              {
                'providerDisplayName' => 'Provider,Twenty',
                'providerName' => 'PROVIDER,TWENTY'
              }
            ]
          }
        ]
      },
      'status' => 200
    }
  end

  context 'TC#621: Comma Separated List' do
    it '. Comma separater list: a,b,c  --> a,b,c' do
      test_whitelist('fields=primaryProvider%2CroomBed%2Cspecialty',
                     @expected_body1)
    end

    it '. Comma separater list with space: a,b ,c  --> a,b' do
      test_whitelist('fields=primaryProvider%2CroomBed%2C%20specialty',
                     @expected_body2)
    end

    it '. Non-existing item: x --> (all)' do
      test_whitelist('fields=XXXXX',
                     @expected_body_all)
    end

    it '. List/Path Combo: a,b,c,c1/c2,c3  --> a,b,c/c2' do
      test_whitelist('fields=facilityCode%2CfacilityName' \
                     '%2Cproviders%2Cproviders' \
                     '%2FproviderDisplayName%2CproviderName',
                     @expected_body3)
    end

    it '. List/Path Combo with full path: a,b,c,c1/c2,c1/c3 --> a,b,c/c2,c3' do
      test_whitelist('fields=facilityCode%2CfacilityName%2Cproviders%2C' \
                     'providers%2FproviderDisplayName%2C' \
                     'providers%2FproviderName',
                     @expected_body4)
    end
  end

  context 'TC#622: Path format' do
    it '. With path: a/b/c --> a/b/c' do
      test_whitelist('fields=stay%2FarrivalDateTime',
                     @expected_body5)
    end

    it '. Non-existing path: a/x --> (all)' do
      test_whitelist('fields=stay%2FXXXXX',
                     @expected_body_all)
    end
  end

  context 'TC#623: Sub-Selection' do
    it '. With sub-selection: a(b,c) --> a(b,c)' do
      test_whitelist('fields=providers(role%2Csummary)',
                     @expected_body6)
    end

    it '. Sub-selection with a duplicate: a(b,c,b) --> a(b,c)' do
      test_whitelist('fields=providers(role%2Csummary%2Crole)',
                     @expected_body6)
    end

    it '. Sub-selection with one non-existing item: a(b,x) --> a(b)' do
      test_whitelist('fields=providers(role%2Cssssss)',
                     @expected_body7)
    end

    it '. Sub-selection with null: a(b,,,,c) --> a(b)' do
      test_whitelist('fields=providers(role%2C%2C%2C%2Csummary)',
                     @expected_body7)
    end

    it '. Sub-selection with trailing comma: a(b,c,) --> a(b,c)' do
      test_whitelist('fields=providers(role%2Csummary%2C)',
                     @expected_body6)
    end

    it '. Non-closing sub-selection list: a(b,c' do
      test_whitelist('fields=providers(role%2Csummary',
                     @expected_body6)
    end

    it '. Case Sensitive: a/(B,c) --> a/(c)' do
      test_whitelist('fields=providers%2F(providerUID%2Cprimary)',
                     @expected_body8)
    end

    it '. Path/Sub-selection Combo: a/b(c,d)' do
      test_whitelist('fields=facilityCode%2CfacilityName%2Cproviders%2C' \
                     'providers(providerDisplayName%2CproviderName)',
                     @expected_body9)
    end
  end

  def test_whitelist(fields, expected_body)
    command = 'resource/patient/record/timeline?' \
              "pid=#{@test_pid}&" \
              "&uid=#{@test_uid}&&&&&" + fields

    path = QueryGenericRDK.new(command).path
    response = HTTPartyWithBasicAuth.get_with_authorization(path)

    expect(response.code).to eq(200)
    unless compare_json(JSON.parse(response.body), expected_body,
                        %w(totalItems currentItemCount stampTime))
      puts 'COMPARISON FAILED -------------------------------------'
      puts 'exp='
      puts JSON.pretty_generate(expected_body)
      puts '-------------------------------------------------------'
      puts 'act='
      puts JSON.pretty_generate(JSON.parse(response.body))
    end
    expect(compare_json(JSON.parse(response.body),
                        expected_body,
                        %w(totalItems currentItemCount stampTime))).to eq(true)
  end
end
