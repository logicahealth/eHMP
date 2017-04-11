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

describe 'f140_patient_search_global_spec.rb', acceptance: true do
  include VxAPIUtility
  include JsonUtilities

  before(:all) do
    @command = 'resource/patient-search/global'
  end

  context 'lastname' do
    @test_data = [ \
      { 'desc' => 'lastname only',
        'data' => { 'name.last' => 'Eight' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'lastname + firstname',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient' },
        'result' => { 'code' => 200, 'minTotalItems' => 10 }
      },
      { 'desc' => 'lastname + ssn',
        'data' => { 'name.last' => 'Eight',
                    'ssn' => '666-00-0008' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      },
      { 'desc' => 'lastname + dob',
        'data' => { 'name.last' => 'Eight',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 200, 'minTotalItems' => 3 }
      },
      { 'desc' => 'lastname + non-firstname',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'xxxxxxx' },
        'result' => { 'code' => 200, 'totalItems' => 0 }
      },
      { 'desc' => 'lastname + non-ssn',
        'data' => { 'name.last' => 'Eight',
                    'ssn' => '345-00-0033' },
        'result' => { 'code' => 200, 'totalItems' => 0 }
      },
      { 'desc' => 'lastname + non-dob',
        'data' => { 'name.last' => 'Eight',
                    'date.birth' => '12/12/2032' },
        'result' => { 'code' => 200, 'totalItems' => 0 }
      }, #
      { 'desc' => 'lastname + firstname + non-ssn',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'ssn' => '345-00-0033' },
        'result' => { 'code' => 200, 'minTotalItems' => 10 }
      },
      { 'desc' => 'lastname + firstname + non-dob',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'date.birth' => '12/12/2032' },
        'result' => { 'code' => 200, 'minTotalItems' => 10 }
      }, #
      { 'desc' => 'lastname + firstname + ssn',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'ssn' => '666-00-0008' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      },
      { 'desc' => 'lastname + firstname + dob',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      },
      { 'desc' => 'lastname + ssn + dob',
        'data' => { 'name.last' => 'Eight',
                    'ssn' => '666-00-0008',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      },
      { 'desc' => 'lastname all upper case',
        'data' => { 'name.last' => 'EIGHT',
                    'ssn' => '666-00-0008',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      },
      { 'desc' => 'lastname all lower case',
        'data' => { 'name.last' => 'eight',
                    'ssn' => '666-00-0008',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      },
      { 'desc' => 'bad lastname',
        'data' => { 'name.last' => '555555',
                    'name.first' => 'Patient' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'lastname omitted',
        'data' => { 'name.first' => 'Patient',
                    'ssn' => '666-00-0008',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 406 }
      }
    ]

    @test_data.each do |e|
      it "Scenario: #{e['desc']}" do
        run_scenario(e)
      end
    end
  end

  context 'firstname' do
    @test_data = [
      { 'desc' => 'bad firstname',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => '666-00-0008' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'all upper case',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'PATIENT',
                    'ssn' => '666000008' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      },
      { 'desc' => 'all lower case',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'patient',
                    'ssn' => '666000008' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      }
    ]

    @test_data.each do |e|
      it "Scenario: #{e['desc']}" do
        run_scenario(e)
      end
    end
  end

  context 'ssn' do
    @test_data = [
      { 'desc' => 'no dash',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'ssn' => '666000008' },
        'result' => { 'code' => 200, 'totalItems' => 1 }
      },
      { 'desc' => 'bad ssn format',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'ssn' => '666-000-0008' },
        'result' => { 'code' => 406 }
      }
    ]

    @test_data.each do |e|
      it "Scenario: #{e['desc']}" do
        run_scenario(e)
      end
    end
  end

  context 'dob' do
    @test_data = [
      { 'desc' => 'mm-dd-yyyy format',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'date.birth' => '04-07-1935' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'dd.mm.yyyy format',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'date.birth' => '07.04.1935' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'yyyy-mm-dd format',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'date.birth' => '1935-04-07' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'mm/dd/yy format',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'date.birth' => '04/07/35' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'out of range format',
        'data' => { 'name.last' => 'Eight',
                    'name.first' => 'Patient',
                    'date.birth' => '13/13/1935' },
        'result' => { 'code' => 406 }
      }
    ]

    @test_data.each do |e|
      it "Scenario: #{e['desc']}" do
        run_scenario(e)
      end
    end
  end

  context 'non-existing last name' do
    @test_data = [
      { 'desc' => 'but existing first+ssn',
        'data' => { 'name.last' => 'xxxxx',
                    'name.first' => 'Patient',
                    'ssn' => '666-000-0008' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'but existing ssn+dob',
        'data' => { 'name.last' => 'xxxxx',
                    'ssn' => '666-000-0008',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'but existing first+dob',
        'data' => { 'name.last' => 'xxxxx',
                    'name.first' => 'Patient',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 200, 'totalItems' => 0 }
      },
      { 'desc' => 'but existing firstname+ssn+dob',
        'data' => { 'name.last' => 'xxxxx',
                    'name.first' => 'Patient',
                    'ssn' => '666-000-0008',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 406 }
      },
      { 'desc' => 'and firstname but existing ssn+dob',
        'data' => { 'name.last' => 'xxxxx',
                    'name.first' => 'yyyy',
                    'ssn' => '666-000-0008',
                    'date.birth' => '04/07/1935' },
        'result' => { 'code' => 406 }
      }
    ]

    @test_data.each do |e|
      it "Scenario: #{e['desc']}" do
        run_scenario(e)
      end
    end
  end

  def run_scenario(e)
    response = rdk_fetch(@command, e['data'])
    # if response.code != 200
    #   dump(response.body)
    # end
    expect(response.code).to eq(e['result']['code'])
    if e['result']['totalItems'].nil?
      unless e['result']['minTotalItems'].nil?
        items = hash_to_array(get_hash_items(response.body))
        # puts items.size
        expect(items.size).to be >= (e['result']['minTotalItems'])
        unless e['result']['maxTotalItems'].nil?
          expect(items.size).to be <= (e['result']['maxTotalItems'])
        end
      end
    else
      items = hash_to_array(get_hash_items(response.body))
      # puts items.size
      expect(items.size).to eq(e['result']['totalItems'])
    end
  end
end
