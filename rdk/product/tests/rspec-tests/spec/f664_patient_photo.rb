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

describe 'f664_patient_photo.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/photo'

    rdk_sync('10107V395912')
    rdk_sync('10108V420871')
    rdk_sync('9E7A;100022')

    @generic_image = \
      '/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQ' \
      'gKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQ' \
      'CwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB' \
      'D/wAARCAB5AHoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL' \
      '/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0f' \
      'AkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1' \
      'dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1N' \
      'XW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQF' \
      'BgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRob' \
      'HBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVm' \
      'Z2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExc' \
      'bHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7cHiXxCAA' \
      'NdvxgDn7S+Pw5FH/AAk3iL/oP3//AIEP/jWaOn4CloA0f+Em8Rf9B+//APAh/wDGj/hJvE' \
      'X/AEH7/wD8CH/xrOooA0f+Em8Rf9B+/wD/AAIf/Gj/AISbxF/0H7//AMCH/wAazqAM0AaP' \
      '/CTeIv8AoP3/AP4EP/jR/wAJN4i/6D9//wCBD/41n7fejb70AaH/AAk3iL/oP3//AIEP/j' \
      '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'
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(403)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '')

      expect(response.code).to eq(403)
    end

    it '. icn (specific image)' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871')
      # puts response.body
      expect(response.code).to eq(200)
      expect(response.body).not_to eq(@generic_person)
    end

    it '. site/dfn' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;100022')

      # puts response.body
      expect(response.code).to eq(200)
      expect(response.body).to eq(@generic_image)
    end

    it '. icn (generic image)' do
      response = rdk_fetch(@command,
                           'pid' => '10107V395912')

      expect(response.code).to eq(200)
      expect(response.body).to eq(@generic_image)
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'pid' => 'EEEE;3')
      expect(response.code).to eq(200)
      expect(response.body).to eq(@generic_image)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'pid' => '9E7A;848484')
      expect(response.code).to eq(200)
      expect(response.body).to eq(@generic_image)
    end

    it '. not found icn' do
      response = rdk_fetch(@command,
                           'pid' => '848V484')
      expect(response.code).to eq(200)
      expect(response.body).to eq(@generic_image)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command,
                           'pid' => '10108v420871')
      expect(response.code).to eq(200)
      expect(response.body).to eq(@generic_image)
    end
  end
end
