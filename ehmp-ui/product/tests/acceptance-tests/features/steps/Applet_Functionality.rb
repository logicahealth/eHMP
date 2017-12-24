class Navigation < AccessBrowserV2
  include Singleton
  def initialize
    super
    initialize_immunizations
    add_action(CucumberLabel.new("Vaccine Name"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='immunizations-name']/a"))
    add_action(CucumberLabel.new("Appointments Expand Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=appointments] .applet-maximize-button"))
    add_action(CucumberLabel.new("Orders Expand Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] .applet-maximize-button"))
    add_action(CucumberLabel.new("Appointments Filter Button"), ClickAction.new, AccessHtmlElement.new(:id, "grid-filter-button-appointments"))
    add_action(CucumberLabel.new("CoversheetDropdown Button"), ClickAction.new, AccessHtmlElement.new(:css, "#header-region span#screenName"))
    add_action(CucumberLabel.new("Appointments Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#grid-filter-appointments #input-filter-search"))
    add_action(CucumberLabel.new("Numeric Lab Results Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .form-search input"))
    add_action(CucumberLabel.new("Problems Overlay Button"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-options-button-"))  
    add_action(CucumberLabel.new("Problems Expand View"), ClickAction.new, AccessHtmlElement.new(:css, "#left .options-box-expanded "))  
    add_action(CucumberLabel.new("Allergies Overlay Button"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-options-button-"))
    add_action(CucumberLabel.new("Allergies Expand View"), ClickAction.new, AccessHtmlElement.new(:css, "#right .options-box-expanded "))
    add_action(CucumberLabel.new("Allergies Gist View"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@id='grid-panel-']/ul/li[3]/span/a/div"))    
    add_action(CucumberLabel.new("Community Health Summaries Expand Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=ccd_grid] .applet-maximize-button"))
    add_action(CucumberLabel.new("Community Health Summaries Filter Button"), ClickAction.new, AccessHtmlElement.new(:id, "grid-filter-button-ccd_grid"))
    add_action(CucumberLabel.new("Community Health Summaries Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#grid-filter-ccd_grid input"))   
    add_action(CucumberLabel.new("Back to Top Button"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@id='toc_ccd_Active Allergies and Adverse Reactions']/a/small"))
    add_action(CucumberLabel.new("Active Problems Hyperlink"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@id='modal-body']/div/div/div[1]/ul/li[4]/a"))
    add_action(CucumberLabel.new("Erythromycin Allergy"), ClickAction.new, AccessHtmlElement.new(:css, "div.allergyBubbleView div:nth-child(1) span"))
    add_action(CucumberLabel.new("CHOCOLATE"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-allergy-SITE-3-874"))
    add_action(CucumberLabel.new("Diabetes Mellitus Type II or unspecified"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-problem-SITE-3-183"))
    add_action(CucumberLabel.new("Modal Close Button"), ClickAction.new, AccessHtmlElement.new(:id, "modal-close-button")) 
    add_action(CucumberLabel.new("Coversheet Modal Close Button"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-footer div div.pull-right"))   
    add_action(CucumberLabel.new("Allergies Expand Button"), ClickAction.new, AccessHtmlElement.new(:css, "#e543e81ca31a span.pull-right span.grid-resize button")) 
    add_action(CucumberLabel.new("Standardized Allergen"), ClickAction.new, AccessHtmlElement.new(:css, "#allergy_grid-standardizedName>a")) 
    add_action(CucumberLabel.new("Allergies Filter Button"), ClickAction.new, AccessHtmlElement.new(:id, "grid-filter-button-allergy_grid"))
    add_action(CucumberLabel.new("Allergies Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#grid-filter-allergy_grid input"))
    add_action(CucumberLabel.new("Vitals Expand Button"), ClickAction.new, AccessHtmlElement.new(:css, "#dc49ad17e67c .applet-maximize-button.btn.btn-sm.btn-link")) 
    add_action(CucumberLabel.new("Vitals Filter Button"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-button-vitals"))
    add_action(CucumberLabel.new("Vitals Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#grid-filter-vitals #input-filter-search-vitals"))
    add_action(CucumberLabel.new("Visit"), ClickAction.new, AccessHtmlElement.new(:id, "urn-va-visit-SITE-3-11417"))
    add_action(CucumberLabel.new("Continuity of Care Document"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-vlerdocument-VLER-10108V420871-e587bf82-bfae-4499-9ca8-6babf6eea630"))
    add_action(CucumberLabel.new("Iodine Containing Agents"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-allergy-DOD-0000000003-1000010342"))
    add_action(CucumberLabel.new("Summarization of episode note"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-vlerdocument-VLER-10108V420871-5a31395c-b245-4333-b62f-e94fb0c7ae5d"))
    add_action(CucumberLabel.new("Occasional, uncontrolled chest pain"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-problem-ABCD-10108V420871-58"))
    add_action(CucumberLabel.new("Info button"), ClickAction.new, AccessHtmlElement.new(:css, "#info-button-sidekick-detailView > i"))   
    add_action(CucumberLabel.new("Chronic Systolic Heart failure"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-problem-SITE-3-323"))
    add_action(CucumberLabel.new("Problems Description"), ClickAction.new, AccessHtmlElement.new(:id, "problems-problemText"))
    add_action(CucumberLabel.new("Problems Acuity"), ClickAction.new, AccessHtmlElement.new(:id, "problems-acuityName"))
    add_action(CucumberLabel.new("Problems Filter Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .applet-filter-button"))
    add_action(CucumberLabel.new("Problems Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#grid-filter-problems input"))
    # moved to own class
    # add_action(CucumberLabel.new("Problems Expand Button"), ClickAction.new, AccessHtmlElement.new(:css, ".applet-maximize-button.btn.btn-sm.btn-link"))
    add_action(CucumberLabel.new("Immunization Date Header"), ClickAction.new, AccessHtmlElement.new(:id, "immunizations-administeredDateTime"))
    add_action(CucumberLabel.new("Immunizations Expand Button"), ClickAction.new, AccessHtmlElement.new(:css, "#a7dace4f6e1f .applet-maximize-button.btn.btn-sm.btn-link")) 
    add_action(CucumberLabel.new("all-range-vitals"), ClickAction.new, AccessHtmlElement.new(:id, "all-range-vitals"))
    add_action(CucumberLabel.new("1 yr Vitals Range"), ClickAction.new, AccessHtmlElement.new(:id, "1yr-range-vitals"))
    add_action(CucumberLabel.new("24 hr Vitals Range"), ClickAction.new, AccessHtmlElement.new(:id, "24hr-range-vitals"))
    add_action(CucumberLabel.new("24 hr Appointments Range"), ClickAction.new, AccessHtmlElement.new(:id, "24hr-range-appointments"))
    add_action(CucumberLabel.new("Modal X Button"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-header > div > div > div > div.labs-modal-nav-buttons.col-md-6.text-right > button.close > span:nth-child(1)"))   
  end

  def initialize_immunizations
    add_action(CucumberLabel.new("Immunizations Filter Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=immunizations] .applet-filter-button"))
    add_action(CucumberLabel.new("Immunizations Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#a7dace4f6e1f .backgrid-filter.form-search input"))
    add_action(CucumberLabel.new("Immunizations Filter Field Expand"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, ".backgrid-filter.form-search>input"))
  end
end #Navigation

#Perform any selection or button click
When(/^the user clicks the "(.*?)"$/) do |html_action_element|
  driver = TestSupport.driver
  navigation = Navigation.instance
  navigation.wait_until_action_element_visible(html_action_element, 40)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
  if html_action_element == "Diabetes Mellitus Type II or unspecified" || html_action_element == "Iodine Containing Agents"
    driver.find_element(:id, "info-button-sidekick-detailView").click
  end
end

#Enter Search Term
When(/^the user enters "(.*?)" into the "(.*?)"$/) do |text, html_element|
  navigation = Navigation.instance
  navigation.wait_until_action_element_visible(html_element, DefaultLogin.wait_time)
  expect(navigation.perform_action(html_element, text)).to be_true, "Error when attempting to enter '#{text}' into #{html_element}"
end
