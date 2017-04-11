Then(/^the add problems button is not displayed$/) do
  @ehmp = PobProblemsApplet.new unless @ehmp.is_a? PobProblemsApplet
  @ehmp.wait_until_fld_applet_title_visible
  expect(@ehmp).to_not have_btn_applet_add
end

Given(/^the user takes note of number of existing problems$/) do
  @number_existing_problems = PobProblemsApplet.new.number_expanded_applet_rows
  p "number existing_problems: #{@number_existing_problems}"
end

When(/^user attempts to add a problem from problem applet header$/) do
  @ehmp = PobProblemsApplet.new unless @ehmp.is_a? PobProblemsApplet
  @ehmp.wait_until_btn_applet_add_visible
  @ehmp.btn_applet_add.click

  @ehmp.wait_until_fld_open_tray_visible
  @ehmp.wait_until_fld_add_problem_title_visible
  expect(@ehmp.fld_add_problem_title.text.upcase).to eq("ADD PROBLEM")
end

When(/^user searches and selects new problem "([^"]*)"$/) do |problem_term|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_fld_search_problem_visible
  @ehmp.fld_search_problem.set problem_term
  @ehmp.btn_search_problem.click

  @ehmp.problem_search_result problem_term
  @ehmp.wait_until_fld_results_header_visible
  @ehmp.wait_until_fld_search_result_visible
  @ehmp.fld_search_result.click

  @ehmp.selected_problem problem_term
  @ehmp.wait_until_fld_selected_problem_visible
  expect(@ehmp.fld_selected_problem.text.upcase).to eq(problem_term.upcase)
end

Then(/^Add Problem modal is displayed$/) do
  @ehmp = AddProblemsTrayModal.new
  @ehmp.wait_until_tray_loaded
end

When(/^user accepts the new problem$/) do
  @ehmp = AddProblemsTrayModal.new
  @ehmp.btn_accept_problem_addition.click

  @ehmp.wait_until_btn_accept_problem_addition_invisible
end

Then(/^a problem is added to the applet$/) do
  @ehmp = PobProblemsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { @ehmp.number_expanded_applet_rows == @number_existing_problems + 1 }
end

When(/^user opens observation tray$/) do
  @ehmp = PobOverView.new
  expect(@ehmp.traysidebar).to have_btn_open_observations
  @ehmp.traysidebar.btn_open_observations.click
  @ehmp.traysidebar.wait_until_btn_open_observations_visible
end

When(/^user attempts to create a new "([^"]*)" observation$/) do |text|
  @ehmp = ObservationTrayModal.new
  @ehmp.wait_until_btn_new_observation_visible
  @ehmp.btn_new_observation.click
  @ehmp.select_observation(text)
end

When(/^Problem Name is reported as "([^"]*)"$/) do |problem_name|
  @ehmp = AddProblemsTrayModal.new
  @ehmp.wait_until_fld_problem_name_visible
  expect(@ehmp.fld_problem_name.text.upcase).to eq(problem_name.upcase), "Expected problem name #{problem_name}, but following is displayed #{@ehmp.fld_problem_name.text}"
end

When(/^user chooses to select a new problem$/) do
  @ehmp = AddProblemsTrayModal.new
  @ehmp.wait_until_btn_select_new_problm_visible
  @ehmp.btn_select_new_problm.click
  @ehmp.wait_until_btn_select_new_problm_invisible
end

When(/^user chooses to keep previous problem name$/) do
  @ehmp = AddProblemsTrayModal.new
  @ehmp.wait_until_btn_keep_previous_visible
  @ehmp.btn_keep_previous.click
  @ehmp.wait_until_btn_keep_previous_invisible
end

When(/^user searches for a new problem with term "([^"]*)"$/) do |problem_term|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_fld_search_problem_visible
  @ehmp.fld_search_problem.set problem_term
  @ehmp.btn_search_problem.click

  @ehmp.problem_search_result problem_term
  @ehmp.wait_until_fld_results_header_visible
end

Then(/^the Add Problem model displays a result for "([^"]*)"$/) do |problem_term|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.problem_search_result problem_term
  @ehmp.wait_until_fld_search_result_visible
  expect(@ehmp).to have_fld_search_result
end

Then(/^the Add Problem model displays a message "([^"]*)"$/) do |message|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_fld_result_message_visible
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { @ehmp.fld_result_message.text.length > 0 }
  expect(@ehmp.fld_result_message.text.upcase).to eq(message.upcase)
end

When(/^user selects Responsible Provider "([^"]*)"$/) do |provider|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_ddl_responsible_provider_visible
  expect(@ehmp).to have_ddl_responsible_provider
  @ehmp.ddl_responsible_provider.click
  @ehmp.wait_until_fld_select2_search_box_visible
  @ehmp.fld_select2_search_box.set provider
  @ehmp.fld_select2_search_box.native.send_keys(:enter)
end

When(/^user chooses to extend the search for a new problem$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_btn_extend_search_visible
  expect(@ehmp).to have_btn_extend_search
  @ehmp.btn_extend_search.click
  @ehmp.wait_until_btn_extend_search_invisible
end

Then(/^the user is given an option to Enter Free Text$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_btn_free_text_visible
  expect(@ehmp).to have_btn_free_text
end

When(/^user chooses to Enter Free Text$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  step "user chooses to extend the search for a new problem"
  step "the user is given an option to Enter Free Text"
  @ehmp.btn_free_text.click
  @ehmp.wait_until_btn_free_text_invisible
end

Then(/^the Free Text Warning Acknowledgement is displayed$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_btn_free_text_no
  expect(@ehmp).to have_btn_free_text_yes
  expect(@ehmp).to have_chk_request_term
  expect(@ehmp).to have_fld_icd_code_warning
  expect(@ehmp).to have_fld_use_term_quesiton
end

Then(/^the Free Text Warning Acknowledgement includes the free text "([^"]*)"$/) do |arg1|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_use_term_quesiton
  expect(@ehmp.fld_use_term_quesiton.text.upcase).to eq('USE "PEA"?')
end

When(/^user chooses to not proceed with a nonspecific term$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_btn_free_text_no
  @ehmp.btn_free_text_no.click
  @ehmp.wait_until_btn_free_text_no_invisible
end

When(/^user chooses to proceed with a nonspecific term$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_btn_free_text_yes
  @ehmp.btn_free_text_yes.click
  @ehmp.wait_until_btn_free_text_yes_invisible
end

Then(/^the New Problem search modal is displayed$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_fld_search_problem_visible
  expect(@ehmp).to have_fld_search_problem
  expect(@ehmp).to have_btn_search_problem
end

Then(/^Freetext Problem Name is reported as "([^"]*)"$/) do |problem_name|
  @ehmp = AddProblemsTrayModal.new
  @ehmp.wait_until_fld_freetext_problem_name_label_visible
  expect(@ehmp).to have_fld_freetext_problem_name
  expected = "#{@ehmp.freetext_label_text.upcase} #{problem_name.upcase}"
  expect(@ehmp.fld_freetext_problem_name.text.upcase).to eq(expected), "Expected problem name: '#{expected}', but following is displayed '#{@ehmp.fld_freetext_problem_name.text}'"
end

When(/^the user chooses to Request New Term$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_chk_request_term
  expect(@ehmp.chk_request_term.checked?).to eq(false)
  @ehmp.chk_request_term.click
  expect(@ehmp.chk_request_term.checked?).to eq(true)
end

Then(/^the user is presented with ability to add New Term Request Comment$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_fld_new_term_request_label_visible
  expect(@ehmp).to have_txt_new_term_request
  expect(@ehmp).to have_txt_new_term_request
end

Then(/^Problem Status is set to Active by default$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_rbn_status_active
  expect(@ehmp.rbn_status_active.checked?).to eq(true), "Expected rbn_status_active to be selected by default"
end

Then(/^Problem Acuity is set to Unknown by default$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_rbn_acuity_unknown
  expect(@ehmp.rbn_acuity_unknown.checked?).to eq(true), "Expected rbn_acuity_unknown to be selected by default"
end

Then(/^Required fields have a visual indication$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.required?(@ehmp.fld_status_label.text)).to eq(true), "Status Label does not have * indicating a required field"
  expect(@ehmp.required?(@ehmp.fld_acuity_label.text)).to eq(true), "Acuity Label does not have * indicating a required field"
  expect(@ehmp.required?(@ehmp.fld_onset_date_label.text)).to eq(true), "Onset Date Label does not have * indicating a required field"
  expect(@ehmp.required?(@ehmp.fld_responsible_provider_label.text)).to eq(true), "Provider Label does not have * indicating a required field"
  expect(@ehmp.required?(@ehmp.fld_clinic_label.text)).to eq(false), "Clinic/Service Label has * indicating a required field and it is not a required field"
end

Then(/^Problem Onset Date is prepopulated to Today$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_onset_date
  today = Date.today.strftime("%m/%d/%Y")
  expect(@ehmp.fld_onset_date.value).to eq(today)
end

Then(/^the clinic field's label is "([^"]*)"$/) do |label_text|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_clinic_label
  expect(@ehmp.fld_clinic_label.text.upcase).to eq(label_text.upcase)
end

Then(/^the clinic field's value is default to "([^"]*)"$/) do |clinic|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_clinic
  expect(@ehmp).to have_fld_selected_clinic
  expect(@ehmp.fld_selected_clinic.text.upcase).to eq(clinic.upcase)
end

Then(/^the clinic field's value is not set$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_clinic
  expect(@ehmp).to_not have_fld_selected_clinic
end

Then(/^the user enters a New Term Request Comment "([^"]*)" and a timestamp$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  @ehmp.wait_until_fld_new_term_request_label_visible
  expect(@ehmp).to have_txt_new_term_request
  @new_problem_comment_time = Time.now
  full_comment = "#{user_comment} #{@new_problem_comment_time}"
  @ehmp.txt_new_term_request.set full_comment
end

Then(/^the Add Problem Request New Term checkbox is selected$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_btn_details
  @ehmp.btn_details.click
  @ehmp.wait_until_chk_request_term_visible
  expect(@ehmp).to have_chk_request_term
  expect(@ehmp.chk_request_term.checked?).to eq(true)
end

Then(/^the Add Problem New Term Request Comment is populated with "([^"]*)" and the timestamp$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_txt_new_term_request
  expect(@ehmp.txt_new_term_request.text).to eq("#{user_comment} #{@new_problem_comment_time}")
end

When(/^user enters a comment "([^"]*)" and a timestamp$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_comment
  @new_problem_comment_time = Time.now
  @full_comment = "#{user_comment} #{@new_problem_comment_time}"
  @ehmp.fld_comment.set @full_comment

end

Then(/^the comment character count is updated$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_comment_characters_left
  expect(@ehmp.fld_comment_characters_left.text).to eq((200 - @full_comment.length).to_s)
end

Then(/^the Add Problem comment add button is enabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.btn_add_comment.disabled?).to eq(false), "Expected Add comment button to be enabled"
end

Then(/^the Add Problem accept button is disabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.btn_accept_problem_addition.disabled?).to eq(true), "Expected Add Problem accept button to be disabled"
end

When(/^user adds the problem comment$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  comment_count = @ehmp.fld_comment_rows.length
  @ehmp.btn_add_comment.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_comment_rows.length == comment_count + 1 }
end

Then(/^the Add Problem comment add button is disabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.btn_add_comment.disabled?).to eq(true), "Expected Add comment button to be disabled"
end

Then(/^the Add Problem accept button is enabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.btn_accept_problem_addition.disabled?).to eq(false), "Expected Add Problem accept button to be enabled"
end

Then(/^a Add Problem comment row is displayed with "([^"]*)" and a timestamp$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  # assumption that the most recently comment is the last in the list
  count = @ehmp.fld_comment_row_text.length
  expect(count).to be > 0
  expect(@ehmp.fld_comment_row_text[count-1].text).to eq("#{user_comment} #{@new_problem_comment_time}")
  expect(@ehmp.btn_comment_row_edit.length).to eq(count), "Expected every comment row to have an edit button"
  expect(@ehmp.btn_comment_row_delete.length).to eq(count), "Expected every comment row to have an edit button"
end

Then(/^Treatment Factors are displayed on the Add Problem modal$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_rbn_service_contected_yes
  expect(@ehmp).to have_rbn_service_contected_no
  expect(@ehmp).to have_rbn_agent_orange_yes
  expect(@ehmp).to have_rbn_agent_orange_no
  expect(@ehmp).to have_rbn_radiation_yes
  expect(@ehmp).to have_rbn_radiation_no
  expect(@ehmp).to have_rbn_shipboard_hazard_yes
  expect(@ehmp).to have_rbn_rshipboard_hazard_no
  expect(@ehmp).to have_rbn_mst_yes
  expect(@ehmp).to have_rbn_mst_no
  expect(@ehmp).to have_rbn_head_cancer_yes
  expect(@ehmp).to have_rbn_head_cancer_no
end

Then(/^the default selection for Treatment Factors is No$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.rbn_service_contected_no.checked?).to eq(true)
  expect(@ehmp.rbn_agent_orange_no.checked?).to eq(true)
  expect(@ehmp.rbn_radiation_no.checked?).to eq(true)
  expect(@ehmp.rbn_rshipboard_hazard_no.checked?).to eq(true)
  expect(@ehmp.rbn_mst_no.checked?).to eq(true)
  expect(@ehmp.rbn_head_cancer_no.checked?).to eq(true)
end
