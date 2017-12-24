require 'rspec_helper'
require 'videoVisits/eHMP_PageObject'
require 'loginLogout'


class AccessEhmp
  include PageObject

  def initialize(driver)
    @driver = driver
    @ehmp_po  = EHMP_PageObject.new(@driver)
    @waitUtility = WaitUtility.new(@driver)
  end

  def access_with(user_info)
    log = LoginLogout.new(@driver)
    log.loginWith(user_info)
  end

  def patient_selection_by_full_name(patient_name)
    patient_search(patient_name)
    select_patient_by_match_name(patient_name)
  end

  def patient_search(patient_name)
    p "in patient search loop...."
    @waitUtility.waitWhileSpinnerPresent
    @ehmp_po.patientSearch.patientSelectionTitle_element.when_visible(TIME_OUT_LIMIT)

    @ehmp_po.patientSearch.patientSelection = patient_name
    @driver.send_keys :enter
    p "at end of patient search loop..."
  end

  def select_patient_by_match_name(patient_name)
    p "in select_patient_by_match_name loop...."
    @waitUtility.waitWhileModuleSpinnerPresent
    @ehmp_po.patientSearch.patientSelectionTitle_element.when_visible(TIME_OUT_LIMIT)

    container_elements = @ehmp_po.patientSearch.patientSelectionContainer_element
    i = 0
    table_size = container_elements.rows
    for i in 1..table_size-1
      container_elements[i]['Patient Name'].click if container_elements[i]['Patient Name'].text.include? patient_name
    end

    @waitUtility.waitWhileModuleSpinnerPresent
    @ehmp_po.patientSearch.confirmationButton_element.when_visible(TIME_OUT_LIMIT).click

    @waitUtility.waitWhileModuleSpinnerPresent
    @waitUtility.wait_untill_elements_size_steadied
    #@ehmp_po.patientSearch.confirmFlaggedPatinetButton_element.click if @ehmp_po.patientSearch.confirmFlaggedPatinetButton_element.when_visible(TIME_OUT_LIMIT).visible?
    p "in end of select_patient_by_match_name loop ...."
  end

  def access_to_workspace_name(workspace_and_applet_name)
    p "access_to_workspace_name ------------"
    # @waitUtility.waitWhileModuleSpinnerPresent
    workspace_name = workspace_and_applet_name['workspace_name']

    create_workspace_name(workspace_name) unless find_workspace_name(workspace_name)
    customize_ele = get_customize_ele(workspace_name)

    if customize_ele.text == 'Launch'
      get_customize_ele(workspace_name).click
    elsif customize_ele.text == "Customize"
      create_customize_view(customize_ele, workspace_and_applet_name)
    end
  end
  def create_workspace(patient_name)
    patient_selection_by_full_name(patient_name)
    workspace_and_applet_name = {'workspace_name' => "Video Visit Appointment", 'applet_name' => "Video Visits - Next 90 Days", 'data_appletid' => 'videovisits'}
    p "workspace name :" 
    access_to_workspace_name(workspace_and_applet_name)
  end

  def find_workspace_name(workspace_name)
    p "find_workspace_name -----------"
    @ehmp_po.patientSearch.workSpaceButton_element.when_visible(TIME_OUT_LIMIT).click
    # @waitUtility.waitWhileModuleSpinnerPresent
    # @waitUtility.wait_untill_elements_size_steadied

    begin
      return @driver.text_field(:text, workspace_name).visible?
    rescue
      return false
    end

  end

  def create_workspace_name(workspace_name)
    p "create_workspace_name -----------"
    begin
      workspace_name_size = @driver.text_fields(:text, /User Defined Workspace/).size + 1
    rescue
      workspace_name_size = 0
    end

    @ehmp_po.patientSearch.addWorkSpace_element.when_visible(TIME_OUT_LIMIT).click
    # @waitUtility.waitWhileModuleSpinnerPresent
    @waitUtility.wait_untill_elements_size_steadied

    last_ele = @driver.text_field(:text, "User Defined Workspace " + workspace_name_size.to_s)

    last_ele.set workspace_name
    # last_ele.fouce
    @ehmp_po.patientSearch.closeBtn_element.when_visible(TIME_OUT_LIMIT).click
    # @waitUtility.waitWhileModuleSpinnerPresent
    @waitUtility.wait_untill_elements_size_steadied

    @ehmp_po.patientSearch.workSpaceButton_element.when_visible(TIME_OUT_LIMIT).click
    # @waitUtility.waitWhileModuleSpinnerPresent
    @waitUtility.wait_untill_elements_size_steadied
    # @driver.send_keys :enter
  end

  def create_customize_view(customize_ele, workspace_and_applet_name)
    p "create_customize_view ------------"

    customize_ele.click
    @waitUtility.waitWhileModuleSpinnerPresent
    @waitUtility.wait_untill_elements_size_steadied

    select_applet(workspace_and_applet_name)
  end

  def select_applet(workspace_and_applet_name)
    p "select_applet --------------"
    applet_name = workspace_and_applet_name['applet_name']
    applet_id = workspace_and_applet_name['data_appletid']

    applet_found = false
    for i in 1..3
      @waitUtility.wait_untill_elements_size_steadied
      begin
        applet_ele = @driver.span(:text, applet_name)
        if applet_ele.visible?
          applet_found = true
          break
        else
          @ehmp_po.patientSearch.rightMargin_element.when_visible(TIME_OUT_LIMIT).click
        end
      rescue
        @ehmp_po.patientSearch.rightMargin_element.when_visible(TIME_OUT_LIMIT).click
        applet_found = false
      end

    end

    if applet_found
      locator_applet = "[data-appletid='" + applet_id + "']"
      applet_ele = @driver.div(:css, locator_applet)

      @waitUtility.wait_untill_elements_size_steadied
      applet_ele.focus

      @waitUtility.wait_untill_elements_size_steadied
      @driver.send_keys :enter

      @waitUtility.wait_untill_elements_size_steadied
      @driver.send_keys :enter

      @waitUtility.wait_untill_elements_size_steadied
      @ehmp_po.patientSearch.acceptBtn_element.when_visible(TIME_OUT_LIMIT).click
    else
      fail "Could NOT find the #{applet_name} in customize view"
    end
  end

  def get_customize_ele(workspace_name)
    # data-screen-id="video-visit-appointment"
    workspace_name = workspace_name.gsub(" ", "-").downcase
    locator_customize = "[data-screen-id='" + workspace_name + "'] div ~div ~div ~div ~div ~div ~div ~div ~div ~div"
    customize_ele = @driver.div(:css, locator_customize)
    p customize_ele.text
    return customize_ele
  end

    
def create_appointment_with_additional_instructions(proEmail, patEmail, patPhone, proPhone, patPhoneType, comments, addinstructions)
          @waitUtility.waitWhileModuleSpinnerPresent
          @waitUtility.wait_untill_elements_size_steadied 
          @ehmp_po.createAppointment.additem_element.focus  
          @ehmp_po.createAppointment.additem_element.click
          @waitUtility.wait_untill_elements_size_steadied 
          today_date = Time.now
          future_date = today_date + 1.day
          future_date = future_date.strftime('%m/%d/%Y')
          @datetime = (Time.now + 1.day).strftime('%m/%d/%Y') + " - 15:30 EST"
          @ehmp_po.createAppointment.date = future_date
          @driver.send_keys :tab
          @ehmp_po.createAppointment.timeIcon_element.click
          @ehmp_po.createAppointment.timeHour = 15
          @ehmp_po.createAppointment.timeMinutes = 30
          @driver.send_keys :tab
          @waitUtility.wait_untill_elements_size_steadied 

          if @ehmp_po.createAppointment.providerEmail_element.attribute('value')== ""
             @ehmp_po.createAppointment.providerEmail = proEmail             
          else
            proEmail = @ehmp_po.createAppointment.providerEmail_element.attribute('value')
          end   
          if @ehmp_po.createAppointment.patientEmail_element.attribute('value')== ""
             @ehmp_po.createAppointment.patientEmail = patEmail             
          else
           patEmail = @ehmp_po.createAppointment.patientEmail_element.attribute('value')
          end  
          if @ehmp_po.createAppointment.patientPhone_element.attribute('value')== ""
             @ehmp_po.createAppointment.patientPhone = patPhone             
          else
            patPhone = @ehmp_po.createAppointment.patientPhone_element.attribute('value')
          end   
          if @ehmp_po.createAppointment.providerPhone_element.attribute('value')== ""
             @ehmp_po.createAppointment.providerPhone = proPhone             
          else
            proPhone = @ehmp_po.createAppointment.providerPhone_element.attribute('value')
          end             
           if @ehmp_po.createAppointment.patientPhoneType_element.attribute('value')== ""
             @ehmp_po.createAppointment.patientPhoneType = patPhoneType             
          else
            patPhoneType = @ehmp_po.createAppointment.patientPhoneType_element.attribute('value')
          end  
          @ehmp_po.createAppointment.comment = comments
          @ehmp_po.createAppointment.yesRadio_element.click
          @waitUtility.wait_untill_elements_size_steadied
          @ehmp_po.createAppointment.selectinstructionsdropdownlist = "Other"
          @ehmp_po.createAppointment.instructionstopatient = addinstructions
          @waitUtility.wait_untill_elements_size_steadied
          @ehmp_po.createAppointment.create_element.click
          @waitUtility.wait_untill_elements_size_steadied 
          @ehmp_po.createAppointment.growler_message_element.when_visible(TIME_OUT_LIMIT)
          success_message = @ehmp_po.createAppointment.growler_message_element.text
          expected_data4= ["Appointment successfully booked. Confirmation emails have been sent to Patient and Provider."]
          data_comper(expected_data4, success_message)  
          @waitUtility.waitWhileGrowlerPresent 
          @waitUtility.wait_untill_elements_size_steadied 
          @ehmp_po.createAppointment.actionTray_element.click      
          @waitUtility.wait_untill_elements_size_steadied   
          @waitUtility.waitWhileModuleSpinnerPresent 

       p "End of appointment creation with additional instructions......"
          return proEmail, patEmail, patPhone, proPhone, patPhoneType, comments, addinstructions
   
end

def create_appointment_without_additional_instructions(proEmail, patEmail, patPhone, proPhone, patPhoneType, comments)
           @waitUtility.waitWhileModuleSpinnerPresent
          @waitUtility.wait_untill_elements_size_steadied 
          @ehmp_po.createAppointment.additem_element.focus  
          @ehmp_po.createAppointment.additem_element.click
          @waitUtility.wait_untill_elements_size_steadied 
          today_date = Time.now
          future_date1 = today_date + 1.day
          future_date1 = future_date1.strftime('%m/%d/%Y')
          @datetime1 = (Time.now + 1.day).strftime('%m/%d/%Y') + " - 16:30 EST"
          @ehmp_po.createAppointment.date = future_date1
          @driver.send_keys :tab
          @ehmp_po.createAppointment.timeIcon_element.click
          @ehmp_po.createAppointment.timeHour = 16
          @ehmp_po.createAppointment.timeMinutes = 30
          @driver.send_keys :tab
          @waitUtility.wait_untill_elements_size_steadied 

          if @ehmp_po.createAppointment.providerEmail_element.attribute('value')== ""
             @ehmp_po.createAppointment.providerEmail = proEmail             
          else
            proEmail = @ehmp_po.createAppointment.providerEmail_element.attribute('value')
          end   
          if @ehmp_po.createAppointment.patientEmail_element.attribute('value')== ""
             @ehmp_po.createAppointment.patientEmail = patEmail             
          else
            patEmail = @ehmp_po.createAppointment.patientEmail_element.attribute('value')
          end 
          if @ehmp_po.createAppointment.patientPhone_element.attribute('value')== ""
             @ehmp_po.createAppointment.patientPhone = patPhone             
          else
            patPhone = @ehmp_po.createAppointment.patientPhone_element.attribute('value')
          end   
          if @ehmp_po.createAppointment.providerPhone_element.attribute('value')== ""
             @ehmp_po.createAppointment.providerPhone = proPhone             
          else
            proPhone = @ehmp_po.createAppointment.providerPhone_element.attribute('value')
          end             
           if @ehmp_po.createAppointment.patientPhoneType_element.attribute('value')== ""
             @ehmp_po.createAppointment.patientPhoneType = patPhoneType             
          else
            patPhoneType = @ehmp_po.createAppointment.patientPhoneType_element.attribute('value')
          end 
          @ehmp_po.createAppointment.comment = comments          
          @ehmp_po.createAppointment.create_element.click
          @waitUtility.wait_untill_elements_size_steadied 
          @ehmp_po.createAppointment.growler_message_element.when_visible(TIME_OUT_LIMIT)
          success_message = @ehmp_po.createAppointment.growler_message_element.text
          expected_data4= ["Appointment successfully booked. Confirmation emails have been sent to Patient and Provider."]
          data_comper(expected_data4, success_message)   
          @waitUtility.waitWhileGrowlerPresent
          @waitUtility.wait_untill_elements_size_steadied 
          @ehmp_po.createAppointment.actionTray_element.click      
          @waitUtility.wait_untill_elements_size_steadied   
          @waitUtility.waitWhileModuleSpinnerPresent  

       p "End of appointment creation without additional instructions......"
          return proEmail, patEmail, patPhone, proPhone, patPhoneType, comments

   
end


    def data_comper(data_expected, container_elements)
    data_expected.each do |expect_data|
      expect_data
      error_msg = "Could not find the expected data: \n#{expect_data} \n into: \n#{container_elements}"
      fail error_msg unless container_elements.include? expect_data
    end
  end


end
