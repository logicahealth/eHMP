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
    add_action(CucumberLabel.new("Meds Review"), ClickAction.new, AccessHtmlElement.new(:link_text, "Medication Review"))
    add_verify(CucumberLabel.new("No Records Found"), VerifyText.new, AccessHtmlElement.new(:class, "emptyMedsList")) 

    add_action(CucumberLabel.new("Clinic Order Meds Group"), ClickAction.new, AccessHtmlElement.new(:css, "[data-type-row='clinical']"))
    add_verify(CucumberLabel.new("Clinic Order Meds Group"), VerifyText.new, AccessHtmlElement.new(:css, "[data-type-row='clinical']"))
    add_action(CucumberLabel.new("Inpatient Meds Group"), ClickAction.new, AccessHtmlElement.new(:css, "[id^='accordion'] [data-type-row='inpatient']"))
    add_verify(CucumberLabel.new("Inpatient Meds Group"), VerifyText.new, AccessHtmlElement.new(:css, "[id^='accordion'] [data-type-row='inpatient']"))
    add_action(CucumberLabel.new("Outpatient Meds Group"), ClickAction.new, AccessHtmlElement.new(:css, "[id^='accordion'] [data-type-row='outpatient']"))
    add_verify(CucumberLabel.new("Outpatient Meds Group"), VerifyText.new, AccessHtmlElement.new(:css, "[id^='accordion'] [data-type-row='outpatient']"))
    add_verify(CucumberLabel.new("Applet Title"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] .panel-title-label"))

    warfarin_tab_id = 'medication_name_urn_va_med_SITE_271_17220'
    #add_action(CucumberLabel.new("WARFARIN TAB"), FocusInAction.new(warfarin_tab_id), AccessHtmlElement.new(:id, warfarin_tab_id))
    add_action(CucumberLabel.new("WARFARIN TAB"), ClickAction.new, AccessHtmlElement.new(:id, warfarin_tab_id))
    add_action(CucumberLabel.new("WARFARIN TAB detail icon"), ClickAction.new, AccessHtmlElement.new(:css, "#medication_Item_urn_va_med_SITE_271_17220 [button-type=detailView-button-toolbar]"))
    add_action(CucumberLabel.new("DIGOXIN TAB detail icon"), ClickAction.new, AccessHtmlElement.new(:css, "#medication_Item_urn_va_med_SITE_164_9583 [button-type=detailView-button-toolbar]"))
    # add_action(CucumberLabel.new("DIGOXIN TAB detail icon"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='medication_Item_urn_va_med_SITE_164_9583']/descendant::a[@id='detailView-button-toolbar']"))

    digoxin_tab_id = 'medication_name_urn_va_med_SITE_164_9583'
    #add_action(CucumberLabel.new("DIGOXIN TAB"), FocusInAction.new(digoxin_tab_id), AccessHtmlElement.new(:css, "[data-appletid='medication_review'] ##{digoxin_tab_id}"))
    add_action(CucumberLabel.new("DIGOXIN TAB"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] ##{digoxin_tab_id}"))
    metformin_tab_id = 'medication_name_urn_va_med_SITE_271_27860'
    #add_action(CucumberLabel.new("METFORMIN TAB,SA"), FocusInAction.new(metformin_tab_id), AccessHtmlElement.new(:css, "[data-appletid='medication_review'] ##{metformin_tab_id}"))
    add_action(CucumberLabel.new("METFORMIN TAB,SA"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] ##{metformin_tab_id}"))

    add_action(CucumberLabel.new("METFORMIN TAB,SA detail icon"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='medication_Item_urn_va_med_SITE_271_27860']/descendant::a[@button-type='detailView-button-toolbar']"))
    add_verify(CucumberLabel.new("Order Hx Date Range 1"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #order-urn_va_med_SITE_271_27860"))
    add_verify(CucumberLabel.new("Order Hx Date Range 2"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #order-urn_va_med_SITE_271_27860"))
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

class MedReviewAppletSummaryDetails < ADKContainer
  include Singleton
  def initialize
    super
    #outpatient medications
    add_verify(CucumberLabel.new("METFORMIN TAB,SA Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_271_27860"))
    add_verify(CucumberLabel.new("METOPROLOL TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_271_16944"))
    add_verify(CucumberLabel.new("METOPROLOL TARTRATE TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_271_27960"))
    add_verify(CucumberLabel.new("SIMVASTATIN TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_271_28060"))
    add_verify(CucumberLabel.new("WARFARIN TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("ASPIRIN TAB,EC Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_271_18044"))

    add_verify(CucumberLabel.new("METFORMIN TAB,SA Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_271_27860"))
    add_verify(CucumberLabel.new("METOPROLOL TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_271_16944"))
    add_verify(CucumberLabel.new("METOPROLOL TARTRATE TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_271_27960"))
    add_verify(CucumberLabel.new("SIMVASTATIN TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_271_28060"))
    add_verify(CucumberLabel.new("WARFARIN TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("ASPIRIN TAB,EC Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_271_18044"))

    add_verify(CucumberLabel.new("METFORMIN TAB,SA Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_271_27860"))
    add_verify(CucumberLabel.new("METOPROLOL TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_271_16944"))
    add_verify(CucumberLabel.new("METOPROLOL TARTRATE TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_271_27960"))
    add_verify(CucumberLabel.new("SIMVASTATIN TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_271_28060"))
    add_verify(CucumberLabel.new("WARFARIN TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("ASPIRIN TAB,EC Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_271_18044"))

    add_verify(CucumberLabel.new("METFORMIN TAB,SA Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_271_27860"))
    add_verify(CucumberLabel.new("METOPROLOL TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_271_16944"))
    add_verify(CucumberLabel.new("METOPROLOL TARTRATE TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_271_27960"))
    add_verify(CucumberLabel.new("SIMVASTATIN TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_271_28060"))
    add_verify(CucumberLabel.new("WARFARIN TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("ASPIRIN TAB,EC Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_271_18044"))

    #inpatient medications
    add_verify(CucumberLabel.new("AMPICILLIN INJ in SODIUM CHLORIDE 0.9% INJ Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_164_10714"))
    add_verify(CucumberLabel.new("CEFAZOLIN INJ in SODIUM CHLORIDE 0.9% INJ Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_164_10717"))
    add_verify(CucumberLabel.new("DIGOXIN TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_164_9583"))
    add_verify(CucumberLabel.new("FUROSEMIDE TAB Name"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #medication_name_urn_va_med_SITE_164_9584"))

    add_verify(CucumberLabel.new("AMPICILLIN INJ in SODIUM CHLORIDE 0.9% INJ Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_164_10714"))
    add_verify(CucumberLabel.new("CEFAZOLIN INJ in SODIUM CHLORIDE 0.9% INJ Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_164_10717"))
    add_verify(CucumberLabel.new("DIGOXIN TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_164_9583"))
    add_verify(CucumberLabel.new("FUROSEMIDE TAB Sig"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #sig_urn_va_med_SITE_164_9584"))

    add_verify(CucumberLabel.new("AMPICILLIN INJ in SODIUM CHLORIDE 0.9% INJ Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_164_10714"))
    add_verify(CucumberLabel.new("CEFAZOLIN INJ in SODIUM CHLORIDE 0.9% INJ Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_164_10717"))
    add_verify(CucumberLabel.new("DIGOXIN TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_164_9583"))
    add_verify(CucumberLabel.new("FUROSEMIDE TAB Last"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #time_urn_va_med_SITE_164_9584"))

    add_verify(CucumberLabel.new("AMPICILLIN INJ in SODIUM CHLORIDE 0.9% INJ Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_164_10714"))
    add_verify(CucumberLabel.new("CEFAZOLIN INJ in SODIUM CHLORIDE 0.9% INJ Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_164_10717"))
    add_verify(CucumberLabel.new("DIGOXIN TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_164_9583"))
    add_verify(CucumberLabel.new("FUROSEMIDE TAB Fillable"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #fillable_urn_va_med_SITE_164_9584"))
  end
end

class MedReviewAppletDetailsView < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Med Name_Warfarin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #qualifiedName-urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("Sig_Warfarin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #med-summary-urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("Status_Warfarin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #status_urn_va_med_SITE_271_17220"))

    add_verify(CucumberLabel.new("Med Name_Digoxin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #qualifiedName-urn_va_med_SITE_164_9583"))
    add_verify(CucumberLabel.new("Sig_Digoxin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #med-summary-urn_va_med_SITE_164_9583"))
    add_verify(CucumberLabel.new("Status_Digoxin"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #status_urn_va_med_SITE_164_9583"))

    add_verify(CucumberLabel.new("Prescription No. Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #prescription-label-urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("Supply Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #supply-label-urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("Dose/Schedule Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #dose-label-urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("Provider Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #provider-label-urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("Pharmacist Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #pharmacist-label-urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("Location Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #location-label-urn_va_med_SITE_271_17220"))
    add_verify(CucumberLabel.new("Facility Label"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #facility-label-urn_va_med_SITE_271_17220"))

    add_verify(CucumberLabel.new("Med Review Details Values"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='medication_review'] #order-detail-urn_va_med_SITE_271_17220"))
  end
end

class MedReviewDateFilter < ADKContainer
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Control - Applet - Date Filter"), ClickAction.new, AccessHtmlElement.new(:css, ".global-date-picker #date-region-minimized"))
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
  ehmp = PobMedsReview.new
  ehmp.load
  expect(ehmp).to be_displayed
  medication_review_loaded?
  
  # remove filters if any applied
  ehmp.wait_for_btn_applet_remove_filters(1)
  if ehmp.has_btn_applet_remove_filters?
    ehmp.btn_applet_remove_filters.click
    # once we remove filters, the applet needs to reload 
    medication_review_loaded? 
  end
end

def medication_review_loaded?  
  ehmp = PobMedsReview.new
  expect(ehmp.wait_for_fld_inpatient_meds_group).to eq(true)
  expect(ehmp.wait_for_fld_outpatient_meds_group).to eq(true)
  expect(ehmp.wait_for_fld_clinic_order_meds_group).to eq(true)
  
  ehmp.menu.wait_until_fld_screen_name_visible
  expect(ehmp.menu.fld_screen_name.text.upcase).to have_text("Medication Review".upcase)
end

Then(/^the title of the page says "(.*?)" in Meds Review Applet$/) do |title|
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible("Applet Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Applet Title", title)).to be_true, "Title does not say MEDICATION REVIEW"
end

Then(/^user sees "(.*?)" and "(.*?)" and "(.*?)" in Meds Review Applet$/) do |outpatient_group, inpatient_group, clinic_group|
  @ehmp = PobMedsReview.new
  @ehmp.wait_for_fld_inpatient_meds_group
  @ehmp.wait_for_fld_clinic_order_meds_group
  @ehmp.wait_for_fld_outpatient_meds_group
  expect(@ehmp).to have_fld_inpatient_meds_group
  expect(@ehmp).to have_fld_outpatient_meds_group
  expect(@ehmp).to have_fld_clinic_order_meds_group
end

When(/^user expands "(.*?)" in Meds Review Applet$/) do |med_group_name|
  aa = MedReviewApplet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)#DefaultTiming.default_table_row_load_time)
  wait.until { aa.applet_loaded }

  expect(aa.wait_until_action_element_visible(med_group_name, DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(med_group_name, "")).to be_true, "Could not expand #{med_group_name}"
end

Then(/^"(.*?)" summary view contains headers in Meds Review Applet$/) do |med_group_name, table|
  applet = PobMedsReview.new
  applet.section_header_elements med_group_name
  applet.wait_for_section_headers
  header_text = applet.section_headers.map { |header| header.text.upcase.sub('SORTABLE COLUMN', '').strip }
  table.headers.each do | header |
    expect(header_text).to include header.upcase
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

Then(/^the user clicks on search filter in Meds Review Applet$/) do
  aa = MedReviewApplet.instance
  expect(aa.wait_until_action_element_visible("Control - applet - Filter Toggle", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Control - applet - Filter Toggle", "")).to be_true
  
end

Then(/^the user types "(.*?)" in search box of the Meds Review Applet$/) do |search_field|
  aa = MedReviewApplet.instance    
  expect(aa.wait_until_action_element_visible("Control - applet - Text Filter", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Control - applet - Text Filter", search_field)).to be_true  
end

Then(/^Inpatient Meds Group summary view displays medications$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_inpatient_meds_rows
  expect(ehmp.fld_inpatient_meds_rows.length). to be > 0, "Inpatient Meds group doesn't display any medications"
end

Then(/^Outpatient Meds Group summary view displays medications$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_outpatient_med_rows
  expect(ehmp.fld_outpatient_med_rows.length). to be > 0, "Outpatient Meds group doesn't display any medications"
end

Then(/^the user filters the Medication Review Applet by text "([^"]*)"$/) do |input_text|
  ehmp = PobMedsReview.new
  row_count = ehmp.fld_outpatient_med_rows.length
  ehmp.wait_until_fld_applet_text_filter_visible
  expect(ehmp).to have_fld_applet_text_filter
  ehmp.fld_applet_text_filter.set input_text
  ehmp.fld_applet_text_filter.native.send_keys(:enter)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { row_count != ehmp.fld_outpatient_med_rows.length }
end

Then(/^the Medication Review table only diplays rows including text "([^"]*)"$/) do |input_text|    
  ehmp = PobMedsReview.new
  ehmp.wait_until_fld_outpatient_med_rows_visible
  expect(only_text_exists_in_list(ehmp.fld_outpatient_med_rows, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
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

Then(/^the workspace title and category group texts are displayed correctly$/) do 
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_inpatient_meds_group
  ehmp.wait_for_fld_clinic_order_meds_group
  ehmp.wait_for_fld_outpatient_meds_group
  expect(ehmp.fld_outpatient_meds_group.text.upcase).to have_text("outpatient and non-va".upcase)
  expect(ehmp.fld_clinic_order_meds_group.text.upcase).to have_text("clinic order".upcase)
  expect(ehmp.fld_inpatient_meds_group.text.upcase).to have_text("inpatient".upcase)
  expect(ehmp.menu.fld_screen_name.text.upcase).to have_text("Medication Review".upcase)
end

Then(/^Outpatient Meds Group is also expanded$/) do 
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_outpatient_meds_group
  ehmp.wait_for_fld_outpatient_meds_group_expanded
  expect(ehmp).to have_fld_outpatient_meds_group_expanded
end

Given(/^Medication Review applet is loaded successfully$/) do
  ehmp = PobMedsReview.new
  medication_review_loaded?
end

When(/^user sorts the Medication Review applet by column header Name$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_until_btn_name_header_visible
  expect(ehmp).to have_btn_name_header
  ehmp.btn_name_header.click
end

Then(/^the Medication Review applet is sorted in alphabetic order based on column Name$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_outpatient_med_rows
     
  column_values = ehmp.fld_outpatient_med_rows
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Medication Review applet is sorted in reverse alphabetic order based on column Name$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_outpatient_med_rows
    
  column_values = ehmp.fld_outpatient_med_rows
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^user sorts the Medication Review applet by column header Sig$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_until_btn_sig_header_visible
  expect(ehmp).to have_btn_sig_header
  ehmp.btn_sig_header.click
end

Then(/^the Medication Review applet is sorted in alphabetic order based on column Sig$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_outpatient_sig_rows
     
  column_values = ehmp.fld_outpatient_sig_rows
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Medication Review applet is sorted in reverse alphabetic order based on column Sig$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_outpatient_sig_rows
    
  column_values = ehmp.fld_outpatient_sig_rows
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^user sorts the Medication Review applet by column header Facility$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_until_btn_facility_header_visible
  expect(ehmp).to have_btn_facility_header
  ehmp.btn_facility_header.click
end

Then(/^the Medication Review applet is sorted in alphabetic order based on column Facility$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_outpatient_facility_rows
     
  column_values = ehmp.first_facility_grouped("outpatient-applet")
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Medication Review applet is sorted in reverse alphabetic order based on column Facility$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_outpatient_facility_rows
    
  column_values = ehmp.first_facility_grouped("outpatient-applet")
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^user hovers over the medication review applet row$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_fld_med_review_applet_rows
  expect(ehmp).to have_fld_med_review_applet_rows
  rows = ehmp.fld_med_review_applet_rows
  expect(rows.length).to be > 0
  rows[0].hover
end

Given(/^user can view the Quick Menu Icon in medication review applet$/) do
  ehmp = PobMedsReview.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in medication review applet$/) do
  ehmp = PobMedsReview.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in medication review applet$/) do
  ehmp = PobMedsReview.new
  QuickMenuActions.select_quick_menu ehmp
end

Then(/^user can see the options in the medication review applet$/) do |table|
  ehmp = PobMedsReview.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^user selects the detail view from Quick Menu Icon of medication review applet$/) do
  ehmp = PobMedsReview.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end


