#!/bin/env ruby
# encoding: utf-8

require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative 'rspec_helper'
require_relative '../lib/pages/login_page'
require_relative '../lib/pages/search_page'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/pages/patient_overview_page'
require_relative '../lib/pages/visit_information_page'
require_relative '../lib/pages/vitals_gist_page'
require_relative '../lib/pages/common_elements_page'

describe 'F513: US 6854: Visit Management Form (f513_visit_management_spec.rb) - DE2160', future: true do
  include DriverUtility

  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)
    @common_test = CommonTest.new(@driver)
    @common_test.login_with_default
    patient_name = 'Fourteen, Patient'
    @common_test.mysite_patient_search(patient_name, patient_name)
  end

  after(:all) do
    @driver.close
  end

  let(:search) { SearchPage.new(@driver) }
  let(:visit) { VisitInformationPage.new(@driver) }
  let(:vital) { VitalsGistPage.new(@driver) }
  let(:overview) { PatientOverview.new(@driver) }
  let(:comm_elem) { CommonElementsPage.new(@driver) }

  context 'TC482' do
    it 'Verify prescense of Current Encounter section' do
      overview.screenNm_element.when_visible(20)
      expect(overview.screenNm_element.text.strip.include?('Overview')).to eq(true)
      visit.visitInfo_element.when_visible
    end
    it 'TC482.5: Verify Change Current Encounter modal opens' do
      visit.selVisitInfo_element.when_visible
      visit.selVisitInfo_element.click
      visit.mainModal_element.when_visible
    end
    xit 'Verify correct tabs visible and selected' do
      p 'does not appear to be a requirement for this'
    end
    xit 'Verify no values selected for encounter location and encounter provider' do
      p "I don't know where encounter location is"
      p 'Encounter provider appears to be set to logged in user'
    end
    it 'TC482.6: Validate Set and View button and Set and Close button are disabled' do
      visit.setAndView_element.when_visible
      expect(visit.setAndView_element.disabled?).to eq(true)
      expect(visit.setAndClose_element.disabled?).to eq(true)
    end
    it 'Verify user can cancel out of Change Encounter section' do
      visit.visitCan
      visit.mainAlert_element.when_visible
      visit.alertContinue_element.when_visible
      visit.alertContinue
      visit.mainModal_element.when_not_visible
    end
  end

  # context 'TC#482: Visit Management: Clinical Appointments' do
  #   include DriverUtility

  #   patient_name = 'Ten, Patient'

  #   it 'select and add visit' do
  #     @common_test.mysite_patient_search(patient_name, patient_name)
  #   end

  #   it 'select and confirm the visit added succefully' do
  #     visit_button_click = %w(Cancel Continue Ok)

  #     visit_date = '05/24/04, 08'
  #     # location_name =  'General Medicine'
  #     # provider = 'Labtech,One'
  #     from_date_string = '05/25/2000'
  #     to_date_string = '06/30/2015'

  #     visit_button_click.each do |scenario|
  #       overview.navigate_to_overview
  #       vital.vitals_gist_applet_finish_loading?
  #       visit.selVisitInfo_element.when_visible(MEDIUM_TIMEOUT)
  #       visit.selVisitInfo_element.click
  #       puts expect(visit.setVisit_element.disabled?).to be_truthy
  #       visit.selectProvider_element.when_visible(LARGE_TIMEOUT)
  #       visit.selectProvider = 'Labtech,One'
  #       visit.fromDtApts_element.when_visible(MEDIUM_TIMEOUT)
  #       puts '10'
  #       @common_test.enter_into_date_field(visit.fromDtApts_element, from_date_string)
  #       puts '11'
  #       @common_test.enter_into_date_field(visit.thrDtApts_element, to_date_string)
  #       visit.visitApts_element.when_visible(MEDIUM_TIMEOUT)
  #       visit.select_clinical_visit(visit_date)
  #       puts expect(visit.setVisit_element.enabled?).to be_truthy

  #       if scenario == 'Cancel'
  #         puts scenario
  #         visit.visitCan_element.when_visible(MEDIUM_TIMEOUT)
  #         visit.visitCan
  #         visit.cancel_element.when_visible(MEDIUM_TIMEOUT)
  #         puts 'x'
  #         visit.cancel_element.click
  #       elsif scenario == 'Continue'
  #         puts scenario
  #         visit.visitCan_element.when_visible(MEDIUM_TIMEOUT)
  #         puts 'w'
  #         visit.visitCan
  #         visit.continue_element.when_visible(MEDIUM_TIMEOUT)
  #         puts 'y'
  #         visit.continue_element.click
  #       elsif scenario == 'Ok'
  #         puts scenario
  #         visit.setVisit_element.when_visible(MEDIUM_TIMEOUT)
  #         puts 'n'
  #         visit.setVisit
  #       end
  #     end
  #   end
  # end

  # context 'TC#482: Visit Management : Hospital Admissions' do
  #   it 'select and confirm the visit added succefully' do
  #     visit_button_click = %w(Cancel Continue Ok)

  #     visit_date = '09/04/91, 09'
  #     # location_name =  'Alcohol'

  #     visit_button_click.each do |scenario|
  #       visit.selVisitInfo_element.when_visible(MEDIUM_TIMEOUT)
  #       visit.selVisitInfo_element.click
  #       visit.selectProvider_element.when_visible(LARGE_TIMEOUT)
  #       visit.selectProvider = 'Pcmm-Md,Five'
  #       visit.visitAdmts_element.when_visible(MEDIUM_TIMEOUT)
  #       visit.visitAdmts
  #       expect(visit.visitAdmts_element).to be_truthy
  #       visit.select_hospital_visit(visit_date)

  #       if scenario == 'Cancel'
  #         puts scenario
  #         visit.visitCan_element.when_visible(MEDIUM_TIMEOUT)
  #         visit.visitCan
  #         visit.cancel_element.when_visible(MEDIUM_TIMEOUT)
  #         puts 'x'
  #         visit.cancel_element.click
  #       elsif scenario == 'Continue'
  #         puts scenario
  #         visit.visitCan_element.when_visible(MEDIUM_TIMEOUT)
  #         puts 'w'
  #         visit.visitCan
  #         visit.continue_element.when_visible(MEDIUM_TIMEOUT)
  #         puts 'y'
  #         visit.continue_element.click
  #       elsif scenario == 'Ok'
  #         puts scenario
  #         visit.setVisit_element.when_visible(MEDIUM_TIMEOUT)
  #         puts 'n'
  #         visit.setVisit
  #       end
  #     end
  #   end
  # end

  # # context 'TC#482: Visit Management : Clinical Appointments' do

  # #     it 'search, select and add visit using date field' do

  # #       from_date_string = '05/25/2014'
  # #       to_date_string = '06/30/2015'

  # #       overview.navigate_to_overview
  # #       vital.vitals_gist_applet_finish_loading?
  # #       visit.selVisitInfo_element.when_visible(MEDIUM_TIMEOUT)
  # #       visit.selVisitInfo_element.click
  # #       visit.visitNew_element.when_visible(MEDIUM_TIMEOUT)
  # #       visit.fromDtApts_element.when_visible(MEDIUM_TIMEOUT)
  # #       puts '10'
  # #       @common_test.enter_into_date_field(visit.fromDtApts_element, from_date_string)
  # #       puts '11'
  # #       @common_test.enter_into_date_field(visit.thrDtApts_element, to_date_string)
  # #       visit.setVisit_element.when_visible(MEDIUM_TIMEOUT)
  # #       visit.setVisit_element.click
  # #   end
  # # end
  # context 'TC#482: Visit Management : New Visit' do
  #   new_date_string = '05/25/2014'
  #   location_name = 'ULTRASOUND'

  #   it 'enter a new visit: New Visit'  do
  #     overview.navigate_to_overview
  #     vital.vitals_gist_applet_finish_loading?
  #     visit.selVisitInfo_element.when_visible(MEDIUM_TIMEOUT)
  #     visit.selVisitInfo_element.click
  #     visit.selectProvider_element.when_visible(LARGE_TIMEOUT)
  #     visit.selectProvider = 'Hfe,Test Two'
  #     visit.visitNew_element.when_visible(MEDIUM_TIMEOUT)
  #     visit.visitNew
  #     visit.selectLocation_element.when_visible(MEDIUM_TIMEOUT)
  #     puts 'j'
  #     visit.selectLocation = location_name
  #     visit.newVisitDate_element.when_visible(MEDIUM_TIMEOUT)
  #     @common_test.enter_into_date_field(visit.newVisitDate_element, new_date_string)
  #     @common_test.enter_into_time_field(visit.newVisitTime_element, '16:05')
  #     visit.setVisit_element.when_visible(MEDIUM_TIMEOUT)
  #     visit.setVisit_element.click
  #   end
  # end
end
