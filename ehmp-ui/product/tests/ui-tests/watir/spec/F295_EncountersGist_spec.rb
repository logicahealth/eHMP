#!/bin/env ruby
# encoding: utf-8

require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative 'rspec_helper'
require_relative '../lib/pages/encounters_gist_page'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/pages/patient_overview_page'
require_relative '../lib/pages/table_verifier'
require_relative '../lib/pages/global_date_filter_page'

describe 'Story#US3706: F295_EncountersGist_spec.rb', future: true do
  include DriverUtility
  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)
    @common_test = CommonTest.new(@driver)
    @eg = EncountersGistPage.new(@driver)
    @overview = PatientOverview.new(@driver)
    @table_verifier = TableVerifier.new(@driver)
    @global_date = GlobalDateFilter.new(@driver)
  end

  after(:all) do
    @driver.close
  end

  context 'AC#F295-1: Encounters Initial View' do
    it '. Login to the application' do
      @common_test.login_with_default
    end

    it '. Search for a patient' do
      @common_test.mysite_patient_search('sixhundred', 'Sixhundred, patient')
    end

    it '. Overview screen is active' do
      @overview.screenNm_element.when_visible(20)
      expect(@overview.screenNm_element.text.strip.include?('Overview')).to eq(true)
    end

    xit '. Encounter Gist is present - F295_encounters_initial_view' do
      @eg.encounterGistTitle_element.when_visible(20)
      expect(@eg.encounterGistTitle_element.text.strip.include?('ENCOUNTERS')).to eq(true)
    end

    xit '. Encounter Gist has the headers Encounter, Last and HxOccurrence - F295_encounters_initial_view' do
      @eg.encounterGistTitle_element.when_visible(20)
      expect(@eg.descriptionHeader_element.text.strip).to eq('Encounter')
      expect(@eg.lastHeader_element.text.strip).to eq('Last')
      expect(@eg.HxOccurrenceHeader_element.text.strip).to eq('Hx Occurrence')
    end

    xit '. Encounter Gist has the inital view Visits, Appointments, Admissions, Procedures - F295_encounters_initial_view' do
      @eg.encounterGistTitle_element.when_visible(20)
      expect(@eg.visits_element.text.strip.include?('Visits')).to eq(true)
      expect(@eg.appointments_element.text.strip.include?('Appointments')).to eq(true)
      expect(@eg.admissions_element.text.strip.include?('Admissions')).to eq(true)
      expect(@eg.procedures_element.text.strip.include?('Procedures')).to eq(true)
    end
  end # end context Encounters Initial View

  xcontext 'AC#F295-2: Encounters Expanded View - F295_encounterGist_expanded_view' do
    it '. Expand view of encounters gist applet goes to TIMELINE applet view' do
      @eg.maximize_encounter_gist_view
      @eg.encounterMaximizeAppletTitle_element.when_visible(60)
      Watir::Wait.until { @eg.screenNm.upcase == 'TIMELINE' }
      expect(@eg.encounterMaximizeAppletTitle_element.text.strip.upcase).to eq('TIMELINE')
      @eg.exit_timeline_view
    end
  end # end context Encounters Expanded View

  context 'Change global date filter to All' do
    it 'selects all from GDT' do
      @overview.navigate_to_overview unless @overview.screenNm == 'Overview'
      @global_date.glodate_collapsed_element.when_visible(10)
      @global_date.glodate_collapsed
      @global_date.all_range_btn_element.when_visible(10)
      @global_date.all_range_btn
      @global_date.apply_btn
    end
  end # end context Global date filter

  xcontext 'AC#F295-3: Encounters Filter data - no cucumber test, too data specific' do
    it '. Able to filter on any particular text in Encounters Gist Applet' do
      @eg.filterButton
      @eg.filterInput_element.when_visible(20)
      @eg.input_into_search_filter_encounter('cardiology')
      @eg.visits_element.when_visible
      expect(@eg.visits_element.text.strip).to include('Visits')
      expect(@eg.visits_element.text.strip).to include('9y')
      expect(@eg.visits_element.text.strip).to include('2')
      @eg.filterButton
    end
  end # end context Encounters Filter data

  xcontext 'AC#F295-4: Quick view of Visit encounter type' do
    it '. Verify the the number of Visits and time past since last visit. ' do
      @eg.visits_element.when_visible(20)
      expect(@eg.visits_element.text.strip).to include('Visits')
      expect(@eg.visits_element.text.strip).to include('11y')
      expect(@eg.visits_element.text.strip).to include('4')
    end

    it '. Verify the the column headers of the Visit Type object. ' do
      @eg.visits_element.when_visible(20)
      @eg.expand_object('Visits')
      @eg.visitTypeHeader_element.when_visible(20)
      expect(@eg.visitTypeHeader_element.text.strip).to eq('Visit Type')
      p @eg.visitLastHeader_element.text.strip
      expect(@eg.visitLastHeader_element.text.strip).to eq('Last')
      expect(@eg.visitHxOccurrenceHeader_element.text.strip).to eq('Hx Occurrence')
    end

    it '. Verify the the details of the Visit Type object. ' do
      @eg.visitTypeHeader_element.when_visible(20)
      @eg.visitTypeRow1_element.when_visible
      expect(@eg.visitTypeRow1_element.text.strip).to eq('GENERAL INTERNAL MEDICINE')
      expect(@eg.visitLastRow1_element.text.strip).to eq('9y')
      expect(@eg.visitHxOccurrencRow1_element.text.strip).to eq('2')
      expect(@eg.visitTypeRow2_element.text.strip).to eq('CARDIOLOGY')
      expect(@eg.visitLastRow2_element.text.strip).to eq('10y')
      expect(@eg.visitHxOccurrencRow2_element.text.strip).to eq('2')
    end

    xit '.Verify that visit type column header can be sorted in ascending when clicked first time - F295_encounterGist_Column_Sorting_Visit_Type' do
      @eg.visitTypeHeader_element.when_visible(20)
      @eg.visitTypeHeader_element.click
      expect(@eg.verify_sort_ascending('Visit Type')).to be_truthy
    end

    xit '.Verify that visit type column header can be sorted in descending when clicked again - F295_encounterGist_Column_Sorting_Visit_Type' do
      @eg.visitTypeHeader_element.when_visible(20)
      @eg.visitTypeHeader_element.click
      expect(@eg.verify_sort_descending('Visit Type')).to be_truthy
    end

    it '.Close the Visits objects' do
      @eg.expand_object('Visits') # closes the visits object
    end

    xit '. Verify the the details when clicking on the right hand side of the visits object. - F295_encounterGist_quick_view_visits' do
      @eg.visits_element.when_visible(20)
      @eg.right_click_object('Visits')
      @eg.quickViewTableTitle_element.when_visible(20)
      expect(@eg.quickViewTableTitle_element.text.strip).to eq('Recent Visits')
      expected_headers = ['Date', 'Appt Status', 'Clinic Name', 'Provider', 'Facility']
      expect(@table_verifier.table_contains_headers(@eg.visitsTableHeaders_elements, expected_headers)).to be_truthy
      row1 = ['11/02/2006',  'Unknown', 'GENERAL INTERNAL MEDICINE', 'Unknown', '888']
      row2 = ['02/04/2005', 'Unknown', 'CARDIOLOGY', 'Unknown', '888']
      rows = []
      rows.push(row1)
      rows.push(row2)
      expect(@table_verifier.table_contains_rows(@eg.visitsTable_elements, rows)).to be_truthy
    end
  end # end Context : Quick view of Visit encounter type

  xcontext 'AC#F295-35: Multi option menu for Visit Type' do
    it '. Verify the quick view multi option menu item' do
      @eg.expand_object('Visits')
      @eg.visitTypeGeneralInternalMedicine_element.click
      @eg.quickViewIcon_element.when_visible(20)
      @eg.quickViewIcon
      expected_headers = ['Date', 'Appt status', 'Location', 'Provider', 'Facility']
      expect(@table_verifier.table_contains_headers(@eg.visitTypeTableHeaders_elements, expected_headers)).to be_truthy
      row1 = ['11/02/2006', 'Unknown', '20 Minute', 'Unknown', '888']
      rows = []
      rows.push(row1)
      expect(@table_verifier.table_contains_rows(@eg.visitTypeTable_elements, rows)).to be_truthy
    end

    it '. Verify the detail view multi option menu item' do
      @eg.detailViewIcon_element.when_visible(20)
      @eg.detailViewIcon
      expect(@eg.modalTitle_element.text.strip).to eq('GENERAL INTERNAL MEDICINE')
    end
  end # end context Multi option menu for Visit Type
end # end describe block
