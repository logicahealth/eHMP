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

describe 'f117_patient_search_full_name_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient-search/full-name'
    @total_seven_item_count = 38
  end

  context 'full-name' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(400)
    end

    it '. null' do
      response = rdk_fetch(@command, 'name.full' => '')

      expect(response.code).to eq(400)
    end

    it '. numeric' do
      response = rdk_fetch(@command, 'name.full' => '7,Patient')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. not found' do
      response = rdk_fetch(@command, 'name.full' => 'Sevn')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. lower case' do
      response = rdk_fetch(@command, 'name.full' => 'seven,patient')

      expect(response.code).to eq(200)

      items_hash = get_hash_items(response.body)

      verify_response_contains([%w(totalItems 1)], response.body)
      verify_response_contains([['displayName', 'Seven,Patient']],  items_hash)
    end

    it '. upper case' do
      response = rdk_fetch(@command, 'name.full' => 'SEVEN,PATIENT')

      expect(response.code).to eq(200)
      items_hash = get_hash_items(response.body)

      verify_response_contains([%w(totalItems 1)], response.body)
      verify_response_contains([['displayName', 'Seven,Patient']],  items_hash)
    end

    it '. space after seperator' do
      response = rdk_fetch(@command, 'name.full' => 'Seven,%20Patient')
      items_hash = get_hash_items(response.body)

      verify_response_contains([%w(totalItems 1)], response.body)
      verify_response_contains([['displayName', 'Seven,Patient']],  items_hash)
    end

    it '. special char with match' do
      response = rdk_fetch(@command, 'name.full' => 'Seven&Xxxxxx')

      expect(response.code).to eq(200)
      verify_response_contains([['totalItems', "#{@total_seven_item_count}"]],
                               response.body)
    end

    it '. special char with no match' do
      response = rdk_fetch(@command, 'name.full' => 'Sevn&Patient')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. missing comma' do
      response = rdk_fetch(@command, 'name.full' => 'Seven%20Patient')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. no comma' do
      response = rdk_fetch(@command, 'name.full' => 'SevenPatient')

      expect(response.code).to eq(200)

      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. period separator' do
      response = rdk_fetch(@command, 'name.full' => 'Seven.Patient')

      expect(response.code).to eq(200)

      verify_response_contains([%w(totalItems 0)], response.body)
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command, 'name.full' => 'Seven')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_seven_item_count}"],
                                ['currentItemCount',
                                 "#{@total_seven_item_count}"]],
                               response.body)
    end

    it '. zero' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'start' => '0')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_seven_item_count}"],
                                ['currentItemCount',
                                 "#{@total_seven_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'start' => '1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_seven_item_count}"],
                                ['currentItemCount',
                                 "#{@total_seven_item_count - 1}"]],
                               response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'start' => '5')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_seven_item_count}"],
                                %w(currentItemCount 33)],
                               response.body)
    end

    it '. total' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'start' =>
                                       "#{@total_seven_item_count}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_seven_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'start' =>
                                       "#{@total_seven_item_count + 1}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_seven_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'start' => '-1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_seven_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'limit' => '0')

      # expect(response.code).to eq(500)
      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 0)], response.body)
      verify_response_contains([%w(currentItemCount 0)], response.body)
    end

    it '. null' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'limit' => '')

      expect(response.code).to eq(200)
      expect(JSON.parse(response.body)['data'].key?('itemsPerPage')).to \
        eq(false)
      verify_response_contains([['totalItems',
                                 "#{@total_seven_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'limit' => '1')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 1)], response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'limit' => '5')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 5)], response.body)
    end

    it '. total' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'limit' => "#{@total_seven_item_count}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_seven_item_count}"]],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'limit' =>
                                       "#{@total_seven_item_count + 1}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_seven_item_count + 1}"]],
                               response.body)

      a = hash_to_array(get_hash_items(response.body))

      expect(a.size).to be(@total_seven_item_count)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'limit' => '-1')

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage', '-1']], response.body)
    end
  end

  context 'order' do
    it '. omitted' do
      response = rdk_fetch(@command, 'name.full' => 'Seven')

      expect(response.code).to eq(200)

      # Probablility that list is initially sorted by localId is very slim,
      # so expect it to be not sorted.
      sorted = true

      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        sorted = a[i + 1]['localId'] < a[i]['localId'] ? false : sorted
      end
      expect(sorted).to be(false)
      expect(a.size).to be(@total_seven_item_count)
    end

    it '. one field - no asc/desc' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'order' => 'localId')

      expect(response.code).to eq(400)
    end

    it '. one field - asc' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'order' => 'localId%20asc')

      expect(response.code).to eq(200)

      # Verify items are sorted by localId in ascending order
      a = hash_to_array(get_hash_items(response.body))
      # for i in 0...(a.size - 1) do
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        expect(a[i + 1]['localId']).to be >= (a[i]['localId'])
      end
      expect(a.size).to be(@total_seven_item_count)
    end

    it '. one field - desc' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'order' => 'localId%20desc')

      expect(response.code).to eq(200)

      # Verify items are sorted by localId in ascending order
      a = hash_to_array(get_hash_items(response.body))
      # for i in 0...(a.size - 1) do
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        expect(a[i + 1]['localId']).to be <= (a[i]['localId'])
      end
      expect(a.size).to be(@total_seven_item_count)
    end

    it '. two fields' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'order' => 'sensitive%20asc,%20localId%20asc')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        key1 = a[i + 1]['sensitive'].to_s + a[i + 1]['localId']
        key2 = a[i]['sensitive'].to_s + a[i]['localId']
        expect(key1).to be >= (key2)
      end
      expect(a.size).to be(@total_seven_item_count)
    end

    it '. non-existing field' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'order' => 'FieldNoExist%20asc')

      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_seven_item_count)
    end

    it '. non-existing field and existing field' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'order' => 'XXXX%20asc,%20displayName%20asc')

      expect(response.code).to eq(200)

      # Verify items are sorted by the existing field in ascending order
      a = hash_to_array(get_hash_items(response.body))
      # for i in 0...(a.size - 1) do
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        expect(a[i + 1]['displayName']).to be >= (a[i]['displayName'])
      end
      expect(a.size).to be(@total_seven_item_count)
    end

    it '. case in-sensitive' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'order' => 'LOCALID%20ASC')
      dump(response.body)
      expect(response.code).to eq(400)
    end
  end

  context 'resultsRecordType' do
    it '. null' do
      response = rdk_fetch(@command, 'name.full' => 'Seven,Patient',
                                     'resultsRecordType' => '')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 1),
                                %w(currentItemCount 1)],
                               response.body)
    end

    it '. normal single return' do
      response = rdk_fetch(@command, 'name.full' => 'Seven,Patient',
                                     'resultsRecordType' => 'summary')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 1),
                                %w(currentItemCount 1)],
                               response.body)
    end

    it '. normal multiple returns' do
      response = rdk_fetch(@command, 'name.full' => 'Seven',
                                     'resultsRecordType' => 'summary')
      expect(response.code).to eq(200)
      verify_response_contains([['totalItems', "#{@total_seven_item_count}"],
                                ['currentItemCount',
                                 "#{@total_seven_item_count}"]],
                               response.body)
    end

    it '. non-summary (will be ignored)' do
      response = rdk_fetch(@command, 'name.full' => 'Seven,Patient',
                                     'resultsRecordType' => 'XxxxxxxxxX')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 1),
                                %w(currentItemCount 1)],
                               response.body)
    end

    it '. upper case' do
      response = rdk_fetch(@command, 'name.full' => 'Seven,Patient',
                                     'resultsRecordType' => 'SUMMARY')

      expect(response.code).to eq(200)

      verify_response_contains([%w(totalItems 1),
                                %w(currentItemCount 1)],
                               response.body)
    end
  end
end
