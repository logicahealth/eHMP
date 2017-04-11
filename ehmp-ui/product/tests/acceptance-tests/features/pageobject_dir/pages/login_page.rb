
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
  #element :ddl_facility, "#facility"
    
  element :ddl_facility, "[x-is-labelledby='select2-selectedFacility-container']"
  element :ddl_facility_results, "[id ='select2-selectedFacility-results']"
  elements :ddl_facility_result_list, ".select2-results__option"
  element :ddl_selected_facility, "#select2-selectedFacility-container"
  element :fld_facility_label, "label[for='selectedFacility']"

  

  # *****************  Local_Methods  *************#
  def login_with(accesscode, verifycode)
    
    #ddl_facility.select facilityname
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
