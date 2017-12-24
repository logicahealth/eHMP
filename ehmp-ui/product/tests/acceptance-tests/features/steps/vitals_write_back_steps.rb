path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class VerifyValueFormat
  include HTMLVerification
  def initialize(regex)
    @error_message = 'no error message'
    @regex = regex
  end

  def verify(html_element, value)
    text = html_element.attribute('value')
    @error_message = "Does element text match regex #{@regex}: #{text}"
    
    return !( @regex.match(text)).nil?
  end

  def pull_value(html_element, _value)
    text = html_element.text
  end

  def error_message
    return @error_message
  end
end

class VitalsWriteBack < AllApplets
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Vitals Add Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=vitals] .applet-add-button"))
    add_verify(CucumberLabel.new("Add Vitals Modal Title"), VerifyText.new, AccessHtmlElement.new(:css, '[id="main-workflow-label-Enter-Vitals"]'))
    add_verify(CucumberLabel.new("Date Taken"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='dateTakenInput']"))
    add_action(CucumberLabel.new("Date Taken Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='dateTakenInput']"))
    add_verify(CucumberLabel.new('Date Taken Input Value'), VerifyValue.new, AccessHtmlElement.new(:css, "[name='dateTakenInput']"))
    add_verify(CucumberLabel.new('Date Taken Error Message'), VerifyText.new, AccessHtmlElement.new(:css, '.dateTakenInput span.error'))
    add_verify(CucumberLabel.new("Time Taken"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='time-taken']"))
    add_action(CucumberLabel.new("Time Taken Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='time-taken']"))
    add_verify(CucumberLabel.new('Time Taken Input Value'), VerifyValueFormat.new(Regexp.new("\\d+\:\\d{2}")), AccessHtmlElement.new(:css, "[name='time-taken']"))
    add_action(CucumberLabel.new("Expand All"), ClickAction.new, AccessHtmlElement.new(:css, "div.expandCollapseAll > button"))
    add_action(CucumberLabel.new("Pass"), ClickAction.new, AccessHtmlElement.new(:css, "div.facility-name-pass-po > button"))
    add_verify(CucumberLabel.new("Modal Loaded"), VerifyText.new, AccessHtmlElement.new(:css, ".modal-content"))
    add_action(CucumberLabel.new("Add"), ClickAction.new, AccessHtmlElement.new(:css, ".form-add-btn [type='button']"))
    add_action(CucumberLabel.new("Cancel"), ClickAction.new, AccessHtmlElement.new(:css, ".vitalsConfirmCancel button.right-margin-xs"))
    add_verify(CucumberLabel.new("Growl Alert Msg"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".growl-alert"))
    add_action(CucumberLabel.new("GDF Region"), ClickAction.new, AccessHtmlElement.new(:css, "#date-region-minimized"))
    add_action(CucumberLabel.new("GDF 24 Hours"), ClickAction.new, AccessHtmlElement.new(:css, "[name='24hrRangeGlobal']"))
    add_action(CucumberLabel.new("GDF Apply"), ClickAction.new, AccessHtmlElement.new(:css, "#customRangeApplyGlobal"))
    add_action(CucumberLabel.new("24 HR Range Vital"), ClickAction.new, AccessHtmlElement.new(:css, "#24hr-range-vitals"))
    add_verify(CucumberLabel.new("BP label"), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[@id='data-grid-vitals']/descendant::td[contains(string(), 'Blood Pressure')]"))
    #add_verify(CucumberLabel.new("BP value"), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid=vitals] [data-infobutton=BP] td:nth-child(2)'))
    add_verify(CucumberLabel.new("BP value"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='data-grid-vitals']/descendant::td[contains(string(), '130/80')]"))
    add_action(CucumberLabel.new("New Observation Button"), ClickAction.new, AccessHtmlElement.new(:css, "#patientDemographic-newObservation [type=button]"))
  
    add_verify(CucumberLabel.new("Error message"), VerifyText.new, AccessHtmlElement.new(:css, 'span.help-block.error'))
  end
end

class BPLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Blood Pressure"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='bpInputValue']"))
    add_verify(CucumberLabel.new("BP Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='bp-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("BP Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='bp-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("BP Location"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='bp-location-po']"))
    add_verify(CucumberLabel.new("BP Method"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='bp-method-po']"))
    add_verify(CucumberLabel.new("BP Cuff Size"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='bp-cuff-size-po']"))
    add_verify(CucumberLabel.new("BP Position"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='bp-position-po']"))      
    bp_units = "mm[HG]"    
    add_verify(CucumberLabel.new("BP Units"), VerifyText.new, AccessHtmlElement.new(:xpath, "//span[contains(@class, 'input-group-addon') and contains(string(), '#{bp_units}')]"))
    add_action(CucumberLabel.new("BP Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='bpInputValue']"))
    add_action(CucumberLabel.new("BP Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='bp-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("BP Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='bp-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("BP Location Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='bp-location-po']"))
    add_action(CucumberLabel.new("BP Method Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='bp-method-po']"))
    add_action(CucumberLabel.new("BP Cuff Size Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='bp-cuff-size-po']"))
    add_action(CucumberLabel.new("BP Position Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='bp-position-po']"))
  end
end

class TempLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Temperature"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='temperatureInputValue']"))
    add_verify(CucumberLabel.new("Temp Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='temperature-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("Temp Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='temperature-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("Temp Units F"), VerifyText.new, AccessHtmlElement.new(:css, "[name='temperatureInputValue-radio-units'][value='F']"))
    add_verify(CucumberLabel.new("Temp Units C"), VerifyText.new, AccessHtmlElement.new(:css, "[name='temperatureInputValue-radio-units'][value='C']"))
    add_verify(CucumberLabel.new("Temp Location"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='temperature-location-po']"))
    add_action(CucumberLabel.new("Temp Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='temperatureInputValue']"))
    add_action(CucumberLabel.new("Temp Units F Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='temperatureInputValue-radio-units'][value='F']"))
    add_action(CucumberLabel.new("Temp Units C Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='temperatureInputValue-radio-units'][value='C']"))
    add_action(CucumberLabel.new("Temp Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='temperature-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("Temp Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='temperature-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("Temp Location Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[name='temperature-location-po']"))      
  end
end

class PulseLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Pulse"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='pulseInputValue']"))
    add_verify(CucumberLabel.new("Pulse Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='pulse-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("Pulse Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='pulse-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("Pulse Method"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='pulse-method-po']"))
    add_verify(CucumberLabel.new("Pulse Position"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='pulse-position-po']"))
    add_verify(CucumberLabel.new("Pulse Site"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='pulse-site-po']"))
    add_verify(CucumberLabel.new("Pulse Location"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='pulse-location-po']"))
    pulse_units = "/min"    
    add_verify(CucumberLabel.new("Pulse Units"), VerifyText.new, AccessHtmlElement.new(:xpath, "//span[contains(@class, 'input-group-addon') and contains(string(), '#{pulse_units}')]"))
    add_action(CucumberLabel.new("Pulse Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='pulseInputValue']"))
    add_action(CucumberLabel.new("Pulse Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='pulse-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("Pulse Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='pulse-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("Pulse Method Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='pulse-method-po']"))
    add_action(CucumberLabel.new("Pulse Position Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='pulse-position-po']"))
    add_action(CucumberLabel.new("Pulse Site Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='pulse-site-po']"))
    add_action(CucumberLabel.new("Pulse Location Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='pulse-location-po']"))
  end
end

class RespirationLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Respiration"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='respirationInputValue']"))
    add_verify(CucumberLabel.new("Respiration Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='respiration-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("Respiration Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='respiration-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("Respiration Method"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='respiration-method-po']"))
    add_verify(CucumberLabel.new("Respiration Position"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='respiration-position-po']"))
    resp_units = "/min"    
    add_verify(CucumberLabel.new("Respiration Units"), VerifyText.new, AccessHtmlElement.new(:xpath, "//span[contains(@class, 'input-group-addon') and contains(string(), '#{resp_units}')]"))
    add_action(CucumberLabel.new("Respiration Input Box"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "[name='respirationInputValue']"))
    add_action(CucumberLabel.new("Respiration Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='respiration-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("Respiration Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='respiration-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("Respiration Method Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='respiration-method-po']"))
    add_action(CucumberLabel.new("Respiration Position Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='respiration-position-po']"))

    add_verify(CucumberLabel.new('Respiration has error'), VerifyContainsText.new, AccessHtmlElement.new(:css, 'div.respirationInputValue.has-error'))
    add_verify(CucumberLabel.new('Respiration has error message'), VerifyContainsText.new, AccessHtmlElement.new(:css, 'div.respirationInputValue.has-error span.help-block.error'))
  end
end

class POLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Pulse Oximetry"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='O2InputValue']"))
    add_verify(CucumberLabel.new("PO Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='po-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("PO Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='po-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("PO Supplemental Oxygen Flow Rate"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='suppO2InputValue']"))
    add_verify(CucumberLabel.new("PO Method"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='po-method-po']"))
    po_units = "(liters/minute)"    
    add_verify(CucumberLabel.new("PO Units"), VerifyText.new, AccessHtmlElement.new(:xpath, "//span[contains(@class, 'input-group-addon') and contains(string(), '#{po_units}')]"))
    add_action(CucumberLabel.new("PO Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='O2InputValue']"))
    add_action(CucumberLabel.new("PO Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='po-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("PO Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='po-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("PO Supplemental Oxygen Flow Rate Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='suppO2InputValue']"))
    add_action(CucumberLabel.new("PO Method Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='po-method-po']"))

    add_verify(CucumberLabel.new('PO has error'), VerifyText.new, AccessHtmlElement.new(:css, 'div.O2InputValue.has-error'))
    add_verify(CucumberLabel.new('PO has error message'), VerifyText.new, AccessHtmlElement.new(:css, 'div.O2InputValue.has-error span.help-block.error'))
    add_verify(CucumberLabel.new('PO Supp Ox has error'), VerifyText.new, AccessHtmlElement.new(:css, 'div.suppO2InputValue.has-error'))
    add_verify(CucumberLabel.new('PO Supp Ox has error message'), VerifyText.new, AccessHtmlElement.new(:css, 'div.suppO2InputValue.has-error span.help-block.error'))
  end
end

class HtLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Height"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='heightInputValue']"))
    add_verify(CucumberLabel.new("Ht Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='height-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("Ht Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='height-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("Ht Units in"), VerifyText.new, AccessHtmlElement.new(:css, "[name='heightInputValue-radio-units'][value='in']"))
    add_verify(CucumberLabel.new("Ht Units cm"), VerifyText.new, AccessHtmlElement.new(:css, "[name='heightInputValue-radio-units'][value='cm']"))
    add_verify(CucumberLabel.new("Ht Quality"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='height-quality-po']"))
    add_action(CucumberLabel.new("Ht Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='heightInputValue']"))
    add_action(CucumberLabel.new("Ht Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='height-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("Ht Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='height-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("Ht Units in Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='heightInputValue-radio-units'][value='in']"))
    add_action(CucumberLabel.new("Ht Units cm Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='heightInputValue-radio-units'][value='cm']"))
    add_action(CucumberLabel.new("Ht Quality Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='height-quality-po']"))
  end
end

class WtLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Weight"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='weightInputValue']"))
    add_verify(CucumberLabel.new("Wt Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='weight-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("Wt Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='weight-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("Wt Units lb"), VerifyText.new, AccessHtmlElement.new(:css, "[name='weightInputValue-radio-units'][value='lb']"))
    add_verify(CucumberLabel.new("Wt Units kg"), VerifyText.new, AccessHtmlElement.new(:css, "[name='weightInputValue-radio-units'][value='kg']"))
    add_verify(CucumberLabel.new("Wt Method"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='weight-method-po']"))
    add_verify(CucumberLabel.new("Wt Quality"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='weight-quality-po']"))
    add_action(CucumberLabel.new("Wt Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='weightInputValue']"))
    add_action(CucumberLabel.new("Wt Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='weight-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("Wt Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='weight-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("Wt Units lb Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='weightInputValue-radio-units'][value='lb']"))
    add_action(CucumberLabel.new("Wt Units kg Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='weightInputValue-radio-units'][value='kg']"))
    add_action(CucumberLabel.new("Wt Method Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='weight-method-po']"))
    add_action(CucumberLabel.new("Wt Quality Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='weight-quality-po']"))
  end
end

class PainLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Pain"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='pain-value-po']"))
    add_verify(CucumberLabel.new("Pain Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='pain-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("Pain Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='pain-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("Pain Unable to Respond"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='pain-checkbox-po']"))
    add_action(CucumberLabel.new("Pain Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='pain-value-po']"))
    add_action(CucumberLabel.new("Pain Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='pain-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("Pain Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='pain-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("Pain Unable to Respond Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[id^='pain-checkbox-po']"))
  end
end

class CGLabels < VitalsWriteBack
  include Singleton
  def initialize
    super 
    #Labels
    add_verify(CucumberLabel.new("Circumference/Girth"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='circumValue']"))
    add_verify(CucumberLabel.new("CG Unavailable"), VerifyText.new, AccessHtmlElement.new(:css, "[name='cg-radio-po'][value='Unavailable']"))  
    add_verify(CucumberLabel.new("CG Refused"), VerifyText.new, AccessHtmlElement.new(:css, "[name='cg-radio-po'][value='Refused']"))
    add_verify(CucumberLabel.new("CG Units in"), VerifyText.new, AccessHtmlElement.new(:css, "[name='circumValue-radio-units'][value='in']"))
    add_verify(CucumberLabel.new("CG Units cm"), VerifyText.new, AccessHtmlElement.new(:css, "[name='circumValue-radio-units'][value='cm']"))
    add_verify(CucumberLabel.new("CG Site"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='cg-site-po']"))
    add_verify(CucumberLabel.new("CG Location"), VerifyText.new, AccessHtmlElement.new(:css, "label[for^='cg-location-po']"))
    add_action(CucumberLabel.new("CG Input Box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[name='circumValue']"))
    add_action(CucumberLabel.new("CG Unavailable Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='cg-radio-po'][value='Unavailable']"))
    add_action(CucumberLabel.new("CG Refused Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='cg-radio-po'][value='Refused']"))
    add_action(CucumberLabel.new("CG Units in Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='circumValue-radio-units'][value='in']"))
    add_action(CucumberLabel.new("CG Units cm Input Box"), ClickAction.new, AccessHtmlElement.new(:css, "[name='circumValue-radio-units'][value='cm']"))
    add_action(CucumberLabel.new("CG Site Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='cg-site-po']"))
    add_action(CucumberLabel.new("CG Location Drop Down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "[id^='cg-location-po']"))
  end
end

Then(/^user adds a new vitals$/) do
  aa = VitalsWriteBack.instance
  expect(aa.perform_action("Vitals Add Button")).to eq(true)
  @ehmp = AddVitalModal.new
  @ehmp.wait_until_fld_modal_title_visible
end

Then(/^user chooses to "([^"]*)" on add vitals modal detail screen$/) do | expand_all |
  aa = TempLabels.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  @ehmp = AddVitalModal.new
  @ehmp.wait_until_btn_expand_collapse_button_visible
  @ehmp.btn_expand_collapse_button.click
  @ehmp.wait_until_fld_temp_location_visible
end

Then(/^add vital modal detail title says "([^"]*)"$/) do |modal_title|
  modal = AddVitalModal.new
  modal.wait_for_fld_modal_title
  expect(modal).to have_fld_modal_title
  expect(modal.fld_modal_title.text.upcase).to eq(modal_title.upcase)
end

Then(/^the add vitals detail modal displays labels$/) do |table|
  aa = VitalsWriteBack.instance
  verify_vitals_modal_details(table, aa)
end

Then(/^the Date Taken is a mandatory field on the add vitals modal detail screen$/) do
  aa = VitalsWriteBack.instance
  expect(aa.perform_verification("Date Taken", "Date Taken *")).to eq(true)
end

Then(/^the add vitals detail modal displays "([^"]*)", "([^"]*)" and "([^"]*)" buttons$/) do |pass_btn, accept_btn, cancel_btn|
  aa = VitalsWriteBack.instance
  expect(aa.am_i_visible?(pass_btn)).to eq(true), "Pass btn is not visible"
  # expect(aa.am_i_visible?(accept_btn)).to eq(true), "Accept btn is not visible"
  expect(aa.get_element(accept_btn).displayed?).to eq(true), "Accept btn is not displayed"
  expect(aa.get_element(accept_btn).enabled?).to eq(false), "Accept btn is enabled"
  expect(aa.am_i_visible?(cancel_btn)).to eq(true), "Cancel btn is not visible"
end

Then(/^the add vitals detail modal displays labels and expanded labels for "([^"]*)"$/) do |vital_type, table|
  verify_vitals_modal_details(table, map_add_vitals_class(vital_type))
end

Then(/^the add vitals detail modal displays form fields for "([^"]*)"$/) do |vital_type, table|
  verify_vitals_modal_details(table, map_add_vitals_class(vital_type))
end

def map_add_vitals_class(vital_type)
  case vital_type
  when 'Blood Pressure'
    aa = BPLabels.instance
  when 'Temperature'
    aa = TempLabels.instance
  when 'Pulse'
    aa = PulseLabels.instance
  when 'Respiration'
    aa = RespirationLabels.instance
  when 'Pulse Oximetry'
    aa = POLabels.instance
  when 'Height'
    aa = HtLabels.instance
  when 'Weight'
    aa = WtLabels.instance
  when 'Pain'
    aa = PainLabels.instance
  when 'Circumference/Girth'
    aa = CGLabels.instance
  end  
  return aa
end

def verify_vitals_modal_details(table, modal)
  #expect(modal.wait_until_action_element_visible("Modal Loaded", DefaultLogin.wait_time)).to be_true
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_fld_modal_body_visible
  table.rows.each do | row |
    expect(modal.am_i_visible?(row[0])).to eq(true)
  end
end

Then(/^user adds a Vital record for the current visit$/) do |table| 
  tray = AddVitalModal.new
  vital_elements = tray.map_elements
  table.rows.each do | row |
    begin
      p row
      field = vital_elements[row[1]]
      expect(field).to_not be_nil, "expected #{row[1]} to not be nil"
      field.native.send_keys row[2]
      page.driver.browser.execute_script("$(arguments[0]).blur();", field.native)
    rescue Selenium::WebDriver::Error::StaleElementReferenceError
      vital_elements = tray.map_elements
      retry
    end
  end
end

Then(/^user sets dropdown values for the vitals$/) do |table|
  tray = AddVitalModal.new
  vital_elements = tray.map_elements
  table.rows.each do | row |
    begin
      p row
      field = vital_elements[row[1]]
      expect(field).to_not be_nil, "expected #{row[1]} to not be nil"
      field.select row[2]
      #page.driver.browser.execute_script("$(arguments[0]).blur();", field.native)
    rescue Selenium::WebDriver::Error::StaleElementReferenceError
      vital_elements = tray.map_elements
      retry
    end
  end
end

Then(/^user chooses unavailable for the vitals$/) do |table|
  table.rows.each do | row |
    vital_class = map_add_vitals_class(row[0])
    input_box = row[1] + " Unavailable Input Box"
    expect(vital_class.perform_action(input_box, "")).to eq(true)
  end
end

Then(/^user chooses refused for the vitals$/) do |table|
  table.rows.each do | row |
    vital_class = map_add_vitals_class(row[0])
    input_box = row[1] + " Refused Input Box"
    expect(vital_class.perform_action(input_box, "")).to eq(true)
  end
end

Then(/^user adds vitals to patient record$/) do
  aa = VitalsWriteBack.instance
  expect(aa.perform_action("Add")).to eq(true)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) # seconds # wait until list opens
  wait.until { element_is_not_present?(:id, 'form-add-btn') }
end

Then(/^the recently added vital record is displayed$/) do |table|
  aa = VitalsWriteBack.instance
  table.rows.each do | row |
    expect(aa.perform_verification("BP label", row[0])).to eq(true)
    expect(aa.perform_verification("BP value", row[1])).to eq(true)
  end
end

When(/^user attempts to add vital$/) do
  aa = VitalsWriteBack.instance
  expect(aa.perform_action("Add")).to eq(true)
end

Then(/^the Respiration error message displays "([^"]*)"$/) do |arg1|
  aa = RespirationLabels.instance
  expect(aa.wait_until_element_present('Respiration has error')).to eq(true), "Respiration is not indicating an error"
  expect(aa.perform_verification('Respiration has error message', arg1)).to eq(true), "Respiration error message is not correct"
end

Then(/^the Pulse Oximetry error message displays "([^"]*)"$/) do |arg1|
  aa = POLabels.instance
  expect(aa.wait_until_element_present('PO has error')).to eq(true), "Pulse Oximetry is not indicating an error"
  expect(aa.perform_verification('PO has error message', arg1)).to eq(true), "Pulse Oximetry error message is not correct"
end

Then(/^the Supplemental Oxygen error message displays "([^"]*)"$/) do |arg1|
  aa = POLabels.instance
  expect(aa.wait_until_element_present('PO Supp Ox has error')).to eq(true), "PO Supp Ox is not indicating an error"
  expect(aa.perform_verification('PO Supp Ox has error message', arg1)).to eq(true), "PO Supp Ox error message is not correct"
end

When(/^user chooses to Pass on entering vitals$/) do
  expect(VitalsWriteBack.instance.perform_action('Pass')).to eq(true)
  sleep(10)
end

Then(/^the form fields for "([^"]*)" are disabled$/) do |vital_type, table|
  elements = map_add_vitals_class(vital_type)
  table.rows.each do | row |
    element = elements.get_element(row[0])
    expect(element.enabled?).to eq(false), "Expected #{row[0]} to be disabled"
  end
end

Then(/^the Date Taken field defaults to Today$/) do
  aa = VitalsWriteBack.instance
  today = Date.today.strftime("%m/%d/%Y")

  expect(aa.perform_verification('Date Taken Input Value', today)).to eq(true), "Expected date to be today"
end

Then(/^the Time Taken field defaults to time in specific format$/) do
  aa = VitalsWriteBack.instance
  expect(aa.perform_verification('Time Taken Input Value', '')).to eq(true), "Expected time to be in specific format"
end

When(/^the user sets the Date Take field to Tomorrow$/) do
  aa = VitalsWriteBack.instance
  tomorrow = (Date.today + 1).strftime("%m/%d/%Y")
  p tomorrow
  expect(aa.perform_action('Date Taken Input Box', tomorrow)).to eq(true)
end

Then(/^the Date \/ Time error message displays "([^"]*)"$/) do |arg1|
  aa = VitalsWriteBack.instance
  expect(aa.perform_verification('Date Taken Error Message', arg1)).to eq(true)
end

class VitalsAlert < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('Alert Title'), VerifyText.new, AccessHtmlElement.new(:css, '#alert-region h4.modal-title'))
    add_action(CucumberLabel.new('No button'), ClickAction.new, AccessHtmlElement.new(:xpath, xpath_footer_button('No')))
    add_action(CucumberLabel.new('Yes button'), ClickAction.new, AccessHtmlElement.new(:xpath, xpath_footer_button('Yes')))
  end

  def xpath_footer_button(text)
    "//div[@id='alert-region']/descendant::div[contains(@class, 'modal-footer')]/descendant::button[contains(string(), '#{text}')]"
  end
end

Then(/^an alert is displayed with title "([^"]*)"$/) do |title|
  alert = VitalsAlert.instance
  @alert_title = title
  expect(alert.perform_verification('Alert Title', title)).to eq(true)
end

When(/^user chooses "([^"]*)" button on the alert$/) do |button_text|
  alert = VitalsAlert.instance
  expect(alert.perform_action("#{button_text} button")).to eq(true)
end

Then(/^the alert is closed$/) do
  alert = VitalsAlert.instance
  expect(alert.perform_verification('Alert Title', @alert_title, 5)).to eq(false)
end

Then(/^user closes the new observation window$/) do
  aa = VitalsWriteBack.instance
  click_button = aa.perform_action("New Observation Button")
  unless click_button
    aa.add_action(CucumberLabel.new("ob button"), ClickAction.new, AccessHtmlElement.new(:css, "#patientDemographic-newObservation div.action-list-container button"))
    if aa.am_i_visible? 'ob button'
      p "observation tray still open, try to refresh page"
      TestSupport.driver.navigate.refresh
    end
  end
end

Then(/^the add vitals detail modal displays form fields for Blood Pressure$/) do
  @ehmp = AddVitalModal.new
  expect(@ehmp).to have_fld_bp_input
  expect(@ehmp).to have_rbn_bp_unavailable
  expect(@ehmp).to have_rbn_bp_refused
  expect(@ehmp).to have_fld_bp_location
  expect(@ehmp).to have_fld_bp_method
  expect(@ehmp).to have_fld_bp_cuffsize
  expect(@ehmp).to have_fld_bp_position
end

Then(/^the add vitals detail modal displays form fields for Temperature$/) do 
  @ehmp = AddVitalModal.new
  expect(@ehmp).to have_fld_temp_input
  expect(@ehmp).to have_rbn_temp_unavailable
  expect(@ehmp).to have_rbn_temp_refused
  expect(@ehmp).to have_fld_temp_location
  expect(@ehmp).to have_rbn_temp_f
  expect(@ehmp).to have_rbn_temp_c
end

Then(/^the add vitals detail modal displays form fields for Pulse$/) do
  @ehmp = AddVitalModal.new
  expect(@ehmp).to have_fld_pulse_input
  expect(@ehmp).to have_rbn_pulse_unavailable
  expect(@ehmp).to have_rbn_pulse_refused
  expect(@ehmp).to have_fld_pulse_method
  expect(@ehmp).to have_fld_pulse_position
  expect(@ehmp).to have_fld_pulse_site
  expect(@ehmp).to have_fld_pulse_location
end

Then(/^the add vitals detail modal displays form fields for Respiration$/) do
  @ehmp = AddVitalModal.new
  expect(@ehmp).to have_fld_resp_input
  expect(@ehmp).to have_rbn_resp_unavailable
  expect(@ehmp).to have_rbn_resp_refused
  expect(@ehmp).to have_fld_resp_method
  expect(@ehmp).to have_fld_resp_position
end

Then(/^the add vitals detail modal displays form fields for Pulse Oximetry$/) do
  @ehmp = AddVitalModal.new
  expect(@ehmp).to have_fld_pulseox_input
  expect(@ehmp).to have_rbn_pulseox_unavailable
  expect(@ehmp).to have_rbn_pulseox_refused
  expect(@ehmp).to have_fld_pulseox_suppox
  expect(@ehmp).to have_fld_pulseox_method
end

Then(/^the add vitals detail modal displays form fields for Height$/) do
  @ehmp = AddVitalModal.new
  expect(@ehmp).to have_fld_height_input
  expect(@ehmp).to have_rbn_height_unavailable
  expect(@ehmp).to have_rbn_height_refused
  expect(@ehmp).to have_rbn_height_in
  expect(@ehmp).to have_rbn_height_cm
  expect(@ehmp).to have_fld_height_quality
end

Then(/^the add vitals detail modal displays form fields for Circumference\/Girth$/) do
  @ehmp = AddVitalModal.new
  expect(@ehmp).to have_fld_cg_input
  expect(@ehmp).to have_rbn_cg_unavailable
  expect(@ehmp).to have_rbn_cg_refused
  expect(@ehmp).to have_rbn_cg_in
  expect(@ehmp).to have_rbn_cg_cm
  expect(@ehmp).to have_fld_cg_site
  expect(@ehmp).to have_fld_cg_location
end

Then(/^the add vitals detail modal displays form fields for Weight$/) do
  @ehmp = AddVitalModal.new
  expect(@ehmp).to have_fld_weight_input
  expect(@ehmp).to have_rbn_weight_unavailable
  expect(@ehmp).to have_rbn_weight_refused
  expect(@ehmp).to have_rbn_weight_lb
  expect(@ehmp).to have_rbn_weight_kg
  expect(@ehmp).to have_fld_weight_method
  expect(@ehmp).to have_fld_weight_quality
end
