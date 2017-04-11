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

  # *****************  All_Button_Elements  ******************* #
  element :btn_login, "button[type='submit']"

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
end
