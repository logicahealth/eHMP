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

describe 'f664_patient_health_summaries_reports.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient/health-summaries/reports'

    rdk_sync('10107V395912')
    rdk_sync('10108V420871')
  end

  context 'pid' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      expect(response.code).to eq(500)
    end

    it '. null' do
      response = rdk_fetch(@command,
                           'pid' => '',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      expect(response.code).to eq(404)
    end

    it '. icn' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      expect(response.code).to eq(200)
      # dump(response.body)

      # items = hash_to_array(get_hash_data(response.body))
      report_item = get_hash_data(response.body)

      expect(report_item['reportID']).to eq('11')
      expect(report_item['hsReport']).to eq('OUTPATIENT')
      expect(report_item['totalLength']).to be >= (1)
      expect(report_item['totalLength']).to eq(report_item['detail'].size)

      expect(report_item['detail']).to be
    end

    it '. site/dfn' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;253',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      expect(response.code).to eq(404)
    end

    it '. not found site' do
      response = rdk_fetch(@command,
                           'pid' => 'EEEE;3',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      expect(response.code).to eq(404)
    end

    it '. not found in site' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;848484',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      expect(response.code).to eq(404)
    end

    it '. not found icn' do
      response = rdk_fetch(@command,
                           'pid' => '848V484',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      expect(response.code).to eq(404)
    end

    it '. lower case icn v' do
      response = rdk_fetch(@command,
                           'pid' => '10108v420871',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      # dump(response.body)
      expect(response.code).to eq(200)

      report_item = get_hash_data(response.body)

      expect(report_item['reportID']).to eq('11')
      expect(report_item['hsReport']).to eq('OUTPATIENT')
      expect(report_item['totalLength']).to be >= (1)
      expect(report_item['totalLength']).to eq(report_item['detail'].size)

      expect(report_item['detail']).to be
    end
  end

  context 'all' do
    it '. all omitted' do
      response = rdk_fetch(@command, {})

      expect(response.code).to eq(500)
    end

    it '. all reports' do
      response = rdk_fetch('resource/patient/health-summaries/sites',
                           'pid' => '10108V420871')

      expect(response.code).to eq(200)
      # dump(response.body)

      items = hash_to_array(get_hash_data(response.body))
      # puts "ITEM SIZE=[#{items.size}]"
      items.each_with_index do |item, i|
        # Sample through 1 in 5
        next unless i.modulo(5) == 0

        report_id = "#{item['reportID']};#{item['hsReport']}"
        report_id = report_id.gsub(/ /, "%20").gsub(/\//, "%2F")

        # puts "----->[#{i}] [#{item['hsReport']}][#{report_id}]"

        response = rdk_fetch(@command,
                             'pid' => '10108V420871',
                             'id' => report_id,
                             'site.code' => item['siteKey'])

        expect(response.code).to eq(200)
        # dump(response.body)

        # items = hash_to_array(get_hash_data(response.body))
        report_item = get_hash_data(response.body)

        expect(report_item['reportID']).to eq(item['reportID'])
        expect(report_item['hsReport']).to eq(item['hsReport'])
        expect(report_item['totalLength']).to be >= (1)
        expect(report_item['totalLength']).to eq(report_item['detail'].size)

        expect(report_item['detail']).to be
      end
    end
  end

  context 'id' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'site.code' => 'SITE')
      expect(response.code).to eq(500)
    end

    it '. empty' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => '',
                           'site.code' => 'SITE')
      expect(response.code).to eq(500)
    end

    it '. non-existing' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => 'NONEXISTING',
                           'site.code' => 'SITE')
      expect(response.code).to eq(500)
    end

    it '. no report name' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => '11;',
                           'site.code' => 'SITE')
      expect(response.code).to eq(500)
    end

    it '. no report id' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => ';OUTPATIENT',
                           'site.code' => 'SITE')
      expect(response.code).to eq(200)
      # dump(response.body)
      report_item = get_hash_data(response.body)

      expect(report_item['reportID']).to eq('')
      expect(report_item['hsReport']).to eq('OUTPATIENT')
      expect(report_item['totalLength']).to be >= (1)
      expect(report_item['totalLength']).to eq(report_item['detail'].size)

      expect(report_item['detail']).to be
    end

    it '. just report id' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => '11',
                           'site.code' => 'SITE')
      expect(response.code).to eq(500)
    end

    it '. just report name' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => 'OUTPATIENT',
                           'site.code' => 'SITE')
      expect(response.code).to eq(500)
    end

    it '. alpha report id' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => 'AA;OUTPATIENT',
                           'site.code' => 'SITE')
      expect(response.code).to eq(200)
      # dump(response.body)
      report_item = get_hash_data(response.body)

      expect(report_item['reportID']).to eq('AA')
      expect(report_item['hsReport']).to eq('OUTPATIENT')
      expect(report_item['totalLength']).to be >= (1)
      expect(report_item['totalLength']).to eq(report_item['detail'].size)

      expect(report_item['detail']).to be
    end
  end

  context 'site.code' do
    it '. omitted' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => '11;OUTPATIENT')

      expect(response.code).to eq(500)
    end

    it '. empty' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => '11;OUTPATIENT',
                           'site.code' => '')

      expect(response.code).to eq(500)
    end

    it '. non-existing' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'NOTEXIST')

      expect(response.code).to eq(500)
    end

    it '. site.code not matching pid' do
      response = rdk_fetch(@command,
                           'pid' => 'SITE;253',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE')

      expect(response.code).to eq(404)
    end

    it '. multiple' do
      response = rdk_fetch(@command,
                           'pid' => '10108V420871',
                           'id' => '11;OUTPATIENT',
                           'site.code' => 'SITE;SITE')

      expect(response.code).to eq(500)
    end
  end
end
