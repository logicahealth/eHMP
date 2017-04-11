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

describe 'f664_patient_record_labs_by_panel_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/labs/by-panel'
    rdk_sync('10108V420871')
    rdk_sync('11010V543403')

    @total_item_count = 55
    @json_array_size = 25

    response = rdk_fetch(@command, 'pid' => '11010V543403')

    expect(response.code).to eq(200)

    # We expect actual count to be at least what is in @total_item_count
    # Then adjust the count to be what is really returned
    expect(key_value(response.body, 'totalItems')).to \
      be >= (@total_item_count)
    @total_item_count = key_value(response.body, 'totalItems')

    puts "@total_item_count = #{@total_item_count}"
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command, 'pid' => '')

      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command, 'pid' => '11010V543403')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (25)
      # puts response.code
      # dump(response.body)
      # puts "ITEM SIZE [#{items.size}]"
      # verify_response_contains([['totalItems', "#{items.size}"]],
      #                          JSON.parse(response.body))
    end

    it '. site/dfn' do
      response = rdk_fetch(@command, 'pid' => '9E7A;1')
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
      response = rdk_fetch(@command, 'pid' => 'EEEE;1')
      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command, 'pid' => '9E7A;848484')
      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command, 'pid' => '848V484')
      expect(response.code).to eq(404)
    end

    it '. UPPER case icn v' do
      response = rdk_fetch(@command, 'pid' => '10108V420871')
      # puts response.code
      # dump(response.body)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE [#{items.size}]"
      expect(items.size).to be >= 373
      expect(response.code).to eq(200)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command, 'pid' => '10108v420871')
      # expect(response.code).to eq(500)
      # expect(response.body).to include('Not Found')
      expect(response.code).to eq(404)
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'start' => '')

      expect(response.code).to eq(200)

      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)

      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. zero' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'start' => '0')

      expect(response.code).to eq(200)

      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)

      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. one' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'start' => '1')

      expect(response.code).to eq(200)

      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)

      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems') - 1)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'start' => '5')

      expect(response.code).to eq(200)

      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)

      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems') - 5)
    end

    it '. total' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'start' =>
                                       "#{@total_item_count}")

      expect(response.code).to eq(200)

      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)

      expect(key_value(response.body, 'currentItemCount')).to eq(0)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'start' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)

      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)

      expect(key_value(response.body, 'currentItemCount')).to eq(0)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'start' => '-1')

      expect(response.code).to eq(200)
      # puts 'start - negative -----------------------------------------------'
      # dump(response.body)
      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)
      expect(key_value(response.body, 'itemsPerPage')).to be nil
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'limit' => '0')
      # dump(response.body)
      expect(response.code).to eq(200)
      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. null' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'limit' => '')
      # dump(response.body)

      expect(response.code).to eq(200)
      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end

    it '. one' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'limit' => '1')

      expect(response.code).to eq(200)
      expect(key_value(response.body, 'itemsPerPage')).to eq(1)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'limit' => '5')

      expect(response.code).to eq(200)
      expect(key_value(response.body, 'itemsPerPage')).to eq(5)
    end

    it '. total' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'limit' => "#{@total_item_count}")

      expect(response.code).to eq(200)
      expect(key_value(response.body, 'itemsPerPage')).to \
        be >= (@total_item_count)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'limit' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)
      # dump(response.body)
      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)
      expect(key_value(response.body, 'itemsPerPage')).to \
        eq(key_value(response.body, 'totalItems') + 1)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'pid' => '11010V543403',
                                     'limit' => '-1')
      # puts 'limit - negative ----------------------------------------------'
      # dump(response.body)

      expect(response.code).to eq(200)
      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)
      expect(key_value(response.body, 'itemsPerPage')).to be nil
      expect(key_value(response.body, 'currentItemCount')).to \
        eq(key_value(response.body, 'totalItems'))
    end
  end

  context 'filter' do
    it 'no filter' do
      response = rdk_fetch(@command,
                           'pid' => '11010V543403')
      # dump(response.body)
      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be <= (@total_item_count)
      expect(a.size).to be >= (@json_array_size)
      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)
    end

    it 'syntax error' do
      response = rdk_fetch(@command,
                           'pid' => '11010V543403',
                           'filter' => 'ilike(xxxxxxx%22HDL%22)')

      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be <= (@total_item_count)
      expect(a.size).to be >= (@json_array_size)
      expect(key_value(response.body, 'totalItems')).to \
        be >= (@total_item_count)
    end

    it '. non-existing field ' do
      response = rdk_fetch(@command,
                           'pid' => '11010V543403',
                           'filter' => 'ilike(xxxxxxx,%22HDL%22)')
      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to eq(0)
      # expect(a.size).to be <= (@total_item_count)
      # expect(a.size).to be >= (@json_array_size)
      # expect(key_value(response.body, 'totalItems')).to \
      #   be >= (@total_item_count)
    end

    it '. exact match' do
      response = rdk_fetch(@command,
                           'pid' => '11010V543403',
                           'filter' => 'ilike(specimen,%22LYMPH%20NODES%22)')
      # dump(response.body)
      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be >= (2)
      verify_response_contains([['totalItems', "#{a.size}"]],
                               response.body)
    end

    it '. no exact match' do
      response = rdk_fetch(@command,
                           'pid' => '11010V543403',
                           'filter' => 'ilike(specimen,%22NOMATCH%22)')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it '. wild card match' do
      response = rdk_fetch(@command,
                           'pid' => '11010V543403',
                           'filter' => 'ilike(specimen,%22%25MARROW%25%22)')

      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be >= (2)
      verify_response_contains([['totalItems', "#{a.size}"]],
                               response.body)
    end

    it '. wild card no match' do
      response = rdk_fetch(@command,
                           'pid' => '11010V543403',
                           'filter' => 'ilike(specimen,%22XYZH%25%22)')

      expect(response.code).to eq(200)
      # a = hash_to_array(get_hash_items(response.body))
      # expect(a.size).to eq(56)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end
  end
end
