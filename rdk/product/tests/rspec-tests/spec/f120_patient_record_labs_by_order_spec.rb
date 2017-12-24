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

describe 'f120_patient_record_labs_by_order_spec.rb', debug: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/labs/by-order'
    @total_item_count = 7
    rdk_sync('10108V420871')
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, 'uid' => 'urn:va:order:SITE:227:16682')

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command, 'pid' => '',
                                     'uid' => 'urn:va:order:SITE:227:16682')

      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (7)
      verify_response_contains([['totalItems', "#{items.size}"]],
                               JSON.parse(response.body))
    end

    it '. site/dfn' do
      response = rdk_fetch(@command, 'pid' => 'SITE;227',
                                     'uid' => 'urn:va:order:SITE:227:16682')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (7)
      verify_response_contains([['totalItems', "#{items.size}"]],
                               JSON.parse(response.body))
    end

    it '. not found site' do
      response = rdk_fetch(@command, 'pid' => 'EEEE;227',
                                     'uid' => 'urn:va:order:SITE:227:16682')
      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command, 'pid' => 'SITE;848484',
                                     'uid' => 'urn:va:order:SITE:227:16682')
      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command, 'pid' => '848V484',
                                     'uid' => 'urn:va:order:SITE:227:16682')
      expect(response.code).to eq(404)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command, 'pid' => '11016v630869',
                                     'uid' => 'urn:va:order:SITE:227:16682')
      expect(response.code).to eq(500)
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'start' => '')

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                ['currentItemCount',
                                 "#{@total_item_count}"]],
                               JSON.parse(response.body))
    end

    it '. zero' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'start' => '0')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                ['currentItemCount', "#{@total_item_count}"]],
                               JSON.parse(response.body))
    end

    it '. one' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'start' => '1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                ['currentItemCount', "#{@total_item_count - 1}"
                                ]],
                               JSON.parse(response.body))
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'start' => '5')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                ['currentItemCount', "#{@total_item_count - 5}"
                                ]],
                               JSON.parse(response.body))
    end

    it '. total' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'start' =>
                                       "#{@total_item_count}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                %w(currentItemCount 0)],
                               JSON.parse(response.body))
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'start' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                %w(currentItemCount 0)],
                               JSON.parse(response.body))
    end

    it '. negative' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'start' => '-1')

      expect(response.code).to eq(200)
      # puts 'start - negative -----------------------------------------------'
      # dump(response.body)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                %w(currentItemCount 1)],
                               JSON.parse(response.body))
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'limit' => '0')
      # dump(response.body)
      expect(response.code).to eq(200)
    end

    it '. null' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'limit' => '')
      # dump(response.body)

      expect(response.code).to eq(200)
    end

    it '. one' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'limit' => '1')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 1)], JSON.parse(response.body))
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'limit' => '5')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 5)], JSON.parse(response.body))
    end

    it '. total' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'limit' => "#{@total_item_count}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_item_count}"]],
                               JSON.parse(response.body))
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'limit' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage', "#{@total_item_count + 1}"]],
                               JSON.parse(response.body))

      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_item_count)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'limit' => '-1')
      # puts 'limit - negative ----------------------------------------------'
      # dump(response.body)

      expect(response.code).to eq(200)
      verify_response_contains([['totalItems', "#{@total_item_count}"]],
                               JSON.parse(response.body))
      verify_response_contains([['currentItemCount', "#{@total_item_count}"]],
                               JSON.parse(response.body))
    end
  end

  context 'order' do
    it '. omitted' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682')

      expect(response.code).to eq(200)

      # Expect result NOT to be sorted by uid
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        sorted = a[i + 1]['uid'] < a[i]['uid'] ? false : sorted
      end
      expect(sorted).to be(false)
      expect(a.size).to be(@total_item_count)
    end

    it 'DE1790: . one field ascending' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'order' => 'uid')
      expect(response.code).to eq(200)

      display_items(response.body, 'uid')

      # Verify items are sorted by uid in ascending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['uid']}] >= [#{a[i]['uid']}]"
        expect(a[i + 1]['uid']).to be >= (a[i]['uid'])
      end

      expect(a.size).to be(@total_item_count)
    end

    it 'DE1790: . one field descending' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'order' => 'summary%20desc')

      expect(response.code).to eq(200)

      display_items(response.body, 'summary')

      # Verify items are sorted by summary in descending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['summary']}] " \
        #  "<= [#{a[i]['summary']}]"

        expect(a[i + 1]['summary']).to be <= (a[i]['summary'])
      end
      expect(a.size).to be(@total_item_count)
    end

    it 'DE1790: . one field no ascend/descend (default order)' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'order' => 'summary')
      expect(response.code).to eq(200)

      display_items(response.body, 'summary')

      # Default sorting
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['summary']}] " \
        #  "<= [#{a[i]['summary']}]"

        expect(a[i + 1]['summary']).to be <= (a[i]['summary'])
      end
      expect(a.size).to be(@total_item_count)
    end

    it 'DE1790: . two fields asc' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
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
      expect(a.size).to be(@total_item_count)
    end

    it 'DE1790: . two fields desc' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
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
      expect(a.size).to be(@total_item_count)
    end

    it '. two fields unspecified asc' do
      # order of 'uid, summary desc' will sort
      # like 'uid asc, summary desc'

      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'order' => 'uid,summary%20desc')
      expect(response.code).to eq(200)
      a1 = hash_to_array(get_hash_items(response.body))

      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'order' =>
                                         'uid%20asc,summary%20desc')
      expect(response.code).to eq(200)
      a2 = hash_to_array(get_hash_items(response.body))

      a1.each_with_index do |_, i|
        expect(a1[i]['uid']).to eq(a2[i]['uid'])
        expect(a1[i]['summary']).to eq(a2[i]['summary'])
      end
      expect(a1.size).to be(@total_item_count)
    end

    it '. non-existing field' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:16682',
                                     'order' => 'FieldNoExist%20asc')
      expect(response.code).to eq(200)

      # It will be like no 'order' parameter was specified
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1 = a[i + 1]['uid'].nil? ? '' : a[i + 1]['uid'].to_s
        key2 = a[i]['uid'].nil? ? '' : a[i]['uid'].to_s
        sorted = key1 < key2 ? false : sorted
      end
      expect(sorted).to be(false)

      expect(a.size).to be(@total_item_count)
    end

    it '. case in-sensitive' do
      response = rdk_fetch(@command,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:order:SITE:227:16682',
                           'order' => 'SUMMARY%20asc')
      # puts 'order - case in-sensitive -------------------------------------'
      # display_items(response.body, 'summary')
      expect(response.code).to eq(200)

      # It will be like no 'order' parameter was specified
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1 = a[i + 1]['uid'].nil? ? '' : a[i + 1]['uid'].to_s
        key2 = a[i]['uid'].nil? ? '' : a[i]['uid'].to_s
        sorted = key1 < key2 ? false : sorted
      end
      expect(sorted).to be(false)

      expect(a.size).to be(@total_item_count)
    end
  end

  context 'uid' do
    it 'omitted' do
      response = rdk_fetch(@command, 'pid' => '11016V630869')
      expect(response.code).to eq(400)
    end

    it 'null' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => '')
      expect(response.code).to eq(400)
    end

    it 'upper case' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'URN:VA:ORDER:SITE:227:16682')
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'incomplete' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'truncated' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:227:')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'non-existing domain' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:NOTEXIST:SITE:227:16682')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'upper case urn' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'URN:va:order:SITE:227:16682')
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'upper case va' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:VA:order:SITE:227:16682')
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'upper case domain' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:ORDER:SITE:227:16682')
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'missing urn' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => ':va:order:SITE:227:16682')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'missing va' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn::order:SITE:227:16682')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'missing domain' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va::SITE:227:16682')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'missing site' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order::227:16682')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'missing all' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => ':::::')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'another uid' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:vital:SITE:100022:29165')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end

    it 'partial uid' do
      response = rdk_fetch(@command, 'pid' => '11016V630869',
                                     'uid' => 'urn:va:order:SITE:100022:29165')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               JSON.parse(response.body))
    end
  end
end
