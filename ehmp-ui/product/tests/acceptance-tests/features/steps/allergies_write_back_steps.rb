path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class AllergiesWriteBack < AllApplets
  include Singleton
  def initialize
    super
    appletid_css = "[data-appletid=allergy_grid]"
    add_toolbar_buttons
    
    add_action(CucumberLabel.new("Allergy Add Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=allergy_grid] .applet-add-button"))
    add_verify(CucumberLabel.new("Allergy Modal Title"), VerifyText.new, AccessHtmlElement.new(:css, '[id="main-workflow-label-Allergies"]'))
    add_verify(CucumberLabel.new("Modal Loaded"), VerifyText.new, AccessHtmlElement.new(:css, ".modal-body"))
    add_verify(CucumberLabel.new("Growl Alert Msg"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".notify-message"))
    # form labels
    add_verify(CucumberLabel.new("allergen"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='allergen']"))
    add_verify(CucumberLabel.new("observed"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='allergyType-o']"))
    add_verify(CucumberLabel.new("historical"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='allergyType-h']"))
    add_verify(CucumberLabel.new("reaction date"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='reaction-date']"))
    add_verify(CucumberLabel.new("reaction time"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='reaction-time']"))
    add_verify(CucumberLabel.new("severity"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='severity']"))
    add_verify(CucumberLabel.new("nature of reaction"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='nature-of-reaction']"))
    add_verify(CucumberLabel.new("signs/symptoms"), VerifyText.new, AccessHtmlElement.new(:xpath, "//fieldset[contains(@class, 'signs-and-symptoms')]/descendant::legend[contains(string(),'Signs / Symptoms')]"))
    parent_div = "//div[contains(@class, 'allergies-writeback-add')]/descendant"
    add_verify(CucumberLabel.new("available"), VerifyText.new, AccessHtmlElement.new(:xpath, "#{parent_div}::div[contains(@class, 'table-cell') and contains(string(),'Available')]"))
    add_verify(CucumberLabel.new("selected"), VerifyText.new, AccessHtmlElement.new(:xpath, "#{parent_div}::div[contains(@class, 'table-cell') and contains(string(),'Selected')]"))
    add_verify(CucumberLabel.new("date"), VerifyText.new, AccessHtmlElement.new(:xpath, "#{parent_div}::div[contains(@class, 'table-cell') and contains(@class, 'percent-width-25') and contains(string(),'Date')]"))
    add_verify(CucumberLabel.new("time"), VerifyText.new, AccessHtmlElement.new(:xpath, "#{parent_div}::div[contains(@class, 'table-cell') and contains(string(),'Time')]"))
    add_verify(CucumberLabel.new("comments"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='moreInfo']"))
    add_verify(CucumberLabel.new("verify allergy row"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-allergy_grid tr.selectable:nth-child(1) td:nth-child(1)"))
    add_action(CucumberLabel.new("open allergy row"), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-allergy_grid tr.selectable:nth-child(1) td:nth-child(1)")) 
    add_verify(CucumberLabel.new("facility name"), VerifyText.new, AccessHtmlElement.new(:css, "#facilityName"))    
    # form fields
    add_action(CucumberLabel.new("allergen search input drop down"), ClickAction.new, AccessHtmlElement.new(:css, "[x-is-labelledby='select2-allergen-container']"))
    add_action(CucumberLabel.new("allergen search input box"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, ".select2-search__field"))
    add_action(CucumberLabel.new("select allergen"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[contains(@class, 'select2-results__options--nested')]/descendant::li[contains(string(), 'CHOCOLATE LAXATIVE')]"))
    add_action(CucumberLabel.new("observed check box"), ClickAction.new, AccessHtmlElement.new(:id, "allergyType-o"))
    add_action(CucumberLabel.new("historical check box"), ClickAction.new, AccessHtmlElement.new(:id, "allergyType-h"))
    add_action(CucumberLabel.new("reaction date input box"), SendKeysAction.new, AccessHtmlElement.new(:id, "reaction-date"))
    add_action(CucumberLabel.new("reaction time input box"), SendKeysAction.new, AccessHtmlElement.new(:id, "reaction-time"))
    add_action(CucumberLabel.new("severity drop down"), ComboSelectAction.new, AccessHtmlElement.new(:id, "severity"))
    add_action(CucumberLabel.new("nature of reaction drop down"), ComboSelectValueAction.new, AccessHtmlElement.new(:id, "nature-of-reaction"))
    add_action(CucumberLabel.new("signs/symptoms input box"), SendKeysAction.new, AccessHtmlElement.new(:id, "available--modifiers-filter-results"))
    add_action(CucumberLabel.new("add drowsy"), ClickAction.new, AccessHtmlElement.new(:css, "[title='Press enter to add DROWSINESS.']"))
    add_action(CucumberLabel.new("comments input box"), SendKeysAction.new, AccessHtmlElement.new(:id, "moreInfo"))
    add_action(CucumberLabel.new("reason input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#reason"))      
    # buttons
    add_action(CucumberLabel.new("Add"), ClickAction.new, AccessHtmlElement.new(:css, ".addBtn button.btn-primary"))
    add_action(CucumberLabel.new("Cancel"), ClickAction.new, AccessHtmlElement.new(:css, "#form-cancel-btn"))
    add_action(CucumberLabel.new("entered in error"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-footer #error"))
    add_action(CucumberLabel.new("submit entered in error"), ClickAction.new, AccessHtmlElement.new(:css, "#submit-entered-in-error"))
  end
end 

Then(/^user adds a new allergy$/) do
  aa = AllergiesWriteBack.instance
  expect(aa.perform_action("Allergy Add Button")).to eq(true)
end

Then(/^add allergy modal detail title says "([^"]*)"$/) do | modal_title|
  aa = AllergiesWriteBack.instance
  expect(aa.perform_verification("Allergy Modal Title", modal_title.upcase)).to eq(true)
end

Then(/^the user adds "([^"]*)" allergy "([^"]*)"$/) do |allergy_type, allergy_name|
  aa = AllergiesWriteBack.instance
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_fld_modal_body_visible
  expect(aa.wait_until_action_element_visible("add drowsy", DefaultLogin.wait_time)).to be_true
  expect(aa.wait_until_action_element_visible("allergen search input drop down", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("allergen search input drop down")).to eq(true)
#  expect(aa.perform_action("allergen search input box", allergy_name)).to eq(true)
#  expect(aa.wait_until_action_element_visible("select allergen", 30)).to be_true
#  expect(aa.perform_action("select allergen")).to eq(true)
  
  @ehmp.wait_until_fld_pick_list_input_visible
  expect(@ehmp).to have_fld_pick_list_input
  @ehmp.fld_pick_list_input.set allergy_name
  @ehmp.fld_pick_list_input.native.send_keys(:enter)
  
  expect(aa.wait_until_action_element_visible("select allergen", 30)).to be_true
  expect(aa.perform_action("select allergen")).to eq(true)
   
  if allergy_type == 'historical'
    expect(aa.perform_action("historical check box")).to eq(true)
  else
    expect(aa.perform_action("observed check box")).to eq(true)
    expect(aa.perform_action("severity drop down", 'Severe')).to eq(true)
  end
  expect(aa.wait_until_action_element_visible("nature of reaction drop down", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("nature of reaction drop down", "A")).to eq(true)
  expect(aa.perform_action("add drowsy")).to eq(true)  
#  expect(aa.wait_until_action_element_visible("Add", DefaultLogin.wait_time)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { aa.get_element("Add").enabled? }
  wait.until { aa.get_element("Add").displayed? }
  expect(aa.perform_action("Add")).to eq(true)
  verify_allergy_growl_msg("Allergy Submitted")
end

def verify_allergy_growl_msg(message)
  aa = AllergiesWriteBack.instance
  expect(aa.wait_until_action_element_visible("Growl Alert Msg", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Growl Alert Msg", message)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { element_is_not_present?(:css, 'div.growl-alert') }
end

Then(/^verifies the above "([^"]*)" allergy is added to patient record$/) do |allergy_name|
  aa = AllergiesWriteBack.instance
  expect(aa.perform_verification('verify allergy row', allergy_name)).to eq(true)
end

def mark_allergy_in_error
  entered_error = 'entered in error'
  @ehmp = PobCommonElements.new
  aa = AllergiesWriteBack.instance
  @ehmp.wait_until_fld_modal_body_visible
  expect(aa.wait_until_action_element_visible(entered_error, DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(entered_error)).to eq(true)
  expect(aa.perform_action('reason input box', 'clearing for automated test')).to eq(true)
  expect(aa.perform_action('submit entered in error')).to eq(true)
  verify_allergy_growl_msg("Allergy marked as entered in error")
end

Then(/^user opens allergy row "([^"]*)" and marks as "([^"]*)"$/) do |allergen_name, entered_error|
  aa = AllergiesWriteBack.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  expect(aa.perform_action('open allergy row')).to eq(true)
  expect(aa.perform_action('Detail View Button')).to eq(true)
  mark_allergy_in_error
end

Then(/^patient does not have a "([^"]*)" allergy$/) do |allergy_name|
  ehmp = PobAllergiesApplet.new
  ehmp.allergy_pill allergy_name
  p "Has pill? #{ehmp.has_fld_allergy_pill?}"
  if ehmp.has_fld_allergy_pill?
    ehmp.fld_allergy_pill.click
    expect(AllergiesWriteBack.instance.perform_action('Detail View Button')).to eq(true)
    mark_allergy_in_error
  end
  expect(ehmp.has_fld_allergy_pill?).to eq(false), "patient should not have an allergy displayed for #{allergy_name}"
end

Given(/^Cover Sheet is active and ready for write back tests$/) do
  # sleep 5
  step 'Cover Sheet is active'
  # check for visiblity of bottom applets, if elements not visible, then refresh

  # immunizations, active meds, orders
  p PobImmunizationsApplet.new.btn_applet_expand_view
  p PobImmunizationsApplet.new.btn_applet_expand_view.native
  begin 
    PobImmunizationsApplet.new.wait_until_btn_applet_expand_view_visible(1)
    PobAppointmentsApplet.new.wait_until_btn_applet_expand_view_visible(1)
    PobProblemsApplet.new.wait_until_btn_applet_expand_view_visible(1)
  rescue
    p 'all applets not visible, attempt a refresh'
    #PobCoverSheet.new.load
    TestSupport.driver.navigate.refresh
    step 'Cover Sheet is active'
  end
end
