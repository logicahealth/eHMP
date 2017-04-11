path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

class ClinicalReminders < AccessBrowserV2
  include Singleton
  def initialize
    super
    appletid_css = '[data-appletid=cds_advice]'
    add_verify(CucumberLabel.new("Empty Row"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#{appletid_css} tr.empty"))
    
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Row'
    return TestSupport.driver.find_elements(:css, '#data-grid-cds_advice tbody tr.selectable').length > 0
  rescue => e 
    # p e
    false
  end
end

Before do
  @clinical_reminders_applet = ClinicalReminders.instance
end
