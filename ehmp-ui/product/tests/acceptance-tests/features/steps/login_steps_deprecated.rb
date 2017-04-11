class Login < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("AccessCode"), SendKeysAction.new, AccessHtmlElement.new(:id, "accessCode"))
    add_action(CucumberLabel.new("VerifyCode"), SendKeysAction.new, AccessHtmlElement.new(:id, "verifyCode"))

    add_action(CucumberLabel.new("Sign in"), ClickAction.new, AccessHtmlElement.new(:id, "login"))
    add_action(CucumberLabel.new("Signout"), ClickAction.new, AccessHtmlElement.new(:id, "logoutButton"))

    add_action(CucumberLabel.new("Control - MySite Tab"), ClickAction.new, AccessHtmlElement.new(:id, "mySite"))
    add_action(CucumberLabel.new("Control - All"), ClickAction.new, AccessHtmlElement.new(:css, "#all > a"))
    add_action(CucumberLabel.new("Control - Patient Search Input"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "patientSearchInput"))
    add_action(CucumberLabel.new("Control - First Patient Result"), ClickAction.new, AccessHtmlElement.new(:css, ".patient-search-results .list-group a"))
    add_action(CucumberLabel.new("Control - Second Patient Result"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@class='list-group']/descendant::a[2]"))
    add_action(CucumberLabel.new("Control - Confirm"), ClickAction.new, AccessHtmlElement.new(:id, "confirmationButton"))

    add_verify(CucumberLabel.new("Coversheet"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".cover-sheet"))
  end
end
