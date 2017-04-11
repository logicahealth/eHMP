require 'rubygems'
require 'watir-webdriver'
require 'page-object'

# VitalsGistPage: Page-Object for vitals gist on overview page and expanded vitals gist
class VitalsGistPage
  include PageObject

  span(:vitalsGistTitle, css: '[data-appletid=vitals] .panel-title')
  span(:typeHeader, css: '#vitals-observations-gist #name-header')
  span(:lastHeader, css: '#vitals-observations-gist #age-header')
  span(:resultHeader, css: '#vitals-observations-gist #results-header')

  # Vitals Gist buttons
  button(:refresh, css: '[data-appletid=vitals] .applet-refresh-button')
  link(:help, id: 'help-button-vitals')
  button(:add, css: '[data-appletid=vitals] .applet-add-button')
  button(:maximize, css: '[data-appletid=vitals] .applet-maximize-button')
  button(:filter, css: '[data-appletid=vitals] .applet-filter-button')

  # VITALS GIST elements accesible from overview screen
  VITALS_HEADER = 'vitals-observations-gist'
  div(:vitalsGrid, id: "#{VITALS_HEADER}")
  span(:vitalsHeaderType, css: "##{VITALS_HEADER} #name-header")
  span(:vitalsHeaderResult, css: "##{VITALS_HEADER} #results-header")
  span(:vitalsHeaderLast, css: "##{VITALS_HEADER} #age-header")
  span(:vitalsHeaderGraph, css: "##{VITALS_HEADER} #graph-header")
  elements(:vitalsGistItems, :div, css: "##{VITALS_HEADER} .gistItemInner")

  # Vitals gist name
  div(:nameBPS, id: 'vitals_problem_name_BPS')
  div(:nameBPD, id: 'vitals_problem_name_BPD')
  div(:nameP, id: 'vitals_problem_name_P')
  div(:nameR, id: 'vitals_problem_name_R')
  div(:nameT, id: 'vitals_problem_name_T')
  div(:nameSPO, id: 'vitals_problem_name_PO2')
  div(:namePN, id: 'vitals_problem_name_PN')
  div(:nameWT, id: 'vitals_problem_name_WT')
  div(:nameHT, id: 'vitals_problem_name_HT')
  div(:nameBMI, id: 'vitals_problem_name_BMI')

  # Vitals Gist results
  div(:resultBPS, id: 'vitals_problem_result_BPS')
  div(:resultBPD, id: 'vitals_problem_result_BPD')
  div(:resultP, id: 'vitals_problem_result_P')
  div(:resultR, id: 'vitals_problem_result_R')
  div(:resultT, id: 'vitals_problem_result_T')
  div(:resultSPO, id: 'vitals_problem_result_PO2')
  div(:resultPN, id: 'vitals_problem_result_PN')
  div(:resultWT, id: 'vitals_problem_result_WT')
  div(:resultHT, id: 'vitals_problem_result_HT')
  div(:resultBMI, id: 'vitals_problem_result_BMI')

  # Vitals Gist Age
  div(:ageBPS, id: 'vitals_time_since_BPS')
  div(:ageBPD, id: 'vitals_time_since_BPD')
  div(:ageP, id: 'vitals_time_since_P')
  div(:ageR, id: 'vitals_time_since_R')
  div(:ageT, id: 'vitals_time_since_T')
  div(:ageSPO, id: 'vitals_time_since_PO2')
  div(:agePN, id: 'vitals_time_since_PN')
  div(:ageWT, id: 'vitals_time_since_WT')
  div(:ageHT, id: 'vitals_time_since_HT')
  div(:ageBMI, id: 'vitals_time_since_BMI')

  # Vitals Gist Chart
  div(:chartBPS, xpath: "//div[@id='observations_BPS']/descendant::div[@id='chartArea']")
  div(:chartBPD, xpath: "//div[@id='observations_BPD']/descendant::div[@id='chartArea']")
  div(:chartP, xpath: "//div[@id='observations_P']/descendant::div[@id='chartArea']")
  div(:chartR, xpath: "//div[@id='observations_R']/descendant::div[@id='chartArea']")
  div(:chartT, xpath: "//div[@id='observations_T']/descendant::div[@id='chartArea']")
  div(:chartSPO, xpath: "//div[@id='observations_PO2']/descendant::div[@id='chartArea']")
  div(:chartPN, xpath: "//div[@id='observations_PN']/descendant::div[@id='chartArea']")
  div(:chartWT, xpath: "//div[@id='observations_WT']/descendant::div[@id='chartArea']")
  div(:chartHT, xpath: "//div[@id='observations_HT']/descendant::div[@id='chartArea']")
  div(:chartBMI, xpath: "//div[@id='observations_BMI']/descendant::div[@id='chartArea']")

  # Vitals Gist no records
  span(:noRecordsBPS, id: 'vitals_no_record_BPS')
  span(:noRecordsBPD, id: 'vitals_no_record_BPS')
  span(:noRecordsP, id: 'vitals_no_record_P')
  span(:noRecordsR, id: 'vitals_no_record_R')
  span(:noRecordsT, id: 'vitals_no_record_T')
  span(:noRecordsSPO, id: 'vitals_no_record_PO2')
  span(:noRecordsPN, id: 'vitals_no_record_PN')
  span(:noRecordsWT, id: 'vitals_no_record_WT')
  span(:noRecordsHT, id: 'vitals_no_record_HT')
  span(:noRecordsBMI, id: 'vitals_no_record_BMI')

  # popover toolbar
  div(:popoverBar, css: '#vitals-observations-gist-items div.toolbarActive')
  a(:popoverInfo, css: '#vitals-observations-gist-items div.toolbarActive [button-type=info-button-toolbar]')
  a(:popoverDetails, css: '#vitals-observations-gist-items div.toolbarActive [button-type=detailView-button-toolbar]')
  a(:popoverQuick, css: '#vitals-observations-gist-items div.toolbarActive [button-type=quick-look-button-toolbar]')

  # quickview
  div(:popoverGist, css: 'div.gistPopover')
  element(:popoverHeaderDate, :th, css: 'div.gistPopover th:nth-child(1)')
  element(:popoverHeaderResult, :th, css: 'div.gistPopover th:nth-child(2)')
  element(:popoverHeaderRefRange, :th, css: 'div.gistPopover th:nth-child(3)')
  element(:popoverHeaderFacility, :th, css: 'div.gistPopover th:nth-child(4)')
  elements(:popoverRows, :tr, css: 'div.gistPopover tr')

  def age_in_correct_format(age)
    age_format = /\d+\D/
    !(age_format.match(age).nil?)
  end

  def vitals_gist_applet_finish_loading?
    return true if vitalsGistItems_elements.length > 0
    false
  end

  def verify_sort_ascending(column_name)
    column_values_array = []

    case column_name
    when 'Type'
      self.class.elements(:vitalsList, :div, css: '#vitals-observations-gist-items div.col-sm-12.problem-name')
    else
      fail '**** No function found! Check your script ****'
    end

    vitalsList_elements.each do |row|
      column_values_array << row.text.downcase
    end

    if (column_values_array == column_values_array.sort { |x, y| x <=> y })
      return true
    else
      return false
    end
  end

  def verify_sort_descending(column_name)
    column_values_array = []

    case column_name
    when 'Type'
      self.class.elements(:vitalsList, :div, css: '#vitals-observations-gist-items div.col-sm-12.problem-name')
    else
      fail '**** No function found! Check your script ****'
    end

    vitalsList_elements.each do |row|
      column_values_array << row.text.downcase
    end

    if (column_values_array == column_values_array.sort { |x, y| y <=> x })
      return true
    else
      return false
    end
  end
end
