#!/bin/env ruby
# encoding: utf-8

require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative 'rspec_helper'
require_relative '../lib/pages/vitals_gist_page'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/pages/patient_overview_page'
require_relative '../lib/pages/global_date_filter_page'

describe 'Story#US3138: f280_vitals_gist_spec.rb' do
  # Team Venus
  include DriverUtility
  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)
    @common_test = CommonTest.new(@driver)
    @common_test.login_with_default
  end

  after(:all) do
    @driver.close
  end

  let(:vg) { VitalsGistPage.new(@driver) }
  let(:overview) { PatientOverview.new(@driver) }
  let(:global_date) { GlobalDateFilter.new(@driver) }

  context 'Feature No. 280: Vitals Gist View', future: true do
    patient_name = 'Ten, Patient'

    it '. Search for a patient' do
      @common_test.mysite_patient_search(patient_name, patient_name, true)
    end

    xit '. Vitals Gist is present on Overview - F280_a_vitalsGist_view', tc47: true do
      overview.screenNm_element.when_visible(MEDIUM_TIMEOUT)
      expect(overview.screenNm_element.text.strip.include?('Overview')).to eq(true)
      vg.vitalsGistTitle_element.when_visible(MEDIUM_TIMEOUT)
      expect(vg.vitalsGistTitle_element.text.strip.include?('VITALS')).to eq(true)
      global_date.select_all
    end

    # it '. Selects all from GDT' do
    #   global_date.select_all
    # end

    xit '. Verify Vitals displays Blood pressure (Result, Age and Chart) - F280_1_vitalsGist_View' do
      # took out the checks for existence if there is also a check for data in attempt to reduce test time
      # expect(vg.nameBPS?).to eq(true)
      vg.nameBPS_element.when_visible
      expect(vg.nameBPS_element.text).to eq('BPS')
      # expect(vg.nameBPD?).to eq(true)
      expect(vg.nameBPD_element.text).to eq('BPD')

      unless vg.noRecordsBPS_element.visible?
        # expect(vg.resultBPS?).to eq(true)
        expect(vg.resultBPS_element.text.strip.length).to be > 0
        # expect(vg.ageBPS?).to eq(true)
        expect(vg.age_in_correct_format(vg.ageBPS_element.text.strip)).to eq(true)
        expect(vg.chartBPS?).to eq(true)
      end

      unless vg.noRecordsBPD_element.visible?
        # expect(vg.resultBPD?).to eq(true)
        expect(vg.resultBPD_element.text.strip.length).to be > 0
        # expect(vg.ageBPD?).to eq(true)
        expect(vg.age_in_correct_format(vg.ageBPD_element.text.strip)).to eq(true)
        expect(vg.chartBPD?).to eq(true)
      end
    end

    xit '. Verify Vitals displays Pulse (Result, Age and Chart)' do
      expect(vg.nameP_element.text).to eq('Pulse')
      unless vg.noRecordsP_element.visible?
        expect(vg.resultP_element.text.strip.length).to be > 0
        expect(vg.age_in_correct_format(vg.ageP_element.text.strip)).to eq(true)
        expect(vg.chartP?).to eq(true)
      end
    end

    xit '. Verify Vitals displays Respiration (Result, Age and Chart)' do
      expect(vg.nameR_element.text).to eq('RR')
      unless vg.noRecordsR_element.visible?
        expect(vg.resultR_element.text.strip.length).to be > 0
        expect(vg.age_in_correct_format(vg.ageR_element.text.strip)).to eq(true)
        expect(vg.chartR?).to eq(true)
      end
    end

    xit '. Verify Vitals displays Temperature (Result, Age and Chart)' do
      expect(vg.nameT_element.text).to eq('Temp')
      unless vg.noRecordsT_element.visible?
        expect(vg.resultT_element.text.strip.length).to be > 0
        expect(vg.age_in_correct_format(vg.ageT_element.text.strip)).to eq(true)
        expect(vg.chartT?).to eq(true)
      end
    end

    xit '. Verify Vitals displays Pain (Result, Age and Chart)' do
      expect(vg.namePN_element.text).to eq('Pain')
      unless vg.noRecordsPN_element.visible?
        expect(vg.resultPN_element.text.strip.length).to be > 0
        expect(vg.age_in_correct_format(vg.agePN_element.text.strip)).to eq(true)
        expect(vg.chartPN?).to eq(true)
      end
    end

    xit '. Verify Vitals displays SpO2 (Result, Age and Chart)' do
      expect(vg.nameSPO_element.text).to eq('SpO2')
      unless vg.noRecordsSPO_element.visible?
        expect(vg.resultSPO_element.text.strip.length).to be > 0
        expect(vg.age_in_correct_format(vg.ageT_element.text.strip)).to eq(true)
        expect(vg.chartT?).to eq(true)
      end
    end

    xit '. Verify Vitals displays Height and Weight (Result, Age and Chart)' do
      expect(vg.nameWT_element.text).to eq('Wt')
      unless vg.noRecordsWT_element.visible?
        expect(vg.resultWT_element.text.strip.length).to be > 0
        expect(vg.age_in_correct_format(vg.ageWT_element.text.strip)).to eq(true)
        expect(vg.chartWT?).to eq(true)
      end

      expect(vg.nameHT_element.text).to eq('Ht')
      unless vg.noRecordsHT_element.visible?
        expect(vg.resultHT_element.text.strip.length).to be > 0
        expect(vg.age_in_correct_format(vg.ageHT_element.text.strip)).to eq(true)
        expect(vg.chartHT?).to eq(true)
      end
    end

    xit '. Verify Vitals displays BMI (Result, Age and Chart)' do
      expect(vg.nameBMI_element.text).to eq('BMI')
      unless vg.noRecordsBMI_element.visible?
        expect(vg.resultBMI_element.text.strip.length).to be > 0
        expect(vg.age_in_correct_format(vg.ageBMI_element.text.strip)).to eq(true)
        expect(vg.chartBMI?).to eq(true)
      end
    end

    xit '. Verify that Type column header can be sorted in ascending when clicked first time - f280_vitals_type_sort ', tc47: true do
      vg.typeHeader_element.when_visible(20)
      vg.typeHeader_element.click
      expect(vg.verify_sort_ascending('Type')).to be_truthy
    end

    xit '. Verify that Type column header can be sorted in descending when clicked again - f280_vitals_type_sort ', tc47: true do
      vg.typeHeader_element.when_visible(20)
      vg.typeHeader_element.click
      expect(vg.verify_sort_descending('Type')).to be_truthy
    end

    xit '. Verify the vital toolbar - f280_vitals_toolbar' do
      expect(vg.noRecordsBPS_element.visible?).to eq(false), 'Cannot test toolbar, BPS has no records'
      # expect(vg.nameBPS?).to eq(true)
      vg.nameBPS_element.click
      vg.popoverBar_element.when_visible
      expect(vg.popoverInfo?).to eq(true)
      expect(vg.popoverDetails?).to eq(true)
      expect(vg.popoverQuick?).to eq(true)
    end

    xit '. Verify the quickview - f280_vitals_quickview' do
      expect(vg.noRecordsBPS_element.visible?).to eq(false), 'Cannot test quickview, BPS has no records'
      vg.resultBPS_element.click
      vg.popoverGist_element.when_visible
      expect(vg.popoverHeaderDate?).to eq(true)
      expect(vg.popoverHeaderResult?).to eq(true)
      expect(vg.popoverHeaderRefRange?).to eq(true)
      expect(vg.popoverHeaderFacility?).to eq(true)
      expect(vg.popoverRows_elements.length).to be > 0
    end
  end # end Context : Quick view of Vitals type
end # end describe block
