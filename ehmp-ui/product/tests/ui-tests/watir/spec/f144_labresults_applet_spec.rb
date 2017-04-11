require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative 'rspec_helper'
require_relative '../lib/pages/labresults_expanded_page'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/common/ehmp_constants'
require_relative '../lib/pages/coversheet_page'
require_relative '../lib/pages/global_date_filter_page'
require_relative '../lib/pages/table_verifier'
# Team: Andromeda

describe 'F144 - eHMP Viewer GUI - Numeric Lab Results - coversheet', future: true do
  include DriverUtility
  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)

    @common_test = CommonTest.new(@driver)

    @common_test.login_with_default
  end

  after(:all) do
    @driver.close
  end

  let(:applet) { LabResultsExpanded.new(@driver) }
  let(:coversheet) { Coversheet.new(@driver) }
  let(:search) { SearchPage.new(@driver) }
  let(:globalDateFilter) { GlobalDateFilter.new(@driver) }
  let(:table_verifier) { TableVerifier.new(@driver) }
  context 'When the user views the coversheet' do
    applet_title = 'NUMERIC LAB RESULTS'
    # expected_total_rows = 360
    it 'Verify the numeric lab results applet is present' do
      full_patient_name = 'Eight, Patient'
      @common_test.mysite_patient_search full_patient_name, full_patient_name, true
      coversheet.navigate_to_coversheet
      expect(coversheet.applet_visible? Coversheet::NUMERIC_LAB_RESULTS_GRID_APPLET).to eq(true)
    end
    it "US2038: Verify the numeric lab results applet title is correct (#{applet_title})" do
      expect(applet.title).to eq(applet_title)
    end
    it 'TA5030: Verify the numeric lab results headers' do
      coversheet.labResultHeaderDate_element.when_visible
      expect(coversheet.labResultHeaderDate?).to eq(true)
      expect(coversheet.labResultHeaderTest?).to eq(true)
      expect(coversheet.labResultHeaderFlag?).to eq(true)
      expect(coversheet.labResultHeaderResult?).to eq(true)
    end
  end
end
