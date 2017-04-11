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

describe 'f117_patient_complex_note_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/record/complex-note'

    @pid_data = '10108V420871'
    @sync_url = 'http://10.3.3.6:8080'
    @rdk_url = 'http://10.4.4.105:8888'

    # rdk_clear_sync(@pid_data)
    rdk_sync(@pid_data)
  end

  context 'pid' do
    it 'DE2115: icn format' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:va:document:DOD:0000000003:1000000648')
      expect(response.code).to eq(200)
      dump(response.body)
    end

    it 'DE2115: pid format' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;3',
                           'uid' => 'urn:va:document:DOD:0000000003:1000000648')
      expect(response.code).to eq(200)
    end

    it 'no complex document' do
      response = rdk_fetch(@command,
                           'pid' => '5000000009V082878',
                           'uid' => 'urn:va:document:DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'omitted' do
      response = rdk_fetch(@command,
                           'uid' => 'urn:va:document:DOD:0000000003:1000000648')
      expect(response.code).to eq(403)
    end

    it 'blank' do
      response = rdk_fetch(@command,
                           'pid' => '',
                           'uid' => 'urn:va:document:DOD:0000000003:1000000648')
      expect(response.code).to eq(403)
    end
  end

  context 'uid' do
    it 'non-complex document' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:va:document:9E7A:3:2745')
      expect(response.code).to eq(404)
    end

    it 'omitted' do
      response = rdk_fetch(@command, 'pid' => @pid_data)
      expect(response.code).to eq(400)
    end

    it 'null' do
      response = rdk_fetch(@command, 'pid' => @pid_data,
                                     'uid' => '')
      expect(response.code).to eq(400)
    end

    it 'upper case' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'URN:VA:DOCUMENT:DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'incomplete' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:va:document:DOD:0000000003')
      expect(response.code).to eq(404)
    end

    it 'truncated' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:va:document:DOD:0000000003:')
      expect(response.code).to eq(404)
    end

    it 'non-existing domain' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:va:NOTEXIST:DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'upper case urn' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'URN:va:document:DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'upper case va' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:VA:document:DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'upper case domain' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:va:DOCUMENT:DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'missing urn' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => ':va:document:DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'missing va' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn::document:DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'missing domain' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:va::DOD:0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'missing site' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => 'urn:va:document::0000000003:1000000648')
      expect(response.code).to eq(404)
    end

    it 'missing all' do
      response = rdk_fetch(@command,
                           'pid' => @pid_data,
                           'uid' => ':::::')
      expect(response.code).to eq(404)
    end
  end

  def rdk_clear_sync(pid)
    # Clear out patient
    post_and_check_response_code("#{@sync_url}/sync/clearPatient?icn=" + pid,
                                 '')
    get_and_check_response_code("#{@rdk_url}/resource/sync/status?pid="+pid,
                                404)
  end

  def post_and_check_response_code(path, payload, response_code = nil)
    response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload)
    unless response_code.nil?
      expect(response.code).to eq(response_code), response.body
    end
    puts "post"
    puts response.code
    puts response.body

    response.body
  end

  def get_and_check_response_code(path, response_code = nil)
    response = HTTPartyWithBasicAuth.get_with_authorization(path)
    unless response_code.nil?
      expect(response.code).to eq(response_code), response.body
    end
    puts "get"
    puts response.code
    puts response.body
    response.body
  end
end
