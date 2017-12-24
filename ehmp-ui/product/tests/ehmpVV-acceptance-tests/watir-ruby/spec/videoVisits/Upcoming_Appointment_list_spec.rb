require_relative '../rspec_helper'
require 'videoVisits/eHMP_PageObject'


describe '[eHMPVV-3: Upcoming Appointments List]' do
  include DriverUtility

  before(:all) do
    initializeConfigurations(BASE_URL)
    @ehmp_po  = EHMP_PageObject.new(@driver)
    @ehmp_po.accessEhmp.access_with(UserAccessPu)
    @waitUtility = WaitUtility.new(@driver)
    @table_ele = @ehmp_po.appointmentsList.headerrow2_element
    @table_ele1 = @ehmp_po.appointmentsList.headerrow2_element   
    @ehmp_po.accessEhmp.create_workspace("Ten, Patient")
    #  @ehmp_po.accessEhmp.create_workspace("Seven, Patient") 
    #  @ehmp_po.accessEhmp.create_workspace("Eight, Inpatient")
  
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
    @datetimecolumn_values_array  = []
    @facilitycolumn_values_array  = []
    @locationcolumn_values_array  = []
    @dateFlag = false
    @apptFlag = false
  end

  after(:all) do
     @ehmp_po.loginLogout.logout
  end

   context 'Upcoming Appointment list view' do
    # Commenting this out as selected patient might have upcoming video visit appointments or not. 
    # it "validate no results found" do
    #   if (@table_ele.rows.to_i) == 2
    #      expect(@table_ele.last_row.text).to eq "No Records Found"   
    #   end
    # end

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

    it "create appointment without Additional instructions..." do 
         list = @ehmp_po.accessEhmp.create_appointment_without_additional_instructions(@proEmail, @patEmail, @patPhone, @proPhone, @patPhoneType, @comments)
         @proEmail = list[0] 
         @patEmail = list[1]
         @patPhone = list[2]
         @proPhone = list[3]
         @patPhoneType = list[4]
         @comments = list[5]
    end

    it "verify title, headers and data ...." do
        @ehmp_po.appointmentsList.listModal_element.when_visible(TIME_OUT_LIMIT)
        @waitUtility.wait_untill_elements_size_steadied       
        model_container = @ehmp_po.appointmentsList.listModal_element.text
        expected_header = ["Date/Time", "Facility", "Location"]
        expected_title = ["VIDEO VISITS - NEXT 90 DAYS"]
        expected_aptdetails = ["#{@datetime.to_s}","KODAK"]
        expected_data = expected_header + expected_title + expected_aptdetails
        data_comper(expected_data, model_container)
        @waitUtility.wait_untill_elements_size_steadied  
        expect(@ehmp_po.appointmentsList.dateHeaderBtn_element.attribute("data-original-title")).to eq "Date and Time of appointment"
        expect(@ehmp_po.appointmentsList.facilityHeaderBtn_element.attribute("data-original-title")).to eq "Facility for the appointment"
        expect(@ehmp_po.appointmentsList.locationHeaderBtn_element.attribute("data-original-title")).to eq "Location for the appointment"
    end              
    
    it "Verify date is within the current date + 90 days range" do 
        dateVerification()
        expect(@dateFlag).to be true
    end

    it "Verify created appointment exists in the upcoming appointment list" do 
        apptDetails()
        expect(@apptFlag).to be true
    end
    
    it "Verify the sorting functionality in Video Visit Applet" do
       sorting()
       p "Verify data are sorted by date/time by default"
       expect(@datetimecolumn_values_array == @datetimecolumn_values_array.sort).to be true
       p "Verify sorting by date/time - ascending" 
       @ehmp_po.appointmentsList.dateHeaderBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       sorting()          
       expect(@datetimecolumn_values_array == @datetimecolumn_values_array.sort).to be true               
       p "Verify sorting by date/time - descending" 
       @ehmp_po.appointmentsList.dateHeaderBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       sorting()          
       expect(@datetimecolumn_values_array == @datetimecolumn_values_array.sort.reverse).to be true  
       p "Verify sorting by Facility - ascending" 
       @ehmp_po.appointmentsList.facilityHeaderBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       sorting()          
       expect(@facilitycolumn_values_array == @facilitycolumn_values_array.sort).to be true               
       p "Verify sorting by Facility - descending" 
       @ehmp_po.appointmentsList.facilityHeaderBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       sorting()          
       expect(@facilitycolumn_values_array == @facilitycolumn_values_array.sort.reverse).to be true 
       p "Verify sorting by Location - ascending" 
       @ehmp_po.appointmentsList.locationHeaderBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       sorting()          
       expect(@locationcolumn_values_array == @locationcolumn_values_array.sort).to be true               
       p "Verify sorting by Location - descending" 
       @ehmp_po.appointmentsList.locationHeaderBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       sorting()          
       expect(@locationcolumn_values_array == @locationcolumn_values_array.sort.reverse).to be true       
    end

    it "Verify refresh button functionality" do
       p "Verify refresh button functionality" 
       expect(@ehmp_po.appointmentsList.refreshBtn_element.visible?).to be true
       expect(@ehmp_po.appointmentsList.refreshBtn_element.attribute("data-original-title")).to eq "Refresh"
       @ehmp_po.appointmentsList.facilityHeaderBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       sorting()
       expect(@facilitycolumn_values_array == @facilitycolumn_values_array.sort).to be true
       @ehmp_po.appointmentsList.refreshBtn_element.focus
       @ehmp_po.appointmentsList.refreshBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       @waitUtility.waitWhileModuleSpinnerPresent
       sorting() 
       expect(@datetimecolumn_values_array == @datetimecolumn_values_array.sort).to be true
    end

    it "Verify the add button exists in Video Visit Applet" do
      expect(@ehmp_po.appointmentsList.addBtn_element.visible?).to be true
      expect(@ehmp_po.appointmentsList.addBtn_element.attribute("data-original-title")).to eq "Add Item"
    end   
 
    it "Verify options button functionality" do
       p "Verify options button functionality" 
       expect(@ehmp_po.appointmentsList.optionsBtn_element.visible?).to be true
       expect(@ehmp_po.appointmentsList.optionsBtn_element.attribute("data-original-title")).to eq "Options"
       @ehmp_po.appointmentsList.optionsBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       expect(@ehmp_po.appointmentsList.summaryView_element.visible?).to be true 
       expect(@ehmp_po.appointmentsList.remove_element.visible?).to be true 
       @ehmp_po.appointmentsList.closeOptions_element.click
       @waitUtility.wait_untill_elements_size_steadied       
    end

    it "Verify filter button functionality" do 
       p "Verify filter button functionality"
       expect(@ehmp_po.appointmentsList.filterBtn_element.visible?).to be true
       expect(@ehmp_po.appointmentsList.filterBtn_element.attribute("data-original-title")).to eq "Filter"
       @ehmp_po.appointmentsList.filterBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied 
       expect(@ehmp_po.appointmentsList.filterText_element.visible?).to be true  
       @ehmp_po.appointmentsList.filterBtn_element.click
       @waitUtility.wait_untill_elements_size_steadied      
    end

    it "Verify Help button functionality" do 
       p "Verify Help button functionality"
       expect(@ehmp_po.appointmentsList.helpBtn_element.visible?).to be true
       expect(@ehmp_po.appointmentsList.helpBtn_element.attribute("data-original-title")).to eq "Help"
       @ehmp_po.appointmentsList.helpBtn_element.click
       switchWindowToWindowHandleLast
       #  expect(getCurrentURL).to eq("https://IP        /r2.0/help/eHMP_Help%20Content%20Not%20Available.htm")
       switchWindowToWindowHandleFirst        
    end

  end

  def sorting()
      @datetimecolumn_values_array  = []
      @facilitycolumn_values_array  = []
      @locationcolumn_values_array  = []
      first = true
      @table_ele.each do |row|
        if first
           first = false
        else
           @datetimecolumn_values_array << row[0].text.split("\n")[1].to_s
           @facilitycolumn_values_array << row[1].text.split("\n")[0].to_s
           @locationcolumn_values_array << row[2].text.split("\n")[0].to_s
        end       
      end 
  end

  def apptDetails()
      first = true
      @table_ele.each do |row|
        if first
           first = false
        else
           if (row[0].text.split("\n")[1].to_s + " " + row[1].text.split("\n")[0].to_s) == (@datetime + " " + "KODAK")
               @apptFlag = true
               break
           else 
               @apptFlag = false
           end        
        end       
      end 
      return @apptFlag
  end

  def dateVerification()
      @datetimecolumn_values_array  = []
      first = true
      @table_ele.each do |row|
        if first
           first = false
        else
           today_date = Time.now
           future_date = today_date + 91.day
           today_date = today_date.strftime('%m/%d/%Y')
           future_date = future_date.strftime('%m/%d/%Y')
           date = row[0].text.split("\n")[1]
           date1 = date.split(" -")[0]
           if date1 < future_date and date1 >= today_date
            @dateFlag = true
           else
            @dateFlag = false
           end  
        end      
      end 
      return @dateFlag
  end
  def data_comper(data_expected, container_elements)
      data_expected.each do |expect_data|
        expect_data
        error_msg = "Could not find the expected data: \n#{expect_data} \n into: \n#{container_elements}"
        fail error_msg unless container_elements.include? expect_data
      end
  end

end