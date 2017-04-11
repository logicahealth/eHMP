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
require_relative '../lib/helper/JsonFieldDateValidator.rb'
require_relative '../lib/helper/JsonVerifier.rb'
require_relative '../lib/helper/VerifyJsonRuntimeValue.rb'

require_relative '../lib/module/vxapi_utility'
require_relative '../lib/module/json_utilities'

describe 'f664_patient_record_serviceconnected_rateddisabilities.rb', future: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/service-connected/serviceconnectedrateddisabilities'

    rdk_sync('10107V395912')
    rdk_sync('10108V420871')

    @expected_no_disabilities_body = {
      'status' => 200,
      'data' => {
        'scPercent' => '0',
        'serviceConnected' => 'NO',
        'disability' => 'NONE STATED'
      }
    }

    @expected_has_disabilities_body = {
      'status' => 200,
      'data' => {
        'scPercent' => '0',
        'serviceConnected' => true,
        'disability' => [
          {
            'disPercent' => 10,
            'name' => 'VITAMIN DEFICIENCY',
            'serviceConnected' => true,
            'summary' => "PatientDisability{uid=\'\'}"
          },
          {
            'disPercent' => 20,
            'name' => 'GASTRIC ULCER',
            'serviceConnected' => true,
            'summary' => "PatientDisability{uid=\'\'}"
          },
          {
            'disPercent' => 10,
            'name' => 'HEMORRHOIDS',
            'serviceConnected' => true,
            'summary' => "PatientDisability{uid=\'\'}"
          },
          {
            'disPercent' => 0,
            'name' => 'INGUINAL HERNIA',
            'serviceConnected' => true,
            'summary' => "PatientDisability{uid=\'\'}"
          }
        ]
      }
    }
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, {})
      # dump(response.body)

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '')
      # dump(response.body)

      expect(response.code).to eq(403)
    end

    it '. icn - no disabilities' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871')

      expect(response.code).to eq(200)
      # dump(response.body)

      expect(compare_json(JSON.parse(response.body),
                          @expected_no_disabilities_body,
                          [])).to eq(true)
    end

    it '. icn - has disabilties' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_data(response.body)['disability'])
      # puts "ITEM SIZE=[#{items.size}]"
      expect(compare_json(JSON.parse(response.body),
                          @expected_has_disabilities_body,
                          [])).to eq(true)
      expect(key_value(response.body, 'serviceConnected')).to \
        eq(true)

      expect(items.size).to eq(4)
    end

    it '. site/dfn - has disabilties' do
      response = rdk_fetch(@command,
                           'pid' => 'C877;253')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_data(response.body)['disability'])
      # puts "ITEM SIZE=[#{items.size}]"
      expect(compare_json(JSON.parse(response.body),
                          @expected_has_disabilities_body,
                          [])).to eq(true)
      expect(items.size).to eq(4)
    end

    it '. site/dfn1 - has disabilities' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;253')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_data(response.body)['disability'])
      # puts "ITEM SIZE=[#{items.size}]"
      expect(compare_json(JSON.parse(response.body),
                          @expected_has_disabilities_body,
                          [])).to eq(true)
      expect(items.size).to eq(4)
    end

    it '. site/dfn2 - has disabilities' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;164')

      expect(response.code).to eq(200)

      expect(compare_json(JSON.parse(response.body),
                          @expected_no_disabilities_body,
                          [])).to eq(true)
    end

    it '. site/dfn' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;3')

      expect(response.code).to eq(200)
      # dump(response.body)

      expect(compare_json(JSON.parse(response.body),
                          @expected_no_disabilities_body,
                          [])).to eq(true)
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'pid' => 'EEEE;3')
      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;848484')
      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command,
                           'pid' => '848V484')
      expect(response.code).to eq(404)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command,
                           'pid' => '10107v395912')
      expect(response.code).to eq(400)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command,
                           'pid' => '10108v420871')
      expect(response.code).to eq(400)
    end
  end
end
