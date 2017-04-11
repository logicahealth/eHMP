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

describe 'f144_patient_record_cwad_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/cwad'

    response = rdk_fetch(@command, 'pid' => '10108V420871')

    items = hash_to_array(get_hash_items(response.body))
    @total_item_count = items.size
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
      response = rdk_fetch(@command, 'pid' => '10108V420871')

      expect(response.code).to eq(200)
      # display_items(response.body, 'kind')

      verify_response_contains_item([['kind', 'Advance Directive']],
                                    hash_to_array(get_hash_items(response.body)
                                    ))
      verify_response_contains_item([['kind', 'Crisis Note']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))
      verify_response_contains_item([['kind', 'Allergy/Adverse Reaction']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))

      # Last count, there where 23 items, so verify that there is at least
      # that many.
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (23)
      verify_response_contains([['totalItems', "#{@total_item_count}"]],
                               response.body)
    end

    it '. site' do
      response = rdk_fetch(@command, 'pid' => 'C877;3')

      expect(response.code).to eq(200)
      # display_items(response.body, 'kind')

      verify_response_contains_item([['kind', 'Advance Directive']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))
      verify_response_contains_item([['kind', 'Crisis Note']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))
      verify_response_contains_item([['kind', 'Allergy/Adverse Reaction']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))

      verify_response_contains([['totalItems', "#{@total_item_count}"]],
                               response.body)
    end

    it '. with site' do |example|
      response = rdk_fetch(@command, 'pid' => '9E7A;100816')

      expect(response.code).to eq(200)
      # display_items(response.body, 'kind')

      verify_response_contains_item([['kind', 'Advance Directive']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))
      verify_response_contains_item([['kind', 'Allergy/Adverse Reaction']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))

      puts "Example=[#{example.description}] " \
        "totalItems=[#{nested_hash_value(JSON.parse(response.body), \
                                         'totalItems')}] "

      items = hash_to_array(get_hash_items(response.body))
      verify_response_contains([['totalItems', "#{items.size}"]], response.body)
      # verify_response_contains([%w(totalItems 2)]
    end

    it '. not found site' do
      response = rdk_fetch(@command, 'pid' => 'EEEE;3')

      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command, 'pid' => 'C877;848484')

      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command, 'pid' => '848V484')

      expect(response.code).to eq(404)
    end

    it '. upper case V (normal)' do |example|
      response = rdk_fetch(@command, 'pid' => '5000000009V082878')
      expect(response.code).to eq(200)

      verify_response_contains_item([['kind', 'Advance Directive']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))
      verify_response_contains_item([['kind', 'Allergy/Adverse Reaction']],
                                    hash_to_array(get_hash_items(response.body)
                                   ))

      puts "Example=[#{example.description}] " \
        "totalItems=[#{nested_hash_value(JSON.parse(response.body), \
                                         'totalItems')}] "

      items = hash_to_array(get_hash_items(response.body))
      verify_response_contains([['totalItems', "#{items.size}"]], response.body)
      # verify_response_contains([%w(totalItems 2)], response.body)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command, 'pid' => '5000000009v082878')
      expect(response.code).to eq(400)
      # expect(get_hash_data(response.body)['error']['code']).to eq(404)
      # expect(get_hash_data(response.body)['error']['message']).to \
      #   eq('Not Found')
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command, 'pid' => '10108V420871')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                ['currentItemCount',
                                 "#{@total_item_count}"]],
                               response.body)
    end

    it '. zero' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'start' => '0')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                ['currentItemCount', "#{@total_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'start' => '1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                ['currentItemCount', "#{@total_item_count - 1}"
                                ]],
                               response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'start' => '5')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                ['currentItemCount', "#{@total_item_count - 5}"
                                ]],
                               response.body)
    end

    it '. total' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'start' =>
                                       "#{@total_item_count}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'start' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'start' => '-1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'limit' => '0')
      # dump(response.body)
      expect(response.code).to eq(200)
    end

    it '. null' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'limit' => '')
      dump(response.body)

      # expect(response.code).to eq(200)
      expect(response.code).to eq(500)
    end

    it '. one' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'limit' => '1')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 1)], response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'limit' => '5')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 5)], response.body)
    end

    it '. total' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'limit' => "#{@total_item_count}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_item_count}"]],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'limit' => "#{@total_item_count + 1}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage', "#{@total_item_count + 1}"]],
                               response.body)

      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_item_count)
    end

    it '. negative' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'limit' => '-1')

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage', '-1']], response.body)
    end
  end

  context 'order' do
    it '. omitted' do
      response = rdk_fetch(@command, 'pid' => '10108V420871')

      expect(response.code).to eq(200)

      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        unless a[i + 1]['author'].nil?
          sorted = a[i + 1]['author'] < a[i]['author'] ? false : sorted
        end
      end
      expect(sorted).to be(false)
      expect(a.size).to be(@total_item_count)
    end

    it '. one field ascending' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' => 'author%20asc')
      expect(response.code).to eq(200)

      # Verify items are sorted by author in ascending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        unless a[i]['author'].nil?
          # puts a[i]['author']
          expect(a[i + 1]['author']).to be >= (a[i]['author'])
        end
      end

      expect(a.size).to be(@total_item_count)
    end

    it '. one field descending' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' => 'author%20desc')

      expect(response.code).to eq(200)

      # Verify items are sorted by author in descending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        unless a[i + 1]['author'].nil?
          # puts a[i]['author']
          expect(a[i + 1]['author']).to be <= (a[i]['author'])
        end
      end
      expect(a.size).to be(@total_item_count)
    end

    it '. one field no ascend/descend' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' => 'author')
      expect(response.code).to eq(400)
    end

    it '. two fields asc' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' => 'author,localId%20asc')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))

      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        key1a = a[i + 1]['author'].nil? ? '' : a[i + 1]['author'].to_s
        key1b = a[i + 1]['localId'].nil? ? '' : a[i + 1]['localId'].to_s
        key2a = a[i]['author'].nil? ? '' : a[i]['author'].to_s
        key2b = a[i]['localId'].nil? ? '' : a[i]['localId'].to_s

        key1 = key1a + key1b
        key2 = key2a + key2b

        expect(key1).to be >= (key2)
      end
      expect(a.size).to be(@total_item_count)
    end

    it '. two fields desc' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' =>
                                         'author%20desc,localId%20desc')

      expect(response.code).to eq(200)

      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1a = a[i + 1]['author'].nil? ? '' : a[i + 1]['author'].to_s
        key1b = a[i + 1]['localId'].nil? ? '' : a[i + 1]['localId'].to_s
        key2a = a[i]['author'].nil? ? '' : a[i]['author'].to_s
        key2b = a[i]['localId'].nil? ? '' : a[i]['localId'].to_s

        key1 = key1a + key1b
        key2 = key2a + key2b
        # puts "[#{key1}] <= [#{key2}]"

        expect(key1).to be <= (key2)
      end
      expect(a.size).to be(@total_item_count)
    end

    it '. two fields unspecified asc' do
      # order of 'author, localId desc' will sort
      # like 'author asc, localId desc'

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' => 'author,localId%20desc')
      expect(response.code).to eq(200)
      a1 = hash_to_array(get_hash_items(response.body))

      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' =>
                                         'author%20asc,localId%20desc')
      expect(response.code).to eq(200)
      a2 = hash_to_array(get_hash_items(response.body))

      a1.each_with_index do |_, i|
        expect(a1[i]['author']).to eq(a2[i]['author'])
        expect(a1[i]['localId']).to eq(a2[i]['localId'])
      end
      expect(a1.size).to be(@total_item_count)
    end

    it '. non-existing field' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' => 'FieldNoExist%20asc')
      expect(response.code).to eq(200)

      # It will be like no 'order' parameter was specified
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1 = a[i + 1]['author'].nil? ? '' : a[i + 1]['author'].to_s
        key2 = a[i]['author'].nil? ? '' : a[i]['author'].to_s
        sorted = key1 < key2 ? false : sorted
      end
      expect(sorted).to be(false)

      expect(a.size).to be(@total_item_count)
    end

    it '. case in-sensitive' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'order' => 'AUTHOR%20asc')
      # dump(response.body)
      # display_items(response.body, 'author')
      expect(response.code).to eq(200)

      # It will be like no 'order' parameter was specified
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)

        key1 = a[i + 1]['author'].nil? ? '' : a[i + 1]['author'].to_s
        key2 = a[i]['author'].nil? ? '' : a[i]['author'].to_s
        sorted = key1 < key2 ? false : sorted
      end
      expect(sorted).to be(false)
    end
  end

  context 'filter' do
    it 'no filter' do
      response = rdk_fetch(@command, 'pid' => '10108V420871')

      expect(response.code).to eq(200)
      verify_response_contains([['totalItems', "#{@total_item_count}"]],
                               response.body)
    end

    it 'Wild card' do |example|
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'filter' =>
                                         'ilike(kind,%22%25Advance%25%22)')

      expect(response.code).to eq(200)

      puts "Example=[#{example.description}] " \
        "totalItems=[#{nested_hash_value(JSON.parse(response.body), \
                                         'totalItems')}] "

      items = hash_to_array(get_hash_items(response.body))
      verify_response_contains([['totalItems', "#{items.size}"]], response.body)

      # verify_response_contains([%w(totalItems 7)], response.body)
    end

    it '. exact match' do |example|
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'filter' =>
                                       'ilike(kind,%22Advance%20Directive%22)')

      expect(response.code).to eq(200)

      puts "Example=[#{example.description}] " \
        "totalItems=[#{nested_hash_value(JSON.parse(response.body), \
                                         'totalItems')}] "

      items = hash_to_array(get_hash_items(response.body))
      verify_response_contains([['totalItems', "#{items.size}"]], response.body)

      # verify_response_contains([%w(totalItems 7)], response.body)
    end

    it '. filter no match with wild card' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'filter' =>
                                         'ilike(kind,%22%25XXXXX%25%22)')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. filter no match' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'filter' =>
                                         'ilike(kind,%22Advance%20Directiv%22)')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)], response.body)
    end

    it '. filter wild card end match' do |example|
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'filter' =>
                                         'ilike(kind,%22%25%20Directive%22)')
      expect(response.code).to eq(200)

      puts "Example=[#{example.description}] " \
        "totalItems=[#{nested_hash_value(JSON.parse(response.body), \
                                         'totalItems')}] "

      items = hash_to_array(get_hash_items(response.body))
      verify_response_contains([['totalItems', "#{items.size}"]], response.body)

      # verify_response_contains([%w(totalItems 7)], response.body)
    end

    it '. filter wild card begin match' do |example|
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'filter' =>
                                         'ilike(kind,%22Advance%20%25%22)')
      expect(response.code).to eq(200)

      puts "Example=[#{example.description}] " \
        "totalItems=[#{nested_hash_value(JSON.parse(response.body), \
                                         'totalItems')}] "

      items = hash_to_array(get_hash_items(response.body))
      verify_response_contains([['totalItems', "#{items.size}"]], response.body)

      # verify_response_contains([%w(totalItems 7)], response.body)
    end

    it '. filter Upper case match' do |example|
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'filter' =>
                                         'ilike(kind,%22ADVANCE%20%25%22)')
      expect(response.code).to eq(200)

      puts "Example=[#{example.description}] " \
        "totalItems=[#{nested_hash_value(JSON.parse(response.body), \
                                         'totalItems')}] "

      items = hash_to_array(get_hash_items(response.body))
      verify_response_contains([['totalItems', "#{items.size}"]], response.body)

      # verify_response_contains([%w(totalItems 7)], response.body)
    end

    it '. filter lower case match' do |example|
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'filter' =>
                                         'ilike(kind,%22advance%20%25%22)')
      expect(response.code).to eq(200)
      puts "Example=[#{example.description}] " \
        "totalItems=[#{nested_hash_value(JSON.parse(response.body), \
                                         'totalItems')}] "

      items = hash_to_array(get_hash_items(response.body))
      verify_response_contains([['totalItems', "#{items.size}"]], response.body)

      # verify_response_contains([%w(totalItems 7)], response.body)
    end
  end
end
