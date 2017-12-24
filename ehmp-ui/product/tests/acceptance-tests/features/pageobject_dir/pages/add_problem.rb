require_relative 'alert.rb'

class AddProblemsDeleteCommentAlert < PobAlert
  element :btn_restore, '.modal-footer .restore-button'
  element :btn_okay, '.modal-footer .no-button'
end

class CommonProblemElements < SitePrism::Page 
  element :fld_problem_name_label, '.select-problem-container p:nth-of-type(1) strong'
  element :fld_problem_name, ".select-problem-container p:nth-of-type(2)"

  element :rbn_status_active, '.statusRadioValue [id$=A-ACTIVE]'
  element :rbn_status_inactive, '.statusRadioValue [id$=I-INACTIVE]'
  element :fld_status_label, "div.statusRadioValue p.faux-label"

  element :rbn_acuity_acute, '.immediacyRadioValue [id$=A-ACUTE]'
  element :rbn_acuity_chronic, '.immediacyRadioValue [id$=C-CHRONIC]'
  element :rbn_acuity_unknown, '.immediacyRadioValue [id$=U-UNKNOWN]'
  element :fld_acuity_label, "div.immediacyRadioValue p.faux-label"
  element :fld_onset_date, '#onsetDate'
  element :fld_onset_date_label, "label[for='onsetDate']"
  element :fld_clinic, '.select-control.clinic [id^=clinic]'
  element :fld_clinic_label, ".select-control.clinic label"
  element :fld_selected_clinic, "[id^='select2-clinic']"
  element :fld_responsible_provider, '.select-control.resProvider [id^=resProvider]'
  element :fld_responsible_provider_label, ".select-control.resProvider label"
  element :fld_responsible_provider_instruction, "ul[id ^='select2-resProvider'] li.select2-results__message"
  elements :fld_responsible_provider_list, "ul[id^='select2-resProvider'] li:not(.select2-results__message)"

  def all_common_there?
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
    true
  end
end

class AddProblemsTrayModal < CommonProblemElements
  # ****************  first modal **************** #
  element :btn_keep_previous, '#keepProblemBtn'
  element :fld_search_problem, "#problemTerm"
  element :btn_search_problem, "#problemTermBtn:not([disabled])"
  # element :btn_search_problem, "#problemTermBtn"
  element :fld_results_header, ".problem-results-header"
  element :btn_extend_search, '#extendedSearchBtn'
  element :btn_free_text, '#freeTxtBtn'
  element :fld_result_message, '.problem-results-message-container'
  elements :fld_search_results_tree_node, '.problem-results-container li.tree-node'
  elements :fld_selectable_problems, '.problem-results-container ul[role=tree] > li.tree-leaf div'

  # ****************  second modal *************** #
  element :btn_select_new_problm, '#changeProblemBtn'

  element :fld_freetext_problem_name_label, '.free-text-container p:nth-of-type(1) strong'
  element :fld_freetext_problem_name, '.free-text-container p:nth-of-type(1)'
  
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

  element :fld_comment, '.input-control.inputString input'
  element :fld_comment_label, ".annotations-container strong"
  element :btn_add_comment, ".add-comment-button"
  element :fld_comment_characters_left, "div.inputString span.input-char-count"
  element :btn_cancel_problem_addition, '#cancelBtnProblem'
  element :btn_accept_problem_addition, '#addDrpDwnContainer'
  element :ddl_responsible_provider, ".select-control.resProvider [x-is-labelledby^='select2-resProvider']"
  element :fld_select2_search_box, "input[class='select2-search__field']"

  element :btn_details, '#ftDetailsBtn'
  elements :fld_comment_rows, '#patientDemographic-newObservation .comment-box-comment-region .table-row'
  elements :fld_comment_row_text, '.comment-box-comment-region .comment-text-region'
  elements :btn_comment_row_edit, '.comment-box-comment-region .comment-edit-button'
  elements :btn_comment_row_delete, '.comment-box-comment-region .comment-delete-button'
  element :txt_comment_edit, 'div.table-row input'
  element :btn_comment_cancel_edit, 'div.table-row .cancel-edit-comment-button'
  element :btn_comment_save_edit, 'div.table-row .edit-comment-button'

  element :txt_editable_new_term_request, "form:not(.hidden) div.editableFreeTxtTxtArea [name='editableFreeTxtTxtArea']"
  element :txt_editable_new_term_request_length, 'form:not(.hidden) div.editableFreeTxtTxtArea span.char-count-region span'

  # *************** free text modal *************** #
  element :btn_free_text_no, '#ftNoBtn'
  element :btn_free_text_yes, '#ftYesBtn'
  element :chk_request_term, "form:not(.hidden) [name='requestTermCheckBox']"
  element :fld_icd_code_warning, 'form:not(.hidden) p:nth-of-type(1) strong'
  element :fld_use_term_quesiton, 'form:not(.hidden) p:nth-of-type(2) strong'
  element :fld_new_term_request_label, "form:not(.hidden) label[for^='freeTxtTxtArea']"
  element :txt_new_term_request, "form:not(.hidden) div.freeTxtTxtArea [name='freeTxtTxtArea']"
  element :txt_new_term_request2, "form:not(.hidden) [name='editableFreeTxtTxtArea']"
  element :txt_new_term_request_length, 'form:not(.hidden) div.freeTxtTxtArea span.char-count-region span'

  def index_of_comment(comment_text)
    available_comment_text = []
    fld_comment_row_text.each_with_index do | comment_column, index |
      available_comment_text.push(comment_column.text)
      return index if comment_column.text == comment_text
    end
    p "available comments: #{available_comment_text}"
    return -1
  end

  def unique_tree_items(index)
    unique_tree_node = "//*[contains(@class, 'problem-results-container')]/descendant::li[contains(@class, 'tree-node')][#{index}]"
    self.class.element :unique_tree_node, :xpath, "#{unique_tree_node}/descendant::i"
    self.class.elements :unique_tree_leaves, :xpath, "#{unique_tree_node}/descendant::li"
    self.class.element :unique_first_leaf, :xpath, "#{unique_tree_node}/descendant::*[contains(@class, 'tree-leaf')][1]"
  end

  def define_tree_node(problem_name)
    self.class.element :fld_search_result_tree_node, :xpath, "//li[contains(@class, 'tree-node')]/descendant::div[(text()='#{problem_name}')]/preceding-sibling::i[contains(@class, 'node-icon')]"
  end

  def problem_search_result(problem_result_text)
    self.class.element :fld_search_result, :xpath, "//div[contains(@class, 'problemResults')]/descendant::li[contains(@class, 'tree-leaf')]/descendant::div[(text()='#{problem_result_text}')]"
  end

  def selected_problem(selected_problem_text)
    self.class.element :fld_selected_problem, :xpath, "//div[contains(@class, 'select-problem-container')]/descendant::p[contains(string(), '#{selected_problem_text}')]"
  end

  def all_required_there?
    return false unless has_btn_select_new_problm?
    return false unless all_common_there?

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
