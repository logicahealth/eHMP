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

describe 'f137_patient_record_domain_spec.rb', debug: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/domain'
    @command_lab = @command + '/lab'
    @command_order = @command + '/order'

    rdk_sync('10108V420871')

    # Get count of order
    response = rdk_fetch(@command_order, 'pid' => '10108V420871')
    expect(response.code).to eq(200)
    items = hash_to_array(get_hash_items(response.body))
    @total_order_item_count = items.size
  end

  context 'domain' do
    it 'DE1796 (document-view): valid domains' do
      %w(allergy
         appointment
         consult
         cpt
         document
         document-view
         education
         exam
         factor
         image
         immunization
         lab
         med
         mh
         newsfeed
         obs
         order
         parent-documents
         patient
         pov
         problem
         procedure
         ptf
         rad
         skin
         surgery
         treatment
         visit
         vital
         vlerdocument
      ).each do |e|
        if e == 'accession'
          pid = '10108V420871'
        elsif e == 'skin'
          pid = '5000000341V359724'
        elsif e == 'ptf'
          pid = 'SITE;71'
        else
          pid = '10107V395912'
        end
        response = rdk_fetch(@command + '/' + e, 'pid' => pid)

        if e == 'document-view' || e == 'immunization'
          items = hash_to_array(get_hash_data(response.body))
        else
          items = hash_to_array(get_hash_items(response.body))
        end

        # puts "response.code=[#{response.code}]  items.size=[#{items.size}]"

        # if e == 'exam' || e == 'mh' || e == 'obs' || e == 'treatment'
        if e == 'obs' || e == 'treatment'
          if items.size != 0
            puts "FAILURE e=#{e}"
            dump(response.body)
          end
          expect(items.size).to eq(0)
        else
          expect(items.size).to be >= (1)
        end
      end
    end

    it 'non-existing' do
      response = rdk_fetch(@command + '/non-existing',
                           'pid' => '5000000341V359724')
      expect(response.code).to eq(404)
    end

    it 'omitted' do
      response = rdk_fetch(@command + '/', 'pid' => '5000000341V359724')
      expect(response.code).to eq(404)
    end
  end

  context 'uid' do
    it 'omitted' do
      response = rdk_fetch(@command_lab, 'pid' => '11016V630869')
      expect(response.code).to eq(200)
      # dump(response.body)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (107)
      verify_response_contains([['totalItems', "#{items.size}"]],
                               response.body)
    end

    it 'null' do
      response = rdk_fetch(@command_lab, 'pid' => '11016V630869',
                                         'uid' => '')
      expect(response.code).to eq(200)
      # dump(response.body)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be >= (107)
      verify_response_contains([['totalItems', "#{items.size}"]],
                               response.body)
    end

    it 'upper case' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'URN:VA:LAB:SITE:227:CH;7049580.915555;5')
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'nominal' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:lab:SITE:227:CH;7049580.915555;5')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 1)],
                               response.body)
    end

    it 'incomplete' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:lab:SITE:227:CH;7049580.915555')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'truncated' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:lab:SITE:227:CH;7049580')

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'non-existing domain' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:lab:SITE:227:CH')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'upper case urn' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'URN:va:lab:SITE:227:CH;7049580.915555;5')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'upper case va' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:VA:lab:SITE:227:CH;7049580.915555;5')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'upper case domain' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:LAB:SITE:227:CH;7049580.915555;5')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'missing urn' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => ':va:lab:SITE:227:CH;7049580.915555;5')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'missing va' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn::lab:SITE:227:CH;7049580.915555;5')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'missing domain' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va::SITE:227:CH;7049580.915555;5')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'missing site' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:lab::227:CH;7049580.915555;5')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'missing all' do
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => ':::::')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it 'another\'s uid which also exists' do
      # "urn:va:lab:ABCD:15:CH;7089596.8377;2" used to be in both
      # pid '5000000341V359724' and '11016V630869'.  Now, its unique so that
      # pid '5000000341V359724' has 'urn:va:lab:ABCD:5000000341V359724:CH;7089596.8377;2', and
      # pid '11016V630869' has 'urn:va:lab:ABCD:11016V630869:CH;7089596.8377;2'
      response = rdk_fetch(@command_lab,
                           'pid' => '5000000341V359724',
                           'uid' => 'urn:va:lab:ABCD:15:CH;7089596.8377;2')
      expect(response.code).to eq(200)
      puts nested_hash_value(JSON.parse(response.body), 'totalItems')
      verify_response_contains([%w(totalItems 0)],
                               response.body)

      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:lab:ABCD:15:CH;7089596.8377;2')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)],
                               response.body)

      response = rdk_fetch(@command_lab,
                           'pid' => '5000000341V359724',
                           'uid' => 'urn:va:lab:ABCD:11016V630869:CH;7089596.8377;2')
      expect(response.code).to eq(200)
      puts nested_hash_value(JSON.parse(response.body), 'totalItems')
      verify_response_contains([%w(totalItems 0)],
                               response.body)

      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:lab:ABCD:5000000341V359724:CH;7089596.8377;2')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)],
                               response.body)

      # response = rdk_fetch(@command_lab,
      #                      'pid' => '5000000341V359724',
      #                      'uid' => 'urn:va:lab:ABCD:5000000341V359724:CH;7089596.8377;2')
      # expect(response.code).to eq(200)
      # puts nested_hash_value(JSON.parse(response.body), 'totalItems')
      # verify_response_contains([%w(totalItems 1)],
      #                          response.body)
      #
      # response = rdk_fetch(@command_lab,
      #                      'pid' => '11016V630869',
      #                      'uid' => 'urn:va:lab:ABCD:11016V630869:CH;7089596.8377;2')
      # expect(response.code).to eq(200)
      # verify_response_contains([%w(totalItems 1)],
      #                          response.body)
    end

    it 'another\'s uid that does not exist' do
      response = rdk_fetch(@command_lab,
                           'pid' => '5000000341V359724',
                           'uid' => 'urn:va:lab:DOD:0000000010:20060315090500' \
                                    '_060315-MOM-32-MI_548')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)],
                               response.body)

      # uid is in pid=5000000341V359724
      response = rdk_fetch(@command_lab,
                           'pid' => '11016V630869',
                           'uid' => 'urn:va:lab:DOD:0000000010:20060315090500' \
                                    '_060315-MOM-32-MI_548')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end
  end

  context 'start' do
    it '. omitted' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'start' => '')

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_order_item_count}"],
                                ['currentItemCount',
                                 "#{@total_order_item_count}"]],
                               response.body)
    end

    it '. zero' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'start' => '0')

      expect(response.code).to eq(200)
      # dump(response.body)
      verify_response_contains([['totalItems', "#{@total_order_item_count}"],
                                ['currentItemCount',
                                 "#{@total_order_item_count}"]],
                               response.body)
    end

    it '. one' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'start' => '1')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_order_item_count}"],
                                ['currentItemCount',
                                 "#{@total_order_item_count - 1}"
                                ]],
                               response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'start' => '5')

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_order_item_count}"],
                                ['currentItemCount',
                                 "#{@total_order_item_count - 5}"
                                ]],
                               response.body)
    end

    it '. total' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'start' =>
                                             "#{@total_order_item_count}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_order_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'start' =>
                                             "#{@total_order_item_count + 1}")

      expect(response.code).to eq(200)

      verify_response_contains([['totalItems', "#{@total_order_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end

    it '. negative' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'start' => '-1')

      expect(response.code).to eq(200)
      # dump(response.body)

      verify_response_contains([['totalItems', "#{@total_order_item_count}"],
                                %w(currentItemCount 0)],
                               response.body)
    end
  end

  context 'limit' do
    it '. zero' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'limit' => '0')
      # dump(response.body)
      expect(response.code).to eq(200)
    end

    it '. null' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'limit' => '')
      # dump(response.body)

      expect(response.code).to eq(200)
    end

    it '. one' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'limit' => '1')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 1)], response.body)
    end

    it '. nominal' do
      response = rdk_fetch(@command_order, 'pid' => '10108V420871',
                                           'limit' => '5')

      expect(response.code).to eq(200)
      verify_response_contains([%w(itemsPerPage 5)], response.body)
    end

    it '. total' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'limit' => "#{@total_order_item_count}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_order_item_count}"]],
                               response.body)
    end

    it '. more than total' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'limit' => "#{@total_order_item_count + 1}")

      expect(response.code).to eq(200)
      verify_response_contains([['itemsPerPage',
                                 "#{@total_order_item_count + 1}"]],
                               response.body)

      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be(@total_order_item_count)
    end

    it '. negative' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'limit' => '-1')

      expect(response.code).to eq(200)
      # puts '-------------------------------'
      # dump(response.body)
      verify_response_contains([['itemsPerPage', '-1']],
                               response.body)
    end
  end

  context 'order' do
    it '. omitted' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871')

      expect(response.code).to eq(200)

      # display_items(response.body, 'uid')

      # Expect result NOT to be sorted by uid
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        sorted = a[i + 1]['uid'] < a[i]['uid'] ? false : sorted
      end
      expect(sorted).to be(false)
      expect(a.size).to be(@total_order_item_count)
    end

    it '. one field ascending' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
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

      expect(a.size).to be(@total_order_item_count)
    end

    it 'DE1791: . one field descending' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'order' => 'uid%20desc')

      expect(response.code).to eq(200)

      # display_items(response.body, 'summary')

      # Verify items are sorted by summary in descending order
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['summary']}] " \
        #      "<= [#{a[i]['summary']}]"

        expect(a[i + 1]['uid']).to be <= (a[i]['uid'])
      end
      expect(a.size).to be(@total_order_item_count)
    end

    it 'DE1791: . one field no ascend/descend (default order)' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'order' => 'uid')
      expect(response.code).to eq(200)

      display_items(response.body, 'uid')

      # Default sorting
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['summary']}] <= "\
        #      "[#{a[i]['summary']}]"

        expect(a[i + 1]['uid']).to be >= (a[i]['uid'])
      end
      expect(a.size).to be(@total_order_item_count)
    end

    it '. two fields asc' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
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
      expect(a.size).to be(@total_order_item_count)
    end

    it '. two fields desc' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'order' => 'uid%20desc,summary%20desc')

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
      expect(a.size).to be(@total_order_item_count)
    end

    it '. two fields unspecified asc' do
      # order of 'uid, summary desc' will sort
      # like 'uid asc, summary desc'

      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'order' => 'uid,summary%20desc')
      expect(response.code).to eq(200)
      a1 = hash_to_array(get_hash_items(response.body))

      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'order' => 'uid%20asc,summary%20desc')

      expect(response.code).to eq(200)
      a2 = hash_to_array(get_hash_items(response.body))

      a1.each_with_index do |_, i|
        expect(a1[i]['uid']).to eq(a2[i]['uid'])
        expect(a1[i]['summary']).to eq(a2[i]['summary'])
      end
      expect(a1.size).to be(@total_order_item_count)
    end

    it '. non-existing field' do
      # response = rdk_fetch(@command_order,
      #                      'pid' => '10108V420871',
      #                      'order' => 'summary%20desc')
      # a = hash_to_array(get_hash_items(response.body))
      # a.each_with_index do |e, i|
      #   puts "A i=[#{i}] uid=[#{e['uid']}]"
      # end

      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'order' => 'FieldNoExist%20asc')
      expect(response.code).to eq(200)

      # It will be like no 'order' parameter was specified
      a = hash_to_array(get_hash_items(response.body))
      # a.each_with_index do |e, i|
      #   puts "B i=[#{i}] uid=[#{e['uid']}]"
      # end
      # sorted = true
      # a.each_with_index do |_, i|
      #   next if i == (a.size - 1)
      #
      #   key1 = a[i + 1]['uid'].nil? ? '' : a[i + 1]['uid'].to_s
      #   key2 = a[i]['uid'].nil? ? '' : a[i]['uid'].to_s
      #   sorted = key1 < key2 ? false : sorted
      # end
      # expect(sorted).to eq(false)

      expect(a.size).to be(@total_order_item_count)
    end

    it '. case in-sensitive' do
      response = rdk_fetch(@command_order,
                           'pid' => '10108V420871',
                           'order' => 'SUMMARY%20desc')

      expect(response.code).to eq(200)

      # display_items(response.body, 'summary')
      # display_items(response.body, 'uid')

      # Will not be sorted
      sorted = true
      a = hash_to_array(get_hash_items(response.body))
      a.each_with_index do |_, i|
        next if i == (a.size - 1)
        # puts "expect: i=[#{i}] [#{a[i + 1]['summary']}] <= " \
        #      "[#{a[i]['summary']}]"

        sorted = a[i + 1]['summary'] < a[i]['summary'] ? false : sorted
      end
      expect(sorted).to be(false)
      expect(a.size).to be(@total_order_item_count)
    end
  end

  context 'filter' do
    it 'no filter' do
      response = rdk_fetch(@command + '/lab',
                           'pid' => '10108V420871')

      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be >= (441)
      verify_response_contains([['totalItems', "#{a.size}"]],
                               response.body)
    end

    it 'syntax error' do
      response = rdk_fetch(@command + '/lab',
                           'pid' => '10108V420871',
                           'filter' => 'ilike(xxxxxxx%22HDL%22)')

      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be >= (441)
      verify_response_contains([['totalItems', "#{a.size}"]],
                               response.body)
    end

    it '. non-existing field ' do
      response = rdk_fetch(@command + '/lab',
                           'pid' => '10108V420871',
                           'filter' => 'ilike(xxxxxxx,%22HDL%22)')
      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to eq(0)
      verify_response_contains([['totalItems', "#{a.size}"]],
                               response.body)
    end

    it '. exact match' do
      response = rdk_fetch(@command + '/lab',
                           'pid' => '10108V420871',
                           'filter' => 'ilike(typeName,%22HDL%22)')
      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be >= (24)
      verify_response_contains([['totalItems', "#{a.size}"]],
                               response.body)
    end

    it '. no exact match' do
      response = rdk_fetch(@command + '/lab',
                           'pid' => '10108V420871',
                           'filter' => 'ilike(typeName,%22NOMATCH%22)')
      expect(response.code).to eq(200)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end

    it '. wild card match' do
      response = rdk_fetch(@command + '/lab',
                           'pid' => '10108V420871',
                           'filter' => 'ilike(typeName,%22H%25%22)')

      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be >= (56)
      verify_response_contains([['totalItems', "#{a.size}"]],
                               response.body)
    end

    it '. wild card no match' do
      response = rdk_fetch(@command + '/lab',
                           'pid' => '10108V420871',
                           'filter' => 'ilike(typeName,%22XYZH%25%22)')

      expect(response.code).to eq(200)
      # a = hash_to_array(get_hash_items(response.body))
      # expect(a.size).to eq(56)
      verify_response_contains([%w(totalItems 0)],
                               response.body)
    end
  end

  context 'callType' do
    it 'non existing' do
      response = rdk_fetch(@command + '/vlerdocument',
                           'pid' => '10108V420871',
                           'callType' => 'xxxxxxx')
      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be >= (11)
    end
  end

  context 'vler_uid' do
    it 'non existing' do
      response = rdk_fetch(@command + '/vlerdocument',
                           'pid' => '10108V420871',
                           'vler_uid' => 'XXXXXXXXX')
      expect(response.code).to eq(200)
      a = hash_to_array(get_hash_items(response.body))
      expect(a.size).to be >= (11)
    end
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command_order, '' => '')

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command_order, 'pid' => '')

      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command_order, 'pid' => '11016V630869')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_items(response.body))
      # puts items.size
      expect(items.size).to be >= (61)
      verify_response_contains([['totalItems', "#{items.size}"]],
                               response.body)
    end

    it '. site/dfn' do
      response = rdk_fetch(@command_order, 'pid' => 'SITE;227')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      # puts items.size
      expect(items.size).to be >= (61)
      verify_response_contains([['totalItems', "#{items.size}"]],
                               response.body)
    end

    it '. not found site' do
      response = rdk_fetch(@command_order, 'pid' => 'EEEE;227')
      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command_order, 'pid' => 'SITE;848484')
      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command_order, 'pid' => '848V484')
      expect(response.code).to eq(404)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command_order, 'pid' => '11016v630869')
      expect(response.code).to eq(404)
    end
  end
end
