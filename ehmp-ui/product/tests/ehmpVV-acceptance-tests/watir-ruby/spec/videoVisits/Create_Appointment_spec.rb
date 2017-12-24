require_relative '../rspec_helper'
require 'videoVisits/eHMP_PageObject'


describe '[eHMPVV-7: Create Appointmnet]' do
  include DriverUtility

  before(:all) do
    initializeConfigurations(BASE_URL)
    @ehmp_po  = EHMP_PageObject.new(@driver)
    @ehmp_po.accessEhmp.access_with(UserAccessPu)
    @waitUtility = WaitUtility.new(@driver)
    @table_ele = @ehmp_po.appointmentsList.headerrow2_element
    @ehmp_po.accessEhmp.create_workspace("Ten, Patient")
    @waitUtility.waitWhileModuleSpinnerPresent
    p "access to video visit applet::::"
  end

  after(:all) do
     @ehmp_po.loginLogout.logout
  end
  context 'EHMPVV-7 Create Appointment' do

    it "Validate the Add Icon functionality" do
      @waitUtility.waitWhileModuleSpinnerPresent
      expect(@ehmp_po.createAppointment.additem_element.attribute('tooltip-data-key')).to eq "Add Item"
      @ehmp_po.createAppointment.additem_element.click
      @waitUtility.wait_untill_elements_size_steadied
    end

    it "Validate the Header, required fields and field labels " do
      model_container = @ehmp_po.createAppointment.modelContent_element.text
      expected_header_footer = ["CREATE VIDEO VISIT APPOINTMENT", "?", "Date *", "Time (EST) *", "CREATE" , "CANCEL"]
      expected_duration = ["Duration *", "15 minutes", "20 minutes", "30 minutes"]
      expected_phonetype = ["Phone Type", "Mobile",  "Home", "Work", "Fax"]
      expected_patinfo = ["Patient Email *", "Patient Phone"]
      expected_proinfo = ["Provider Name", "Provider Email *", "Provider Phone *"]
      expected_addinst = ["Include additional instructions for Patient?", "Yes", "No"]
      expected_comment = ["Comment", "250 of 250 characters remaining"]
      expected_data = expected_header_footer + expected_duration + expected_phonetype + expected_patinfo + expected_proinfo + expected_addinst + expected_comment
      data_comper(expected_data, model_container)
      expect(@ehmp_po.createAppointment.create_element.enabled?).to eq(false)
    end

  it "Validate the date field" do
     expect(@ehmp_po.createAppointment.date_element.attribute('placeholder')).to eq "MM/DD/YYYY"
     expect(@ehmp_po.createAppointment.timeIcon_element.visible?).to be true

     days = [-1, 91]
     days.each do |invaliddate| 
       today_date = Time.now
       invalid_date = today_date + invaliddate.day
       invalid_date = invalid_date.strftime('%m/%d/%Y') 
       @ehmp_po.createAppointment.date = invalid_date
       @driver.send_keys :tab
       @waitUtility.wait_untill_elements_size_steadied
       expected_data = ["Invalid date"]    
       error_msg = @ehmp_po.createAppointment.errorMessage_element.text
       data_comper(expected_data, error_msg)
    end

     today_date = Time.now
     future_date = today_date + 30.day
     future_date = future_date.strftime('%m/%d/%Y')
     @ehmp_po.createAppointment.date = future_date
     @driver.send_keys :tab
     expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
     @waitUtility.wait_untill_elements_size_steadied
     today_date = Time.now
     today_date = today_date.strftime('%m/%d/%Y')
     @ehmp_po.createAppointment.date = today_date
  end

  it "Validate the time field" do
     expect(@ehmp_po.createAppointment.time_element.attribute('placeholder')).to eq "HH:MM"

     @ehmp_po.createAppointment.date = Time.now.strftime('%m/%d/%Y')
     @ehmp_po.createAppointment.timeIcon_element.click
     time_hour = Time.now.ago(1*16*60).strftime('%H')
     time_minutes = Time.now.ago(1*16*60).strftime('%M')
     @ehmp_po.createAppointment.timeHour = time_hour
     @ehmp_po.createAppointment.timeMinutes = time_minutes
     @driver.send_keys :tab
     @waitUtility.wait_untill_elements_size_steadied
     expected_data = ["Invalid time - can be no more than 15 minutes prior to the current time"]    
     error_msg = @ehmp_po.createAppointment.errorMessage_element.text
     data_comper(expected_data, error_msg)

     t_hour = [-1, 14, 24]
     time_minutes = 30
     @ehmp_po.createAppointment.date = (Time.now + 5.day).strftime('%m/%d/%Y')     
     t_hour.each do |hours|
       @ehmp_po.createAppointment.timeIcon_element.click
       @ehmp_po.createAppointment.timeHour = hours
       @ehmp_po.createAppointment.timeMinutes = time_minutes   
       @driver.send_keys :tab
       if hours != -1 or hours != 24
         expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
         @waitUtility.wait_untill_elements_size_steadied
       else
         @waitUtility.wait_untill_elements_size_steadied
         expected_data = ["Invalid time (should be 15 minute increments)"]    
         error_msg = @ehmp_po.createAppointment.errorMessage_element.text
         data_comper(expected_data, error_msg)  
       end           
    end

     t_min = [-1, 00, 15, 30, 45, 3]
     time_hour = 15
     @ehmp_po.createAppointment.date = (Time.now + 5.day).strftime('%m/%d/%Y')     
     t_min.each do |time_minutes|
       @ehmp_po.createAppointment.timeIcon_element.click
       @ehmp_po.createAppointment.timeHour = time_hour
       @ehmp_po.createAppointment.timeMinutes = time_minutes   
       @driver.send_keys :tab
       @waitUtility.wait_untill_elements_size_steadied
       if time_minutes == 00 or time_minutes == 15 or time_minutes == 30 or time_minutes == 45
         expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
         @waitUtility.wait_untill_elements_size_steadied
       else
         @waitUtility.wait_untill_elements_size_steadied
         expected_data = ["Invalid time (should be 15 minute increments)"]    
         error_msg = @ehmp_po.createAppointment.errorMessage_element.text
         data_comper(expected_data, error_msg)            
       end
    end

      @ehmp_po.createAppointment.date = (Time.now + 30.day).strftime('%m/%d/%Y')
      @ehmp_po.createAppointment.timeIcon_element.click
      time_hour = 10
      time_minutes = 30
      @ehmp_po.createAppointment.timeHour = time_hour
      @ehmp_po.createAppointment.timeMinutes = time_minutes
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
  end  

  it "Validate the duration field" do
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.duration_element.selected_options.include? "20 minutes").to be true
      @waitUtility.wait_untill_elements_size_steadied

      @ehmp_po.createAppointment.duration=""
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied
      expected_data = ["Invalid duration"]    
      error_msg = @ehmp_po.createAppointment.errorMessage_element.text
      data_comper(expected_data, error_msg)

      t_duration = ["20 minutes", "15 minutes", "30 minutes"]
      t_duration.each do |duration|
        @ehmp_po.createAppointment.duration=duration
        @driver.send_keys :tab
        @waitUtility.wait_untill_elements_size_steadied
        expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
        @waitUtility.wait_untill_elements_size_steadied
      end  
  end 

  it "Validate Patient Email field" do
      text_char = 'a'*100
      @ehmp_po.createAppointment.patientEmail = text_char
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.patientEmail.size).to eq 100
      expect(@ehmp_po.createAppointment.patientEmail).to eq text_char
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied
      expected_data = ["Invalid email"]    
      error_msg = @ehmp_po.createAppointment.errorMessage_element.text
      data_comper(expected_data, error_msg)

      text_char = 'a'*100
      @ehmp_po.createAppointment.patientEmail = text_char + "b"
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.patientEmail.size).to eq 100
      expect(@ehmp_po.createAppointment.patientEmail).to eq text_char 
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied

      text_char = 'a #?1'
      @ehmp_po.createAppointment.patientEmail = text_char
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.patientEmail.size).to eq 5
      expect(@ehmp_po.createAppointment.patientEmail).to eq text_char 
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied
      expected_data = ["Invalid email"]    
      error_msg = @ehmp_po.createAppointment.errorMessage_element.text
      data_comper(expected_data, error_msg)

      @ehmp_po.createAppointment.patientEmail = "sohal.shah@accenturefederal.com"
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied 
      expect(@ehmp_po.createAppointment.patientEmail_element.attribute('value')).to eq "sohal.shah@accenturefederal.com"      
      expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
  end  

  it "Validate Patient Phone field " do
     expect(@ehmp_po.createAppointment.patientPhone_element.attribute('value')).to eq "(703) 222-5555"

     @ehmp_po.createAppointment.patientPhone = 123
     @driver.send_keys :tab
     @waitUtility.wait_untill_elements_size_steadied
     expected_data = ["Invalid phone number"]    
     error_msg = @ehmp_po.createAppointment.errorMessage_element.text
     data_comper(expected_data, error_msg)

     @ehmp_po.createAppointment.patientPhone = '(703) 222-5555'
     @driver.send_keys :tab
     @waitUtility.wait_untill_elements_size_steadied 
     expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
  end  

  it "Validate Patient Phone Type field " do
      expect(@ehmp_po.createAppointment.patientPhoneType_element.selected_options.include? "Mobile").to be true

      t_phonetype= ["", "Mobile", "Work", "Home", "Fax"]
      t_phonetype.each do |phonetype|  
        @ehmp_po.createAppointment.patientPhoneType=phonetype
        @driver.send_keys :tab
        @waitUtility.wait_untill_elements_size_steadied
        expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
        @waitUtility.wait_untill_elements_size_steadied
      end  
  end  

  it "Validate Provider Name field " do
     expect(@ehmp_po.createAppointment.providerName_element.attribute('value')).to eq "USER, PANORAMA"
     @waitUtility.wait_untill_elements_size_steadied
     expect(@ehmp_po.createAppointment.providerName_element.disabled?).to be true
  end 

  it "Validate Provider Email field " do
      text_char = 'a'*100
      @ehmp_po.createAppointment.providerEmail = text_char
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.providerEmail.size).to eq 100
      expect(@ehmp_po.createAppointment.providerEmail).to eq text_char
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied
      expected_data = ["Invalid email"]    
      error_msg = @ehmp_po.createAppointment.errorMessage_element.text
      data_comper(expected_data, error_msg)  

      text_char = 'a'*100
      @ehmp_po.createAppointment.providerEmail = text_char + "b"
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.providerEmail.size).to eq 100
      expect(@ehmp_po.createAppointment.providerEmail).to eq text_char 
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied

      text_char = 'dfkldjskfl'
      @ehmp_po.createAppointment.providerEmail = text_char
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.providerEmail.size).to eq 10
      expect(@ehmp_po.createAppointment.providerEmail).to eq text_char 
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied
      expected_data = ["Invalid email"]    
      error_msg = @ehmp_po.createAppointment.errorMessage_element.text
      data_comper(expected_data, error_msg)

      @ehmp_po.createAppointment.providerEmail = 'sohal.shah@accenturefederal.com'
      @driver.send_keys :tab
      @waitUtility.wait_untill_elements_size_steadied 
      expect(@ehmp_po.createAppointment.providerEmail_element.attribute('value')).to eq "sohal.shah@accenturefederal.com"

      expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false   
  end  

  it "Validate Provider Phone field " do
     expect(@ehmp_po.createAppointment.providerPhone_element.attribute('value')).to eq "(571) 222-2222"

     @waitUtility.wait_untill_elements_size_steadied
     @ehmp_po.createAppointment.providerPhone=123
     @driver.send_keys :tab
     @waitUtility.wait_untill_elements_size_steadied
     expected_data = ["Invalid phone"]    
     error_msg = @ehmp_po.createAppointment.errorMessage_element.text
     data_comper(expected_data, error_msg)

     @ehmp_po.createAppointment.providerPhone = "(571) 222-2222"
     @driver.send_keys :tab
     @waitUtility.wait_untill_elements_size_steadied 
     expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false   
  end

  it "Validate the Radio buttons default functionality  " do
       expect(@ehmp_po.createAppointment.yesRadio_selected?). to be false  
       expect(@ehmp_po.createAppointment.noRadio_selected?). to be true   
  end

  it "Validate the Create and Cancel buttons default functionality" do
      expect(@ehmp_po.createAppointment.cancel_element.enabled?).to eq(true)
      expect(@ehmp_po.createAppointment.create_element.enabled?).to eq(true)
  end

  it "Validate the Comment field" do 
       text_char = 'a'*250
       @ehmp_po.createAppointment.comment = text_char
       @waitUtility.wait_untill_elements_size_steadied
       expect(@ehmp_po.createAppointment.charCount_element.text).to eq "0 of 250 characters remaining"
       expect(@ehmp_po.createAppointment.comment.size).to eq 250
       expect(@ehmp_po.createAppointment.comment).to eq text_char  

       text_char = 'a'*250
       @ehmp_po.createAppointment.comment = text_char + "b"
       @waitUtility.wait_untill_elements_size_steadied
       expect(@ehmp_po.createAppointment.charCount_element.text).to eq "0 of 250 characters remaining"
       expect(@ehmp_po.createAppointment.comment.size).to eq 250
       expect(@ehmp_po.createAppointment.comment).to eq text_char 

       text_char = 'a #?1'
       @ehmp_po.createAppointment.comment = text_char
       @waitUtility.wait_untill_elements_size_steadied
       expect(@ehmp_po.createAppointment.charCount_element.text).to eq "245 of 250 characters remaining"
       expect(@ehmp_po.createAppointment.comment.size).to eq 5
       expect(@ehmp_po.createAppointment.comment).to eq text_char 
       @ehmp_po.createAppointment.comment = "test"
       @waitUtility.wait_untill_elements_size_steadied
       expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false
  end

  it "Validate additional isntructions fields " do
      expect(@ehmp_po.createAppointment.yesRadio_selected?). to be false 
      @ehmp_po.createAppointment.yesRadio_element.click
      expect(@ehmp_po.createAppointment.yesRadio_selected?). to be true
      expect(@ehmp_po.createAppointment.noRadio_selected?). to be false   
      expect(@ehmp_po.createAppointment.create_element.enabled?).to eq(false)

      additional_container = @ehmp_po.createAppointment.modelContent_element.text
      expected_data1 = ["Select Instructions *", "Other"]
      data_comper(expected_data1, additional_container)
  end

  it "Validate the select instruction dropdown functionality" do
      expect(@ehmp_po.createAppointment.selectinstructionsdropdownlist_options.first == "").to be true
      expect(@ehmp_po.createAppointment.selectinstructionsdropdownlist_options.last == "Other").to be true
  end

  it "Validate the predefined instruction " do
     @ehmp_po.createAppointment.selectinstructionsdropdownlist_options.each do |options|
        if options != "" and options != "Other"
          @ehmp_po.createAppointment.selectinstructionsdropdownlist = options
          additional_container2 = @ehmp_po.createAppointment.modelContent_element.text
          expected_data3 = ["Instructions that will be sent to Patient", "10000 characters remaining"]
          data_comper(expected_data3, additional_container2)
          @ehmp_po.createAppointment.instructionstopatient_element.attribute('disabled')
          expect(@ehmp_po.createAppointment.instructionstopatient_element.attribute('disabled')).to eq "true"
          expect(@ehmp_po.createAppointment.create_element.enabled?).to eq(true)   
       end        
    end
  end

  it "Validate the Other instructions" do
      @ehmp_po.createAppointment.selectinstructionsdropdownlist = "Other"
      additional_container1 = @ehmp_po.createAppointment.modelContent_element.text
      expected_data2 = ["Instructions that will be sent to Patient *", "10000 of 10000 characters remaining"]
      data_comper(expected_data2, additional_container1)
      expect(@ehmp_po.createAppointment.create_element.enabled?).to eq(false)

      expect(@ehmp_po.createAppointment.instructionstopatient_element.attribute('maxlength')).to eq "10000"

      text_char = 'a #?1'
      @ehmp_po.createAppointment.instructionstopatient = text_char
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.charCount_Additional_element.text).to eq "9995 of 10000 characters remaining"
      expect(@ehmp_po.createAppointment.instructionstopatient.size).to eq 5
      expect(@ehmp_po.createAppointment.instructionstopatient).to eq text_char 
      @ehmp_po.createAppointment.instructionstopatient = "test"
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.errorMessage_element.exists?).to be false

      text_char = 'a'*5000
      @ehmp_po.createAppointment.instructionstopatient = text_char
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.charCount_Additional_element.text).to eq "5000 of 10000 characters remaining"
      expect(@ehmp_po.createAppointment.instructionstopatient.size).to eq 5000
      expect(@ehmp_po.createAppointment.instructionstopatient).to eq text_char  
  end

  it "Validate the pre-selected addtional isntructions" do
      @ehmp_po.createAppointment.noRadio_element.click
      @waitUtility.wait_untill_elements_size_steadied
      @ehmp_po.createAppointment.yesRadio_element.click
      @waitUtility.wait_untill_elements_size_steadied
      expect(@ehmp_po.createAppointment.create_element.enabled?).to eq(true)
      expect(@ehmp_po.createAppointment.selectinstructionsdropdownlist == "Other").to be true    
      @ehmp_po.createAppointment.instructionstopatient = "test"
      expect(@ehmp_po.createAppointment.instructionstopatient).to eq "test" 
  end

  it "Validate Cancel Popup" do
      @ehmp_po.createAppointment.cancel_element.click
      @waitUtility.wait_untill_elements_size_steadied 
      popup_body = @ehmp_po.createAppointment.cancelPopup_element.text
      expected_data = ["Warning", "All unsaved changes will be lost. Are you sure you want to cancel?", "NO", "YES"]
      data_comper(expected_data, popup_body)
      expect(@ehmp_po.createAppointment.noCancel_element.enabled?).to eq(true)
      expect(@ehmp_po.createAppointment.yesCancel_element.enabled?).to eq(true)
      @ehmp_po.createAppointment.noCancel_element.click
      @waitUtility.wait_untill_elements_size_steadied 
      expect(isCancelPopUpPresent()) == false
      expect(isCreateAptModalPresent()) == true

      @ehmp_po.createAppointment.cancel_element.click
      @waitUtility.wait_untill_elements_size_steadied 
      @ehmp_po.createAppointment.yesCancel_element.click
      @waitUtility.wait_untill_elements_size_steadied 
      expect(isCancelPopUpPresent()) == false
      expect(isCreateAptModalPresent()) == false
      @ehmp_po.createAppointment.actionTray_element.click
      @waitUtility.wait_untill_elements_size_steadied 
  end
 
end

  def data_comper(data_expected, container_elements)
    data_expected.each do |expect_data|
      expect_data
      error_msg = "Could not find the expected data: \n#{expect_data} \n into: \n#{container_elements}"
      fail error_msg unless container_elements.include? expect_data
    end
  end

    def isCancelPopUpPresent()
      begin
        return @ehmp_po.createAppointment.cancelPopup_element.exists?
      rescue Exception=>e
        return false
      end
    end

    def isCreateAptModalPresent()
      begin
        return @ehmp_po.createAppointment.modelContent_element.exists?
      rescue Exception=>e
        return false
      end
    end

end 
