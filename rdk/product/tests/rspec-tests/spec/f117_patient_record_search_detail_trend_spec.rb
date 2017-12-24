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

describe 'f117_patient_record_search_detail_trend_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/search/detail/trend'

    response = rdk_fetch(@command,
                         'pid' => '10110V004877',
                         'uid' => 'urn:va:med:SITE:8:8145')

    items = hash_to_array(get_hash_items(response.body))
    @all_match_count = items.size
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '',
                           'query' => 'blood')

      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command,
                           'pid' => '10110V004877',
                           'uid' => 'urn:va:med:SITE:8:8145')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be > (0)
      expect(items.size).to eq(@all_match_count)
    end

    it '. site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;3',
                           'uid' => 'urn:va:med:SITE:8:8145')

      expect(response.code).to eq(404)
    end

    it '. with site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;100816',
                           'uid' => 'urn:va:med:SITE:8:8145')

      expect(response.code).to eq(404)
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'pid' => 'EEEE;3',
                           'uid' => 'urn:va:med:SITE:8:8145')

      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;848484',
                           'uid' => 'urn:va:med:SITE:8:8145')

      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command,
                           'pid' => '848V484',
                           'uid' => 'urn:va:med:SITE:8:8145')

      expect(response.code).to eq(404)
    end

    it '. upper case V (normal)' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va:med:2939:135:5587940')

      expect(response.code).to eq(200)
      # dump(response.body)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >=(1)
      expect(items.size).to be <=(@all_match_count)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009v082878',
                           'uid' => 'urn:va:med:2939:135:5587940')

      expect(response.code).to eq(404)
    end
  end

  context 'uid' do
    it 'nominal document' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;100125',
                           'uid' => 'urn:va:med:2939:135:5587940')

      expect(response.code).to eq(200)
      # dump(response.body)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >=(1)
      expect(items.size).to be <=(@all_match_count)
    end

    it 'omitted' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878')

      expect(response.code).to eq(400)
    end

    it 'null' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => '')

      expect(response.code).to eq(400)
    end

    it 'upper case' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'URN:VA:MED:9016:5000000009V082878:5587940')

      expect(response.code).to eq(400)
    end

    it 'incomplete' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va:med:9016:5000000009V082878')

      expect(response.code).to eq(404)
    end

    it 'truncated' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va:med:9016:5000000009V082878:')

      expect(response.code).to eq(404)
    end

    it 'non-existing domain' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va:NOTEXIST:9016:5000000009V082878:5587940')

      expect(response.code).to eq(400)
    end

    it 'upper case urn' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'URN:va:med:9016:5000000009V082878:5587940')

      expect(response.code).to eq(400)
    end

    it 'upper case va' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:VA:med:9016:5000000009V082878:5587940')

      expect(response.code).to eq(400)
    end

    it 'upper case domain' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va:MED:9016:5000000009V082878:5587940')

      expect(response.code).to eq(400)
    end

    it 'missing urn' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => ':va:med:9016:5000000009V082878:5587940')

      expect(response.code).to eq(400)
    end

    it 'missing va' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn::med:9016:5000000009V082878:5587940')

      expect(response.code).to eq(400)
    end

    it 'missing domain' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va::9016:5000000009V082878:5587940')

      expect(response.code).to eq(400)
    end

    it 'missing site' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va:med::5000000009V082878:5587940')

      expect(response.code).to eq(404)
    end

    it 'missing all' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => ':::::')

      expect(response.code).to eq(400)
    end

    it 'uid of lab' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'uid' => 'urn:va:lab:SITE:3:CH;6999478.96;2')

      expect(response.code).to eq(500)
    end

    it 'uid of different pid' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va:med:SITE:8:8145')

      expect(response.code).to eq(404)
    end
  end
end
