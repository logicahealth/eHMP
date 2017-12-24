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

describe 'f664_patient_record_patient_entered_goals_spec.rb', future: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    puts "TAG IS FUTURE"
    @command = 'resource/patient/record/patient-entered-goals'
    rdk_sync('10108V420871')
    rdk_sync('11010V543403')
    @total_item_count = 8
    puts "@total_item_count = #{@total_item_count}"
  end

  context 'subject.identifier' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '')

      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_data(response.body))
      expect(items.size).to be >= (8)
      # puts response.code
      # dump(response.body)
      # puts "ITEM SIZE [#{items.size}]"
      # verify_response_contains([['totalItems', "#{items.size}"]],
      #                          JSON.parse(response.body))
    end

    it '. site/dfn' do
      response = rdk_fetch(@command,
                           'subject.identifier' => 'SITE;1')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(308)
      expect(response.body).to include('RESTRICTED RECORD')

      # items = hash_to_array(get_hash_items(response.body))
      # expect(items.size).to be >= (7)
      # verify_response_contains([['totalItems', "#{items.size}"]],
      #                         JSON.parse(response.body))
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'subject.identifier' => 'EEEE;1')
      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'subject.identifier' => 'SITE;848484')
      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '848V484')
      expect(response.code).to eq(404)
    end

    it '. UPPER case icn v' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '10108V420871')
      expect(response.code).to eq(200)
      # dump(response.body)
      items = hash_to_array(get_hash_data(response.body))
      expect(items.size).to be >= (@total_item_count)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '10108v420871')
      # puts response.code
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_data(response.body))
      expect(items.size).to be >= (@total_item_count)
    end
  end

  context 'type' do
    it '. empty' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '10108V420871',
                           'type' => '')
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_data(response.body))
      expect(items.size).to be >= (@total_item_count)
    end

    it '. discharge summary' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '10108V420871',
                           'type' => '34745-0')
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_data(response.body))
      expect(items.size).to be >= (@total_item_count)
    end

    it '. others' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '10108V420871',
                           'type' => '34765-8')
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_data(response.body))
      expect(items.size).to be >= (@total_item_count)
    end

    it '. non-existent' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '10108V420871',
                           'type' => '34765-')
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_data(response.body))
      expect(items.size).to be >= (@total_item_count)
    end

    it '. alpha' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '10108V420871',
                           'type' => 'AABBB-8')
      # puts response.code
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_data(response.body))
      expect(items.size).to be >= (@total_item_count)
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'start' => '')

      expect(response.code).to eq(200)

      # expect(key_value(response.body, 'totalItems')).to \
      #   be >= (@total_item_count)

      # expect(key_value(response.body, 'currentItemCount')).to \
      #   eq(key_value(response.body, 'totalItems'))
    end

    it '. zero' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'start' => '0')

      expect(response.code).to eq(200)

      # expect(key_value(response.body, 'totalItems')).to \
      #   be >= (@total_item_count)

      # expect(key_value(response.body, 'currentItemCount')).to \
      #   eq(key_value(response.body, 'totalItems'))
    end

    it '. one' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'start' => '1')

      expect(response.code).to eq(200)

      # expect(key_value(response.body, 'totalItems')).to \
      #   be >= (@total_item_count)

      # expect(key_value(response.body, 'currentItemCount')).to \
      #   eq(key_value(response.body, 'totalItems') - 1)
    end

    it '. nominal' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'start' => '5')

      expect(response.code).to eq(200)

      # expect(key_value(response.body, 'totalItems')).to \
      #   be >= (@total_item_count)

      # expect(key_value(response.body, 'currentItemCount')).to \
      #   eq(key_value(response.body, 'totalItems') - 5)
    end

    it '. total' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'start' => "#{@total_item_count}")

      expect(response.code).to eq(200)

      # expect(key_value(response.body, 'totalItems')).to \
      #   be >= (@total_item_count)

      # expect(key_value(response.body, 'currentItemCount')).to eq(0)
    end

    it '. more than total' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'start' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)

      # expect(key_value(response.body, 'totalItems')).to \
      #   be >= (@total_item_count)

      # expect(key_value(response.body, 'currentItemCount')).to eq(0)
    end

    it '. negative' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'start' => '-1')

      expect(response.code).to eq(200)

      # expect(key_value(response.body, 'totalItems')).to \
      #   be >= (@total_item_count)
      # expect(key_value(response.body, 'itemsPerPage')).to be nil
      # expect(key_value(response.body, 'currentItemCount')).to \
      #   eq(key_value(response.body, 'totalItems'))
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'limit' => '0')
      # dump(response.body)
      expect(response.code).to eq(200)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'limit' => '')
      # dump(response.body)

      expect(response.code).to eq(200)
    end

    it '. one' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'limit' => '1')

      expect(response.code).to eq(200)
      # verify_response_contains([%w(itemsPerPage 1)], JSON.parse(response.body))
    end

    it '. nominal' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'limit' => '5')

      expect(response.code).to eq(200)
      # verify_response_contains([%w(itemsPerPage 5)], JSON.parse(response.body))
    end

    it '. total' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'limit' => "#{@total_item_count}")

      expect(response.code).to eq(200)
      # verify_response_contains([['itemsPerPage',
      #                            "#{@total_item_count}"]],
      #                          JSON.parse(response.body))
    end

    it '. more than total' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'limit' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)
      # verify_response_contains([['itemsPerPage', "#{@total_item_count + 1}"]],
      #                          JSON.parse(response.body))

      # a = hash_to_array(get_hash_items(response.body))
      # expect(a.size).to be(@total_item_count)
    end

    it '. negative' do
      response = rdk_fetch(@command,
                           'subject.identifier' => '11010V543403',
                           'limit' => '-1')

      expect(response.code).to eq(200)
      # verify_response_contains([['totalItems', "#{@total_item_count}"]],
      #                          JSON.parse(response.body))
      # verify_response_contains([['currentItemCount', "#{@total_item_count}"]],
      #                          JSON.parse(response.body))
    end
  end
end
