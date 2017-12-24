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

describe 'f117_patient_record_search_detail_document_spec.rb', debug: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/search/detail/document'

    response = rdk_fetch(@command,
                         'pid' => '10108V420871',
                         'query' => 'document',
                         'group.field' => 'local_title',
                         'group.value' => 'ADVANCE%20DIRECTIVE')
    dump(response.body)
    items = hash_to_array(get_hash_items(response.body))
    @all_match_count = items.size
  end

  context 'required fields' do
    it '. all omitted' do
      response = rdk_fetch(@command, {})
      # puts response.code
      # dump(response.body)
      expect(response.code).to eq(403)
    end

    it '. all null' do
      response = rdk_fetch(@command,
                           'pid' => '',
                           'query' => '',
                           'group.field' => '',
                           'group.value' => '')
      # puts response.code
      # dump(response.body)
      expect(response.code).to eq(403)
    end
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      #puts response.code
      #dump(response.body)

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      #puts response.code
      #dump(response.body)

      expect(response.code).to eq(403)
    end

    it '. icn' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be > (0)
      expect(items.size).to eq(@all_match_count)
    end

    it '. site SITE' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;3',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(2)
    end

    it '. site SITE' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;3',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(2)
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'pid' => 'EEEE;3',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;848484',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command,
                           'pid' => '848V484',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(404)
      #items = hash_to_array(get_hash_items(response.body))
      #puts "ITEM SIZE=[#{items.size}]"
      #expect(items.size).to eq(0)
    end

    it '. upper case V (normal)' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      puts "ITEM SIZE=[#{items.size}]"
      # Size is 1 but is empty
      expect(items.size).to eq(1)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009v082878',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(400)
    end
  end

  context 'query' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(400)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => '',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(400)
    end

    it '. UPPER CASE' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'DOCUMENT',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be > (0)
      expect(items.size).to eq(@all_match_count)
    end

    it '. Mixed Case' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'dOcUmEnt',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be > (0)
      expect(items.size).to eq(@all_match_count)
    end

    it '. no match' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'nomatch',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      # Size is 1 but is empty
      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to eq(1)
      expect(nested_hash_value(JSON.parse(response.body), 'highlights')).to \
        eq({})
    end

    it '. multiple words ' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'CAMP%20MASTER',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # 'query' => 'PROGRESS%20NOTES',
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)
      # Check results hash rather than just the items hash
      items = hash_to_array(get_hash_items(response.body)['results'])
      # expect(items.size).to be >= (6)
      expect(items.size).to be >= (4)
    end

    it '. special chars' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document%25',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))
      expect(items.size).to be > (0)
      expect(items.size).to eq(@all_match_count)
    end
  end

  context 'group.field' do
    it '. UPPER CASE' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'LOCAL_TITLE',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))

      # Size is 1 but is empty
      expect(items.size).to eq(1)
      expect(nested_hash_value(JSON.parse(response.body), 'highlights')).to \
        eq({})
    end

    it '. Mixed Case' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'lOcAl_tItlE',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))

      # Size is 1 but is empty
      expect(items.size).to eq(1)
      expect(nested_hash_value(JSON.parse(response.body), 'highlights')).to \
        eq({})
    end

    it '. Non-existing' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'local-title',
                           'group.value' => 'ADVANCE%20DIRECTIVE')
      # puts response.code
      # dump(response.body)

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))

      # Size is 1 but is empty
      expect(items.size).to eq(1)
      expect(nested_hash_value(JSON.parse(response.body), 'highlights')).to \
        eq({})
    end
  end

  context 'group.value' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'local_title')
      expect(response.code).to eq(400)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => '')

      expect(response.code).to eq(400)
    end

    it '. lower case' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'advance%20directive')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))

      # Size is 1 but is empty
      expect(items.size).to eq(1)
      expect(nested_hash_value(JSON.parse(response.body), 'highlights')).to \
        eq({})
    end

    it '. Mixed Case' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'AdvAncE%20dIrEctIvE')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))

      # Size is 1 but is empty
      expect(items.size).to eq(1)
      expect(nested_hash_value(JSON.parse(response.body), 'highlights')).to \
        eq({})
    end

    it '. partial' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'ADVANCE')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))

      # Size is 1 but is empty
      expect(items.size).to eq(1)
      expect(nested_hash_value(JSON.parse(response.body), 'highlights')).to \
        eq({})
    end

    it '. no-match' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'query' => 'document',
                           'group.field' => 'local_title',
                           'group.value' => 'non-matching')

      expect(response.code).to eq(200)

      items = hash_to_array(get_hash_items(response.body))

      # Size is 1 but is empty
      expect(items.size).to eq(1)
      expect(nested_hash_value(JSON.parse(response.body), 'highlights')).to \
        eq({})
    end
  end
end
