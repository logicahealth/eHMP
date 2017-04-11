class AddProblemsTrayModal < SitePrism::Page 
  # ****************  first modal **************** #
  element :btn_keep_previous, '#keepProblemBtn'
  element :fld_search_problem, "#problemTerm"
  element :btn_search_problem, "#problemTermBtn"
  element :fld_results_header, ".problem-results-header"
  element :btn_extend_search, '#extendedSearchBtn'
  element :btn_free_text, '#freeTxtBtn'
  element :fld_result_message, '.problem-results-message-container'

  # ****************  second modal *************** #
  element :btn_select_new_problm, '#changeProblemBtn'
  element :fld_problem_name_label, '.select-problem-container p:nth-of-type(1) strong'
  element :fld_problem_name, ".select-problem-container p:nth-of-type(2)"

  element :fld_freetext_problem_name_label, '.free-text-container p:nth-of-type(1) strong'
  element :fld_freetext_problem_name, '.free-text-container p:nth-of-type(1)'
  
  element :rbn_status_active, '#statusRadioValue-A-ACTIVE'
  element :rbn_status_inactive, '#statusRadioValue-I-INACTIVE'
  element :fld_status_label, "div.statusRadioValue p.faux-label"

  element :rbn_acuity_acute, '#immediacyRadioValue-A-ACUTE'
  element :rbn_acuity_chronic, '#immediacyRadioValue-C-CHRONIC'
  element :rbn_acuity_unknown, '#immediacyRadioValue-U-UNKNOWN'
  element :fld_acuity_label, "div.immediacyRadioValue p.faux-label"

  element :fld_onset_date, '#onset-date'
  element :fld_onset_date_label, "label[for='onset-date']"

  element :fld_clinic, '#clinic'
  element :fld_clinic_label, "label[for='clinic']"
  element :fld_selected_clinic, '#select2-clinic-container'

  element :fld_responsible_provider, '#resProvider'
  element :fld_responsible_provider_label, "label[for='resProvider']"
  element :fld_treatment_factors_label, :xpath, "//div[contains(@class, 'bottom-margin-md')]/descendant::strong[(string() = 'Treatment Factors')]"
  element :rbn_service_contected_yes, '#treatmentFactors-serviceConnected-true-0'
  element :rbn_service_contected_no, '#treatmentFactors-serviceConnected-false-1'
  element :rbn_agent_orange_yes, '#treatmentFactors-agent-orange-true-0'
  element :rbn_agent_orange_no, '#treatmentFactors-agent-orange-false-1'
  element :rbn_radiation_yes, '#treatmentFactors-ionizing-radiation-true-0'
  element :rbn_radiation_no, '#treatmentFactors-ionizing-radiation-false-1'
  element :rbn_shipboard_hazard_yes, '#treatmentFactors-shipboard-hazard-true-0'
  element :rbn_rshipboard_hazard_no, '#treatmentFactors-shipboard-hazard-false-1'
  element :rbn_mst_yes, '#treatmentFactors-mst-true-0'
  element :rbn_mst_no, '#treatmentFactors-mst-false-1'
  element :rbn_head_cancer_yes, '#treatmentFactors-head-neck-cancer-true-0'
  element :rbn_head_cancer_no, '#treatmentFactors-head-neck-cancer-false-1'

  element :fld_comment, '#inputString'
  element :fld_comment_label, ".annotations-container strong"
  element :btn_add_comment, ".add-comment-button"
  element :fld_comment_characters_left, "div.inputString span.input-char-count"
  element :btn_cancel_problem_addition, '#cancelBtnProblem'
  element :btn_accept_problem_addition, '#addDrpDwnContainer'
  element :ddl_responsible_provider, "[x-is-labelledby='select2-resProvider-container']"
  element :fld_select2_search_box, "input[class='select2-search__field']"

  element :btn_details, '#ftDetailsBtn'
  elements :fld_comment_rows, '.comment-region .table-row'
  elements :fld_comment_row_text, '.comment-region .comment-text-region'
  elements :btn_comment_row_edit, '.comment-region .comment-edit-button'
  elements :btn_comment_row_delete, '.comment-region .comment-delete-button'

  # *************** free text modal *************** #
  element :btn_free_text_no, '#ftNoBtn'
  element :btn_free_text_yes, '#ftYesBtn'
  element :chk_request_term, 'form:not(.hidden) #requestTermCheckBox'
  element :fld_icd_code_warning, '.keep-problem-container p:nth-of-type(1) strong'
  element :fld_use_term_quesiton, '.keep-problem-container p:nth-of-type(2) strong'
  element :fld_new_term_request_label, "form:not(.hidden) label[for='freeTxtTxtArea']"
  element :txt_new_term_request, 'form:not(.hidden) div.freeTxtTxtArea #freeTxtTxtArea'
  element :txt_new_term_request_length, 'form:not(.hidden) div.freeTxtTxtArea span.char-count-region span'
  
  def problem_search_result(problem_result_text)
    self.class.element :fld_search_result, :xpath, "//div[contains(@class, 'problemResults')]/descendant::li[contains(@class, 'tree-leaf')]/descendant::div[contains(string(), '#{problem_result_text}')]"
  end

  def selected_problem(selected_problem_text)
    self.class.element :fld_selected_problem, :xpath, "//div[contains(@class, 'select-problem-container')]/descendant::p[contains(string(), '#{selected_problem_text}')]"
  end

  def all_required_there?
    return false unless has_btn_select_new_problm?
    return false unless has_fld_problem_name_label?
    return false unless has_rbn_status_active?
    return false unless has_rbn_status_inactive?
    return false unless has_fld_status_label?

    return false unless has_rbn_acuity_acute?
    return false unless has_rbn_acuity_chronic?
    return false unless has_rbn_acuity_unknown?
    return false unless has_fld_acuity_label?

    return false unless has_fld_onset_date?
    return false unless has_fld_onset_date_label?
    return false unless has_fld_clinic?
    return false unless has_fld_clinic_label?

    return false unless has_fld_responsible_provider?
    return false unless has_fld_responsible_provider_label?

    return false unless has_fld_comment?
    return false unless has_fld_comment_label?
    return false unless has_btn_add_comment?
    return true
  end

  def wait_until_tray_loaded
    wait = Selenium::WebDriver::Wait.new(:timeout => 10)
    wait.until { 
      begin
        # all_there? We have some elements that are patient dependent so can't use built in function
        all_required_there?
      rescue Selenium::WebDriver::Error::StaleElementReferenceError
        retry
      end
    }
  end

  def freetext_label_text
    "Entered as Freetext"
  end

  def required?(text)
    # designate that a field is required by appending a *
    return text.end_with?('*')
  end
end
