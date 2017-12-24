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

describe 'f664_patient_global_timeline.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/global-timeline'

    rdk_sync('10107V395912')
    rdk_sync('10108V420871')
    rdk_sync('SITE;253')
    rdk_sync('SITE;164')
    rdk_sync('SITE;100022')

    @expected_body = {
      'data' => {
        'inpatient' => [
          {
            'kind' => 'Admission',
            'dateTime' => '19930520100000',
            'stay' => {
              'arrivalDateTime' => '199305201000',
              'dischargeDateTime' => '199305201300'
            }
          },
          {
            'kind' => 'Admission',
            'dateTime' => '19950125155741',
            'stay' => {
              'arrivalDateTime' => '19950125155741'
            }
          },
          {
            'kind' => 'Visit',
            'dateTime' => '19951226112900'
          },
          {
            'kind' => 'Visit',
            'dateTime' => '19951226115500'
          },
          {
            'kind' => 'Visit',
            'dateTime' => '19960503111200'
          }
        ],
        'outpatient' => [

        ],
        'inpatientCount' => 5,
        'outpatientCount' => 0
      },
      'status' => 200
    }


    @total_item_count = 56
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      # expect(response.code).to eq(500)
      expect(response.code).to eq(404)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '')

      # expect(response.code).to eq(500)
      expect(response.code).to eq(404)
    end

    it '. icn' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871')

      expect(response.code).to eq(200)
      expect(key_value(response.body, 'inpatientCount')).to be >= (13)
      expect(key_value(response.body, 'outpatientCount')).to be >= (0)

      # Only check first entry
      expect(key_value(response.body, 'kind')).to eq('Admission')
      expect(key_value(response.body, 'dateTime')).to eq('19930716130000')
      expect(key_value(response.body, 'arrivalDateTime')).to eq('199307161300')
      expect(key_value(response.body, 'dischargeDateTime')).to \
        eq('199307191400')
    end

    it '. site/dfn' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;100022')

      expect(response.code).to eq(200)
      expect(key_value(response.body, 'inpatientCount')).to be >= (11)
      expect(key_value(response.body, 'outpatientCount')).to be >= (0)

      # Only check first entry
      expect(key_value(response.body, 'kind')). to eq('Admission')
      expect(key_value(response.body, 'dateTime')). to eq('19941130120000')
      expect(key_value(response.body, 'arrivalDateTime')). to eq('199411301200')
    end

    it '. icn2' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912')

      expect(response.code).to eq(200)
      # dump(response.body)

      expect(key_value(response.body, 'inpatientCount')).to be >= (3)
      expect(key_value(response.body, 'outpatientCount')).to be >= (112)
    end

    it '. site/dfn2' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;253')

      expect(response.code).to eq(200)

      expect(key_value(response.body, 'inpatientCount')).to be >= (3)
      expect(key_value(response.body, 'outpatientCount')).to be >= (112)
    end

    it '. site/dfn3' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;164')
      expect(response.code).to eq(200)
      expect(compare_json(JSON.parse(response.body),
                          @expected_body, [])).to eq(true)
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'pid' => 'EEEE;3')
      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;848484')
      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command,
                           'pid' => '848V484')
      expect(response.code).to eq(404)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command,
                           'pid' => '10108v420871')
      # expect(response.code).to eq(500)
      expect(response.code).to eq(404)
    end
  end
end
