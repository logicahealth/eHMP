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

describe 'f140_patient_search_default_search_spec.rb', future: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient-search/cprs'

    @expected_body = {
      'data' => {
        'items' => []
      },
      'status' => 200
    }
  end

  context 'request from /patient-search/cprs' do
    it '. with no parameter' do
      response = rdk_fetch(@command)

      expect(response.code).to eq(200)
      expect(compare_json(JSON.parse(response.body),
                          @expected_body)).to eq(true)
    end

    it '. with any parameter' do
      response = rdk_fetch(@command, 'pid' => '10108V420871')

      expect(response.code).to eq(200)
      expect(compare_json(JSON.parse(response.body),
                          @expected_body)).to eq(true)
    end
  end
end
