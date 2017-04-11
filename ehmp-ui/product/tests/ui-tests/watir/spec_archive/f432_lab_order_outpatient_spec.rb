#!/bin/env ruby
# encoding: utf-8

require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative '../lib/module/util.rb'
require_relative 'rspec_helper'
require_relative '../lib/pages/login_page'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/pages/search_page'
require_relative '../lib/pages/patient_overview_page'
require_relative '../lib/pages/numeric_lab_results_page'
require_relative '../lib/pages/orders_form_page'
require_relative '../lib/pages/coversheet_page'
require_relative '../lib/pages/orders_page'

include Util

describe 'Feature No. 432: f432_lab_order_outpatient_spec.rb', debug: true do
  include DriverUtility
  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)
    @common_test = CommonTest.new(@driver)
    @search = SearchPage.new(@driver)
    @common_test.login_with('PW    ', 'PW    !!', 'PANORAMA')
  end

  after(:all) do
    @driver.close
  end

  let(:numeric_lab_results) { LabResultsPage.new(@driver) }
  let(:order_form) { OrdersFormPage.new(@driver) }
  let(:coversheet) { Coversheet.new(@driver) }
  let(:orders) { OrdersPage.new(@driver) }

  context 'US7559: Users can order a lab from the numeric lab results overview' do
    it 'TC569: User logs in and searches for Eight, Patient', tc569: true do
      patient_name = 'Eight, Patient'
      @common_test.patient_search(patient_name)
      @search.patientInTheList_element.when_visible
      @search.click_the_right_patient_from_table(patient_name)
      @search.firstConfirm_element.when_visible
      @search.firstConfirm
      @search.secondConfirmBtn_element.when_visible
      @search.secondConfirmBtn
    end

    it 'TC569: User opens up the Numeric Lab Results Overview order form', tc569: true do
      numeric_lab_results.numeric_lab_results_gist_plus_button_element.when_visible
      numeric_lab_results.numeric_lab_results_gist_plus_button
    end

    it 'TC569: Verify that the order form components are present', tc569: true do
      order_form.check_if_order_form_inputs_present
      expect(order_form.order_form_title).to eq(ORDER_MODAL_TITLE)
    end

    xit 'TC569: Open up the order form through the tile menu on numeric lab results overview', tc569: true do
      order_form.close_button
      numeric_lab_results.glucose_result_element.when_visible
      numeric_lab_results.glucose_result
      numeric_lab_results.add_order_element.when_visible
      numeric_lab_results.add_order
      order_form.order_form_title_element.when_visible
    end

    xit 'TC569: Verify that the order form components are present', tc569: true do
      order_form.check_if_order_form_inputs_present
      expect(order_form.order_form_title).to eq(ORDER_MODAL_TITLE)
    end
  end

  context 'US7559: Users can order a lab from the numeric lab results coversheet' do
    xit 'TC570: User logs in and searches for Eight, Patient', tc570: true do
      patient_name = 'Eight,Patient'
      @common_test.patient_search(patient_name)
      @search.patientInTheList_element.when_visible
      @search.click_the_right_patient_from_table(patient_name)
      @search.firstConfirm_element.when_visible
      @search.firstConfirm
      @search.secondConfirmBtn_element.when_visible
      @search.secondConfirmBtn
    end

    it 'TC570: Switch to the coversheet view', tc570: true do
      coversheet.navigate_to_coversheet
    end

    it 'TC570: User opens up the Numeric Lab Results Overview order form', tc570: true do
      numeric_lab_results.numeric_lab_results_coversheet_plus_button_element.when_visible
      numeric_lab_results.numeric_lab_results_coversheet_plus_button
    end

    it 'TC570: Verify that the order form components are present', tc570: true do
      expect(order_form.order_form_title).to eq(ORDER_MODAL_TITLE)
    end
  end

  context 'US7559: Users can order a lab from the orders coversheet' do
    xit 'TC571: User logs in and searches for Eight, Patient', tc571: true do
      patient_name = 'Eight, Patient'
      @common_test.patient_search(patient_name)
      @search.patientInTheList_element.when_visible
      @search.click_the_right_patient_from_table(patient_name)
      @search.firstConfirm_element.when_visible
      @search.firstConfirm
      @search.secondConfirmBtn_element.when_visible
      @search.secondConfirmBtn
    end

    it 'TC571: Switch to the coversheet view', tc571: true do
      coversheet.navigate_to_coversheet
    end

    it 'TC571: User opens up the Numeric Lab Results Overview order form', tc571: true do
      orders.orders_coversheet_plus_button_element.when_visible
      orders.orders_coversheet_plus_button
    end

    it 'TC571: Verify that the order form components are present', tc571: true do
      expect(order_form.order_form_title).to eq(ORDER_MODAL_TITLE)
    end
  end
end
