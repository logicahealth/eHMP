Then(/^the cwad details view contains$/) do |table|
  @ehmp = PobOverView.new
  @ehmp.wait_until_fld_cwad_details_visible
  @ehmp.wait_for_fld_cwad_visible_titles 
  expect(@ehmp).to have_fld_cwad_visible_titles minimum: 1
  #div[aria-hidden='false'] .cwad-title
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
  @ehmp_for_reload = PobCoverSheet.new if @ehmp_for_reload.nil?
  data_original_title = arg1.downcase
  max_attempt = 4
  cwad_details = CwadDetails.new
  cwad_details.open_and_title data_original_title
  @ehmp = PobOverView.new
  begin
    cwad_details.wait_until_btn_open_cwad_visible
    cwad_details.btn_open_cwad.click 
    
    @ehmp.wait_until_fld_cwad_details_visible
    @ehmp.wait_until_fld_panel_title_visible
    expect(@ehmp.fld_panel_title.text.downcase).to have_text(data_original_title)
  rescue Exception => e 
    p "loading visible? #{cwad_details.loading.visible?}"
    @ehmp_for_reload.load if cwad_details.loading.visible?
    PobHeaderFooter.new.wait_until_header_footer_elements_loaded
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

