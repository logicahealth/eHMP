class CwadCoverSheet < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("cwad details"), VerifyContainsText.new, AccessHtmlElement.new(:css, 'div.demographic-group-wrapper:nth-child(1)')) 
    #add_verify(CucumberLabel.new("cwad details"), VerifyContainsText.new, AccessHtmlElement.new(:css, '#cwad-detail-list .row'))     
  end
end 

Then(/^the cwad details view contains$/) do |table|
  cwad = CwadCoverSheet.instance
  @ehmp = PobOverView.new
  @ehmp.wait_until_fld_cwad_details_visible
  max_attempt = 4
  begin
    table.rows.each do |fields|
      expect(object_exists_in_list(@ehmp.fld_cwad_details, "#{fields[0]}")).to eq(true), "Field '#{fields[0]}' was not found"
    end
  rescue Exception => e
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
  
end

When(/^the user opens the "(.*?)" details view$/) do |arg1|
  driver = TestSupport.driver
  cwad = CwadCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  data_original_title = arg1.downcase
  max_attempt = 4
  begin
    #css_string = "#patientDemographic-cwad span[data-original-title='#{data_original_title}'] span"
    xpath_string = "//section[@class='patient-postings']/descendant::span[contains(string(),'#{data_original_title}')]/ancestor::button"
    posting_element = driver.find_element(:xpath, xpath_string)
    posting_element.click 
    @ehmp = PobOverView.new
    @ehmp.wait_until_fld_cwad_details_visible
    @ehmp.wait_until_fld_panel_title_visible
    expect(@ehmp.fld_panel_title.text.downcase).to have_text(data_original_title)
  rescue Exception => e 
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

Then(/^the following postings are active$/) do |table|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  table.rows.each do |column|
    data_original_title = column[0].downcase
    begin
      #css_string = "#patientDemographic-cwad span[data-original-title='#{data_original_title[0]}'] span"
      xpath_string = "//section[@class='patient-postings']/descendant::span[contains(string(),'#{data_original_title}')]/ancestor::button"
      posting_element = driver.find_element(:xpath, xpath_string)
      p posting_element.attribute('disabled')
      expect(posting_element.attribute('disabled')).to be_false, "#{data_original_title} is not active"
    rescue Exception => e 
      p 'error: #{e}'
      raise
    end
  end
end

Then(/^the following postings are active and open the details view$/) do |table|
  driver = TestSupport.driver
  cwad = CwadCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  table.rows.each do |column|
    data_original_title = column[0].downcase
    begin
      #css_string = "#patientDemographic-cwad span[data-original-title='#{data_original_title}'] span"
      xpath_string = "//section[@class='patient-postings']/descendant::span[contains(string(),'#{data_original_title}')]/ancestor::button"
      posting_element = driver.find_element(:xpath, xpath_string)
      expect(posting_element.attribute('disabled')).to be_false, "#{data_original_title} is not active"
      posting_element.click 
      @ehmp = PobOverView.new
      @ehmp.wait_until_fld_cwad_details_visible
      expect(cwad.perform_verification('cwad details title', data_original_title)).to be_true, "The title #{data_original_title} is not present in the cwad details"
    rescue Exception => e 
      p "error: #{e}"
      raise
    end
  end
end

Then(/^the following postings are inactive$/) do |table|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  table.rows.each do |column|
    data_original_title = column[0].downcase
    begin
      xpath_string = "//section[@class='patient-postings']/descendant::span[contains(string(),'#{data_original_title}')]/ancestor::button"
      posting_element = driver.find_element(:xpath, xpath_string)
      expect(posting_element.attribute('disabled')).to be_true, "#{data_original_title} has 'active class' when it should not"
    rescue Exception => e 
      p "error: #{e}"
      raise
    end
  end
end

