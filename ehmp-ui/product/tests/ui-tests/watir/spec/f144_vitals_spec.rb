require 'rubygems'
require 'watir-webdriver'
require 'page-object'
require_relative 'rspec_helper'
require_relative '../lib/common/ehmp_constants'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/pages/coversheet_page'
require_relative '../lib/pages/patient_overview_page'
require_relative '../lib/pages/global_date_filter_page'
require_relative '../lib/pages/vitals_page'

describe '(F144) US2800: Verify Vitals applet. ( f144_vitals_spec.rb )', future: true do
  include DriverUtility

  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)
    @common_test = CommonTest.new(@driver)
    @common_test.login_with_default
    full_patient_name = 'Eight, Patient'
    @common_test.mysite_patient_search full_patient_name, full_patient_name, true
  end

  after(:all) do
    @driver.close
  end
  # no_record_text = 'No Record'
  let(:no_record_text) { 'No Record' }
  let(:coversheet) { Coversheet.new(@driver) }
  let(:overview) { PatientOverview.new(@driver) }
  let(:applet) { VitalsPage.new(@driver) }
  let(:globaldate) { GlobalDateFilter.new(@driver) }

  context 'Vitals Applet on Coversheet' do
    title = 'VITALS'
    xit 'Verify Vitals applet is present on coversheet - base' do
      coversheet.navigate_to_coversheet
      expect(coversheet.applet_visible? Coversheet::VITALS_APPLET).to eq(true)
      coversheet.vitalATable_element.when_visible
    end
    xit "Verify title is #{title} - US2800f" do
      expect(applet.vitalsTitle).to eq(title)
    end
    xit 'Verify applet buttons - US2800f' do
      expect(applet.refresh?).to eq(true)
      expect(applet.help?).to eq(true)
      expect(applet.maximize?).to eq(true)
    end
    xit 'DE1068: Verify does not have filter button' do
      expect(applet.filter?).to eq(false)
    end

    xit 'Verify expected vitals listed - US2800_coversheet_only2' do
      expect(applet.bp_label_element.text).to eq('BP')
      expect(applet.p_label_element.text).to eq('P')
      expect(applet.r_label_element.text).to eq('R')
      expect(applet.t_label_element.text).to eq('T')
      expect(applet.po2_label_element.text).to eq('PO2')
      expect(applet.pn_label_element.text).to eq('PN')
      expect(applet.wt_label_element.text).to eq('WT')
      expect(applet.bmi_label_element.text).to eq('BMI')
    end

    xit 'Verify vitals data - US2800_coversheet_only2' do
      # date_format = /\d\d\/\d\d\/\d\d\d\d/
      # date_format = /\d{2}\/\d{2}\/\d{4}/
      date_format = %r{\d\d/\d\d/\d\d\d\d}
      unless applet.bp_no_record_element.visible?
        expect(applet.bp_result_element.text.strip.length).to be > (0), 'Expected BP result to display text'
        expect(date_format.match(applet.bp_date)).to_not be_nil, "Expected BP date to be in specific format #{date_format}: #{applet.bp_date_element.text}"
      end

      unless applet.p_result_element.text.eql? no_record_text
        expect(applet.p_result_element.text.strip.length).to be > (0), 'Expected P result to display text'
        expect(date_format.match(applet.p_date)).to_not be_nil, "Expected P date to be in specific format #{date_format}: #{applet.p_date_element.text}"
      end

      unless applet.r_result_element.text.eql? no_record_text
        expect(applet.r_result_element.text.strip.length).to be >  (0), 'Expected R result to display text'
        expect(date_format.match(applet.r_date)).to_not be_nil, "Expected R date to be in specific format #{date_format}: #{applet.r_date_element.text}"
      end

      unless applet.t_result_element.text.eql? no_record_text
        expect(applet.t_result_element.text.strip.length).to be > (0), 'Expected T result to display text'
        expect(date_format.match(applet.t_date)).to_not be_nil, "Expected T date to be in specific format #{date_format}: #{applet.t_date_element.text}"
      end

      unless applet.po2_result_element.text.eql? no_record_text
        expect(applet.po2_result_element.text.strip.length).to be > (0), 'Expected PO2 result to display text'
        expect(date_format.match(applet.po2_date)).to_not be_nil, "Expected PO2 date to be in specific format #{date_format}: #{applet.po2_date_element.text}"
      end

      unless applet.pn_result_element.text.eql? no_record_text
        expect(applet.pn_result_element.text.strip.length).to be > (0), 'Expected PN result to display text'
        expect(date_format.match(applet.pn_date)).to_not be_nil, "Expected PN date to be in specific format #{date_format}: #{applet.pn_date_element.text}"
      end

      unless applet.wt_result_element.text.eql? no_record_text
        expect(applet.wt_result_element.text.strip.length).to be > (0), 'Expected WT result to display text'
        expect(date_format.match(applet.wt_date)).to_not be_nil, "Expected WT date to be in specific format #{date_format}: #{applet.wt_date_element.text}"
      end

      unless applet.bmi_result_element.text.eql? no_record_text
        expect(applet.bmi_result_element.text.strip.length).to be > (0), 'Expected BMI result to display text'
        expect(date_format.match(applet.bmi_date)).to_not be_nil, "Expected BMI date to be in specific format #{date_format}: #{applet.bmi_date_element.text}"
      end
    end
  end
  context 'Vitals Applet behavior' do
    xit 'Verify the vitals applet refreshes - f144_vitals_applet_summary_view_refresh ' do
      applet.refresh
      Watir::Wait.until { applet.applet_finish_loading? }
    end

    xit 'Verify the vitals applet expands - US2800e' do
      applet.maximize
      Watir::Wait.until { coversheet.screenNm == 'Vitals' }
      expect(applet.minimize?).to eq(true)
    end

    xit 'Verify the expanded applet returns to coversheet - US2800g' do
      applet.minimize
      Watir::Wait.until { coversheet.screenNm == 'Coversheet' }
    end

    xit 'Verify the vitals applet is affected by the global date filter - TA39335' do
      coversheet.navigate_to_coversheet unless coversheet.screenNm == 'Coversheet'
      Watir::Wait.until { applet.applet_finish_loading? }
      bp_text = applet.bp_result_element.text
      globaldate.select_24h
      applet.bp_no_record_element.when_visible
      expect(applet.bp_result_element.text).to_not eq(bp_text)
    end
  end

  xcontext 'Vitals Applet Details - DE2609' do
    it 'Verify the vitals applet can open the BP details - DE2017, DE2499' do
      # globaldate.select_all removed because of DE2499
      # Watir::Wait.until { !applet.bp_result_element.text.eql? no_record_text }
      applet.bp_no_record_element.when_not_visible(MEDIUM_TIMEOUT)
      Watir::Wait.until { applet.applet_finish_loading? }
      applet.bp_result_element.click
      applet.vital_detail_element.when_visible
      applet.vital_detail

      possible_titles = ['Blood Pressure', 'BP']
      applet.vital_modal_title_element.when_visible
      modal_title = applet.vital_modal_title_element.text.strip
      expect(possible_titles.include? modal_title).to eq(true), "Modal title does not match possible titles #{possible_titles}"
      applet.vital_modal_xclose
    end
    it 'Verify the vitals applet can open the BMI details -DE2017' do
      applet.vital_modal_xclose if applet.mainModal_element.visible? == true
      Watir::Wait.until { applet.mainModal_element.visible? == false }
      # wait.until { element_is_not_present?(:css, 'div.modal-backdrop.fade.in') }
      Watir::Wait.until { applet.mainModalBackdrop_element.visible? == false }
      sleep 1 # the background fade is not completely gone not sure why
      applet.bmi_result_element.click
      applet.vital_detail_element.when_visible
      applet.vital_detail

      possible_titles = ['BMI', 'Body Mass Index']
      applet.vital_modal_title_element.when_visible
      modal_title = applet.vital_modal_title_element.text.strip
      expect(possible_titles.include? modal_title).to eq(true), "Modal title does not match possible titles #{possible_titles}"
    end
  end
end
