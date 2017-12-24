class VerifyEncounterHxOccuranceFormat
  include HTMLVerification
  def initialize
    @error_message = 'no error message'
  end

  def pull_value(html_element, _value)
    return html_element.text
  end
  
  def verify(html_element, value)
    #p "#{html_element.text} should contain #{value}"
    reggie = /\d+/
    text = html_element.text
    @error_message = "Does element text match regex #{reggie}: #{text}"
    
    return !(reggie.match(text)).nil?
  end

  def error_message
    return @error_message
  end
end

class EncountersGist <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super  
    @appletid = 'encounters'
    appletid_css = "[data-appletid=#{@appletid}]"

    add_verify(CucumberLabel.new("Encounter Gist Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[ddata-appletid=encounters] .panel-title"))
    add_verify(CucumberLabel.new("EncountersGridVisible"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] .enc-gist-list"))
    #Encounter Header Verification 
    add_verify(CucumberLabel.new("Description-header"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=encounters] [data-header-instanceid="description-header"]'))
    add_verify(CucumberLabel.new("Event-header"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=encounters] [data-header-instanceid="event-header"]'))
    add_verify(CucumberLabel.new("Age-header"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=encounters] [data-header-instanceid="age-header"]'))
    #Encounter details at top level verification
    add_verify(CucumberLabel.new("Visits"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Visits]"))
    add_verify(CucumberLabel.new("Appointments"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Appointments]"))
    add_verify(CucumberLabel.new("Admissions"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Admissions]"))
    add_verify(CucumberLabel.new("Procedures"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Procedures]"))

    add_verify(CucumberLabel.new("Visits Occurance"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Visits] .flex-width-2 div.table-cell:nth-of-type(2)"))
    add_verify(CucumberLabel.new("Appointments Occurance"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Visits] .flex-width-2 div.table-cell:nth-of-type(2)"))
    add_verify(CucumberLabel.new("Admissions Occurance"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Admissions] .flex-width-2 div.table-cell:nth-of-type(2)"))
    add_verify(CucumberLabel.new("Procedures Occurance"), VerifyEncounterHxOccuranceFormat.new, AccessHtmlElement.new(:css, "[data-group-instanceid=panel-Procedures] .flex-width-2 div.table-cell:nth-of-type(2)"))
    
    # add actions for applet buttons, ex refresh, filter, maximize
    add_applet_buttons appletid_css  
    add_applet_title appletid_css
    add_toolbar_buttons

    #Expand encounter objects
    add_action(CucumberLabel.new("Expand_Visits"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Visits'] i"))
    add_action(CucumberLabel.new("Expand_Procedures"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Procedures'] i"))
    add_action(CucumberLabel.new("Expand_Appointments"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Appointments'] i"))
    add_action(CucumberLabel.new("Expand_Admissions"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='encounters'] [data-group-instanceid='panel-Admissions'] i"))
    #expand collapse timeline  
    add_action(CucumberLabel.new("Close-Timeline"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=newsfeed] .applet-minimize-button"))
    #text filter  
    #Quick View
    add_verify(CucumberLabel.new("Quick View Table Title"), VerifyText.new, AccessHtmlElement.new(:css, ".overview .popover-title"))
    #menu
    # add_action(CucumberLabel.new("Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] div.toolbarActive [button-type=quick-look-button-toolbar]"))
    # add_action(CucumberLabel.new("Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=encounters] div.toolbarActive [button-type=detailView-button-toolbar]"))
    #modal title
    add_verify(CucumberLabel.new("Main Modal Label"), VerifyContainsText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_verify(CucumberLabel.new("Modal Details"), VerifyContainsText.new, AccessHtmlElement.new(:id, "modal-body"))
  end

  def applet_loaded?
    # return true if am_i_visible? 'Empty Gist' I don't believe it is possible for encounters to be empty, there is always 4 rows
    return TestSupport.driver.find_elements(:css, '[data-appletid=encounters] div.enc-gist-list').length > 0
  rescue => e 
    # p e
    false
  end
end 
        

Then(/^user sees Encounters Gist$/) do 
  aa = EncountersGist.instance 
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", "ENCOUNTERS")).to be_true
end

def arrow_position(css, expected_arrow_position)
  driver = TestSupport.driver
  arrow_position = driver.find_element(:css, css).attribute("arrowposition")
  return arrow_position.eql? expected_arrow_position
rescue Exception => e
  p "#{e}"
  return false
end

When(/^user select the menu "(.*?)" in Encounters Gist$/) do |icon_type|
  aa = EncountersGist.instance
  expect(aa.wait_until_action_element_visible(icon_type, DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(icon_type, "")).to be_true, "#{icon_type} can't be clicked"
end

