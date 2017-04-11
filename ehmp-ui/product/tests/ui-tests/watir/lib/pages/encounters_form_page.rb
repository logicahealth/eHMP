require 'rubygems'
require 'watir-webdriver'
require 'page-object'

require_relative '../common/ehmp_constants'
require_relative 'visit_information_page'

# Encounters Form: Page-Object for encounters form
class EncountersFormPage
  include PageObject

  element(:first_location, :span, css: '#selectableTableAppointments > div > div > a:nth-of-type(1) div:nth-of-type(2) span')
  h4(:encountersFormTitle, id: 'main-workflow-label')
  div(:ecountersFormSectionTitles, css: '.adk-form.form-container h5')

  # Diagnoses
  button(:addOtherDiagnosis, css: '.addDiagPopover [data-original-title="Add Other Diagnosis"]')
  h5(:diagnoses_heading, css: '.scroll-enter-form > div:nth-of-type(1) h5')
  h6(:selectedDiagnosisHeading, css: '.scroll-enter-form div:nth-of-type(3) h6')
  span(:selectedDiagnosis, css: '.DiagnosisCollection .ncb-body-region .ncb-descriptive-text-region span')
  element(:diagnosisChecklistLabel, :legend, css: '.diagChecklist > legend')
  elements(:checklistForEachDiagnosis, :div, css: '.diagChecklist > div > div')
  elements(:diagnosisSectionOptionList, :option, css: '#diagnosesSection option')
  select_list(:diagnosisSectionOptionSelectList, id: 'diagnosesSection')
  element(:diagnosisSectionConditionList, :option, css: '#diagnosesSection option:nth-of-type(1)')
  element(:diagnosisSectionInfectiousDisease, :option, css: '#diagnosesSection option:nth-of-type(2)')
  div(:visitRelatedToHeader, class: 'control form-group yesNoChecklist-control yesNoChecklist')
  button(:addOtherBtn, css: '[data-original-title="Add Other Diagnosis"]')
  h3(:addOtherDiagnosisHeading, css: '.add-other-diagnosis-popover h3')
  text_field(:addOtherDiagnosisSearchField, id: 'addOtherDiagnosisSearchString')
  button(:addOtherDiagnosisSearchBtn, id: 'add-other-diagnosis-search-btn')

  # Service Connected
  h5(:serviceConnected, css: '.scroll-enter-form div:nth-of-type(4) h5')
  p(:serviceConnectedPercent, css: '.scroll-enter-form div:nth-of-type(4) div > div > div > p:nth-of-type(1)')
  p(:ratedDisabilities, css: '.scroll-enter-form div:nth-of-type(4) div  > div > div > p:nth-of-type(2)')
  legend(:visitRelatedTo, css: '.scroll-enter-form div:nth-of-type(4) legend')
  radio(:serviceConnectionRadioYes, id: 'service-connected-yes')
  radio(:serviceConnectionRadioNo, id: 'service-connected-no')

  # Visit Type
  element(:visitTypeSectionFirstItem, :option, css: '#visitTypeSelection option:nth-of-type(1)')
  elements(:visitTypeSectionOptionList, :option, css: '#visitTypeSelection option')
  h5(:visitTypeHeading, css: '.scroll-enter-form div:nth-of-type(5) h5')
  element(:visitTypeChecklistLabel, :legend, css: '.visit-checklist > legend')
  elements(:checklistForEachVisitType, :div, css: '.visit-checklist > div > div')
  button(:addRemoveModifierBtn, css: '[data-original-title="Add Modifiers"]')
  h3(:visitModifierPopoverHeading, css: '.add-visit-modifiers-popover h3')
  h6(:availableModifiersHeading, css: '.available-region .availableVisitModifiers h6')
  h6(:selectedModifiersHeading, css: '.selected-region .availableVisitModifiers h6')
  button(:visitModifierCloseBtn, id: 'add-visit-modifiers-close-btn')
  elements(:availableModifiersList, :li, css: '.add-visit-modifiers-popover .available-region li')
  element(:firstAvailableModifiersInList, :li, css: '.add-visit-modifiers-popover .available-region li:nth-of-type(1)')
  text_field(:visitTypeFilterField, id: 'available-Modifiers-modifiers-filter-results')
  h6(:availableProvidersHeading, css: '.scroll-enter-form div:nth-of-type(7) .available-region h6')
  h6(:selectedProvidersHeading, css: '.scroll-enter-form div:nth-of-type(7) .selected-region h6')
  text_field(:availableProvidersFilterField, id: 'available-Providers-modifiers-filter-results')
  elements(:availableProvidersList, :li, css: '.scroll-enter-form div:nth-of-type(7) .available-region li')
  element(:firstAvailableProvidersInList, :li, css: '.scroll-enter-form div:nth-of-type(7) .available-region li:nth-of-type(1)')
  element(:thirdAvailableProvidersInList, :li, css: '.scroll-enter-form div:nth-of-type(7) .available-region li:nth-of-type(3)')
  element(:firstSelectedProvidersInList, :li, css: '.scroll-enter-form div:nth-of-type(7) .selected-region li:nth-of-type(1)')

  # Procedure
  h5(:procedureHeading, css: '.scroll-enter-form > div:nth-of-type(9) h5')
  h6(:selectedProcedureHeading, css: '.scroll-enter-form div:nth-of-type(14) h6')
  span(:selectedProcedure, css: '.ProcedureCollection .ncb-body-region .ncb-descriptive-text-region span')
  element(:procedureChecklistLabel, :legend, css: '.procChecklist > legend')
  elements(:checklistForEachProcedure, :div, css: '.procChecklist > div > div')
  elements(:procedureSectionOptionList, :option, css: '#procedureSection option')
  element(:procedureSectionOfficeVisit1, :option, css: '#procedureSection option:nth-of-type(1)')
  element(:procedureSectionOfficeVisit2, :option, css: '#procedureSection option:nth-of-type(2)')

  def visit_type_list_label(num)
    self.class.element(:visit_type_list_label, :option, css: '#visitTypeSection option:nth-of-type('" #{ num } "') option')
    visit_type_list_label_element.text.strip
  end

  def available_modifiers_filter_results_text(num)
    self.class.li(:availableList, css: '.add-visit-modifiers-popover .available-region li:nth-of-type('" #{ num } "')')
    availableList_element.when_visible(SMALL_TIMEOUT)
    availableList_element.click
    availableList_element.text.strip
  end

  def available_providers_filter_results_text(num)
    self.class.li(:providersList, css: '.scroll-enter-form div:nth-of-type(7) .available-region li:nth-of-type('" #{ num } "')')
    providersList_element.when_visible(SMALL_TIMEOUT)
    providersList_element.click
    providersList_element.text.strip
  end

  def available_providers_list_text(num)
    self.class.element(:availableProvidersListText, :li, css: '.scroll-enter-form div:nth-of-type(7) .available-region li:nth-of-type('" #{ num } "')')
    availableProvidersListText_element.when_visible(MEDIUM_TIMEOUT)
    availableProvidersListText_element.click
    availableProvidersListText_element.text.strip
  end

  def selected_providers_list_text(num)
    self.class.element(:selectedProvidersListText, :li, css: '.scroll-enter-form div:nth-of-type(7) .selected-region li:nth-of-type('" #{ num } "')')
    selectedProvidersListText_element.when_visible(MEDIUM_TIMEOUT)
    selectedProvidersListText_element.click
    selectedProvidersListText_element.text.strip
  end

  def click_available_provider_add_button(num)
    self.class.button(:availableProviderAddBtn, css: '.scroll-enter-form div:nth-of-type(7) .available-region li:nth-of-type('" #{ num } "') .icon-btn-mini')
    availableProviderAddBtn_element.when_visible(SMALL_TIMEOUT)
    availableProviderAddBtn_element.click
  end

  def click_selected_provider_delete_button(num)
    self.class.button(:selectedProviderDeleteBtn, css: '.scroll-enter-form div:nth-of-type(7) .selected-region li:nth-of-type('" #{ num } "') .icon-btn-mini')
    selectedProviderDeleteBtn_element.when_visible(MEDIUM_TIMEOUT)
    selectedProviderDeleteBtn_element.click
  end

  def service_connection_radio_label(num)
    self.class.element(:serviceConnectionRadioLabel, :label, css: '#service-connected label:nth-of-type('" #{ num } "')')
    serviceConnectionRadioLabel_element.when_visible(SMALL_TIMEOUT)
    serviceConnectionRadioLabel_element.text.strip
  end

  def click_available_modifier_add_button(num)
    self.class.button(:availableModifierAddBtn, css: '.add-visit-modifiers-popover .available-region li:nth-of-type('" #{ num } "') .icon-btn-mini')
    availableModifierAddBtn_element.when_visible(SMALL_TIMEOUT)
    availableModifierAddBtn_element.click
  end

  def click_selected_modifier_delete_button(num)
    self.class.button(:selectedModifierDeleteBtn, css: '.add-visit-modifiers-popover .selected-region li:nth-of-type('" #{ num } "') .icon-btn-mini')
    selectedModifierDeleteBtn_element.when_visible(MEDIUM_TIMEOUT)
    selectedModifierDeleteBtn_element.click
  end

  def available_modifier_region_text(num)
    self.class.element(:availableModifierText, :div, css: '.available-region .availableVisitModifiers li:nth-of-type('" #{ num } "') div > div')
    availableModifierText_element.when_visible(MEDIUM_TIMEOUT)
    availableModifierText_element.click
    availableModifierText_element.text.strip
  end

  def selected_modifier_region_text(num)
    self.class.element(:selectedModifierText, :div, css: '.selected-region .availableVisitModifiers li:nth-of-type('" #{ num } "') div > div')
    selectedModifierText_element.when_visible(MEDIUM_TIMEOUT)
    selectedModifierText_element.click
    selectedModifierText_element.text.strip
  end

  def add_remove_modifiers_region_text
    self.class.element(:addRemoveModifierText, :li, css: '.scroll-enter-form div:nth-of-type(6) .list-inline li')
    selectedModifierText_element.when_visible(MEDIUM_TIMEOUT)
    addRemoveModifierText_element.click
    addRemoveModifierText_element.text.strip
  end

  def diagnoses_section_list(num)
    self.class.element(:diagnosesSectionList, :option, css: '#diagnosesSection option:nth-of-type('" #{ num } "')')
    diagnosesSectionList_element.when_visible(MEDIUM_TIMEOUT)
    diagnosesSectionList_element.click
    diagnosesSectionList_element.text.strip
  end

  def select_visit_location(num)
    self.class.element(:selectLocation, :span, css: '#selectableTableAppointments > div > div > a:nth-of-type('" #{ num } "') div:nth-of-type(2) span')
    selectLocation_element.when_visible(LARGE_TIMEOUT)
    selectLocation_element.click
  end

  def selected_diagnosis_result(num)
    self.class.element(:selectedDiagnosisResult, :label, css: '.diagChecklist > div > div:nth-of-type('" #{ num } "') label')
    selectedDiagnosisResult_element.text.strip
  end

  def selected_diagnosis_result_header(num)
    self.class.element(:selectedDiagnosisResultHeader, :span, css: '.DiagnosisCollection > div > div:nth-of-type('" #{ num } "')> span')
    selectedDiagnosisResultHeader_element.text.strip
  end

  def selected_procedure_result(num)
    self.class.element(:selectedProcedureResult, :label, css: '.procChecklist > div > div:nth-of-type('" #{ num } "') label')
    selectedProcedureResult_element.text.strip
  end

  def selected_procedure_result_header(num)
    self.class.element(:selectedProcedureResultHeader, :span, css: '.ProcedureCollection > div > div:nth-of-type('" #{ num } "')> span')
    selectedProcedureResultHeader_element.text.strip
  end

  def checkbox_for_diagnosis_element(num)
    self.class.checkbox(:checkUncheck, css: '.scroll-enter-form > div:nth-of-type(2) .checklist-control > div > div:nth-of-type('" #{ num } "') input')
    checkUncheck_element
  end

  def checkbox_for_diagnosis(num)
    self.class.checkbox(:checkUncheck, css: '.conditionListItems > div > div:nth-of-type('" #{ num } "') input')
    checkUncheck_element
  end

  def selected_diagnosis_checked_headers
    self.class.element(:selectedDiagnosisHeaders, :div, css: '.scroll-enter-form div:nth-of-type(4) .header > div')
    selectedDiagnosisHeaders_element
  end

  def procedure_section_list(num)
    self.class.element(:procedurSectionOptionList, :option, css: '#procedureSection option:nth-of-type('" #{ num } "')')
    procedurSectionOptionList_element.click
    procedurSectionOptionList_element.text.strip
  end

  def visit_type_section_list(num)
    self.class.element(:visitTypeSectionOptionList, :option, css: '#visitTypeSelection option:nth-of-type('" #{ num } "')')
    visitTypeSectionOptionList_element.when_visible(MEDIUM_TIMEOUT)
    visitTypeSectionOptionList_element.click
    visitTypeSectionOptionList_element.text.strip
  end

  def checkbox_for_procedure_element(num)
    self.class.checkbox(:checkUncheck, css: '.procChecklist > div > div:nth-of-type('" #{ num } "') input')
    checkUncheck_element
  end

  def checkbox_for_visit_type_element(num)
    self.class.checkbox(:checkUncheck, css: '.visit-checklist > div > div:nth-of-type('" #{ num } "') input')
    checkUncheck_element
  end

  def selected_visit_type_checked_headers
    self.class.element(:selectedDiagnosisHeaders, :div, css: '.scroll-enter-form div:nth-of-type(4) .header > div')
    selectedDiagnosisHeaders_element
  end

  def scroll_encounters_form_to_middle
    div_with_scroll = browser.div(id: 'visitTypeSection')
    div_with_scroll.elements.last.wd.location_once_scrolled_into_view
  end

  def scroll_encounters_form_to_bottom
    div_with_scroll = browser.div(class: 'modal-body')
    scroll_bottom_script = 'arguments[0].scrollTop = arguments[0].scrollHeight'
    div_with_scroll.browser.execute_script(scroll_bottom_script, div_with_scroll)
  end
end
