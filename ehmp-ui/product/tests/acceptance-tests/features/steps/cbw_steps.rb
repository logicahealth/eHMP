class CBW < ADKContainer
  include Singleton
  def initialize
    super

    add_action(CucumberLabel.new("Coversheet Dropdown"), ClickAction.new, AccessHtmlElement.new(:id, "screenName"))
    add_verify(CucumberLabel.new("Screenname"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'screenName'))
    add_verify(CucumberLabel.new("Drop Down Menu"), VerifyText.new, AccessHtmlElement.new(:class, "dropdown-menu"))
  end

  def applet_panel_title(dataapplet_id)
    panel_title_accesser = AccessHtmlElement.new(:css, "div[data-appletid='#{dataapplet_id}'] .panel-title-label")
    return panel_title_accesser
  end

  def applet_filter(dataapplet_id)
    p "div[data-appletid='#{dataapplet_id}'] .applet-filter-title"
    filter_title_accesser = AccessHtmlElement.new(:css, "div[data-appletid='#{dataapplet_id}'] .applet-filter-title")
    return filter_title_accesser
  end

  def applet_filter_hidden(dataapplet_id)
    p "div[data-appletid='#{dataapplet_id}'] .applet-filter-title.hidden"
    filter_title_accesser = AccessHtmlElement.new(:css, "div[data-appletid='#{dataapplet_id}'] .applet-filter-title.hidden")
    return filter_title_accesser
  end

  def applet_filter_buton(dataapplet_id)
    filter_title_accesser = AccessHtmlElement.new(:css, "div[data-appletid='#{dataapplet_id}'] .applet-filter-button")
    return filter_title_accesser
  end

  def applet_filter_input(dataapplet_id)
    # input-filter-search
    filter_title_accesser = AccessHtmlElement.new(:css, "div[data-appletid='#{dataapplet_id}'] [type=search]")
    return filter_title_accesser
  end
end

def open_and_verify_filters(applet_id, table)
  diabetes = CBW.instance
  diabetes.add_action(CucumberLabel.new("Filter button"), ClickAction.new, diabetes.applet_filter_buton(applet_id))
  diabetes.add_action(CucumberLabel.new("Filter input"), ClickAction.new, diabetes.applet_filter_input(applet_id))
  p "already opened? #{diabetes.am_i_visible? "Filter input"}"
  expect(diabetes.perform_action('Filter button')).to eq(true) unless diabetes.am_i_visible? "Filter input" # open the filter section
  table.rows.each do | filter |
    # //*[@data-appletid='documents']/descendant::span[contains(@class, 'udaf-tag')]/span[contains(string(), 'Agent')]
    xpath = "//*[@data-appletid='#{applet_id}']/descendant::span[contains(@class, 'udaf-tag')]/span[starts-with(string(), '#{filter[0]}')]"
    diabetes.add_verify(CucumberLabel.new('filter'), VerifyText.new, AccessHtmlElement.new(:xpath, xpath))
    expect(diabetes.perform_verification('filter', filter[0])).to eq(true), "Filter #{filter[0]} not applied to #{applet_id}"
  end
  p "already opened? #{diabetes.am_i_visible? "Filter input"}"
end

def open_and_verify_filters_contains(applet_id, table)
  diabetes = CBW.instance
  diabetes.add_action(CucumberLabel.new("Filter button"), ClickAction.new, diabetes.applet_filter_buton(applet_id))
  diabetes.add_action(CucumberLabel.new("Filter input"), ClickAction.new, diabetes.applet_filter_input(applet_id))
  p "already opened? #{diabetes.am_i_visible? "Filter input"}"
  expect(diabetes.perform_action('Filter button')).to eq(true) unless diabetes.am_i_visible? "Filter input" # open the filter section
  table.rows.each do | filter |
    # //*[@data-appletid='documents']/descendant::span[contains(@class, 'udaf-tag')]/span[contains(string(), 'Agent')]
    xpath = "//*[@data-appletid='#{applet_id}']/descendant::span[contains(@class, 'udaf-tag')]/span[contains(string(), '#{filter[0]}')]"
    diabetes.add_verify(CucumberLabel.new('filter'), VerifyText.new, AccessHtmlElement.new(:xpath, xpath))
    expect(diabetes.perform_verification('filter', filter[0])).to eq(true), "Filter #{filter[0]} not applied to #{applet_id}"
  end
  p "already opened? #{diabetes.am_i_visible? "Filter input"}"
end

Then(/^the filters applied to Lab Results contains$/) do |table|
  open_and_verify_filters_contains('lab_results_grid', table)
end
