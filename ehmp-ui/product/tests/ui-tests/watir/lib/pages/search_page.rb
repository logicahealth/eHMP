require 'rubygems'
require 'watir-webdriver'
require 'page-object'
require_relative 'common_elements_page'
require_relative '../common/ehmp_constants.rb'

# SearchPage page-object for $BASE/#patient-search-screen
class SearchPage < CommonElementsPage
  include PageObject

  # patient search
  text_field(:patientSearch, id: 'patientSearchInput')

  # global search
  li(:cPRSListTab, id: 'myCPRSList')
  # li(:mySiteTab, id: 'mySite')
  # li(:allPatientTab, id: 'global')
  a(:mySiteTab, css: '#mySite a')
  a(:allPatientTab, css: '#global a')

  h4(:patientSearchTitle, class: 'title')
  span(:returnToPatientSrch, class: 'search-icon-text')
  a(:patientInTheList, css: '.list-group a')
  a(:patient_name, css: '.list-group a:nth-of-type(1) div .col-md-6.no-padding-right')
  a(:patient_SSN, css: '.list-group a:nth-of-type(1) div .col-md-2.no-padding-left')
  a(:patient_DOB, css: '.list-group a:nth-of-type(1) div .col-md-2.no-padding')
  a(:patient_gender, css: '.list-group a:nth-of-type(1) div .col-md-2 span')

  text_field(:patientSearchLName, id: 'globalSearchLastName')
  text_field(:patientSearchFName, id: 'globalSearchFirstName')
  text_field(:patientSearchDob, id: 'globalSearchDob')
  text_field(:patientSearchSsn, id: 'globalSearchSsn')

  button(:searchBtn, id: 'globalSearchButton')
  div(:listTable, class: 'list-group')
  div(:confirmSection, id: 'confirmSection')
  div(:confirmationHeader, css: 'div.patientName')
  div(:confirmationHeader_dob, css: 'div.patientInfo > div > div:nth-of-type(2)')
  div(:confirmationHeader_age, css: 'div.patientInfo > div > div:nth-of-type(4)')
  div(:confirmationHeader_gender, css: 'div.patientInfo > div > div:nth-of-type(6)')
  div(:confirmationHeader_ssn, css: 'div.patientInfo > div > div:nth-of-type(8)')

  button(:firstConfirm, id: 'confirmationButton')
  button(:secondConfirmBtn, id: 'confirmFlaggedPatinetButton')
  button(:restrictRecrdConf, id: 'ackButton')
  link(:restrictedTitle, css: '.panel-title > a')
  p(:patientErrMsg, class: 'error-message')

  div(:patientFullNameInConfirm, class: 'patientName')
  element(:errorMsgAfterFirstConfirm, :p, css: '#confirmSection .error-message')

  li(:activeMyCprsList, css: '#myCprsList.active')
  div(:myCprsListResultTable, css: '#my-cprs-search-results div.results-table')
  elements(:myCprsListResults, :a, css: '#my-cprs-search-results div.list-group a')

  ############ local functions ##################
  def initialize(driver)
    super
    @driver = driver
  end

  def retrieve_confirmation_header
    confirmationHeader_element.text
  end

  def this_tab_has_focus?
    self.class.a(:patientTabFocus, css: '#global > a')
    patientTabFocus_element.attribute('aria-selected')
  end

  def retrieve_search_data(rawData)
    rawData.split('|')[0]
  end

  def retrieve_verification_data(rawData)
    rawData.split('|')[1]
  end

  def click_the_right_patient_from_table(search_result_id, patientName)
    self.class.elements(:nameInListGroup, :div, css: "#{search_result_id} div.patientDisplayName")
    nameInListGroup_elements.each_with_index do |name, i|
      row = i + 1
      next unless name.text.strip.include?(patientName.upcase)
      self.class.link(:recordInList, css: "#{search_result_id} .list-group > a:nth-of-type(#{row})")
      recordInList
      firstConfirm_element.when_visible(EXTENDED_TIMEOUT)
      patientFullNameInConfirm_element.when_visible(EXTENDED_TIMEOUT)
      break
    end
  end

  def click_the_right_patient_from_mysite_table(patientName)
    click_the_right_patient_from_table('#patient-search-results', patientName)
  end

  def click_the_right_patient_from_nationwide_table(patientName)
    click_the_right_patient_from_table('#global-search-results', patientName)
  end

  def total_count_in_table
    self.class.elements(:nameInListGroup, :div, class: 'patientDisplayName')
    nameInListGroup_elements.length
  end

  def this_patient_in_search_results(search_result_id, columnNum, patientName)
    found_the_value = false

    self.class.elements(:searchCellValue, :div, css: "#{search_result_id} .list-group > a > .list-group-item-text > div:nth-of-type(#{columnNum})")

    searchCellValue_elements.each do |record|
      # p "#{record.text.strip} ? #{patientName.upcase} = #{record.text.strip.include?(patientName.upcase)}"
      next unless record.text.strip.include?(patientName.upcase)
      found_the_value = true
      break if found_the_value
    end
    found_the_value
  end

  def this_patient_in_the_nationwide_patient_list_table?(columnNum, patientName)
    this_patient_in_search_results('#global-search-results', columnNum, patientName)
  end

  def this_patient_in_the_mysite_patient_list_table?(columnNum, patientName)
    this_patient_in_search_results('#patient-search-results', columnNum, patientName)
  end

  def mycprslist_loaded
    # p "active mycprslist? #{activeMyCprsList_element.visible?}"
    # p "mycprslist table? #{myCprsListResultTable_element.visible?}"
    # p "mycprslist results #{myCprsListResults_elements.length}"
    return true if activeMyCprsList_element.visible? && myCprsListResults_elements.length > 0
    return true if !activeMyCprsList_element.visible? && !myCprsListResultTable_element.visible?
    # return true if myCPRSLIST is not selected & my-cprs-search-results is not displayed
    # return true if myCPRSLIST is selected & my-cprs-searhc-results contains rows
    false
  end

  def navigate_to_patient_search_screen
    @driver.goto(BASE_URL + '#patient-search-screen')
    allPatientTab_element.when_visible(10)
    Watir::Wait.until { mycprslist_loaded }
  end
end
