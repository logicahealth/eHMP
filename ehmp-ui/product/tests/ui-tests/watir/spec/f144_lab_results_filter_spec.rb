require 'rubygems'
require 'rspec'
require 'watir-webdriver'
require 'chronic'
require 'date'

require_relative 'rspec_helper'
require_relative '../lib/pages/labresults_expanded_page'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/common/ehmp_constants'

# Team: Andromeda

describe 'F144 - eHMP Viewer GUI - Numeric Lab Results - Filtering (f144_lab_results_filter_spec.rb )', future: true do
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
  context 'US2033, US2221: User can hide and display filter controls' do
    it 'When the user views the expanded numeric lab results' do
      full_patient_name = 'Eight, Patient'
      @common_test.mysite_patient_search full_patient_name, full_patient_name, true
      applet.navigate_to_labresults_expanded
    end
  end

  xcontext 'US2221: Create a To / From Date Filter - DE2431' do
    it 'US2481: Verify Date filtering using the Custom button' do
      from_date_string = '04/11/2013'
      to_date_string = '05/04/2013'

      applet.clear_filter_and_refresh_applet
      pre_filter_row_count = applet.labResults_elements.length
      @common_test.enter_into_date_field(applet.fromDate_element, from_date_string)
      @common_test.enter_into_date_field(applet.toDate_element, to_date_string)
      Watir::Wait.until { applet.apply_element.enabled? }
      applet.apply
      Watir::Wait.until { applet.finished_loading }
      expect(applet.labResults_elements.length).to_not eq(pre_filter_row_count)

      from_chronic = Date.strptime(from_date_string, '%m/%d/%Y')
      to_chronic = Date.strptime(to_date_string, '%m/%d/%Y')
      applet.dateColumn_elements.each do |lab_date|
        column_date_chronic = Date.strptime(lab_date.text, '%m/%d/%Y')
        expect(column_date_chronic).to be >= from_chronic
        expect(column_date_chronic).to be <= to_chronic
      end
    end
  end
end
