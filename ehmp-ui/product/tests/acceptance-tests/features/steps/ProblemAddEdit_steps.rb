# Leave this constant alone.  It switches Debug Messages on and off
DEBUG=false

class ProblemAdd < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("ClickUseTermButtonAction"), ClickAction.new, AccessHtmlElement.new(:id, "freeTextBtn"))
    add_action(CucumberLabel.new("ClickAddProblemButtonAction"), ClickAction.new, AccessHtmlElement.new(:css, "#addProblemSubmitBtn"))
  end

  def verify(id, value)
    driver = TestSupport.driver
    ctext = driver.find_element(:id, id).attribute('value') # for input tag
    p ctext
    return (ctext == value)
  end
end # END of ProblemAdd Class Def

def debug_message(message)
  print message if DEBUG
end

When(/^user clicks "(.*?)" button$/) do |button|
  con = ProblemAdd.instance
  if button.match("Use Entered Term")
    con.perform_action("ClickUseTermButtonAction")
  elsif button.match("Add Active Problem")
    expect(con.perform_action("ClickAddProblemButtonAction")).to be_true, "was not able to click on the Add Problem button"
  else
    fail!(ScriptError, ArgumentError.new('Button Failed to produce desired result!'))
  end
end

