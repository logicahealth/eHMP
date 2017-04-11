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

describe 'f137_patient_record_uid_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/uid'
    @total_seven_item_count = 38
    rdk_sync('5000000009V082878')
    rdk_sync('10108V420871')
  end

  context 'uid' do
    it 'nominal document 1' do
      response = rdk_fetch(@command, 'pid' => '5000000009V082878',
                                     'uid' => 'urn:va:document:9E7A:100125:2258')
      expect(response.code).to eq(200)
    end

    it 'nominal document 2' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn:va:document:9E7A:3:2745')
      expect(response.code).to eq(200)
    end

    it 'omitted' do
      response = rdk_fetch(@command, 'pid' => '10108V420871')
      expect(response.code).to eq(400)
    end

    it 'null' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => '')
      expect(response.code).to eq(400)
    end

    it 'upper case' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'URN:VA:DOCUMENT:9E7A:3:2745')
      expect(response.code).to eq(404)
    end

    it 'incomplete' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn:va:document:9E7A:3')
      expect(response.code).to eq(404)
    end

    it 'truncated' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn:va:document:9E7A:3:')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(400)
    end

    it 'non-existing domain' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn:va:NOTEXIST:9E7A:3:2745')
      expect(response.code).to eq(404)
    end

    it 'upper case urn' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'URN:va:document:9E7A:3:2745')
      expect(response.code).to eq(404)
    end

    it 'upper case va' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn:VA:document:9E7A:3:2745')
      expect(response.code).to eq(404)
    end

    it 'upper case domain' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn:va:DOCUMENT:9E7A:3:2745')
      expect(response.code).to eq(404)
    end

    it 'missing urn' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => ':va:document:9E7A:3:2745')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(400)
    end

    it 'missing va' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn::document:9E7A:3:2745')
      # expect(response.code).to eq(404)
      expect(response.code).to eq(400)
    end

    it 'missing domain' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn:va::9E7A:3:2745')
      expect(response.code).to eq(400)
    end

    it 'missing site' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => 'urn:va:document::3:2745')
      expect(response.code).to eq(400)
    end

    it 'missing all' do
      response = rdk_fetch(@command, 'pid' => '10108V420871',
                                     'uid' => ':::::')
      expect(response.code).to eq(400)
    end
  end
end
