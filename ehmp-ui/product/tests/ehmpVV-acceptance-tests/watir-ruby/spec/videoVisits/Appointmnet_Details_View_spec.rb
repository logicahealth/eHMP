require_relative '../rspec_helper'
require 'videoVisits/eHMP_PageObject'


describe '[eHMPVV-2: Appointment Details View]' do
  include DriverUtility

  before(:all) do
    initializeConfigurations(BASE_URL)
    @ehmp_po  = EHMP_PageObject.new(@driver)
    @ehmp_po.accessEhmp.access_with(UserAccessPu)
    @waitUtility = WaitUtility.new(@driver)
    @table_ele = @ehmp_po.appointmentsList.headerrow2_element
    @table_ele1 = @ehmp_po.appointmentsList.headerrow2_element   
    @ehmp_po.accessEhmp.create_workspace("Ten, Patient")
    # @ehmp_po.accessEhmp.create_workspace("Eight, Inpatient") 
    # @ehmp_po.accessEhmp.create_workspace("Seven, Patient") 
    @waitUtility.waitWhileModuleSpinnerPresent

    @patEmail = "sohal.shah@accenturefederal.com"
    @proEmail = "sohal.shah1@accenturefederal.com"
    @patPhone = "(703) 222-5555"
    @patPhoneType = "Mobile"
    @proPhone =  "(571) 222-2222"
    @comments = "Test comments"
    @addinstructions = "test other instructions"
    # @emeContact = ""
    @emeContact = "testF testL, (333) 333-3333"
    @datetime = (Time.now + 1.day).strftime('%m/%d/%Y') + " - 15:30 EST"
    @datetime1= (Time.now + 1.day).strftime('%m/%d/%Y') + " - 16:30 EST"
    p "access to video visit applet::::"
    @recordFound = false
  end

  after(:all) do
     @ehmp_po.loginLogout.logout
  end

  context 'Appointment details view' do
     
    it "create appointment with Additional instructions..." do 
       list = @ehmp_po.accessEhmp.create_appointment_with_additional_instructions(@proEmail, @patEmail, @patPhone, @proPhone, @patPhoneType, @comments, @addinstructions)
       @proEmail = list[0] 
       @patEmail = list[1]
       @patPhone = list[2]
       @proPhone = list[3]
       @patPhoneType = list[4]
       @comments = list[5]
       @addinstructions = list[6]
    end

   
    it "Validate the appointment details with additional instructions" do
      select_apt(@datetime)
      expect(@recordFound).to be true
      apt_details(@datetime)
      additional_link()
      additional_details()
      start_videovisit_details()
      close_button()
    end

    it "create appointment without Additional instructions..." do 
       list = @ehmp_po.accessEhmp.create_appointment_without_additional_instructions(@proEmail, @patEmail, @patPhone, @proPhone, @patPhoneType, @comments)
       @proEmail = list[0] 
       @patEmail = list[1]
       @patPhone = list[2]
       @proPhone = list[3]
       @patPhoneType = list[4]
       @comments = list[5]
    end


    it "Validate the appointment details without additional instructions" do 
      select_apt(@datetime1)
      expect(@recordFound).to be true
      apt_details(@datetime1)
      expect(@ehmp_po.detailsView.additionalinstructions_element.exists?).to be false
      start_videovisit_details()
      close_button() 
      select_apt(@datetime1)
      close_icon()   
    end
  end

  def select_apt(datetime)
    totalrows = @table_ele.rows
    i=0
    for i in 1..totalrows-1
      if @table_ele[i]['Date/Time'].text.split("\n").include? datetime and @table_ele[i]['Facility'].text.split("\n").include? "KODAK"
          @recordFound = true
          @table_ele[i]['Date/Time'].click
          @waitUtility.wait_untill_elements_size_steadied 
          @ehmp_po.detailsView.modelContent_element.when_visible(TIME_OUT_LIMIT)  
          break
      end 
    end   
      return @recordFound
  end

  def apt_details(datetime1)
      p "start verifiy details view...."
      @ehmp_po.detailsView.modelContent_element.when_visible(TIME_OUT_LIMIT)
      @waitUtility.wait_untill_elements_size_steadied       
      model_container = @ehmp_po.detailsView.modelContent_element.text
      expected_header_footer = ["Video Visit Appointment", "NEXT", "PREVIOUS", "START VIDEO VISIT", "CLOSE"]
      expected_aptdetails = ["Date/Time:", "Facility/Location:", "Provider:", "#{datetime1.to_s}", "KODAK", "USER, PANORAMA"]
      expected_contactinfo = ["CONTACT INFO","Patient Phone:", "Patient Email:",  "Emergency Contact:", "#{@emeContact}", "#{@patEmail}", "#{@patPhone}"]
      expected_comments = ["COMMENTS:", "#{@comments}"]
      expected_data = expected_header_footer + expected_aptdetails + expected_contactinfo + expected_comments
      data_comper(expected_data, model_container)
      @waitUtility.wait_untill_elements_size_steadied 
      p "details view done..."
  end

  def additional_link()
     p "start verifiy additional link ...."
      @ehmp_po.detailsView.modelContent_element.when_visible(TIME_OUT_LIMIT)
      @waitUtility.wait_untill_elements_size_steadied       
      model_container = @ehmp_po.detailsView.modelContent_element.text
      expected_addinst = ["Additional Instructions to Patient"]
      expected_data =  expected_addinst
      data_comper(expected_data, model_container)
      @waitUtility.wait_untill_elements_size_steadied 
      p "additonal link verification is done done..."

  end    

  def additional_details()
      @ehmp_po.detailsView.additionalinstructions_element.click
      @waitUtility.wait_untill_elements_size_steadied  
      p modal_container1 = @ehmp_po.detailsView.alertModelContent_element.text
      expected_data2 = ["Additional Instructions", "#{@addinstructions}", "CLOSE"]
      data_comper(expected_data2, modal_container1)

      @ehmp_po.detailsView.closebtn_alert_element.click
      @waitUtility.wait_untill_elements_size_steadied  
      p "additonal view done...."

  end

  def start_videovisit_details()
      @ehmp_po.detailsView.startvidoevisitbtn_element.click
      @waitUtility.wait_untill_elements_size_steadied  
      additional_container2 = @ehmp_po.detailsView.startModelContent_element.text
      expected_data3 = ["Start Video Visit", "If you want to start this Video Visit as the Provider, select Yes.\nSelect No to return to the Appointment Details view.", "NO", "YES"]
      data_comper(expected_data3, additional_container2)
      @ehmp_po.detailsView.nobtn_alert_element.click
      @waitUtility.wait_untill_elements_size_steadied  
      p "start video visit view done...."

  end

  def close_button()
     @ehmp_po.detailsView.closebtn_element.click
     @waitUtility.wait_untill_elements_size_steadied     
  end

  def close_icon()
      p "before clicking close icon...."
      @ehmp_po.detailsView.closeicon_element.click
      @waitUtility.wait_untill_elements_size_steadied
      p " after clicking close icon..."
      expect(@ehmp_po.detailsView.modelContent_element.visible?).to be false
  end

  def data_comper(data_expected, container_elements)
    data_expected.each do |expect_data|
      expect_data
      error_msg = "Could not find the expected data: \n#{expect_data} \n into: \n#{container_elements}"
      fail error_msg unless container_elements.include? expect_data
    end
  end
end