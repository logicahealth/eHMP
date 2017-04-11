#!/bin/env ruby
# encoding: utf-8

require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative 'rspec_helper'
require_relative '../lib/pages/login_page'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/pages/search_page'
require_relative '../lib/pages/common_elements_page'
require_relative '../lib/pages/patient_overview_page'
require_relative '../lib/pages/coversheet_page'
require_relative '../lib/pages/ehmp_administration_page'

describe 'Feature No. F457: f457_eHMP Administration_screen_spec.rb', debug: true do
  include DriverUtility
  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)
    @login = LoginPage.new(@driver)
    @common_test = CommonTest.new(@driver)
    @search = SearchPage.new(@driver)
    @common_element = CommonElementsPage.new(@driver)
    @over_view = PatientOverview.new(@driver)
    @covesheet = Coversheet.new(@driver)
    @ehmp_administration = EhmpAdministrationPage.new(@driver)
  end

  after(:all) do
    @driver.close
  end

  context 'US7762:TC1053: only eHMP Administration user can access eHMP Administration screen' do
    it 'logs in as an eHMP Administration user' do
      @common_test.login_with('PW    ', 'PW    !!', 'PANORAMA')
    end

    it 'verifies that user logged in correctly' do
      @login.currentUser_element.when_visible(20)
      expect(@login.navTitle_element.text.strip.include?('Patient Selection')).to eq(true)
      expect(@login.currentUser_element.text.strip.include?('USER, PANORAMA')).to eq(true)
    end
    it 'verifies eHMP Administration button is visible and it navigates user to the eHMP Administration screen' do
      @common_element.ehmp_administration_btn_element.when_visible(20)
      expect(@common_element.ehmp_administration_btn_element.text.strip.include?('eHMP Administration')).to eq(true)
      @common_element.ehmp_administration_btn
      Watir::Wait.until { @over_view.screenNm == 'eHMP Administration' }
      @ehmp_administration.lastNameHeader_element.when_visible(20)
      expect(@over_view.screenNm_element.text.strip.include?('eHMP Administration')).to eq(true)
    end

    it 'logs out' do
      @common_test.logout
    end

    it 'logs in as non eHMP Administration user' do
      @common_test.login_with('he12345', 'he12345!!', 'PANORAMA')
    end

    it 'verifies that user logged in correctly' do
      @login.currentUser_element.when_visible(20)
      expect(@login.navTitle_element.text.strip.include?('Patient Selection')).to eq(true)
      expect(@login.currentUser_element.text.strip.include?('HELLEWELL, JAMES')).to eq(true)
    end

    it 'Verifies non eHMP Administration user cannot see the eHMP Administration button' do
      expect(@common_element.ehmp_administration_btn?).to eq(false)
    end

    it 'logs out' do
      @common_test.logout
    end
  end

  context 'US7762:TC1054, TC1055, TC1056: eHMP Administration user can add, edit and delete user role' do
    it 'logs in as eHMP Administration user' do
      @common_test.login_with('PW    ', 'PW    !!', 'PANORAMA')
    end

    it 'verifies that user logged in correctly' do
      @login.currentUser_element.when_visible(20)
      expect(@login.navTitle_element.text.strip.include?('Patient Selection')).to eq(true)
      expect(@login.currentUser_element.text.strip.include?('USER, PANORAMA')).to eq(true)
    end

    it 'navigates to eHMP Administration screen and verifies eHMP Administration applet is correctly displayed' do
      @common_element.ehmp_administration_btn
      Watir::Wait.until { @over_view.screenNm == 'eHMP Administration' }
      Watir::Wait.until { @covesheet.applets_elements.length == 1 }
      @ehmp_administration.lastNameHeader_element.when_visible(20)
      expect(@ehmp_administration.eHMP Administration_applet?).to eq(true)
      expect(@ehmp_administration.lastNameHeader?).to eq(true)
      expect(@ehmp_administration.lastNameHeader_element.text).to eq('Last Name')
      expect(@ehmp_administration.firstNameHeader?).to eq(true)
      expect(@ehmp_administration.firstNameHeader_element.text).to eq('First Name')
      expect(@ehmp_administration.rolesHeader?).to eq(true)
      expect(@ehmp_administration.rolesHeader_element.text).to eq('Roles')
    end

    it 'opens details view of the first user in the list and clears all selected roles' do
      @ehmp_administration.firstCell_element.click
      @ehmp_administration.firstCell_element.click
      @ehmp_administration.modalTitle_element.when_visible(20)
      @ehmp_administration.roles_element.clear
    end

    it 'adds a role' do
      @ehmp_administration.roles_element.options[2].click
      Watir::Wait.until(5) { @ehmp_administration.designated_roles_element.text == 'Acc' }
      expect(@ehmp_administration.roles).to eq('Acc')
      expect(@ehmp_administration.designated_roles_element.text).to eq('Acc')
    end

    it 'edits the added role' do
      @ehmp_administration.roles_element.options[2].click
      @ehmp_administration.roles_element.options[3].click
      @ehmp_administration.roles_element.options[1].click
      Watir::Wait.until(5) { @ehmp_administration.designated_roles_element.text == 'Standard Doctor, Computer Specialist' }
      expect(@ehmp_administration.designated_roles_element.text).to eq('Standard Doctor, Computer Specialist')
    end

    it 'deletes the added roles' do
      @ehmp_administration.roles_element.options[1].click
      @ehmp_administration.roles_element.options[3].click
      Watir::Wait.until(5) { @ehmp_administration.designated_roles_element.text == 'None' }
      expect(@ehmp_administration.designated_roles_element.text).to eq('None')
      @ehmp_administration.save_roles_btn
    end

    it 'logs out' do
      @common_test.logout
    end
  end

  context 'assigned role persists' do
    it 'logs in as eHMP Administration user' do
      @common_test.login_with('PW    ', 'PW    !!', 'PANORAMA')
    end

    it 'verifies that user logged in correctly' do
      @login.currentUser_element.when_visible(20)
      expect(@login.navTitle_element.text.strip.include?('Patient Selection')).to eq(true)
      expect(@login.currentUser_element.text.strip.include?('USER, PANORAMA')).to eq(true)
    end

    it 'addes a role and saves' do
      @common_element.ehmp_administration_btn
      Watir::Wait.until { @over_view.screenNm == 'eHMP Administration' }
      Watir::Wait.until { @covesheet.applets_elements.length == 1 }
      @ehmp_administration.lastNameHeader_element.when_visible(20)
      @ehmp_administration.select31labtech_element.scroll_into_view
      @ehmp_administration.select31labtech_element.when_visible(20)
      @ehmp_administration.select31labtech_element.click
      @ehmp_administration.select31labtech_element.click
      @ehmp_administration.modalTitle_element.when_visible(20)
      @ehmp_administration.roles_element.options[0].click
      @ehmp_administration.save_roles_btn
      @ehmp_administration.select31labtech_element.click
      @ehmp_administration.select31labtech_element.click
      @ehmp_administration.modalTitle_element.when_visible(20)
      @ehmp_administration.roles_element.clear
      @ehmp_administration.roles_element.options[2].click
      Watir::Wait.until(5) { @ehmp_administration.designated_roles_element.text == 'Acc' }
      expect(@ehmp_administration.roles).to eq('Acc')
      expect(@ehmp_administration.designated_roles_element.text).to eq('Acc')
      @ehmp_administration.save_roles_btn
      sleep 5
    end

    it 'verifies the role is saved in User Info table' do
      # sleep 20
      @ehmp_administration.lastNameHeader_element.when_visible(20)
      Watir::Wait.until(5) { @ehmp_administration.thirdCell_element.text == 'Acc' }
      expect(@ehmp_administration.thirdCell_element.text).to eq('Acc')
    end

    it 'logs out' do
      @common_test.logout
    end

    it 'logs in as a different eHMP Administration user' do
      @common_test.login_with('PW    ', 'PW    !!', 'PANORAMA')
    end

    it 'verifies that user logged in correctly' do
      @login.currentUser_element.when_visible(20)
      expect(@login.navTitle_element.text.strip.include?('Patient Selection')).to eq(true)
      expect(@login.currentUser_element.text.strip.include?('KHAN, VIHAAN')).to eq(true)
    end

    it 'verifies assinged role persists' do
      @common_element.ehmp_administration_btn
      Watir::Wait.until { @over_view.screenNm == 'eHMP Administration' }
      Watir::Wait.until { @covesheet.applets_elements.length == 1 }
      @ehmp_administration.lastNameHeader_element.when_visible(20)
      @ehmp_administration.select31labtech_element.scroll_into_view
      Watir::Wait.until(5) { @ehmp_administration.thirdCell_element.text == 'ehmp_administration' }
      expect(@ehmp_administration.thirdCell_element.text).to eq('ehmp_administration')
    end
  end
end
