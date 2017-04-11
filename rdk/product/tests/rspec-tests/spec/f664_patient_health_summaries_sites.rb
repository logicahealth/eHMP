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

describe 'f664_patient_health_summaries_sites.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/health-summaries/sites'

    rdk_sync('10107V395912')
    rdk_sync('10108V420871')
    @total_item_count = 56
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(500)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '')

      expect(response.code).to eq(404)
    end

    it '. icn - no disabilities' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_data(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >= (@total_item_count)
      items.each do |item|
        expect(item.key?('siteKey')).to eq(true)
        expect(item.key?('facilityCode')).to eq(true)
        expect(item.key?('isPrimary')).to eq(true)
        expect(item.key?('facilityName')).to eq(true)
        expect(item.key?('hsReport')).to eq(true)
        expect(item.key?('reportID')).to eq(true)

        expect(item['siteKey']).to be
        expect(item['facilityCode']).to be
        expect(item['isPrimary']).to be
        expect(item['facilityName']).to be
        expect(item['hsReport']).to be
        expect(item['reportID']).to be
      end
    end

    it '. icn - has disabilties' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_data(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >= (@total_item_count)
    end

    it '. site/dfn' do
      response = rdk_fetch(@command,
                           'pid' => 'C877;253')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_data(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >= (@total_item_count)
    end

    it '. site/dfn2 - has disabilities' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;164')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_data(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >= (@total_item_count / 2)
    end

    it '. site/dfn' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;3')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_data(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >= (@total_item_count)
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
                           'pid' => '10108v420871')
      expect(response.code).to eq(404)
    end
  end
end
