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

describe 'f117_patient_search_pid_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient-search/pid'
    @total_seven_item_count = 38
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(400)
    end

    it '. null' do
      response = rdk_fetch(@command, 'pid' => '')

      expect(response.code).to eq(400)
    end

    it '. icn' do
      response = rdk_fetch(@command, 'pid' => '10108V420871')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 2)], response.body)
    end

    it '. site' do
      response = rdk_fetch(@command, 'pid' => 'SITE;3')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 1)], response.body)
    end

    it '. with site' do
      response = rdk_fetch(@command, 'pid' => 'SITE;100816')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 1)], response.body)
    end

    it '. not found site' do
      response = rdk_fetch(@command, 'pid' => 'EEEE;3')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. not found in site' do
      response = rdk_fetch(@command, 'pid' => 'SITE;848484')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. not found icn' do
      response = rdk_fetch(@command, 'pid' => '848V484')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. 5000000009V082878' do
      response = rdk_fetch(@command, 'pid' => '5000000009V082878')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 2)], response.body)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command, 'pid' => '5000000009v082878')
      expect(response.code).to eq(400)
      # verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. same localId, different site' do
      response = rdk_fetch(@command, 'pid' => 'SITE;100599')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 1)], response.body)

      items_hash = get_hash_items(response.body)
      verify_response_contains([%w(localId 100599),
                                ['pid', 'SITE;100599']],
                               items_hash)

      response = rdk_fetch(@command, 'pid' => 'SITE;100599')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 1)], response.body)

      items_hash = get_hash_items(response.body)
      verify_response_contains([%w(localId 100599),
                                ['pid', 'SITE;100599']],
                               items_hash)
    end

    it '. just site' do
      response = rdk_fetch(@command, 'pid' => 'SITE')
      expect(response.code).to eq(400)
      # verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. site with null localid' do
      response = rdk_fetch(@command, 'pid' => 'SITE;')
      expect(response.code).to eq(400)
      # verify_response_contains([%w(totalItems 0)], response.body)
    end
  end
end
