require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative 'rspec_helper'
require_relative '../lib/pages/login_page'
require_relative '../lib/pages/search_page'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/pages/coversheet_page'
require_relative '../lib/pages/orders_page'
require_relative '../lib/pages/global_date_filter_page'
require_relative '../lib/pages/patient_overview_page'
require_relative '../lib/pages/reports_page'
require_relative '../lib/pages/common_elements_page'

describe 'F294: Reports Gist Modal: ( f294_reportsgist_modal_spec.rb )', future: true do
  include DriverUtility
  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)
    @login = LoginPage.new(@driver)
    @common_test = CommonTest.new(@driver)

    @common_test.login_with_default
    @login.currentUser_element.when_visible(20)
    full_patient_name = 'ZZZRETFOURFORTYSEVEN, Patient'
    @common_test.mysite_patient_search full_patient_name, full_patient_name, true
  end

  after(:all) do
    @driver.close
  end

  let(:overview) { PatientOverview.new(@driver) }
  let(:applet) { ReportsPage.new(@driver) }
  let(:global_date_filter) { GlobalDateFilter.new(@driver) }
  let(:search) { SearchPage.new(@driver) }

  context 'US4157: Reports View:  View Report Modal' do
    it 'When the user views Reports Gist applet on overview' do
      overview.navigate_to_overview unless overview.screenNm == 'Overview'
      expect(overview.screenNm).to eq('Overview')
      expect(overview.applet_visible? PatientOverview::REPORTS).to be(true)
    end
    it 'And the user views all Reports' do
      Watir::Wait.until(APPLET_LOAD_TIME, 'Report Gist did not finish loading data') { applet.report_applet_finish_loading? }

      global_date_filter.select_all
      Watir::Wait.until(APPLET_LOAD_TIME, 'Report Gist did not finish loading data') { applet.report_applet_finish_loading? }
      expect(applet.contains_empty_row? ReportsPage::REPORTS_TABLE_ID).to eq(false), 'Cannot check filtering, there are no rows to filter on'
    end
    it 'Then the user can view the details modal for Procedures' do
      type = 'Procedure'
      elements = applet.typeColumn_elements
      procedure_element = nil
      elements.each do |element|
        procedure_element = element if element.text.casecmp(type) == 0
        break unless procedure_element.nil?
      end
      expect(procedure_element.nil?).to eq(false), "a report of type #{type} is not displayed"
      procedure_element.click
      applet.mainModal_element.when_visible
      applet.typeLabel_element.when_visible
      expect(applet.typeLabel?).to eq(true)
      expect(applet.type?).to eq(true)
      expect(applet.type_element.text.strip).to eq(type)
    end

    it 'Then the user can view the details modal for Imaging' do
      applet.xclose if applet.xclose?
      Watir::Wait.until { applet.mainModal_element.visible? == false }

      type = 'Imaging'
      elements = applet.typeColumn_elements
      procedure_element = nil
      elements.each do |element|
        procedure_element = element if element.text.casecmp(type) == 0
        break unless procedure_element.nil?
      end
      expect(procedure_element.nil?).to eq(false), "a report of type #{type} is not displayed"
      procedure_element.click
      applet.mainModal_element.when_visible
      applet.typeLabel_element.when_visible
      expect(applet.typeLabel?).to eq(true)
      expect(applet.type?).to eq(true)
      expect(applet.type_element.text.strip).to eq(type)
    end

    it 'Then the user can view the details modal for Laboratory Report' do
      applet.xclose if applet.xclose?
      Watir::Wait.until { applet.mainModal_element.visible? == false }

      type = 'Laboratory Report'
      elements = applet.typeColumn_elements
      procedure_element = nil
      elements.each do |element|
        procedure_element = element if element.text.casecmp(type) == 0
        break unless procedure_element.nil?
      end
      expect(procedure_element.nil?).to eq(false), "a report of type #{type} is not displayed"
      procedure_element.click
      applet.mainModal_element.when_visible
      # applet.typeLabel_element.when_visible
      # expect(applet.typeLabel?).to eq(true)
      # expect(applet.type?).to eq(true)
      # expect(applet.type_element.text.strip).to eq(type)
    end

    it 'Then the user can view the details modal for Consults' do
      applet.xclose if applet.xclose?
      Watir::Wait.until { applet.mainModal_element.visible? == false }

      search.navigate_to_patient_search_screen
      full_patient_name = 'NINETYNINE, PATIENT'
      @common_test.mysite_patient_search full_patient_name, full_patient_name, true

      overview.navigate_to_overview unless overview.screenNm == 'Overview'
      expect(overview.screenNm).to eq('Overview')
      expect(overview.applet_visible? PatientOverview::REPORTS).to be(true)
      Watir::Wait.until(APPLET_LOAD_TIME, 'Report Gist did not finish loading data') { applet.report_applet_finish_loading? }

      global_date_filter.select_all
      Watir::Wait.until(APPLET_LOAD_TIME, 'Report Gist did not finish loading data') { applet.report_applet_finish_loading? }

      type = 'Consult'
      elements = applet.typeColumn_elements
      procedure_element = nil
      elements.each do |element|
        procedure_element = element if element.text.casecmp(type) == 0
        break unless procedure_element.nil?
      end
      expect(procedure_element.nil?).to eq(false), "a report of type #{type} is not displayed"
      procedure_element.click
      applet.mainModal_element.when_visible
      applet.typeLabel_element.when_visible
      expect(applet.typeLabel?).to eq(true)
      expect(applet.type?).to eq(true)
      expect(applet.type_element.text.strip).to eq(type)
    end
  end
end
