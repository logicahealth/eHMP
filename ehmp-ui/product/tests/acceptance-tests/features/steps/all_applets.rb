class AllApplets < AccessBrowserV2
  def initialize
    super
    add_verify(CucumberLabel.new("Screenname"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'screenName'))
  end

  def add_applet_buttons(appletid_css)
    # ex appletid_css = '[data-appletid=lab_results_grid]'
    add_action(CucumberLabel.new("Control - applet - Filter Toggle"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-filter-button"))
    add_action(CucumberLabel.new("Control - applet - Text Filter"), SendKeysAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .form-search input"))
    add_action(CucumberLabel.new("Control - applet - Expand View"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-maximize-button"))
    add_action(CucumberLabel.new("Control - applet - Refresh"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-refresh-button"))
    add_action(CucumberLabel.new("Control - applet - Help"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-help-button"))
    add_action(CucumberLabel.new("Control - applet - Minimize View"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-minimize-button"))
    

    add_action(CucumberLabel.new("Control - Applet - Filter Toggle"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-filter-button"))
    add_action(CucumberLabel.new("Control - Applet - Text Filter"), SendKeysAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .form-search input"))
    add_action(CucumberLabel.new("Control - Applet - Expand View"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-maximize-button"))
    add_action(CucumberLabel.new("Control - Applet - Refresh"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-refresh-button"))
    add_action(CucumberLabel.new("Control - Applet - Help"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-help-button"))
    add_action(CucumberLabel.new("Control - Applet - Minimize View"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-minimize-button"))
  end

  def add_applet_title(appletid_css)
    # ex appletid_css = '[data-appletid=lab_results_grid]'
    add_verify(CucumberLabel.new("Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#{appletid_css} .panel-title"))
  end

  def add_date_filter_ids(id)
    add_action(CucumberLabel.new("Date Filter All"), ClickAction.new, AccessHtmlElement.new(:id, "all-range-#{id}"))
    add_action(CucumberLabel.new("Date Filter 2yr"), ClickAction.new, AccessHtmlElement.new(:id, "2yr-range-#{id}"))
    add_action(CucumberLabel.new("Date Filter 1yr"), ClickAction.new, AccessHtmlElement.new(:id, "1yr-range-#{id}"))
    add_action(CucumberLabel.new("Date Filter 3mo"), ClickAction.new, AccessHtmlElement.new(:id, "3mo-range-#{id}"))
    add_action(CucumberLabel.new("Date Filter 1mo"), ClickAction.new, AccessHtmlElement.new(:id, "1mo-range-#{id}"))
    add_action(CucumberLabel.new("Date Filter 7d"), ClickAction.new, AccessHtmlElement.new(:id, "7d-range-#{id}"))
    add_action(CucumberLabel.new("Date Filter 72hr"), ClickAction.new, AccessHtmlElement.new(:id, "72hr-range-#{id}"))
    add_action(CucumberLabel.new("Date Filter 24hr"), ClickAction.new, AccessHtmlElement.new(:id, "24hr-range-#{id}"))
  end

  def add_modal_date_filter_ids
    add_action(CucumberLabel.new("Modal Date Filter All"), ClickAction.new, AccessHtmlElement.new(:id, "allRange"))
    add_action(CucumberLabel.new("Modal Date Filter 2yr"), ClickAction.new, AccessHtmlElement.new(:id, "2yrRange"))
    add_action(CucumberLabel.new("Modal Date Filter 1yr"), ClickAction.new, AccessHtmlElement.new(:id, "1yrRange"))
    add_action(CucumberLabel.new("Modal Date Filter 3mo"), ClickAction.new, AccessHtmlElement.new(:id, "3moRange"))
    add_action(CucumberLabel.new("Modal Date Filter 1mo"), ClickAction.new, AccessHtmlElement.new(:id, "1moRange"))
    add_action(CucumberLabel.new("Modal Date Filter 7d"), ClickAction.new, AccessHtmlElement.new(:id, "7dRange"))
    add_action(CucumberLabel.new("Modal Date Filter 72hr"), ClickAction.new, AccessHtmlElement.new(:id, "72hrRange"))
    add_action(CucumberLabel.new("Modal Date Filter 24hr"), ClickAction.new, AccessHtmlElement.new(:id, "24hrRange"))
  end

  def add_text_filter(appletid_css)
    add_action(CucumberLabel.new("Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#{appletid_css} [id^=input-filter-search-]"))
  end

  def add_text_filter_with_appletid(appletid)
    xpath = "//div[@data-appletid='#{appletid}']/descendant::input[starts-with(@id, 'input-filter-search')]"
    add_action(CucumberLabel.new("Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:xpath, xpath))
  end

  def add_date_input(applet_id)
    # ex applet_id = 'lab_results_grid'
    # //*[@data-appletid='lab_results_grid']/descendant::input[contains(@id, 'filter-to-date')]
    add_verify(CucumberLabel.new("From Date"), VerifyValue.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='#{applet_id}']/descendant::input[contains(@id, 'filter-from-date')]"))
    add_verify(CucumberLabel.new("To Date"), VerifyValue.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='#{applet_id}']/descendant::input[contains(@id, 'filter-to-date')]"))
  end

  def add_applet_add_button(appletid_css)
    add_action(CucumberLabel.new("Control - applet - Add"), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))
  end

  def add_toolbar_buttons
    add_action(CucumberLabel.new("Popover Toolbar"), ClickAction.new, AccessHtmlElement.new(:css, ".applet-toolbar"))
    add_action(CucumberLabel.new("Detail View Button"), ClickAction.new, AccessHtmlElement.new(:css, "[button-type=detailView-button-toolbar]"))
    add_action(CucumberLabel.new("Info Button"), ClickAction.new, AccessHtmlElement.new(:css, "[button-type=info-button-toolbar]"))
    add_action(CucumberLabel.new("Quick View Button"), ClickAction.new, AccessHtmlElement.new(:css, "[button-type=quick-look-button-toolbar]"))
  end

  def clear_filter(filter_button_id = 'unknown')
    # ex. filter_button_id = 'grid-filter-button-problems'

    driver = TestSupport.driver
    # css_filter = "##{filter_button_id} span.applet-filter-title"
    # element = driver.find_element(:css, css_filter)
    # p "Class: #{element.attribute('class')}"
    # unless element.attribute('class').include? 'hidden'
    add_action(CucumberLabel.new('Filter Item'), ClickAction.new, AccessHtmlElement.new(:css, '.clear-udaf-tag'))
    add_verify(CucumberLabel.new('UDAF'), VerifyText.new, AccessHtmlElement.new(:css, 'div.udaf'))
      
    # open filter
    perform_action('Control - applet - Filter Toggle') unless am_i_visible? 'Filter Field'

    # Wait until the filter terms are displayed
    wait_until_element_present('UDAF', 40)
      
    # remove each filter displayed
    perform_action('Filter Item') while am_i_visible? 'Filter Item'

    #Close the filter
    perform_action('Control - applet - Filter Toggle')
    # end
  end
 
  def remove_all_filter
    @ehmp = PobCommonElements.new
    @ehmp.btn_remove_all_filter.click if @ehmp.has_btn_remove_all_filter?

    wait = Selenium::WebDriver::Wait.new(:timeout => 10)
    wait.until { @ehmp.fld_clear_udf_tags.length == 0 }
  end

  def rename_applet(appletid_css, new_name)
    add_action(CucumberLabel.new('Trigger Rename'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .panel-title-label"))
    add_action(CucumberLabel.new('Rename Applet'), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .panel-title input"))
  
    wait = Selenium::WebDriver::Wait.new(:timeout => 5)
    driver = TestSupport.driver
    
    return false unless perform_action('Trigger Rename')

    wait.until { (driver.find_element(:css, "#{appletid_css} .panel-title input").attribute('class').include? 'hidden') == false }
    return false unless perform_action('Rename Applet', new_name)
    true
  end
end
