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

describe 'f664_patient_record_labs_by_type_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/labs/by-type'
    @total_item_count = 2
    # @total_lab_item_count = 31
    rdk_sync('10108V420871')

    response = rdk_fetch(@command, 'pid' => '10108V420871',
                                   'type.name' => 'GLUCOSE',
                                   'date.start' => '0')
    items = hash_to_array(get_hash_items(response.body))
    @total_lab_item_count = items.size
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, 'type.name' => 'POTASSIUM')

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command, 'pid' => '',
                                     'type.name' => 'POTASSIUM')

      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'POTASSIUM')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (2)
      verify_response_contains([['totalItems', "#{items.size}"]],
                               response.body)
    end

    it '. site/dfn' do
      response = rdk_fetch(@command, 'pid' => '9E7A;3',
                                     'type.name' => 'POTASSIUM')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (2)
      # puts "ITEM SIZE=[#{items.size}]"
      verify_response_contains([['totalItems', "#{items.size}"]],
                               response.body)
    end

    it '. not found site' do
      response = rdk_fetch(@command, 'pid' => 'EEEE;3',
                                     'type.name' => 'POTASSIUM')
      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command, 'pid' => '9E7A;848484',
                                     'type.name' => 'POTASSIUM')
      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command, 'pid' => '848V484',
                                     'type.name' => 'POTASSIUM')
      expect(response.code).to eq(404)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command, 'pid' => '10108v420871',
                                     'type.name' => 'POTASSIUM')
      expect(response.code).to eq(404)
    end
  end

  context 'type.name' do
    it '. nil' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'date.start' => '0')
      expect(response.code).to eq(400)
      # dump(response.body)
    end

    it '. empty' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => '',
                                     'date.start' => '0')
      expect(response.code).to eq(400)
      # dump(response.body)

      # verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. non-existing' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'NOT-EXIST',
                                     'date.start' => '0')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. lower case' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'potassium',
                                     'date.start' => '0')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. mixed case' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'pOtAssIUm',
                                     'date.start' => '0')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. upper case' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0')
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. compound' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'POTASSIUM%2CGLUCOSE',
                                     'date.start' => '0')
      expect(response.code).to eq(200)
      # dump(response.body)

      verify_response_contains([%w(totalItems 0)], response.body)
    end
  end

  context 'date.start' do
    it '. nil' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      empty_date_start_count = nested_hash_value(JSON.parse(response.body),
                                                 'totalItems')
      expect(empty_date_start_count).to be >= (1)

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE')

      expect(response.code).to eq(200)

      no_date_start_count = nested_hash_value(JSON.parse(response.body),
                                              'totalItems')

      expect(empty_date_start_count).to eq(no_date_start_count)
    end

    it 'date.start not numeric' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '01-JAN-2008')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([['totalItems',
                                 "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it 'date.start not well formatted' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '01/01/2008')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([['totalItems',
                                 "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it 'date.start future' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '20321231')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end
  end

  context 'date.end' do
    it '. nil' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.end' => '')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      empty_date_start_count = nested_hash_value(JSON.parse(response.body),
                                                 'totalItems')
      expect(empty_date_start_count).to be >= (1)

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE')

      expect(response.code).to eq(200)

      no_date_start_count = nested_hash_value(JSON.parse(response.body),
                                              'totalItems')

      expect(empty_date_start_count).to eq(no_date_start_count)
    end

    it 'date.end not numeric' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.end' => '01-JAN-2008')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it 'date.end not well formatted' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.end' => '01/01/2008')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it 'date.end future' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE')

      expect(response.code).to eq(200)

      no_date_end_count = nested_hash_value(JSON.parse(response.body),
                                            'totalItems')

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.end' => '20321231')

      future_date_end_count = nested_hash_value(JSON.parse(response.body),
                                                'totalItems')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      expect(future_date_end_count).to be >= (no_date_end_count)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"]],
                               response.body)
    end

    it 'date.end past' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.end' => '20150128')
      expect(response.code).to eq(200)
      # puts "one..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')
      # dump(response.body)
      jan_28_date_count = nested_hash_value(JSON.parse(response.body),
                                            'totalItems')
      # verify_response_contains([%w(totalItems 29)], response.body)
      expect(jan_28_date_count).to be >= (@total_lab_item_count - 2)

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.end' => '20150129')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "two..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      # verify_response_contains([%w(totalItems 29)], response.body)
      jan_29_date_count = nested_hash_value(JSON.parse(response.body),
                                            'totalItems')
      expect(jan_29_date_count).to eq(jan_28_date_count)

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.end' => '20150130')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "three..............."
      expect(nested_hash_value(JSON.parse(response.body), 'totalItems')).to \
        be > (jan_29_date_count)

      # verify_response_contains([%w(totalItems 31)], response.body)
    end
  end

  context 'date.start, date.end' do
    it 'date.start given, date.end omitted' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '20141010')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "same..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 2)], response.body)
    end

    it 'date.start later than date.end' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '20150129',
                                     'date.end' => '20140130')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "same..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      # verify_response_contains([%w(totalItems 2)], response.body)
    end

    it 'date.start given, date.end given' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '20150129',
                                     'date.end' => '20150130')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "same..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 2)], response.body)
    end

    it 'date.start omitted, date.end given' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.end' => '20091010')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "AAAAA..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')
      total_item_count = nested_hash_value(JSON.parse(response.body),
                                           'totalItems')
      expect(total_item_count).to be > (0)
      expect(total_item_count).to be < (@total_lab_item_count)
      #verify_response_contains([%w(totalItems 29)], response.body)
    end

    it 'date.start and date.end same 1' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '20150129',
                                     'date.end' => '20150129')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "BBBBBBB............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it 'date.start and date.end same without time' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '20150130',
                                     'date.end' => '20150130')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "CCCCCCCCCC............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it 'date.start and date.end same with time' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '20150129000000',
                                     'date.end' => '20150129235959')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "CCCCCCCCCC............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 2)], response.body)
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'start' => '')

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. zero' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'start' => '0')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'start' => '1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count - 1}"
                                ]],
                               response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'start' => '5')

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count - 5}"
                                ]],
                               response.body)
    end

    it '. total' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'start' =>
                                       "#{@total_lab_item_count}")

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)

      # verify_response_contains([%w(totalItems 2),
      #                           %w(currentItemCount 0)],
      #                          response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'start' => "#{@total_lab_item_count + 1}")

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
      # verify_response_contains([%w(totalItems 2),
      #                           %w(currentItemCount 0)],
      #                          response.body)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'start' => '-1')

      expect(response.code).to eq(200)
      # puts 'start - negative -----------------------------------------------'
      # dump(response.body)

      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
      # verify_response_contains([%w(totalItems 2),
      #                           %w(currentItemCount 2)],
      #                          response.body)
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'limit' => '0')
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"]],
                               response.body)
      verify_response_contains([['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. null' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'limit' => '')
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"]],
                               response.body)
      verify_response_contains([['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'limit' => '1')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 1)], response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'limit' => '5')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 5)], response.body)
    end

    it '. total' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'limit' => "#{@total_lab_item_count}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'limit' => "#{@total_lab_item_count + 1}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_lab_item_count + 1}"]],
                               response.body)

      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'limit' => '-1')
      # puts 'limit - negative ----------------------------------------------'
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"]],
                               response.body)
      verify_response_contains([['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end
  end

  context 'order' do
    it '. omitted' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0')

      expect(response.code).to eq(200)

      # Expect result NOT to be sorted by uid
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        sorted = a[i + 1]['uid'] < a[i]['uid'] ? false : sorted
      end
      expect(sorted).to be(false)
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. one field ascending' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' => 'uid')
      expect(response.code).to eq(200)

      # display_items(response.body, 'uid')

      # Verify items are sorted by uid in ascending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['uid']}] >= [#{a[i]['uid']}]"
        expect(a[i + 1]['uid']).to be >= (a[i]['uid'])
      end

      expect(a.size).to be(@total_lab_item_count)
    end

    it '. one field descending' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' => 'summary%20desc')

      expect(response.code).to eq(200)

      # display_items(response.body, 'summary')

      # Verify items are sorted by summary in descending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['summary']}] " \
        #  "<= [#{a[i]['summary']}]"

        expect(a[i + 1]['summary']).to be <= (a[i]['summary'])
      end
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. one field no ascend/descend (default order)' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' => 'summary')
      expect(response.code).to eq(200)

      # display_items(response.body, 'summary')

      # Default sorting which is ascending
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['summary']}] " \
        #     ">= [#{a[i]['summary']}]"

        expect(a[i + 1]['summary']).to be >= (a[i]['summary'])
      end
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. two fields asc' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' => 'uid,summary%20asc')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))

      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        key1a = a[i + 1]['uid'].nil? ? '' : a[i + 1]['uid'].to_s
        key1b = a[i + 1]['summary'].nil? ? '' : a[i + 1]['summary'].to_s
        key2a = a[i]['uid'].nil? ? '' : a[i]['uid'].to_s
        key2b = a[i]['summary'].nil? ? '' : a[i]['summary'].to_s

        key1 = key1a + key1b
        key2 = key2a + key2b

        # puts "expect: i=[#{i}] [#{key1}] >= [#{key2}]"

        expect(key1).to be >= (key2)
      end
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. two fields desc' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' =>
                                         'uid%20desc,summary%20desc')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1a = a[i + 1]['uid'].nil? ? '' : a[i + 1]['uid'].to_s
        key1b = a[i + 1]['summary'].nil? ? '' : a[i + 1]['summary'].to_s
        key2a = a[i]['uid'].nil? ? '' : a[i]['uid'].to_s
        key2b = a[i]['summary'].nil? ? '' : a[i]['summary'].to_s

        key1 = key1a + key1b
        key2 = key2a + key2b
        # puts "expect: i=[#{i}] [#{key1}] <= [#{key2}]"

        expect(key1).to be <= (key2)
      end
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. two fields unspecified asc' do
      # order of 'uid, summary desc' will sort
      # like 'uid asc, summary desc'

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' => 'uid,summary%20desc')
      expect(response.code).to eq(200)
      a1 = hash_to_array(get_hash_items(response.body))

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' =>
                                         'uid%20asc,summary%20desc')
      expect(response.code).to eq(200)
      a2 = hash_to_array(get_hash_items(response.body))

      a1.each_with_index do |_, i|
        expect(a1[i]['uid']).to eq(a2[i]['uid'])
        expect(a1[i]['summary']).to eq(a2[i]['summary'])
      end
      expect(a1.size).to be(@total_lab_item_count)
    end

    it '. non-existing field' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' => 'FieldNoExist%20asc')
      expect(response.code).to eq(200)

      # It will be like no 'order' parameter was specified
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1 = a[i + 1]['summary'].nil? ? '' : a[i + 1]['summary'].to_s
        key2 = a[i]['summary'].nil? ? '' : a[i]['summary'].to_s
        sorted = key1 < key2 ? false : sorted
      end
      expect(sorted).to be(false)

      expect(a.size).to be(@total_lab_item_count)
    end

    it '. case in-sensitive' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'type.name' => 'GLUCOSE',
                                     'date.start' => '0',
                                     'order' => 'SUMMARY%20asc')
      # puts 'order - case in-sensitive -------------------------------------'
      # display_items(response.body, 'summary')
      expect(response.code).to eq(200)

      # Will not be ordered by 'summary'
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1 = a[i + 1]['summary'].nil? ? '' : a[i + 1]['summary'].to_s
        key2 = a[i]['summary'].nil? ? '' : a[i]['summary'].to_s
        sorted = key1 < key2 ? false : sorted
      end
      expect(sorted).to be(false)

      expect(a.size).to be(@total_lab_item_count)
    end
  end
end
