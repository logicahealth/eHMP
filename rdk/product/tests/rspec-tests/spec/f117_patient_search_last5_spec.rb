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

describe 'f117_search_last5_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient-search/last5'
    @total_z4444_item_count = 24
    @total_z5555_item_count = 17
    @searchlast5_1 = {
      'displayName' => 'Bcma,Eight',
      'birthDate'   => '19350407',
      'familyName'  => 'BCMA',
      'genderName'  => 'Male',
      'givenNames'  => 'EIGHT',
      'pid'         => 'SITE;100022',
      'ssn'         => '*****0008',
      'uid'         => 'urn:va:pt-select:SITE:100022:100022',
      'last4'       => '0008',
      'last5'       => 'B0008',
      'summary'     => 'Bcma,Eight',
      'localId'     => '100022'
    }
  end

  context 'last5' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(400)
    end

    it '. null' do
      response = rdk_fetch(@command, 'last5' => '')

      expect(response.code).to eq(400)
    end

    it '. all numeric' do
      response = rdk_fetch(@command, 'last5' => '05555')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. special char for letter' do
      response = rdk_fetch(@command, 'last5' => '*5555')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. three digits' do
      response = rdk_fetch(@command, 'last5' => 'Z555')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. five digits' do
      response = rdk_fetch(@command, 'last5' => 'Z55555')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. not found' do
      response = rdk_fetch(@command, 'last5' => 'A5555')

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. lower case' do
      response = rdk_fetch(@command, 'last5' => 'z5555')

      expect(response.code).to eq(200)
      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"]],
                               response.body)
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command, 'last5' => 'Z5555')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"],
                                ['currentItemCount',
                                 "#{@total_z5555_item_count}"]],
                               response.body)
    end

    it '. zero' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'start' => '0')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"],
                                ['currentItemCount',
                                 "#{@total_z5555_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'start' => '1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"],
                                ['currentItemCount',
                                 "#{@total_z5555_item_count - 1}"]],
                               response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'start' => '5')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"],
                                %w(currentItemCount 12)],
                               response.body)
    end

    it '. total' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'start' =>
                                       "#{@total_z5555_item_count}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'start' =>
                                       "#{@total_z5555_item_count + 1}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'start' => '-1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'limit' => '0')

      # expect(response.code).to eq(500)
      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 0)], response.body)
      verify_response_contains([%w(currentItemCount 0)], response.body)
    end

    it '. null' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'limit' => '')

      expect(response.code).to eq(200)
      expect(JSON.parse(response.body)['data'].key?('itemsPerPage')).to \
        eq(false)
      verify_response_contains([['totalItems', "#{@total_z5555_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'limit' => '1')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 1)], response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'limit' => '5')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 5)], response.body)
    end

    it '. total' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'limit' => "#{@total_z5555_item_count}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_z5555_item_count}"]],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'limit' => '30')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 30)], response.body)

      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_z5555_item_count)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'last5' => 'Z5555',
                                     'limit' => '-1')

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage', '-1']], response.body)
    end
  end

  context 'order' do
    it '. omitted' do
      response = rdk_fetch(@command, 'last5' => 'Z4444')

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
      expect(a.size).to be(@total_z4444_item_count)
    end

    it '. one field' do
      response = rdk_fetch(@command, 'last5' => 'Z4444',
                                     'order' => 'localId')

      expect(response.code).to eq(200)

      # Verify items are sorted by localId in ascending order
      a = hash_to_array(get_hash_items(response.body))

      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        expect(a[i + 1]['localId']).to be >= (a[i]['localId'])
      end
      expect(a.size).to be(@total_z4444_item_count)
    end

    it '. two fields' do
      response = rdk_fetch(@command, 'last5' => 'Z4444',
                                     'order' => 'sensitive,localId')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))

      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        key1 = a[i + 1]['sensitive'].to_s + a[i + 1]['localId']
        key2 = a[i]['sensitive'].to_s + a[i]['localId']
        expect(key1).to be >= (key2)
      end
      expect(a.size).to be(@total_z4444_item_count)
    end

    it '. non-existing field' do
      response = rdk_fetch(@command, 'last5' => 'Z4444',
                                     'order' => 'FieldNoExist')

      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_z4444_item_count)
    end

    it '. non-existing field and existing field' do
      response = rdk_fetch(@command, 'last5' => 'Z4444',
                                     'order' => 'XXXX,displayName')

      expect(response.code).to eq(200)

      # Verify items are sorted by the existing field in ascending order
      a = hash_to_array(get_hash_items(response.body))

      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        expect(a[i + 1]['displayName']).to be >= (a[i]['displayName'])
      end
      expect(a.size).to be(@total_z4444_item_count)
    end

    it '. case in-sensitive' do
      response = rdk_fetch(@command, 'last5' => 'Z4444',
                                     'order' => 'LOCALID')

      expect(response.code).to eq(200)

      # Verify items are sorted by localId in ascending order
      a = hash_to_array(get_hash_items(response.body))

      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        expect(a[i + 1]['localId']).to be >= (a[i]['localId'])
      end
      expect(a.size).to be(@total_z4444_item_count)
    end
  end
end
