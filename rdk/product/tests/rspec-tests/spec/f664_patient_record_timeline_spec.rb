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

describe 'f664_patient_record_timeline_spec.rb', debug: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/timeline'

    # Start with approximate (minimum values)

    @total_item_count = 500 # 594
    @uid_item_count = 1 # 12    # 35
    @site_item_count = 14
    @diff_pid_uid_item_count = 10
    rdk_sync('10107V395912')

    # Check that actual is within range of estimate
    # and then adjust to actual counts

    response = rdk_fetch(@command,
                         'pid' => '10107V395912')

    expect(response.code).to eq(200)
    items = hash_to_array(get_hash_items(response.body))
    expect(items.size).to be >= (@total_item_count)
    @total_item_count = items.size

    response = rdk_fetch(@command,
                         'pid' => '10107V395912',
                         'uid' => 'urn:va:lab:9E7A:253:CH;6899693.879999;80')
    # 'uid' => 'urn:va:lab:9E7A:164:CH;7039894.9085;80')
    items = hash_to_array(get_hash_items(response.body))
    expect(items.size).to be >= (@uid_item_count)
    @uid_item_count = items.size
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'uid' => 'urn:va:visit:9E7A:164:H918')

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '')

      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. site/dfn' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;164')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (@site_item_count)
      puts "ITEM SIZE=[#{items.size}]"
      verify_response_contains([['totalItems', "#{items.size}"]],
                               response.body)
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
      # Receive a 500 error, but RDK does not crash, therefore acceptable
      expect(response.code).to eq(500)
    end
  end

  context 'uid' do
    it 'normal lab' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:va:lab:9E7A:253:CH;6899693.879999;80')
      #                    'uid' => 'urn:va:lab:9E7A:164:CH;7039894.9085;80')

      expect(response.code).to eq(200)
      # dump(response.body)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to eq(@uid_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@uid_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'normal visit 1' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;164',
                           'uid' => 'urn:va:visit:9E7A:164:H918')

      expect(response.code).to eq(200)
      # dump(response.body)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to eq(1)
      expect(key_value(response.body, 'totalItems')).to eq(1)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'normal visit 2' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:va:visit:C877:253:10807')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to be >= (@uid_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        be >= (@uid_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'null' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => '')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'upper case' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'URN:VA:LAB:9E7A:253:CH;6899693.879999;80')
      #                      'uid' => 'URN:VA:LAB:9E7A:164:CH;7039894.9085;80')
      dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'incomplete' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:va:lab:9e7a:253:ch;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'truncated' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:va:lab:9E7A:253:')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'non-existing domain' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:va:noex:9E7A:253:CH;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'upper case urn' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'URN:va:lab:9E7A:253:CH;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'upper case va' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:VA:lab:9E7A:253:CH;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'upper case domain' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:va:LAB:9E7A:253:CH;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'missing urn' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => ':va:lab:9E7A:253:CH;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'missing va' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn::lab:9E7A:253:CH;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'missing domain' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:va::9E7A:253:CH;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'missing site' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => 'urn:va:lab::253:CH;6899693.879999;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'missing all' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'uid' => ':::::')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it 'uid of different pid' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'uid' => 'urn:va:lab:9E7A:253:CH;6899693.879999;80')
      #                      'uid' => 'urn:va:lab:9E7A:164:CH;7039894.9085;80')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(0)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))

      # expect(items.size).to eq(@diff_pid_uid_item_count)
      # expect(key_value(response.body, 'totalItems')).to \
      #   eq(@diff_pid_uid_item_count)
      # expect(key_value(response.body, 'currentItemCount')).to \
      #   eq(key_value(response.body, 'totalItems'))
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'start' => '')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. zero' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'start' => '0')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. one' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'start' => '1')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count - 1)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. nominal' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'start' => '5')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      # dump(response.body)
      expect(items.size).to eq(@total_item_count - 5)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. total' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'start' =>
                                       "#{@total_lab_item_count}")

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. more than total' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'start' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(0)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. negative' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'start' => '-1')

      #  dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end
  end

  context 'limit' do
    it '. zero :DE2504' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'limit' => '0')
      puts response.code
      dump(response.body)
      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
      expect(key_value(response.body, 'itemsPerPage')).to be nil
    end

    it '. null :DE2504' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'limit' => '')
      puts response.code
      dump(response.body)
      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
      expect(key_value(response.body, 'itemsPerPage')).to be nil
    end

    it '. one' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'limit' => '1')
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(1)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
      expect(key_value(response.body, 'itemsPerPage')).to be nil
    end

    it '. nominal' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'limit' => '5')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(5)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
      expect(key_value(response.body, 'itemsPerPage')).to be nil
    end

    it '. total' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'limit' => "#{@total_item_count}")

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
      expect(key_value(response.body, 'itemsPerPage')).to be nil
    end

    it '. more than total' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'limit' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
      expect(key_value(response.body, 'itemsPerPage')).to be nil
    end

    it '. negative :DE2504' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'limit' => '-1')
      puts response.code
      dump(response.body)
      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to eq(@total_item_count)
      expect(key_value(response.body, 'totalItems')).to \
        eq(@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
      expect(key_value(response.body, 'itemsPerPage')).to \
        eq(@total_item_count)
    end
  end

  context 'order' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912')

      expect(response.code).to eq(200)
      # dump(response.body)
      # display_items(response.body, 'typeDisplayName')
      # Expect result NOT to be sorted by uid
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        sorted = a[i + 1]['facilityName'] < a[i]['facilityName'] ? false : sorted
      end
      expect(sorted).to be(false)
      expect(a.size).to be(@total_item_count)
    end

    it '. one field ascending' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'facilityName%20asc')
      expect(response.code).to eq(200)

      # display_items(response.body, 'facilityName')

      # Verify items are sorted by facilityName in ascending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['uid']}] >= [#{a[i]['uid']}]"
        expect(a[i + 1]['facilityName']).to be >= (a[i]['facilityName'])
      end

      expect(a.size).to be(@total_item_count)
    end

    it '. one field descending' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'facilityName%20desc')

      expect(response.code).to eq(200)

      # Verify items are sorted by facilityName in descending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        expect(a[i + 1]['facilityName']).to be <= (a[i]['facilityName'])
      end
      expect(a.size).to be(@total_item_count)
    end

    it '. one field no ascend/descend (default order)' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'facilityName')
      expect(response.code).to eq(200)

      # Default sorting which is ascending
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        expect(a[i + 1]['facilityName']).to be >= (a[i]['facilityName'])
      end
      expect(a.size).to be(@total_item_count)
    end

    it '. two fields asc' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'uid%20facilityName%20asc')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))

      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1a = a[i + 1]['uid'].nil? ? '' : a[i + 1]['uid'].to_s
        key1b = a[i + 1]['facilityName'].nil? ? '' : a[i + 1]['facilityName'].to_s
        key2a = a[i]['uid'].nil? ? '' : a[i]['uid'].to_s
        key2b = a[i]['facilityName'].nil? ? '' : a[i]['facilityName'].to_s

        expect(key1a).to be >= (key2a)
        if key1a == key2a
          expect(key1b).to be >= (key2b)
        end
      end
      expect(a.size).to be(@total_item_count)
    end

    it '. two fields desc (desc is ignored and becomes asc)' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'uid%20facilityName%20desc')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1a = a[i + 1]['uid'].nil? ? '' : a[i + 1]['uid'].to_s
        key1b = a[i + 1]['facilityName'].nil? ? '' : a[i + 1]['facilityName'].to_s
        key2a = a[i]['uid'].nil? ? '' : a[i]['uid'].to_s
        key2b = a[i]['facilityName'].nil? ? '' : a[i]['facilityName'].to_s

        expect(key1a).to be >= (key2a)
        if key1a == key2a
          expect(key1b).to be >= (key2b)
        end
        # expect(key1).to be >= (key2)
      end
      expect(a.size).to be(@total_item_count)
    end

    it '. two fields unspecified asc' do
      # order of 'uid, summary desc' will sort
      # like 'uid asc, summary desc'

      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'uid%20facilityName')

      expect(response.code).to eq(200)
      a1 = hash_to_array(get_hash_items(response.body))

      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'uid%20facilityName%20asc')

      expect(response.code).to eq(200)
      a2 = hash_to_array(get_hash_items(response.body))

      a1.each_with_index do |_, i|
        expect(a1[i]['uid']).to eq(a2[i]['uid'])
        expect(a1[i]['facilityName']).to eq(a2[i]['facilityName'])
      end
      expect(a1.size).to be(@total_item_count)
    end

    it '. non-existing field' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'FieldNoExist%20asc')
      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_item_count)
    end

    it '. case in-sensitive' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'order' => 'FACILITYNAME%20asc')

      # display_items(response.body, 'facilityName')

      expect(response.code).to eq(200)

      # Will not be ordered by 'facilityName'
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1 = a[i + 1]['facilityName'].nil? ? '' : a[i + 1]['facilityName'].to_s
        key2 = a[i]['facilityName'].nil? ? '' : a[i]['facilityName'].to_s
        sorted = key1 < key2 ? false : sorted
      end
      expect(sorted).to be(false)

      expect(a.size).to be(@total_item_count)
    end
  end
end
