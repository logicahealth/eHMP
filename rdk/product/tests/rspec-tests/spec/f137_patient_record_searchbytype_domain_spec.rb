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

describe 'f137_patient_record_searchbytype_domain_spec.rb', debug: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/search/by-type'
    @command_lab = @command + '/lab'
    @command_vital = @command + '/vital'
    @command_immu = @command + '/immunization'

    rdk_sync('10108V420871')
    rdk_sync('5000000341V359724')
    rdk_sync('5000000009V082878')

    # Get count
    response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                       'type' => 'GLUCOSE',
                                       'date.start' => '19001231')
    expect(response.code).to eq(200)
    items = hash_to_array(get_hash_items(response.body))
    @total_lab_item_count = items.size
    puts "total_lab_item_count = #{@total_lab_item_count}"
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command_lab,
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command_lab,
                           'pid' => '',
                           'type' => 'HGB')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command_lab,
                           'pid' => '10108V420871',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 2)], response.body)
    end

    it '. site' do
      response = rdk_fetch(@command_lab,
                           'pid' => 'C877;3',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 2)], response.body)
    end

    it '. with site' do
      response = rdk_fetch(@command_lab,
                           'pid' => '9E7A;100816',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. not found site' do
      response = rdk_fetch(@command_lab,
                           'pid' => 'EEEE;3',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command_lab,
                           'pid' => 'C877;848484',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command_lab,
                           'pid' => '848V484',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(404)
    end

    it '. 5000000009V082878' do
      response = rdk_fetch(@command_lab,
                           'pid' => '5000000009V082878',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command_lab,
                           'pid' => '5000000009v082878',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(404)
    end

    it '. same localId, different site' do
      response = rdk_fetch(@command_lab,
                           'pid' => 'C877;100599',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)

      response = rdk_fetch(@command_lab,
                           'pid' => '9E7A;100599',
                           'type' => 'HGB')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. just site' do
      response = rdk_fetch(@command_lab,
                           'pid' => '9E7A',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(404)
    end

    it '. site with null localid' do
      response = rdk_fetch(@command_lab,
                           'pid' => '9E7A;',
                           'type' => 'HGB')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(404)
    end
  end

  context 'domain' do
    it 'all valid' do
      [%w(lab 5000000341V359724 HGB),
       %w(immunization 5000000009V082878 PNEUMOCOCCAL 19990101),
       %w(vital 10107V395912 TEMPERATURE)].each do |r|
        domain = r[0]
        pid = r[1]
        type_name = r[2]
        date_start = r[3].nil? ? nil : r[3]
        # puts '------------------------'
        # puts e
        # puts pid
        # puts type_name
        # puts date_start
        if date_start.nil?
          response = rdk_fetch(@command + '/' + domain,
                               'pid' => pid,
                               'type' => type_name)
        else
          response = rdk_fetch(@command + '/' + domain,
                               'pid' => pid,
                               'type' => type_name,
                               'date.start' => date_start)
        end
        items = hash_to_array(get_hash_data(response.body))
        expect(response.code).to eq(200)
        expect(items.size).to be >= (1)
      end
    end

    it 'non-existing' do
      response = rdk_fetch(@command + '/' + 'skin',
                           'pid' => '5000000341V359724',
                           'type' => 'HGB')
      expect(response.code).to eq(404)
    end

    it 'omitted' do
      response = rdk_fetch(@command + '/',
                           'pid' => '5000000341V359724',
                           'type' => 'HGB')
      expect(response.code).to eq(400)
    end
  end

  context 'type' do
    it '. nil lab' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => '',
                                         'date.start' => '0')
      expect(response.code).to eq(400)
      # dump(response.body)
    end

    it '. non-existing lab' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'NOT-EXIST',
                                         'date.start' => '0')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. nil vital' do
      response = rdk_fetch(@command_vital, 'pid' => '10107V395912',
                                           'type' => '',
                                           'date.start' => '0')
      expect(response.code).to eq(400)
      # dump(response.body)
    end

    it '. non-existing vital' do
      response = rdk_fetch(@command_vital, 'pid' => '10107V395912',
                                           'type' => 'NOT-EXIST',
                                           'date.start' => '0')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. nil immunization' do
      response = rdk_fetch(@command_immu, 'pid' => '5000000009V082878',
                                          'type' => '',
                                          'date.start' => '0')
      expect(response.code).to eq(400)
      # dump(response.body)
    end

    it '. non-existing immunization' do
      response = rdk_fetch(@command_immu, 'pid' => '5000000009V082878',
                                          'type' => 'NOT-EXIST',
                                          'date.start' => '0')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end
  end

  context 'date.start' do
    it '. nil' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      empty_date_start_count = nested_hash_value(JSON.parse(response.body),
                                                 'totalItems')
      expect(empty_date_start_count).to be >= (1)

      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE')

      expect(response.code).to eq(200)

      no_date_start_count = nested_hash_value(JSON.parse(response.body),
                                              'totalItems')

      expect(empty_date_start_count).to eq(no_date_start_count)
    end

    it 'date.start not numeric' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
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
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
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
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '20321231')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end
  end

  context 'date.end' do
    it '. nil' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.end' => '')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      empty_date_start_count = nested_hash_value(JSON.parse(response.body),
                                                 'totalItems')
      expect(empty_date_start_count).to be >= (1)

      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE')

      expect(response.code).to eq(200)

      no_date_start_count = nested_hash_value(JSON.parse(response.body),
                                              'totalItems')

      expect(empty_date_start_count).to eq(no_date_start_count)
    end

    it 'date.end not numeric' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.end' => '01-JAN-2008')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it 'date.end not well formatted' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.end' => '01/01/2008')

      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it 'date.end future' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE')

      expect(response.code).to eq(200)

      no_date_end_count = nested_hash_value(JSON.parse(response.body),
                                            'totalItems')

      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
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
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.end' => '20150128')
      expect(response.code).to eq(200)
      # puts "one..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')
      # dump(response.body)
      jan_28_date_count = nested_hash_value(JSON.parse(response.body),
                                            'totalItems')
      # verify_response_contains([%w(totalItems 29)], response.body)
      expect(jan_28_date_count).to be >= (28)

      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.end' => '20150129')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "two..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      # verify_response_contains([%w(totalItems 29)], response.body)
      jan_29_date_count = nested_hash_value(JSON.parse(response.body),
                                            'totalItems')
      expect(jan_29_date_count).to eq(jan_28_date_count)

      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
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
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '20141010')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "same..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 2)], response.body)
    end

    it 'date.start later than date.end' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '20150129',
                                         'date.end' => '20140130')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "same..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      # verify_response_contains([%w(totalItems 2)], response.body)
    end

    it 'date.start given, date.end given' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '20150129',
                                         'date.end' => '20150130')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "same..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 2)], response.body)
    end

    it 'date.start omitted, date.end given' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.end' => '20091010')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "AAAAA..............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')
      total_item_count = nested_hash_value(JSON.parse(response.body), 'totalItems')
      expect(total_item_count).to be > (0)
      expect(total_item_count).to be < (@total_lab_item_count)
      #verify_response_contains([%w(totalItems 29)], response.body)
    end

    it 'date.start and date.end same 1' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '20150129',
                                         'date.end' => '20150129')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "BBBBBBB............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it 'date.start and date.end same without time' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '20150130',
                                         'date.end' => '20150130')
      expect(response.code).to eq(200)
      # dump(response.body)
      # puts "CCCCCCCCCC............."
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')

      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it 'date.start and date.end same with time' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
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
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'start' => '')

      expect(response.code).to eq(200)
      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      verify_response_contains([['totalItems',
                                 "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. zero' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'start' => '0')

      expect(response.code).to eq(200)
      # puts "response.code=[#{response.code}]"
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'start' => '1')
      # puts "response.code=[#{response.code}]"
      # dump(response.body)

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count - 1}"
                                ]],
                               response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'start' => '5')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count - 5}"
                                ]],
                               response.body)
    end

    it '. total' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'start' => "#{@total_lab_item_count}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'start' =>
                                           "#{@total_lab_item_count + 1}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. negative' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'start' => '-1')

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'limit' => '0')
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([['totalItems',
                                 "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. null' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'limit' => '')
      # dump(response.body)

      expect(response.code).to eq(200)
    end

    it '. one' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'limit' => '1')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 1)], response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'limit' => '5')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 5)], response.body)
    end

    it '. total' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'limit' => "#{@total_lab_item_count}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command_lab,
                           'pid' => '10108V420871',
                           'type' => 'GLUCOSE',
                           'date.start' => '19001231',
                           'limit' => "#{@total_lab_item_count + 1}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_lab_item_count + 1}"]],
                               response.body)

      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. negative' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'limit' => '-1')

      expect(response.code).to eq(200)
      # puts '-------------------------------'
      # dump(response.body)
      expect(response.code).to eq(200)
      verify_response_contains([['totalItems',
                                 "#{@total_lab_item_count}"],
                                ['currentItemCount',
                                 "#{@total_lab_item_count}"]],
                               response.body)
    end
  end

  context 'order' do
    it '. omitted (default sort order)' do |example|
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231')

      expect(response.code).to eq(200)
      # Default is date in descending order
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        next unless sorted
        sorted = a[i + 1]['observed'] <= a[i]['observed'] && sorted
      end
      unless sorted
        puts "FAILED: #{example.description}"
        display_items(response.body, 'observed')
      end

      expect(sorted).to be(true)
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. one field ascending' do |example|
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' => 'groupName')
      expect(response.code).to eq(200)

      # Verify items are sorted in ascending order
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        next unless sorted
        sorted = a[i + 1]['groupName'] >= a[i]['groupName'] && sorted
        # expect(a[i + 1]['groupName']).to be >= (a[i]['groupName'])
      end
      unless sorted
        puts "FAILED: #{example.description}"
        display_items(response.body, 'groupName')
      end
      expect(sorted).to be(true)
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. one field descending' do |example|
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' => 'groupName%20desc')

      expect(response.code).to eq(200)

      # Verify items are sortedin descending order
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        next unless sorted
        sorted = a[i + 1]['groupName'] <= a[i]['groupName'] && sorted
        # expect(a[i + 1]['groupName']).to be <= (a[i]['groupName'])
      end
      unless sorted
        puts "FAILED: #{example.description}"
        display_items(response.body, 'groupName')
      end
      expect(sorted).to be(true)
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. one field no ascend/descend (default order)' do |example|
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' => 'groupName')
      expect(response.code).to eq(200)

      # Default sorting
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        next unless sorted
        sorted = a[i + 1]['groupName'] >= a[i]['groupName'] && sorted
        # expect(a[i + 1]['groupName']).to be >= (a[i]['groupName'])
      end
      unless sorted
        puts "FAILED: #{example.description}"
        display_items(response.body, 'groupName')
      end
      expect(sorted).to be(true)
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. two fields asc' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' => 'facilityName,result%20asc')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))

      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        key1a = a[i + 1]['facilityName'].nil? ? '' : a[i + 1]['facilityName'].to_s
        key1b = a[i + 1]['result'].nil? ? '' : a[i + 1]['result'].to_s
        key2a = a[i]['facilityName'].nil? ? '' : a[i]['facilityName'].to_s
        key2b = a[i]['result'].nil? ? '' : a[i]['result'].to_s

        key1 = key1a + key1b
        key2 = key2a + key2b

        # puts "expect: i=[#{i}] [#{key1}] >= [#{key2}]"

        expect(key1).to be >= (key2)
      end
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. two fields desc' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' =>
                                           'facilityName%20desc%2Cresult%20asc')
      # dump(response.body)
      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1a = a[i + 1]['facilityName'].nil? ? '' : a[i + 1]['facilityName'].to_s
        key1b = a[i + 1]['result'].nil? ? '' : a[i + 1]['result'].to_s
        key2a = a[i]['facilityName'].nil? ? '' : a[i]['facilityName'].to_s
        key2b = a[i]['result'].nil? ? '' : a[i]['result'].to_s

        # puts "expect: i=[#{i}] [#{key1}] <= [#{key2}]"
        expect(key1a).to be <= (key2a)
        if key1a == key2a
          expect(key1b).to be >= (key2b)
        end
      end
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. two fields unspecified asc' do
      # order of 'uid, summary desc' will sort
      # like 'uid asc, summary desc'

      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' =>
                                           'facilityName,result%20desc')
      expect(response.code).to eq(200)
      a1 = hash_to_array(get_hash_items(response.body))

      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' =>
                                           'facilityName%20asc,result%20desc')

      expect(response.code).to eq(200)
      a2 = hash_to_array(get_hash_items(response.body))

      a1.each_with_index do |_, i|
        expect(a1[i]['facilityName']).to eq(a2[i]['facilityName'])
        expect(a1[i]['result']).to eq(a2[i]['result'])
      end
      expect(a1.size).to be(@total_lab_item_count)
    end

    it '. non-existing field' do
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' => 'FieldNoExist%20asc')
      expect(response.code).to eq(200)

      # Sort sequence is not defined so just check count
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_lab_item_count)
    end

    it '. case in-sensitive' do |example|
      response = rdk_fetch(@command_lab, 'pid' => '10108V420871',
                                         'type' => 'GLUCOSE',
                                         'date.start' => '19001231',
                                         'order' => 'FACILITYNAME%20desc')

      expect(response.code).to eq(200)

      # Will not be sorted
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        sorted = a[i + 1]['facilityName'] <= a[i]['facilityName'] ? false : sorted
      end
      if sorted
        puts "FAILED: #{example.description}"
        display_items(response.body, 'facilityName')
      end

      expect(sorted).to be(false)
      expect(a.size).to be(@total_lab_item_count)
    end
  end
end
