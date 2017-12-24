path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

class ClinicalReminders < AccessBrowserV2
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'cds_advice'
    appletid_css = '[data-appletid=cds_advice]'
    add_verify(CucumberLabel.new("Empty Row"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#{appletid_css} tr.empty"))
    
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Row'
    return TestSupport.driver.find_elements(:css, '[data-appletid=cds_advice] tbody tr.selectable').length > 0
  rescue => e 
    # p e
    false
  end
end

