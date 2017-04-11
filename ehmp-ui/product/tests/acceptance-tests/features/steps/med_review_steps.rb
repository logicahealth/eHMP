#class FocusInAction
#  include HTMLAction
#  def initialize(html_id)
#    @id = html_id
#  end
#  
#  def perform_action(html_element, value)
#    driver = TestSupport.driver
#    driver.execute_script("$('##{@id}').focusin();")
#  end
#end

class MedReviewApplet < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'medication_review'
    appletid_css = "[data-appletid=#{@appletid}]"
    
    add_applet_buttons appletid_css
    add_action(CucumberLabel.new("Coversheet Dropdown"), ClickAction.new, AccessHtmlElement.new(:id, "screenName"))
    add_verify(CucumberLabel.new("Drop Down Menu"), VerifyText.new, AccessHtmlElement.new(:class, "dropdown-menu"))
    add_action(CucumberLabel.new("Meds Review"), ClickAction.new, AccessHtmlElement.new(:link_text, "Meds Review"))
    add_verify(CucumberLabel.new("No Records Found"), VerifyText.new, AccessHtmlElement.new(:class, "emptyMedsList")) 

    add_action(CucumberLabel.new("Clinic Order Meds Group"), ClickAction.new, AccessHtmlElement.new(:css, "[data-type-row='clinical']"))
    add_verify(CucumberLabel.new("Clinic Order Meds Group"), VerifyText.new, AccessHtmlElement.new(:css, "[data-type-row='clinical']"))
    add_action(CucumberLabel.new("Inpatient Meds Group"), ClickAction.new, AccessHtmlElement.new(:css, "[id^='accordion'] [data-type-row='inpatient']"))
    add_verify(CucumberLabel.new("Inpatient Meds Group"), VerifyText.new, AccessHtmlElement.new(:css, "[id^='accordion'] [data-type-row='inpatient']"))
    add_action(CucumberLabel.new("Outpatient Meds Group"), ClickAction.new, AccessHtmlElement.new(:css, "[id^='accordion'] [data-type-row='outpatient']"))
    add_verify(CucumberLabel.new("Outpatient Meds Group"), VerifyText.new, AccessHtmlElement.new(:css, "[id^='accordion'] [data-type-row='outpatient']"))
    add_verify(CucumberLabel.new("Applet Title"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] .panel-title-label"))

    warfarin_tab_id = 'medication_name_urn_va_med_9E7A_271_17220'
    #add_action(CucumberLabel.new("WARFARIN TAB"), FocusInAction.new(warfarin_tab_id), AccessHtmlElement.new(:id, warfarin_tab_id))
    add_action(CucumberLabel.new("WARFARIN TAB"), ClickAction.new, AccessHtmlElement.new(:id, warfarin_tab_id))
    add_action(CucumberLabel.new("WARFARIN TAB detail icon"), ClickAction.new, AccessHtmlElement.new(:css, "#medication_Item_urn_va_med_9E7A_271_17220 [button-type=detailView-button-toolbar]"))
    add_action(CucumberLabel.new("DIGOXIN TAB detail icon"), ClickAction.new, AccessHtmlElement.new(:css, "#medication_Item_urn_va_med_9E7A_164_9583 [button-type=detailView-button-toolbar]"))
    # add_action(CucumberLabel.new("DIGOXIN TAB detail icon"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='medication_Item_urn_va_med_9E7A_164_9583']/descendant::a[@id='detailView-button-toolbar']"))

    digoxin_tab_id = 'medication_name_urn_va_med_9E7A_164_9583'
    #add_action(CucumberLabel.new("DIGOXIN TAB"), FocusInAction.new(digoxin_tab_id), AccessHtmlElement.new(:css, "[data-appletid='medication_review'] ##{digoxin_tab_id}"))
    add_action(CucumberLabel.new("DIGOXIN TAB"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] ##{digoxin_tab_id}"))
    metformin_tab_id = 'medication_name_urn_va_med_9E7A_271_27860'
    #add_action(CucumberLabel.new("METFORMIN TAB,SA"), FocusInAction.new(metformin_tab_id), AccessHtmlElement.new(:css, "[data-appletid='medication_review'] ##{metformin_tab_id}"))
    add_action(CucumberLabel.new("METFORMIN TAB,SA"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] ##{metformin_tab_id}"))

    add_action(CucumberLabel.new("METFORMIN TAB,SA detail icon"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='medication_Item_urn_va_med_9E7A_271_27860']/descendant::a[@button-type='detailView-button-toolbar']"))
    add_verify(CucumberLabel.new("Order Hx Date Range 1"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #order-urn_va_med_9E7A_271_27860"))
    add_verify(CucumberLabel.new("Order Hx Date Range 2"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #order-urn_va_med_C877_271_27860"))
    add_action(CucumberLabel.new("Meds Review Filter input"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "input[name='q-8afd050c9965']"))
    add_action(CucumberLabel.new("Meds Review Search Filter"), ClickAction.new, AccessHtmlElement.new(:id, "grid-filter-button-8afd050c9965"))

    inpatient_med_rows = AccessHtmlElement.new(:css, "[id^='inpatient'] [class='panel-heading meds-item']")
    add_verify(CucumberLabel.new('Inpatient Med Rows'), VerifyXpathCount.new(inpatient_med_rows), inpatient_med_rows)

    outpatient_med_rows = AccessHtmlElement.new(:css, "[id^='outpatient'] [class='panel-heading meds-item']")
    add_verify(CucumberLabel.new('Outpatient Med Rows'), VerifyXpathCount.new(outpatient_med_rows), outpatient_med_rows)

    add_action(CucumberLabel.new('Control - applet - Text Filter'), SendKeysAction.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] .form-search input"))

    add_verify(CucumberLabel.new('Empty Inpatient'), VerifyText.new, AccessHtmlElement.new(:css, "[data-type-row='inpatient']"))
    add_verify(CucumberLabel.new('Empty Outpatient'), VerifyText.new, AccessHtmlElement.new(:css, "[data-type-row='outpatient']"))
    add_verify(CucumberLabel.new('Empty Clinic Order'), VerifyText.new, AccessHtmlElement.new(:css, "[data-type-row='clinical']"))
  end

  def applet_loaded
    return false unless am_i_visible? 'Inpatient Meds Group'
    return false unless am_i_visible? 'Clinic Order Meds Group'
    return false unless am_i_visible? 'Outpatient Meds Group'
    return false unless med_group_loaded "[data-type-row='inpatient']"
    return false unless med_group_loaded "[data-type-row='outpatient']"
    return false unless med_group_loaded "[data-type-row='clinical']"
    true
  end

  def med_group_loaded(group_id)
    begin
      return true if TestSupport.driver.find_element(:css, "#{group_id}").enabled?
    rescue Exception => e
      p 'Empty message not exist, look for medication rows'
    end
    return TestSupport.driver.find_elements(:css, "#{group_id}").length > 0
  end
end

class MedReviewAppletSummaryDetailsHeader < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Outpatient Name Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[id^='outpatient'] [sortkey='medicationName']"))
    add_verify(CucumberLabel.new("Outpatient Sig Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[id^='outpatient'] [sortkey='sig']"))
    add_verify(CucumberLabel.new("Outpatient Last Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #OUTPATIENT-time-header"))
    add_verify(CucumberLabel.new("Outpatient Status/Fillable Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[id^='outpatient'] [sortkey='status']"))

    add_verify(CucumberLabel.new("Inpatient Name Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] button[sortkey='medicationName']"))
    add_verify(CucumberLabel.new("Inpatient Sig Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] button[sortkey='sig']"))
    add_verify(CucumberLabel.new("Inpatient Last Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #INPATIENT-time-header"))
    add_verify(CucumberLabel.new("Inpatient Status/Next Header"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] div.text-center button"))

    add_action(CucumberLabel.new("Outpatient Name Header Sort"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] button[sortkey='medicationName']"))
    add_action(CucumberLabel.new("Outpatient Sig Header Sort"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] button[sortkey='sig']"))
    add_action(CucumberLabel.new("Outpatient Last Header Sort"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #OUTPATIENT-time-header"))
  end
end

class MedReviewAppletSummaryDetails < ADKContainer
  include Singleton
  def initialize
    super
    #outpatient medications
    add_verify(CucumberLabel.new("METFORMIN TAB,SA Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_271_27860"))
    add_verify(CucumberLabel.new("METOPROLOL TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_271_16944"))
    add_verify(CucumberLabel.new("METOPROLOL TARTRATE TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_271_27960"))
    add_verify(CucumberLabel.new("SIMVASTATIN TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_271_28060"))
    add_verify(CucumberLabel.new("WARFARIN TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("ASPIRIN TAB,EC Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_271_18044"))

    add_verify(CucumberLabel.new("METFORMIN TAB,SA Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_271_27860"))
    add_verify(CucumberLabel.new("METOPROLOL TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_271_16944"))
    add_verify(CucumberLabel.new("METOPROLOL TARTRATE TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_271_27960"))
    add_verify(CucumberLabel.new("SIMVASTATIN TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_271_28060"))
    add_verify(CucumberLabel.new("WARFARIN TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("ASPIRIN TAB,EC Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_271_18044"))

    add_verify(CucumberLabel.new("METFORMIN TAB,SA Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_271_27860"))
    add_verify(CucumberLabel.new("METOPROLOL TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_271_16944"))
    add_verify(CucumberLabel.new("METOPROLOL TARTRATE TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_271_27960"))
    add_verify(CucumberLabel.new("SIMVASTATIN TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_271_28060"))
    add_verify(CucumberLabel.new("WARFARIN TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("ASPIRIN TAB,EC Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_271_18044"))

    add_verify(CucumberLabel.new("METFORMIN TAB,SA Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_271_27860"))
    add_verify(CucumberLabel.new("METOPROLOL TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_271_16944"))
    add_verify(CucumberLabel.new("METOPROLOL TARTRATE TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_271_27960"))
    add_verify(CucumberLabel.new("SIMVASTATIN TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_271_28060"))
    add_verify(CucumberLabel.new("WARFARIN TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("ASPIRIN TAB,EC Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_271_18044"))

    #inpatient medications
    add_verify(CucumberLabel.new("AMPICILLIN INJ in SODIUM CHLORIDE 0.9% INJ Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_164_10714"))
    add_verify(CucumberLabel.new("CEFAZOLIN INJ in SODIUM CHLORIDE 0.9% INJ Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_164_10717"))
    add_verify(CucumberLabel.new("DIGOXIN TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_164_9583"))
    add_verify(CucumberLabel.new("FUROSEMIDE TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_9E7A_164_9584"))

    add_verify(CucumberLabel.new("AMPICILLIN INJ in SODIUM CHLORIDE 0.9% INJ Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_164_10714"))
    add_verify(CucumberLabel.new("CEFAZOLIN INJ in SODIUM CHLORIDE 0.9% INJ Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_164_10717"))
    add_verify(CucumberLabel.new("DIGOXIN TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_164_9583"))
    add_verify(CucumberLabel.new("FUROSEMIDE TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_9E7A_164_9584"))

    add_verify(CucumberLabel.new("AMPICILLIN INJ in SODIUM CHLORIDE 0.9% INJ Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_164_10714"))
    add_verify(CucumberLabel.new("CEFAZOLIN INJ in SODIUM CHLORIDE 0.9% INJ Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_164_10717"))
    add_verify(CucumberLabel.new("DIGOXIN TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_164_9583"))
    add_verify(CucumberLabel.new("FUROSEMIDE TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_9E7A_164_9584"))

    add_verify(CucumberLabel.new("AMPICILLIN INJ in SODIUM CHLORIDE 0.9% INJ Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_164_10714"))
    add_verify(CucumberLabel.new("CEFAZOLIN INJ in SODIUM CHLORIDE 0.9% INJ Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_164_10717"))
    add_verify(CucumberLabel.new("DIGOXIN TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_164_9583"))
    add_verify(CucumberLabel.new("FUROSEMIDE TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_9E7A_164_9584"))
  end
end

class MedReviewAppletDetailsView < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Med Name_Warfarin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #qualifiedName-urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("Sig_Warfarin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #med-summary-urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("Status_Warfarin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #status_urn_va_med_9E7A_271_17220"))

    add_verify(CucumberLabel.new("Med Name_Digoxin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #qualifiedName-urn_va_med_9E7A_164_9583"))
    add_verify(CucumberLabel.new("Sig_Digoxin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #med-summary-urn_va_med_9E7A_164_9583"))
    add_verify(CucumberLabel.new("Status_Digoxin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #status_urn_va_med_9E7A_164_9583"))

    add_verify(CucumberLabel.new("Prescription No. Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #prescription-label-urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("Supply Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #supply-label-urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("Dose/Schedule Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #dose-label-urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("Provider Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #provider-label-urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("Pharmacist Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #pharmacist-label-urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("Location Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #location-label-urn_va_med_9E7A_271_17220"))
    add_verify(CucumberLabel.new("Facility Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #facility-label-urn_va_med_9E7A_271_17220"))

    add_verify(CucumberLabel.new("Med Review Details Values"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #order-detail-urn_va_med_9E7A_271_17220"))
  end
end

class MedReviewDateFilter < ADKContainer
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Control - Applet - Date Filter"), ClickAction.new, AccessHtmlElement.new(:css, "#navigation-date #date-region-minimized"))
    add_action(CucumberLabel.new("Control - Applet - From Date"), SendKeysAction.new, AccessHtmlElement.new(:css, "#globalDate-region #filterFromDateGlobal"))
    add_action(CucumberLabel.new("Control - Applet - To Date"), SendKeysAction.new, AccessHtmlElement.new(:id, "filterToDateGlobal"))
    add_action(CucumberLabel.new("Control - Applet - Apply"), ClickAction.new, AccessHtmlElement.new(:id, "customRangeApplyGlobal"))
  end
end

When(/^user selects Meds Review from drop down menu$/) do
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible("Coversheet Dropdown", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Coversheet Dropdown", "")).to be_true, "Could not click on Drop down menu"
  expect(aa.wait_until_element_present("Drop Down Menu", 60)).to be_true, "Could not see the drop down menu"
  expect(aa.perform_action("Meds Review", "")).to be_true, "Could not click on Med Review link"
end

When(/^user navigates to Meds Review Applet$/) do
  navigate_in_ehmp "#medication-review"
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible("Applet Title", DefaultLogin.wait_time * 4)).to be_true
  MedReviewApplet.instance.clear_filter
end

Then(/^the title of the page says "(.*?)" in Meds Review Applet$/) do |title|
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible("Applet Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Applet Title", title)).to be_true, "Title does not say MEDICATION REVIEW"
end

Then(/^user sees "(.*?)" and "(.*?)" in Meds Review Applet$/) do |outpatient_group, inpatient_group|
  @ehmp = PobMedsReview.new
  @ehmp.wait_for_fld_inpatient_meds_group
  @ehmp.wait_for_fld_outpatient_meds_group
  expect(@ehmp).to have_fld_inpatient_meds_group
  expect(@ehmp).to have_fld_outpatient_meds_group
  # aa = MedReviewApplet.instance
  # expect(aa.wait_until_action_element_visible(outpatient_group, DefaultLogin.wait_time)).to be_true
  # expect(aa.wait_until_action_element_visible(inpatient_group, DefaultLogin.wait_time)).to be_true
  # expect(aa.perform_verification(outpatient_group, "OUTPATIENT MEDS")).to be_true, "Outpatient group does not exist"
  # expect(aa.perform_verification(inpatient_group, "INPATIENT MEDS")).to be_true, "Inpatient group does not exist"
end

When(/^user expands "(.*?)" in Meds Review Applet$/) do |med_group_name|
  aa = MedReviewApplet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)#DefaultTiming.default_table_row_load_time)
  wait.until { aa.applet_loaded }

  expect(aa.wait_until_action_element_visible(med_group_name, DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(med_group_name, "")).to be_true, "Could not expand #{med_group_name}"
end

Then(/^"(.*?)" summary view contains headers in Meds Review Applet$/) do |med_group_name, table|
  ma = MedReviewApplet.instance
  aa = MedReviewAppletSummaryDetailsHeader.instance
  # expect(ma.wait_until_action_element_visible(med_group_name, 30)).to be_true
  patient_type = med_group_name.split(" ")
  p patient_type[0]
  expected_headers = table.headers
  for i in 0...expected_headers.length
    expect(aa.perform_verification(patient_type[0] + " " + expected_headers[i] + " Header", expected_headers[i].upcase, DefaultTiming.default_table_row_load_time)).to be_true, "#{expected_headers[i]} header does not exist"
  end
end

Then(/^"(.*?)" summary view contains medications in Meds Review Applet$/) do |med_group_name, table|
  ma = MedReviewApplet.instance
  aa = MedReviewAppletSummaryDetails.instance
  expect(ma.wait_until_action_element_visible(med_group_name, DefaultLogin.wait_time)).to be_true
  table.rows.each do |row|
    expect(aa.perform_verification(row[0] +" Name", row[0])).to be_true, "The value #{row[0]} is not present in the Medication Name column"
    expect(aa.perform_verification(row[0] + " Sig", row[1])).to be_true, "The value #{row[1]} is not present in the Sig column"
    expect(aa.perform_verification(row[0] + " Fillable", row[2])).to be_true, "The value #{row[0]} #{row[2]} is not present in the Fillable column"
  end
end

Then(/^user selects medication "(.*?)" in Meds Review Applet$/) do |med_name|
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible(med_name, DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(med_name, "")).to be_true, "Could not expand #{med_name}"
end

Then(/^user selects from the menu medication review detail icon for "(.*?)" in Meds Review Applet$/) do |med_name|
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible(med_name + " detail icon", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(med_name + " detail icon", "")).to be_true, "for #{med_name}, medication review detail icon can't be clicked"
end

Then(/^the medication detail header section in Meds Review Applet contains$/) do |table|
  aa = MedReviewAppletDetailsView.instance
  table.rows.each do |row|
    expect(aa.perform_verification(row[0], row[1])).to be_true, "The value #{row[1]} is not present in the Medication Detail View"
  end
end

Then(/^medication detail description section in Meds Review Applet contains$/) do |table|
  aa = MedReviewAppletDetailsView.instance
  table.rows.each do |row|
    expect(aa.perform_verification(row[0] + " Label", row[0])).to be_true, "The Label #{row[0]} is not present in the Medication Detail View"
    expect(aa.perform_verification("Med Review Details Values", row[1])).to be_true, "The Value #{row[1]} is not present in the Medication Detail View"
  end
end

Then(/^the medication detail fill history section in Meds Review Applet contains$/) do |table|
  aa = MedReviewAppletDetailsView.instance
  verify_table_rows_med_review(table)
end

def verify_table_rows_med_review(table)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.compare_specific_row(table, '#history-table-urn_va_med_9E7A_271_17220') }
end

When(/^user clicks on the column header "(.*?)" in Med Review Applet$/) do |name_column_header|
  aa = MedReviewAppletSummaryDetailsHeader.instance
  expect(aa.wait_until_action_element_visible(name_column_header + " Header", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(name_column_header + " Header Sort", "")).to be_true
end

Then(/^"(.*?)" column is sorted in ascending order in Med Review Applet$/) do |column_name|
  driver = TestSupport.driver
  column_values_array = []

  aa = MedReviewAppletSummaryDetailsHeader.instance
  expect(aa.wait_until_action_element_visible("Outpatient " + column_name + " Header", DefaultLogin.wait_time)).to be_true

  case column_name
  when 'Name'
    element_column_values = driver.find_elements(css: '#medication_review-medication-list-items .col-sm-3.outpatientMedItemName')
  when 'Sig'
    element_column_values = driver.find_elements(css: '#medication_review-medication-list-items .col-sm-2.outpatientMedItemSig')
  else
    fail "**** No function found! Check your script ****"
  end

  element_column_values.each do |row|
    #    print "selenium data ----"
    #    p row.text
    column_values_array << row.text.downcase
    # sorted_array_empty_string_removed
    column_values_array -= [""]
  end

  (column_values_array == column_values_array.sort { |x, y| x <=> y }).should == true

end

Then(/^"(.*?)" column is sorted in descending order in Med Review Applet$/) do |column_name|
  driver = TestSupport.driver
  column_values_array = []

  aa = MedReviewAppletSummaryDetailsHeader.instance
  expect(aa.wait_until_action_element_visible("Outpatient " + column_name + " Header", DefaultLogin.wait_time)).to be_true

  case column_name
  when 'Name'
    element_column_values = driver.find_elements(css: '#medication_review-medication-list-items .col-sm-5.outpatientMedItemName')
  when 'Sig'
    element_column_values = driver.find_elements(css: '#medication_review-medication-list-items .col-sm-2.outpatientMedItemSig')
  else
    fail "**** No function found! Check your script ****"
  end

  element_column_values.each do |row|
    #    print "selenium data ----"
    #    p row.text
    column_values_array << row.text.downcase
    column_values_array -= [""]
  end

  (column_values_array == column_values_array.sort { |x, y| y <=> x }).should == true
end

Then(/^"(.*?)" column is sorted in "(.*?)" order in Med Review Applet$/) do |column_name, _sort_type, table|
  driver = TestSupport.driver
  aa = MedReviewAppletSummaryDetailsHeader.instance
  expect(aa.wait_until_action_element_visible("Outpatient " + column_name + " Header", DefaultLogin.wait_time)).to be_true

  element_column_values = driver.find_elements(css: '#medication_review-medication-list-items .col-sm-1.outpatientMedItemTime')
  column_values_array = []

  element_column_values.each do |row|
    #    print "selenium data ----"
    #    p row.text
    column_values_array << row.text.downcase
  end

  cucumber_array = table.headers
  (column_values_array == cucumber_array).should == true
end

Then(/^OrderHx date range shows$/) do |table|
  aa = MedReviewApplet.instance
  i = 1
  table.rows.each do |row|
    expect(aa.perform_verification("Order Hx Date Range #{i}", row[0])).to be_true, "The orderHx #{row[0]} is not present in the Medication Detail View"
    i += 1
  end
end

Then(/^the user clicks on search filter in Meds Review Applet$/) do
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible("Meds Review Search Filter", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Meds Review Search Filter", "")).to be_true
end

Then(/^the user types "(.*?)" in search box of the Meds Review Applet$/) do |search_field|
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible("Meds Review Filter input", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Meds Review Filter input", search_field)).to be_true
end

Then(/^user selects the "(.*?)" detail icon in Meds Review Applet$/) do |arg1|
  aa = MedReviewApplet.instance
  label = "#{arg1} detail icon"
  expect(aa.perform_action(label)).to be_true
end

Then(/^"(.*?)" column is sorted in default sorting order in Med Review Applet$/) do |column_name, table|
  driver = TestSupport.driver
  aa = MedReviewAppletSummaryDetailsHeader.instance
  expect(aa.wait_until_action_element_visible("Outpatient " + column_name + " Header", DefaultLogin.wait_time)).to be_true

  element_column_values = driver.find_elements(css: '#medication_review-medication-list-items .col-sm-5.outpatientMedItemName')
  column_values_array = []

  element_column_values.each do |row|
    print "selenium data ----"
    p row.text
    column_values_array << row.text.downcase
    column_values_array -= [""]
  end

  cucumber_array = []
  table.rows.each do |row|
    cucumber_array << row[0]
  end

  (column_values_array == cucumber_array).should == true
end

def status_num(element)
  # p element.attribute('title')
  title = element.attribute('title').downcase
  return 0 if title.include? 'active'
  return 1 if title.include? 'pending'
  return 2 if title.include? 'expired' # pending
  return 3 if title.include? 'discontinued'
  return 4
end

Then(/^the Outpatient Status column is sorted in default sorting order in Med Review Applet$/) do
  driver = TestSupport.driver
  elements = driver.find_elements(css: '#medsReviewApplet_mainContentArea_listArea_OUTPATIENTMedications_medication_review div.MedItemFillable span')
  last_element_num = 0
  elements.each do |element|
    element.location_once_scrolled_into_view
    current_element_num = status_num element

    is_element_greater = current_element_num >= last_element_num
    expect(is_element_greater).to be_true

    last_element_num = current_element_num
  end # row_elements.each

end

Then(/^Inpatient Meds Group summary view displays medications$/) do
  med_reivew_applet = MedReviewApplet.instance
  expect(med_reivew_applet.wait_until_xpath_count_greater_than('Inpatient Med Rows', 0)).to eq(true), "Expected Inpatient Meds to display more then 0 rows"
end

Then(/^Outpatient Meds Group summary view displays medications$/) do
  med_reivew_applet = MedReviewApplet.instance
  expect(med_reivew_applet.wait_until_xpath_count_greater_than('Outpatient Med Rows', 0)).to eq(true), "Expected Outpatient Meds to display more then 0 rows"
end

Then(/^the user filters the Medication Review Applet by text "([^"]*)"$/) do |input_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  med_reivew_applet = MedReviewApplet.instance

  in_row_count = med_reivew_applet.get_elements('Inpatient Med Rows').size
  out_row_count = med_reivew_applet.get_elements('Outpatient Med Rows').size

  expect(med_reivew_applet.perform_action('Control - applet - Text Filter', input_text)).to eq(true)
  wait.until { in_row_count != med_reivew_applet.get_elements("Inpatient Med Rows").size || out_row_count != med_reivew_applet.get_elements("Outpatient Med Rows").size }
end

Then(/^the Medication Review table only diplays rows including text "([^"]*)"$/) do |input_text|
  @ehmp = PobMedsReview.new
  @ehmp.wait_for_fld_med_review_applet_rows(30)
  expect(object_exists_in_list(@ehmp.fld_med_review_applet_rows, input_text)).to be true
end

When(/^the Meds Review Applet contains data rows$/) do
  meds_review = MedReviewApplet.instance
  med_items = AccessHtmlElement.new(:css, "[data-appletid='medication_review'] [class='panel-heading meds-item']")
  meds_review.add_verify(CucumberLabel.new("Number of Medications"), VerifyXpathCount.new(med_items), med_items)
  expect(meds_review.wait_until_xpath_count_greater_than("Number of Medications", 0)).to be_true
end

When(/^user refreshes Meds Review Applet$/) do
  meds_review = MedReviewApplet.instance
  label = CucumberLabel.new("Applet Refresh")
  elements = AccessHtmlElement.new(:css, "[data-appletid='medication_review'] .applet-refresh-button")
  meds_review.add_action(label, ClickAction.new, elements)
  expect(meds_review.wait_until_action_element_visible("Applet Refresh", DefaultLogin.wait_time)).to be_true
  expect(meds_review.perform_action("Applet Refresh", '')).to eq(true)
end

Then(/^the message on the Meds Review Applet does not say "(.*?)"$/) do |message_text|
  meds_review = MedReviewApplet.instance
  label = CucumberLabel.new("Refresh Error Message")
  elements = AccessHtmlElement.new(:css, "[data-appletid='medication_review'] .fa-exclamation-circle")
  meds_review.add_verify(label, VerifyContainsText.new, elements)
  expect(meds_review.perform_verification("Refresh Error Message", message_text, 5)).to eq(false)
end

When(/^the user views the details of an inpatient med$/) do
  @ehmp = PobMedsReview.new
  attempt = 3
  begin
    @ehmp.wait_for_fld_inpatient_meds_rows
    @ehmp.fld_inpatient_meds_rows.first.click
    @ehmp.wait_for_fld_toolbar
    expect(@ehmp).to have_fld_toolbar
    expect(@ehmp).to have_btn_detail_view
    @ehmp.btn_detail_view.click
  rescue => e
    attempt -=1
    retry if attempt > 1
    raise e if attempt <= 0
  end
end

When(/^the user views the details of an outpatient med$/) do
  @ehmp = PobMedsReview.new

  attempt = 3
  begin
    @ehmp.wait_for_fld_outpatient_med_rows
    @ehmp.fld_outpatient_med_rows.first.click
    @ehmp.wait_for_fld_toolbar
    expect(@ehmp).to have_fld_toolbar
    expect(@ehmp).to have_btn_detail_view
    @ehmp.btn_detail_view.click
  rescue => e
    attempt -= 1
    retry if attempt > 1
    raise e if attempt <= 0
  end
end

Then(/^the detail view displays$/) do |table|
  @ehmp = PobMedsReview.new
  @ehmp.wait_for_fld_panel_all_level_headers
  expect(@ehmp.fld_panel_all_level_headers.length).to be > 0, "expected at least 1 detail header"
  table.rows.each do |heading|
    expect(object_exists_in_list(@ehmp.fld_panel_all_level_headers, "#{heading[0]}")).to eq(true)
  end
end

Given(/^the Meds Review applet displays at least (\d+) outpatient medication$/) do |num|
  @ehmp = PobMedsReview.new
  @ehmp.wait_for_fld_outpatient_med_rows
  expect(@ehmp.fld_outpatient_med_rows.length). to be >= num.to_i
end

