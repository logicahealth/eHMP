Then(/^POB user adds a new order$/) do
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_btn_add_orders_visible
  expect(@ehmp).to have_btn_add_orders
  @ehmp.btn_add_orders.click
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
    table.rows.each do |heading|
      expect(object_exists_in_list(@ehmp.fld_order_modal_labels, "#{heading[0]}")).to eq(true), "Field '#{heading[0]}' was not found"
    end
  rescue
    max_attempt-=1
    retry if max_attempt > 0
  end
end

Then(/^POB add order detail modal displays preview labels$/) do |table|
  @ehmp = PobOrdersApplet.new
  max_attempt = 4
  begin
    @ehmp.wait_until_fld_order_preview_labels_visible
    table.rows.each do |heading|
      expect(object_exists_in_list(@ehmp.fld_order_preview_labels, "#{heading[0]}")).to eq(true), "Field '#{heading[0]}' was not found"
    end
  rescue
    max_attempt-=1
    retry if max_attempt > 0
  end
end

Then(/^POB add order detail modal has buttons$/) do |table|
  @ehmp = PobOrdersApplet.new
  max_attempt = 4
  begin
    @ehmp.wait_until_btn_all_visible
    table.rows.each do |heading|
      expect(object_exists_in_list(@ehmp.btn_all, "#{heading[0]}")).to eq(true), "Field '#{heading[0]}' was not found"
    end
  rescue
    max_attempt-=1
    retry if max_attempt > 0
  end
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
end

Then(/^POB user validates the order to be "(.*?)"$/) do |lab_test|
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_for_fld_collection_type
  @ehmp.wait_until_fld_collection_type_visible
  expect(@ehmp.fld_collection_type).to have_text("Send Patient to Lab")
  @ehmp.wait_for_fld_order_preview_labels
  max_attempt = 4
  begin
    @ehmp.wait_until_fld_order_preview_labels_visible
    expect(object_exists_in_list(@ehmp.fld_order_preview_labels, lab_test)).to eq(true)
  rescue
    max_attempt-=1
    retry if max_attempt > 0
  end
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
  @ehmp.wait_until_btn_accept_add_visible
  expect(@ehmp).to have_btn_accept_add
  @ehmp.btn_accept_add.click
  @ehmp.wait_until_fld_in_progress_visible
  @ehmp.wait_until_fld_in_progress_invisible
  max_attempt = 4
  begin
    if @ehmp.has_btn_accept_duplicate?
      @ehmp.btn_accept_duplicate.click
    end
  rescue
    max_attempt-=1
    retry if max_attempt > 0
  end
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_fld_growl_alert_visible 30, :text => "Lab Order Submitted"
  
  wait_for_growl_alert_to_disappear
end

When(/^POB user expands orders applet$/) do
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_btn_expand_orders_visible
  expect(@ehmp).to have_btn_expand_orders
  @ehmp.btn_expand_orders.click 
end

When(/^POB user verifies the above "(.*?)" order is added to patient record$/) do |order_name|
  @ehmp = PobOrdersApplet.new 
  page.driver.browser.manage.window.resize_to(1280, 1280)
  @ehmp.wait_until_tbl_orders_grid_visible 
  @ehmp.wait_until_btn_order_24hr_range_visible
  expect(@ehmp).to have_btn_order_24hr_range
  @ehmp.btn_order_24hr_range.click
  @ehmp.wait_until_tbl_orders_grid_visible 
  @ehmp.wait_until_tbl_orders_first_row_status_visible
  expect(@ehmp.tbl_orders_first_row_status).to have_text("UNRELEASED")
  @ehmp.wait_until_tbl_orders_first_row_order_visible
  expect(@ehmp.tbl_orders_first_row_order).to have_text(order_name.upcase)  
end

When(/^POB user navigates to orders expanded view$/) do
  navigate_in_ehmp "#orders-full"
end

When(/^user verifies that the first row contains the order "(.*?)" with status "(.*?)"$/) do |order_name, status|
  @ehmp = PobOrdersApplet.new
  page.driver.browser.manage.window.resize_to(1280, 1280)
  @ehmp.wait_until_tbl_orders_grid_visible 
  @ehmp.wait_until_tbl_orders_first_row_status_visible
  expect(@ehmp.tbl_orders_first_row_status).to have_text(status)
  @ehmp.wait_until_tbl_orders_first_row_order_visible
  expect(@ehmp.tbl_orders_first_row_order).to have_text(order_name.upcase)  
end

Then(/^POB user opens the detail view of the order "(.*?)"$/) do |order_name|
  @ehmp = PobOrdersApplet.new 
  @ehmp.wait_until_tbl_orders_first_row_visible 
  expect(@ehmp).to have_tbl_orders_first_row
  @ehmp.tbl_orders_first_row.click
  @common_elements = PobCommonElements.new
  @common_elements.wait_until_fld_modal_body_visible
  @common_elements.wait_until_fld_modal_body_visible 30, :text => "Order:"
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
  @ehmp.wait_until_fld_signature_code_visible
  @ehmp.fld_signature_code.set signature_code
  @ehmp.fld_signature_code.native.send_keys(:enter)
  @ehmp.wait_until_btn_sign_order_visible
  expect(@ehmp).to have_btn_sign_order
  @ehmp.btn_sign_order.click  
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_fld_growl_alert_visible 30, :text => "Lab Order Signed"
  wait_for_growl_alert_to_disappear
end

Then(/^POB user verifies order status changes to "(.*?)"$/) do |order_status|
  @ehmp = PobOrdersApplet.new 
  @ehmp.wait_until_tbl_orders_first_row_status_visible
  expect(@ehmp.tbl_orders_first_row_status).to have_text(order_status)
end

Then(/^POB user discontinues the order$/) do
  @ehmp = PobOrdersApplet.new 
  @ehmp.wait_until_btn_discontinue_order_from_modal_visible
  expect(@ehmp).to have_btn_discontinue_order_from_modal
  @ehmp.btn_discontinue_order_from_modal.click
  @ehmp.wait_until_fld_discontinue_reason_visible
  @ehmp.fld_discontinue_reason.select "Entered in error"
  @ehmp.wait_until_btn_discontinue_order_visible
  expect(@ehmp).to have_btn_discontinue_order
  @ehmp.btn_discontinue_order.click  
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_fld_growl_alert_visible 30, :text => "Lab Order Discontinued"
  wait_for_growl_alert_to_disappear  
end






