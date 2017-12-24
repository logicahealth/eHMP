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

describe 'f117_patient_record_search_suggest_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/search/suggest'

    response = rdk_fetch(@command,
                         'pid' => '10107V395912',
                         'query' => 'blood')

    items = hash_to_array(get_hash_items(response.body))
    @all_match_count = items.size

    puts "all_match_count=[#{@all_match_count}]"

    response = rdk_fetch(@command,
                         'pid' => '10107V395912',
                         'query' => 'pressure')

    expect(response.code).to eq(200)

    items = hash_to_array(get_hash_items(response.body))
    @pressure_match_count = items.size
    puts "pressure_match_count=[#{@pressure_match_count}]"
    expect(@pressure_match_count).to be > (0)
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
                           'pid' => '10108V420871',
                           'query' => 'blood')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (@all_match_count)
    end

    it '. site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;3',
                           'query' => 'blood')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (@all_match_count)
    end

    it '. with site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;100816',
                           'query' => 'blood')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (@all_match_count)
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'pid' => 'EEEE;3',
                           'query' => 'blood')

      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;848484',
                           'query' => 'blood')

      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command,
                           'pid' => '848V484',
                           'query' => 'blood')

      expect(response.code).to eq(404)
    end

    it '. upper case V (normal)' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'query' => 'blood')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >= (@all_match_count)
    end

    it '. lower case icn v' do # |example|
      response = rdk_fetch(@command,
                           'pid' => '5000000009v082878',
                           'query' => 'blood')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >= (@all_match_count)
    end
  end

  context 'query' do
    it '. nominal/lower case' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'pressure')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@pressure_match_count)
    end

    it '. UPPER CASE' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'PRESSURE')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to eq(@pressure_match_count)
    end

    it '. Mixed Case' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'prEssUrE')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@pressure_match_count)
    end

    it '. One match' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'asdfasdf')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      if items.size != 2
        dump(response.body)
      end

      expect(items.size).to be <= (2)
      expect(items.size).to be >= (1)

      # puts items[0]['query']
      # puts items[1]['query']
      expect(items[0]['query']).to eq('asdfasdf')
      if items.size == 2
        expect(items[1]['query']).to eq('bedfast')
      end
    end

    it '. Compound word (match)' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'beta%20blockers')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(2)
    end

    it '. Compound word (no match)' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'xxxxxx%20yyyyy')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(1)
      # puts items[0]['query']
      expect(items[0]['query']).to eq('xxxxxx yyyyy')
    end
  end
end
