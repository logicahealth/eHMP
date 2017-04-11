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

describe 'f117_patient_record_search_text_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/search/text'

    response = rdk_fetch(@command,
                         'pid' => '10107V395912',
                         'query' => 'blood')

    items = hash_to_array(get_hash_items(response.body))
    @all_match_count = items.size

    puts "all_match_count=[#{@all_match_count}]"

    response = rdk_fetch(@command,
                         'pid' => '10108V420871',
                         'query' => 'eight')

    items = hash_to_array(get_hash_items(response.body))
    @eight_match_count = items.size
    puts "eight_match_count=[#{@eight_match_count}]"
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, {})
      if response.code == 401
        expect(response.code).to eq(401)
      else
        expect(response.code).to eq(403)
      end
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
      expect(items.size).to be >= (55)
    end

    it '. site' do
      response = rdk_fetch(@command,
                           'pid' => 'C877;3',
                           'query' => 'blood')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (27)
    end

    it '. with site' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;100816',
                           'query' => 'blood')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(0)
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'pid' => 'EEEE;3',
                           'query' => 'blood')

      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'pid' => 'C877;848484',
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
      if items.size == 0
        dump(response.body)
      end
      expect(items.size).to be >= (1)
    end

    it '. lower case icn v: ISSUE #2' do # |example|
      response = rdk_fetch(@command,
                           'pid' => '5000000009v082878',
                           'query' => 'blood')
      # dump(response.body)
      expect(response.code).to eq(400)
    end
  end

  context 'query' do
    it '. nominal/lower case' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'head')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      # expect(items.size).to be >= (6)
      expect(items.size).to be >= (2)
    end

    it '. UPPER CASE' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'HEAD')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      # expect(items.size).to be >= (6)
      expect(items.size).to be >= (2)
    end

    it '. Mixed Case' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'hEAd')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      # expect(items.size).to be >= (6)
      expect(items.size).to be >= (2)
    end

    it '. Compound word (match)' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'brain%20imaging')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      expect(items.size).to be >= (6)
    end

    it '. No match' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'n888238sf')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(0)

      query_value = nested_hash_value(JSON.parse(response.body), 'query')
      expect(query_value).to eq('n888238sf')
    end

    it '. Compound word (may match): DE2243' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'head%20ct')
      # puts 'DE2243----------------------------------------'
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(0)
    end

    it '. Compound word (triple word): DE2243' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'head%20ct%20scan')
      # puts 'DE2243----------------------------------------'
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"

      #expect(items.size).to be > (0)
      #items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(0)
    end

    it '. Compound word (quadruple word): DE2243' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'm%20head%20ct%20scan')

      expect(response.code).to eq(500)
    end
  end

  context 'types' do
    it 'all (default) domains' do
      # document-view
      # parent-documents
      # newsfeed
      # patient
      # vlerdocument
      %w(allergy
         appointment
         consult
         cpt
         education
         exam
         factor
         image
         immunization
         mh
         obs
         pov
         procedure
         ptf
         rad
         skin
         surgery
         treatment
         visit
      ).each do |e|
        if e == 'accession'
          pid = '10108V420871'
        elsif e == 'skin'
          pid = '5000000341V359724'
        elsif e == 'ptf'
          pid = '9E7A;71'
        else
          pid = '10107V395912'
        end
        puts "************ [#{e}] ****************************************"
        response = rdk_fetch(@command,
                             'pid' => pid,
                             'query' => 'blood',
                             'types' => e)
        # puts "--->Domain request [#{e}] [#{response.code}]"
        # dump(response.body)
        expect(response.code).to eq(400)
        # items = hash_to_array(get_hash_items(response.body))

        # if e == 'procedure'
        #   expected_item_count = 2
        # else
        #   expected_item_count = 0
        # end

        # puts "items=[#{items.size}] expected to be >= (#{expected_item_count})"
        # expect(items.size).to be >= (expected_item_count)
      end
    end

    it 'all (specialized) domains' do
      [%w(document 6),
       %w(lab 27),
       %w(med 15),
       %w(order 20),
       %w(problem 4),
       %w(vital 1),
       %w(result 27)
      ].each do |row|
        e = row[0]
        count = row[1].to_i
        pid = '10108V420871' # '10107V395912'
        if e == 'med'
          query = 'tablet'
        elsif e == 'problem'
          query = 'pain'
        else
          query = 'blood'
        end
        puts "************ [#{e}] ****************************************"
        response = rdk_fetch(@command,
                             'pid' => pid,
                             'query' => query,
                             'types' => e)
        # puts "Domain request [#{e}] [#{response.code}]"
        expect(response.code).to eq(200)
        items = hash_to_array(get_hash_items(response.body))

        puts "items=[#{items.size}] expected to be >= (#{count})"
        expect(items.size).to be >= (count)
      end
    end

    it 'non-existing' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'types' => 'non-existing-type')

      expect(response.code).to eq(400)
    end

    it 'multiple (both specialized (same) query)' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'types' => 'lab%2Cresult')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expected_item_count = 20

      puts "items=[#{items.size}] expected to be >= (#{expected_item_count})"
      expect(items.size).to be >= (expected_item_count)
    end

    it 'multiple (both specialized (different) query)' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'types' => 'lab%2Cdocument')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expected_item_count = 15
      # dump(response.body)
      puts "items=[#{items.size}] expected to be >= (#{expected_item_count})"
      expect(items.size).to be >= (expected_item_count)
    end

    it 'multiple (both default query)' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'types' => 'vital%2Cdocument')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expected_item_count = 4

      puts "items=[#{items.size}] expected to be >= (#{expected_item_count})"
      expect(items.size).to be >= (expected_item_count)
    end

    it 'multiple (one default, one specialized query)' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'types' => 'vital%2Cresult')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expected_item_count = 4

      puts "items=[#{items.size}] expected to be >= (#{expected_item_count})"
      expect(items.size).to be >= (expected_item_count)
    end

    it 'multiple (one not existing)' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'types' => 'consult%2Cxxxxxxx')

      expect(response.code).to eq(400)
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))

      expect(items.size).to eq(@all_match_count)
    end

    it '. zero' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'start' => '0')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))

      expect(items.size).to eq(@all_match_count)
    end

    it '. one' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'start' => '1')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be < (@all_match_count)
      expect(items.size).to be >= (@all_match_count - 6)
    end

    it '. nominal' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'start' => '5')

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))

      expect(items.size).to be < (@all_match_count - (1 * 6) + 1)
      expect(items.size).to be > (0)
    end

    it '. total' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'start' => "#{@all_match_count}")

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))

      expect(items.size).to eq(0)
    end

    it '. more than total' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'start' => "#{@all_match_count + 1}")

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))

      expect(items.size).to eq(0)
    end

    it '. negative' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912',
                           'query' => 'blood',
                           'start' => '-1')

      expect(response.code).to eq(500)
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '0')
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to eq(0)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '')
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to eq(@eight_match_count)
    end

    it '. one' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '1')
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to eq(1 * 2)
    end

    it '. nominal #1' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '2')
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be > (2)
      expect(items.size).to be <= (4)
    end

    it '. nominal #2' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '3')
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be > (4)
      expect(items.size).to be <= (6)
    end

    it '. nominal #3' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '4')
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be >= (@eight_match_count - 4)
      expect(items.size).to be <= (@eight_match_count)
    end

    it '. nominal #4' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '5')
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      # expect(items.size).to be >= (@eight_match_count - 1)
      expect(items.size).to be >= (9)
      expect(items.size).to be <= (@eight_match_count)
    end

    it '. total' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => "#{@eight_match_count}")
      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to eq(@eight_match_count)
    end

    it '. more than total' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => "#{@eight_match_count + 1}")

      # dump(response.body)
      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to eq(@eight_match_count)
    end

    it '. negative' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '-1')
      expect(response.code).to eq(500)
      # expect(response.code).to eq(200)
      # items = hash_to_array(get_hash_items(response.body))
      # expect(items.size).to be >= (4)
      # expect(items.size).to be <= (@eight_match_count)
    end

    it '. has limit' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight',
                           'limit' => '3'
                          )

      expect(response.code).to eq(200)
      # puts nested_hash_value(JSON.parse(response.body), 'limit')
      # puts nested_hash_value(JSON.parse(response.body), 'foundItemsTotal')
      # puts nested_hash_value(JSON.parse(response.body), 'unfilteredTotal')
      # puts "- - - - "
      domain_document_count =
        nested_hash_value(JSON.parse(response.body), 'domain:document')
      domain_result_count =
        nested_hash_value(JSON.parse(response.body), 'domain:document')

      # puts nested_hash_value(JSON.parse(response.body), 'domain:document')
      # puts nested_hash_value(JSON.parse(response.body), 'domain:result')
      # dump(response.body)

      expect(domain_document_count).to be >= (2)
      expect(domain_result_count).to be >= (2)

      items = hash_to_array(get_hash_items(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      # expect(items.size).to eq(6)

      type_document_count = 0
      type_result_count = 0

      items.each do |item|
        if item['type'] == 'document'
          type_document_count += 1
        end
        if item['type'] == 'result'
          type_result_count += 1
        end
      end
      expect(type_document_count).to be >= (2)
      expect(type_result_count).to be >= (2)
    end

    it '. no limit' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'eight')

      expect(response.code).to eq(200)
      # puts nested_hash_value(JSON.parse(response.body), 'limit')
      # puts nested_hash_value(JSON.parse(response.body), 'foundItemsTotal')
      # puts nested_hash_value(JSON.parse(response.body), 'unfilteredTotal')
      # puts "- - - - "
      domain_document_count =
        nested_hash_value(JSON.parse(response.body), 'domain:document')
      domain_result_count =
        nested_hash_value(JSON.parse(response.body), 'domain:document')

      # puts nested_hash_value(JSON.parse(response.body), 'domain:document')
      # puts nested_hash_value(JSON.parse(response.body), 'domain:result')
      # dump(response.body)

      expect(domain_document_count).to be >= (3)
      expect(domain_result_count).to be >= (3)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      expect(items.size).to be > (6)

      type_document_count = 0
      type_result_count = 0

      items.each do |item|
        if item['type'] == 'document'
          type_document_count += 1
        end
        if item['type'] == 'result'
          type_result_count += 1
        end
      end
      expect(type_document_count).to be >= (3)
      expect(type_result_count).to be >= (3)
      expect(items.size).to eq(type_document_count + type_result_count)
    end
  end

  context 'field combinations' do
    it '. nominal' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'blood',
                           'types' => 'order',
                           'start' => '10',
                           'limit' => '3',
                           'fields' => 'type,summary')

      # dump(response.body)
      expect(response.code).to eq(200)
      # puts nested_hash_value(JSON.parse(response.body), 'limit')
      # puts nested_hash_value(JSON.parse(response.body), 'foundItemsTotal')
      # puts nested_hash_value(JSON.parse(response.body), 'unfilteredTotal')
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(3)
      items.each do |item|
        # puts "#{i}--------------------------------------------"
        expect(item['summary'].downcase).to include('blood')
        expect(item['type']).to eq('order')
        # puts item['summary'].downcase.include?('blood')
        # puts item['type']
      end
    end
  end
end
