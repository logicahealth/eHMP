#!/bin/env ruby
# encoding: utf-8

require 'rubygems'
require 'rspec'
require 'watir-webdriver'

require_relative 'rspec_helper'
require_relative '../lib/pages/common_test_page'
require_relative '../lib/pages/visit_information_page'
require_relative '../lib/common/ehmp_constants'
require_relative '../lib/pages/encounters_form_page'

describe 'F413_US7481, Ecounters Form Data Integration', future: true do
  include DriverUtility

  before(:all) do
    initialize_configurations(BASE_URL, BROWSER_NAME)
    @common_test = CommonTest.new(@driver)
    @common_test.login_with_default
  end

  let(:common_test) { CommonTest.new(@driver) }
  let(:encounters) { EncountersFormPage.new(@driver) }
  let(:visit_info) { VisitInformationPage.new(@driver) }

  after(:all) do
    @driver.close
  end

  context 'TC1298: Navigate to Encounters Form' do
    full_patient_name = 'EIGHT, PATIENT'

    it '. Navigates to the Visits Applet and Encounters Form from the Coversheet and sets a visit' do
      common_test.mysite_patient_search full_patient_name, full_patient_name
      visit_info.selVisitInfo_element.when_visible(SMALL_TIMEOUT)
      visit_info.selVisitInfo_element.click
      visit_info.visitInfoHeader_element.when_visible(SMALL_TIMEOUT)
      # Wait for all the data to load
      visit_info.ok_element.when_visible(SMALL_TIMEOUT)
      Watir::Wait.until(XLARGE_TIMEOUT) { visit_info.encounterList_elements.length > 0 }
      encounters.first_location_element.when_visible(SMALL_TIMEOUT)
      encounters.select_visit_location(6)
      visit_info.ok_element.click

      visit_info.selVisitInfo_element.when_visible(SMALL_TIMEOUT)
      visit_info.selVisitInfo_element.click
      visit_info.visitInfoHeader_element.when_visible(SMALL_TIMEOUT)

      visit_info.viewEncounterBtn_element.when_visible(SMALL_TIMEOUT)
      visit_info.viewEncounterBtn

      encounters.encountersFormTitle_element.when_visible(MEDIUM_TIMEOUT)
      expect(encounters.encountersFormTitle_element.text.strip).to eq('Encounter Form')
    end
  end

  context 'TC1309: Diagnosis Section' do
    it '. TC1484 Verifies that the diagnosis section is present' do
      expect(encounters.diagnoses_heading_element.text.strip).to eq('DIAGNOSES LISTS')
    end

    diagnosis_section_labels = ['CONDITION LIST ITEMS', 'INFECTIOUS DISEASE', 'NEOPLASM', 'ENDOCRINE/NUTRITIONAL', 'HEMATOLOGIC',
                                'PSYCHOLOGICAL', 'NERVOUS SYSTEM', 'EENT', 'CARDIOVASCULAR', 'CARDIOVASCULAR (CONT)', 'RESPIRATORY',
                                'DIGESTIVE', 'GENITOURINARY - FEMALE', 'GENITOURINARY - MALE', 'GENITOURINARY - GENERAL', 'SKIN',
                                'MUSCULOSKELETAL', 'SIGNS & SYMPTOMS', 'INJURIES', 'HEALTH PROMOTION']

    it '. TC1485 Verifies that user can select each item in the Diagnosis list and select condition list' do
      encounters.diagnosisSectionConditionList_element.when_visible(LARGE_TIMEOUT)
      encounters.diagnosisSectionInfectiousDisease_element.when_visible(LARGE_TIMEOUT)
      Watir::Wait.until { encounters.diagnosisSectionOptionList_elements.length > 0 }
      diagnoses_section_list_item = 1
      diagnosis_section_labels.each do |item|
        # verifies Diagnosis List
        expect(encounters.diagnoses_section_list(diagnoses_section_list_item)).to eq(item)
        diagnoses_section_list_item += 1
        input_count = 0
        # Verifies Selected Diagnosis Headings
        expect(encounters.selected_diagnosis_result_header(1)).to eq('Selected Diagnosis')
        expect(encounters.selected_diagnosis_result_header(2)).to eq('Comments')
        expect(encounters.selected_diagnosis_result_header(3)).to eq('Add to Condition List')
        expect(encounters.selected_diagnosis_result_header(4)).to eq('Primary Diagnosis')
        encounters.checklistForEachDiagnosis_elements.each do |_input|
          input_count += 1
          # Verifies CheckList Heading
          expect(encounters.diagnosisChecklistLabel_element.text.strip).to eq(encounters.diagnoses_section_list(diagnoses_section_list_item - 1))
          check_uncheck = encounters.checkbox_for_diagnosis_element(input_count)
          check_uncheck.when_visible(LARGE_TIMEOUT)
          check_uncheck.check
          expect(check_uncheck.checked?).to eq(true)
          # Verifies Selected Diagnosis added to the list
          expect(encounters.selectedDiagnosis_element.text.strip).to eq(encounters.selected_diagnosis_result(input_count))
          check_uncheck.uncheck
          expect(check_uncheck.checked?).to eq(false)
        end
      end
    end
  end

  context 'TC1314 Service Connected' do
    it '. TC1486 Verifies Service Connected Title and Subtitle' do
      encounters.serviceConnected_element.when_visible(SMALL_TIMEOUT)
      expect(encounters.serviceConnected_element.text.strip).to eq('SERVICE CONNECTED')
    end

    it '. TC1487 Verifies Service Connected Percent and Rated Disabilties labels' do
      encounters.serviceConnectedPercent_element.when_visible(SMALL_TIMEOUT)
      expect(encounters.serviceConnectedPercent_element.text.strip).to include('Service Connected:')
      expect(encounters.ratedDisabilities_element.text.strip).to include('Rated Disabilities:')
    end

    it '. TC1488 Verifies Service Connected Radio Button labels' do
      expect(encounters.visitRelatedTo_element.text.strip).to eq('VISIT RELATED TO')
      expect(encounters.service_connection_radio_label(1)).to eq('Yes')
      expect(encounters.service_connection_radio_label(2)).to eq('No')
    end

    it '. TC1489 Verifies that Radio buttons are selected' do
      expect(encounters.serviceConnectionRadioYes_selected?).to eq(false)
      expect(encounters.serviceConnectionRadioNo_selected?).to eq(false)
      encounters.select_serviceConnectionRadioYes
      expect(encounters.serviceConnectionRadioYes_selected?).to eq(true)
      expect(encounters.serviceConnectionRadioNo_selected?).to eq(false)
      encounters.select_serviceConnectionRadioNo
      expect(encounters.serviceConnectionRadioYes_selected?).to eq(false)
      expect(encounters.serviceConnectionRadioNo_selected?).to eq(true)
    end
  end

  context 'TC1315: Verify that the Visit Type section of the Encounters form can be interacted with' do
    visit_type_section_labels = ['OFFICE VISIT - NEW PT', 'OFFICE VISIT - EST PT', 'OFFICE CONSULT - NEW/EST']

    it '. TC1490 Verifies that the Visit Type section is present' do
      expect(encounters.visitTypeHeading_element.text.strip).to eq('VISIT TYPE')
    end

    it '. TC1491 Verifies that user can select each item in the Visit Type Section and select Visit list items' do
      visit_type_section_list_item = 1
      encounters.visitTypeSectionFirstItem_element.when_visible(LARGE_TIMEOUT)

      Watir::Wait.until { encounters.visitTypeSectionOptionList_elements.length > 0 }

      visit_type_section_labels.each do |item|
        expect(encounters.visit_type_section_list(visit_type_section_list_item)).to eq(item)
        visit_type_section_list_item += 1
        expect(encounters.visitTypeChecklistLabel_element.text.strip).to eq(item)
        input_count = 0
        encounters.checklistForEachVisitType_elements.each do
          input_count += 1
          check_uncheck = encounters.checkbox_for_visit_type_element(input_count)
          check_uncheck.when_visible(LARGE_TIMEOUT)
          check_uncheck.check
          expect(check_uncheck.checked?).to eq(true)
        end
      end
    end

    it '. TC1492 Verifies that user can select only one Checklist item at a time and other items remain unselected' do
      visit_type_section_list_item = 1
      visit_type_section_labels.each do
        encounters.visit_type_section_list(visit_type_section_list_item)
        visit_type_section_list_item += 1
        input_count = 1
        check_uncheck = encounters.checkbox_for_visit_type_element(input_count)
        check_uncheck.when_visible(MEDIUM_TIMEOUT)
        check_uncheck.check
        expect(check_uncheck.checked?).to eq(true)
        input_count = 1
        while input_count < encounters.checklistForEachVisitType_elements.length
          input_count += 1
          expect(encounters.checkbox_for_visit_type_element(input_count).checked?).to eq(false)
        end
      end
    end

    it '. TC1494 Verifies that user can select list item and add to visit modifiers' do
      visit_type_section_list_item = 1
      visit_type_section_labels.each do
        encounters.visit_type_section_list(visit_type_section_list_item)
        visit_type_section_list_item += 1
        input_count = 0
        encounters.checklistForEachVisitType_elements.each do
          input_count += 1
          check_uncheck = encounters.checkbox_for_visit_type_element(input_count)
          check_uncheck.when_visible(MEDIUM_TIMEOUT)
          check_uncheck.check
          encounters.addRemoveModifierBtn_element.when_visible(MEDIUM_TIMEOUT)
          encounters.addRemoveModifierBtn
          encounters.selectedModifiersHeading_element.when_visible(LARGE_TIMEOUT)
          encounters.visitModifierPopoverHeading_element.when_visible(LARGE_TIMEOUT)
          expect(encounters.visitModifierPopoverHeading_element.text.strip).to eq('Add Modifiers')
          expect(encounters.availableModifiersHeading_element.text.strip).to eq('Available Modifiers')
          expect(encounters.selectedModifiersHeading_element.text.strip).to eq('Selected Modifiers')
          item_count = 0
          encounters.availableModifiersList_elements.each do
            item_count += 1
            break if item_count == 4
            available_item = encounters.available_modifier_region_text(item_count)
            encounters.click_available_modifier_add_button(item_count)
            expect(available_item).to eq(encounters.selected_modifier_region_text(1))
            expect(encounters.selected_modifier_region_text(1)).to eq(encounters.add_remove_modifiers_region_text)
            encounters.click_selected_modifier_delete_button(1)
          end
          encounters.visitModifierCloseBtn
          break
        end
      end
    end

    it '. TC1495 Verifies entering filter text is filtering the Available Modifiers' do
      encounters.visit_type_section_list(1)
      check_uncheck = encounters.checkbox_for_visit_type_element(1)
      check_uncheck.when_visible(MEDIUM_TIMEOUT)
      check_uncheck.check

      encounters.addRemoveModifierBtn_element.when_visible(MEDIUM_TIMEOUT)
      encounters.addRemoveModifierBtn
      filter_text = 'services'
      encounters.visitTypeFilterField_element.when_visible(SMALL_TIMEOUT)
      expect(encounters.visitTypeFilterField_element.attribute('placeholder')).to eq('Filter Results')
      original_available_list_length = encounters.availableModifiersList_elements.length
      encounters.visitTypeFilterField_element.click
      encounters.visitTypeFilterField = filter_text
      encounters.visitTypeFilterField_element.send_keys :enter
      filtered_available_list_length = encounters.availableModifiersList_elements.length
      Watir::Wait.until { original_available_list_length != filtered_available_list_length }
      encounters.firstAvailableModifiersInList_element.when_visible(SMALL_TIMEOUT)
      expect(encounters.visitTypeFilterField_element.value).to eq(filter_text)
      available_list_number = 1
      encounters.availableModifiersList_elements.each do
        break if available_list_number == (filtered_available_list_length + 1)
        expect(encounters.available_modifiers_filter_results_text(available_list_number)).to include(encounters.visitTypeFilterField_element.value.upcase)
        available_list_number += 1
      end
    end

    it '. TC1496 Verifies that user can select list item from Available Providers and that adds to Selected Providers' do
      expect(encounters.selectedProvidersHeading_element.text.strip).to eq('Selected Providers')
      Watir::Wait.until { encounters.availableProvidersList_elements.length > 0 }
      encounters.firstAvailableProvidersInList_element.when_visible(MEDIUM_TIMEOUT)
      available_item = encounters.available_providers_list_text(1)
      encounters.click_available_provider_add_button(1)
      encounters.firstSelectedProvidersInList_element.when_visible(SMALL_TIMEOUT)
      expect(available_item).to eq(encounters.selected_providers_list_text(2))
      encounters.click_selected_provider_delete_button(2)
    end

    it '. TC1497 Verifies entering filter text is filtering the Available Providers list for Visit Type' do
      expect(encounters.availableProvidersHeading_element.text.strip).to eq('Available Providers')
      filter_text = 'two'
      encounters.availableProvidersFilterField_element.when_visible(SMALL_TIMEOUT)
      expect(encounters.availableProvidersFilterField_element.attribute('placeholder')).to eq('Filter Results')
      Watir::Wait.until { encounters.availableProvidersList_elements.length > 0 }
      # original_providers_list_length = encounters.availableProvidersList_elements.length
      encounters.availableProvidersFilterField_element.click
      encounters.availableProvidersFilterField = filter_text
      encounters.availableProvidersFilterField_element.send_keys :enter
      filtered_providers_list_length = encounters.availableProvidersList_elements.length
      # Watir::Wait.until { original_providers_list_length != filtered_providers_list_length }
      encounters.firstAvailableProvidersInList_element.when_visible(MEDIUM_TIMEOUT)

      provider_list_number = 1
      encounters.availableProvidersList_elements.each do
        break if provider_list_number == (filtered_providers_list_length + 1)
        expect(encounters.available_providers_filter_results_text(provider_list_number).downcase).to include(encounters.availableProvidersFilterField_element.value.downcase)
        provider_list_number += 1
      end
    end
  end

  context ' Procedure Section' do
    procedure_section_labels = ['OFFICE VISIT - NEW PT', 'OFFICE VISIT - EST PT', 'OFFICE CONSULT - NEW/EST', 'PREV MEDICINE SVCS', 'COUNSELING/PSYCHOTHERAPY',
                                'PROCEDURES', 'OTHER']

    it '. TC1498 Verifies Procedure section is present' do
      expect(encounters.procedureHeading_element.text.strip).to eq('PROCEDURE')
    end

    it '. TC1499 Verifies that user can select each item in the Procedure Section and select Procedure list items' do
      procedure_section_list_item = 1
      encounters.procedureSectionOfficeVisit1_element.when_visible(LARGE_TIMEOUT)
      encounters.procedureSectionOfficeVisit2_element.when_visible(LARGE_TIMEOUT)
      Watir::Wait.until { encounters.procedureSectionOptionList_elements.length > 0 }
      procedure_section_labels.each do |item|
        expect(encounters.procedure_section_list(procedure_section_list_item)).to eq(item)
        procedure_section_list_item += 1
        expect(encounters.selected_procedure_result_header(1)).to eq('Selected Procedures')
        expect(encounters.selected_procedure_result_header(2)).to eq('Comments')
        expect(encounters.selected_procedure_result_header(3)).to eq('Quantity')
        expect(encounters.selected_procedure_result_header(4)).to eq('Provider')
        expect(encounters.selected_procedure_result_header(5)).to eq('Add Modifiers')
        input_count = 0
        encounters.checklistForEachProcedure_elements.each do
          input_count += 1
          expect(encounters.procedureChecklistLabel_element.text.strip).to eq(encounters.procedure_section_list(procedure_section_list_item - 1))
          check_uncheck = encounters.checkbox_for_procedure_element(input_count)
          check_uncheck.when_visible(LARGE_TIMEOUT)
          check_uncheck.check
          expect(check_uncheck.checked?).to eq(true)
          expect(encounters.selectedProcedure_element.text.strip).to eq(encounters.selected_procedure_result(input_count))
          check_uncheck.uncheck
          expect(check_uncheck.checked?).to eq(false)
        end
      end
    end
  end
end
