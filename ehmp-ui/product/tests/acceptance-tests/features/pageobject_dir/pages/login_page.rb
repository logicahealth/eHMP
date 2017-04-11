module SitePrism
  module ElementContainer
    def create_invisibility_waiter(element_name, *find_args)
      method_name = "wait_until_#{element_name}_invisible"
      create_helper_method method_name, *find_args do
        define_method method_name do |timeout = Waiter.default_wait_time, *runtime_args|
          Timeout.timeout timeout, SitePrism::TimeOutWaitingForElementInvisibility do
            start_time = Time.now
            Capybara.using_wait_time 0 do
              begin
                sleep 0.05 while element_exists?(*find_args, *runtime_args, visible: true)
              rescue => e
                if Time.now - start_time > timeout
                  p Time.now - start_time
                  raise
                else
                  p "OVERWRITTEN INVISIBLITY CHECK: #{e.message}: retry"
                  retry
                end # if
              end # rescue
            end
          end
        end
      end
    end # create_invisibility

    def create_visibility_waiter(element_name, *find_args)
      method_name = "wait_until_#{element_name}_visible"
      create_helper_method method_name, *find_args do
        define_method method_name do |timeout = Waiter.default_wait_time, *runtime_args|
          Timeout.timeout timeout, SitePrism::TimeOutWaitingForElementVisibility do
            start_time = Time.now
            Capybara.using_wait_time 0 do
              begin
                sleep 0.05 until element_exists?(*find_args, *runtime_args, visible: true)
              rescue => e
                if Time.now - start_time > timeout
                  p Time.now - start_time
                  raise
                else
                  p "OVERWRITTEN VISIBLITY CHECK: #{e.message}: retry"
                  retry
                end # if
              end # rescue
            end  #Capybara.using_wait_time
          end # Timeout
        end # define_method
      end #create_helper
    end #create_visibility
  end # module
end #module

class PobLoginPage < SitePrism::Page
  # set_url "/#logon-screen"
  set_url "/"
  # *****************  All_Form_Elements  ******************* #
  element :frm_ehmp, "form"

  # *****************  All_Logo_Elements  ******************* #
  element :lgo_ehmp, "div[class='logo']"

  # *****************  All_Field_Elements  ******************* #
  element :fld_accesscode, "#accessCode"
  element :fld_verifycode, "#verifyCode"
  element :fld_rdk_no_response, "#mainModalLabel"

  # *****************  All_Button_Elements  ******************* #
  element :btn_login, "button[type='submit']"
  element :btn_refresh_page, "#reloadPage"

  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_facility, "#facility"

  # *****************  Local_Methods  *************#
  def login_with(facilityname, accesscode, verifycode)
    wait_for_ddl_facility(30)
    ddl_facility.select facilityname
    wait_for_fld_accesscode
    fld_accesscode.set accesscode
    wait_for_fld_verifycode
    fld_verifycode.set verifycode
    btn_login.click
  end

  def check_rdk_response
    return "" unless has_btn_refresh_page?
    return "" unless has_fld_rdk_no_response?
    return "\n#{fld_rdk_no_response.text.upcase}\n"
  end
end
