Then(/^POB user adds a new order$/) do
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_btn_action_tray_visible
  expect(@ehmp).to have_btn_action_tray
  @ehmp.btn_action_tray.click
  @ehmp.wait_until_btn_add_new_action_visible
  expect(@ehmp).to have_btn_add_new_action
  @ehmp.btn_add_new_action.click
  @ehmp = PobOrdersApplet.new
  rows = @ehmp.fld_add_lab_order
  expect(rows.length >=2).to eq(true), "Expected to find 2 orders button, found only #{rows.length}"
  rows[1].click
  PobCommonElements.new.wait_until_fld_modal_body_visible
end

When(/^the user takes note of number of existing orders$/) do
  @number_existing_orders = PobOrdersApplet.new.number_expanded_applet_rows
  p "number existing_orders: #{@number_existing_orders}"
end

Then(/^an order is added to the applet$/) do
  ehmp = PobOrdersApplet.new
  ehmp.wait_for_tbl_orders_grid
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { ehmp.number_expanded_applet_rows == @number_existing_orders + 1 }
end

Then(/^POB add order modal detail title says "(.*?)"$/) do |order_modal_title|
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_fld_order_modal_title_visible
  expect(@ehmp.fld_order_modal_title).to have_text(order_modal_title.upcase)
end

Then(/^POB add order detail modal displays labels$/) do |table|
  @ehmp = PobOrdersApplet.new
  max_attempt = 4
  begin
    @ehmp.wait_until_fld_order_modal_labels_visible
    table.rows.each do |modal_item_fields|
      expect(object_exists_in_list(@ehmp.fld_order_modal_labels, "#{modal_item_fields[0]}")).to eq(true), "Field '#{modal_item_fields[0]}' was not found"
    end
  rescue Exception => e
    p "*** Entered Rescue block : POB add order detail modal displays labels ***"
    max_attempt-=1
    raise e if max_attempt <= 0
    retry if max_attempt > 0
  end
end

Then(/^POB add order detail modal displays preview labels$/) do |table|
  @ehmp = PobOrdersApplet.new
  max_attempt = 4
  begin
    @ehmp.wait_until_fld_order_preview_labels_visible
    table.rows.each do |preview_labels|
      expect(object_exists_in_list(@ehmp.fld_order_preview_labels, "#{preview_labels[0]}")).to eq(true), "Field '#{preview_labels[0]}' was not found"
    end
  rescue Exception => e
    p "*** Entered Rescue block : POB add order detail modal displays preview labels ***"
    max_attempt-=1
    raise e if max_attempt <= 0
    retry if max_attempt > 0
  end
end

Then(/^POB add order detail modal has buttons$/) do |table|
  @ehmp = PobOrdersApplet.new
  max_attempt = 4
  begin
    @ehmp.wait_until_btn_all_visible
    table.rows.each do |buttons|
      expect(object_exists_in_list(@ehmp.btn_all, "#{buttons[0]}")).to eq(true), "Field '#{buttons[0]}' was not found: buttons found #{@ehmp.btn_all}"
    end
  rescue Exception => e
    p "*** Entered Rescue block : POB add order detail modal has buttons ***"
    max_attempt-=1
    raise e if max_attempt <= 0
    retry if max_attempt > 0
  end
end

Then(/^POB add order detail modal has buttons Delete, Draft and Cancel$/) do
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_for_btn_delete
  @ehmp.wait_for_btn_draft
  @ehmp.wait_for_btn_cancel

  expect(@ehmp).to have_btn_delete
  expect(@ehmp).to have_btn_draft
  expect(@ehmp).to have_btn_cancel
end

Then(/^POB add order detail modal has button "(.*?)"$/) do |accept_btn|
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_btn_accept_add_visible
  expect(@ehmp.btn_accept_add.text.upcase).to have_text(accept_btn.upcase)
end

Then(/^POB user orders "(.*?)" lab test$/) do |lab_test|
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_fld_available_lab_test_drop_down_visible
  expect(@ehmp).to have_fld_available_lab_test_drop_down
  @ehmp.fld_available_lab_test_drop_down.click
  @ehmp.wait_until_fld_available_lab_test_input_box_visible
  @ehmp.fld_available_lab_test_input_box.set lab_test
  @ehmp.fld_available_lab_test_input_box.native.send_keys(:enter)
  wait = Selenium::WebDriver::Wait.new(:timeout => 15)
  wait.until { @ehmp.ddl_urgency.disabled? != true }  
  expect(@ehmp.ddl_urgency.text.upcase).to have_text("Routine".upcase)
end

Then(/^POB user accepts the order$/) do
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_btn_toggle_visible
  expect(@ehmp).to have_btn_toggle
  @ehmp.btn_toggle.click
  @ehmp.wait_for_btn_accept
  @ehmp.wait_until_btn_accept_visible
  expect(@ehmp).to have_btn_accept
  @ehmp.btn_accept.click
  PobCommonElements.new.wait_until_fld_tray_loader_message_visible
  PobCommonElements.new.wait_until_fld_tray_loader_message_invisible(30)
  max_attempt = 4
  begin
    @ehmp.wait_for_btn_accept_duplicate(2)
    if @ehmp.has_btn_accept_duplicate?
      p "*** order is a duplicate order ***"
      @ehmp.btn_accept_duplicate.click
      @ehmp.wait_until_btn_accept_duplicate_invisible
    end
  rescue Exception => e
    max_attempt-=1
    raise e if max_attempt <= 0
    retry if max_attempt > 0
  end
  
  verify_and_close_growl_alert_pop_up("SUCCESS LAB ORDER SUBMITTED")
end

Then(/^POB user navigates to orders expanded view$/) do
  @ehmp = PobOrdersApplet.new
  begin
    @ehmp.load_and_wait_for_screenname
    expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Orders".upcase)
  rescue Exception => e
    p "Exception waiting for screenname: #{e}, try to continue"
  end
  @ehmp.wait_until_applet_loaded
end

Then(/^POB user opens the detail view of the order "([^"]*)" with status "([^"]*)"$/) do |order_name, order_status|
  ehmp = PobOrdersApplet.new
  order_rows = ehmp.tbl_orders_grid
  attempt_to_open_detail_view = false
  order_rows.each do |order_row|
    # p "checking row: #{order_row.text}"
    if order_row.text.upcase.include?(order_name.upcase && order_status.upcase)
      # p "row clicked #{order_name.upcase}, #{order_status.upcase}"
      attempt_to_open_detail_view = true
      order_row.click
      break
    end
  end
  expect(attempt_to_open_detail_view).to eq(true), "Did not find order #{order_name.upcase}, #{order_status.upcase}"
  common_elements = PobCommonElements.new
  common_elements.wait_until_fld_modal_body_visible
  common_elements.wait_until_fld_modal_body_visible 30, :text => "Order:"
end

Then(/^POB user signs the order as "(.*?)"$/) do |signature_code|
  @ehmp = PobOrdersApplet.new 
  @ehmp.wait_until_btn_sign_from_modal_visible
  expect(@ehmp).to have_btn_sign_from_modal
  @ehmp.btn_sign_from_modal.click
  @commom_element = PobCommonElements.new
  @commom_element.wait_for_fld_modal_body
  @commom_element.wait_until_fld_modal_body_visible
  @ehmp.wait_until_btn_sign_order_visible
  if @ehmp.has_fld_override_reason?
    @ehmp.fld_override_reason.set "Testing"
    @ehmp.fld_override_reason.native.send_keys(:enter)
  end
  expect(@ehmp.wait_for_fld_signature_code(15)).to eq(true)
  max_attempt = 2
  begin
    @ehmp.fld_signature_code.click

    @ehmp.fld_signature_code.set signature_code
    expect(@ehmp.fld_signature_code.value).to eq(signature_code)
  rescue Exception => e
    p "Attempt to enter signature #{max_attempt}: #{e}"
    max_attempt -= 1
    raise e if max_attempt < 0
    @ehmp.fld_signature_code.click
    @ehmp.fld_signature_code.native.send_keys [:end]
    @ehmp.fld_signature_code.native.send_keys [:shift, :home], :backspace
    retry
  end

  @ehmp.fld_signature_code.native.send_keys(:enter)
  @ehmp.wait_until_btn_sign_order_visible
  expect(@ehmp).to have_btn_sign_order
  @ehmp.btn_sign_order.click  
  verify_and_close_growl_alert_pop_up("Lab Order Signed")
end

Then(/^POB user verifies order status changes to "([^"]*)" for the order "([^"]*)"$/) do |order_status, order_name|
  ehmp = PobOrdersApplet.new 
  order_rows = ehmp.tbl_orders_grid
  order_rows.each do |order_row|
    if order_row.text.upcase.include?(order_name.upcase && order_status.upcase)
      expect(order_row.text.upcase).to have_text(order_status.upcase)
      break
    end
  end
end

Then(/^POB user discontinues the order$/) do
  @ehmp = PobOrdersApplet.new 
  @ehmp.wait_until_btn_discontinue_order_from_modal_visible
  expect(@ehmp).to have_btn_discontinue_order_from_modal
  @ehmp.btn_discontinue_order_from_modal.click
  expect(@ehmp.wait_for_fld_discontinue_reason).to eq(true), "Could not find/see fld_discontinue_reason"
  @ehmp.fld_discontinue_reason.select "Entered in error"
  @ehmp.wait_until_btn_discontinue_order_visible
  expect(@ehmp).to have_btn_discontinue_order
  @ehmp.btn_discontinue_order.click 
  verify_and_close_growl_alert_pop_up("Lab Order Discontinued") 
end

Then(/^POB user cancels the order$/) do
  @ehmp = PobOrdersApplet.new 
  @ehmp.wait_until_btn_discontinue_order_from_modal_visible
  expect(@ehmp).to have_btn_discontinue_order_from_modal
  @ehmp.btn_discontinue_order_from_modal.click
  @ehmp.wait_until_fld_modal_body_visible
  @ehmp.wait_until_btn_discontinue_order_visible
  expect(@ehmp).to have_btn_discontinue_order
  @ehmp.btn_discontinue_order.click 
  verify_and_close_growl_alert_pop_up("Lab Order Cancelled") 
end

Then(/^POB user saves the order$/) do
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_btn_save_visible
  expect(@ehmp).to have_btn_save
  @ehmp.btn_save.click
end

Then(/^POB user verifies the above "([^"]*)" order is saved in the action tray panel$/) do |order_name|
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_fld_action_tray_panel_visible
  verify_and_close_growl_alert_pop_up("SUCCESS LABORATORY DRAFT ORDER SUCCESFULLY SAVED") 
  expect(@ehmp.fld_action_tray_panel.text.downcase.include? "#{order_name}".downcase.strip).to eq(true), "the value '#{order_name}' is not present"
end

Then(/^POB new order "([^"]*)" is added to the note objects$/) do |new_order|
  @ehmp = PobNotes.new
  #@ehmp.btn_view_note_object
  @ehmp.wait_until_fld_note_objects_visible
  @ehmp.wait_until_btn_view_note_object_visible
  expect(@ehmp.fld_note_objects.text.downcase.include? "#{new_order}".downcase.strip).to eq(true), "the value '#{new_order}' is not present"
end






