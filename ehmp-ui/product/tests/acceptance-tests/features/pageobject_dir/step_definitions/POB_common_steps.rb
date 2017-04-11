Then(/^POB user clicks the actions tray$/) do
  @ehmp = PobCommonElements.new
  begin    
    @ehmp.wait_for_btn_action_tray
    @ehmp.wait_until_btn_action_tray_visible
    expect(@ehmp).to have_btn_action_tray
    @ehmp.btn_action_tray.click
    @ehmp.wait_until_btn_add_new_action_invisible
  rescue
    p "entered the rescue block, will try again to click on the actions tray"
    retry
  end  
end

def wait_for_growl_alert_to_disappear
  @ehmp = PobCommonElements.new
  begin    
    @ehmp.wait_until_fld_growl_alert_invisible(30)
  rescue
    retry
  end
end

