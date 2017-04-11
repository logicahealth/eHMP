When(/^POB the user clicks the Orders Expand Button$/) do
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_btn_expand_orders_visible
  expect(@ehmp).to have_btn_expand_orders
  @ehmp.btn_expand_orders.click
end

And(/^POB "(.*?)" applet loaded successfully$/) do |applet_id|
  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_tbl_orders_data_row_loaded_visible(DefaultTiming.default_table_row_load_time)
  expect(@ehmp).to have_tbl_orders_data_row_loaded
  VerifyTableValue.check_all_data_loaded(applet_id)
end

And(/^the Order Date Column Header exist$/) do
  @ehmp = PobOrdersApplet.new
  expect(@ehmp.btn_orders_date.text.upcase.split("P")[0].strip).to eq("Order Date".upcase)
end

And(/^the Orders Results are not sorted in reverse chronological or chronological order$/) do
  expect(@ehmp.tbl_order_date_header[:class]).not_to include 'descending'
  expect(@ehmp.tbl_order_date_header[:class]).not_to include 'ascending'
end

When(/^the user clicks on the Order Date Column Header$/) do
  @ehmp = PobOrdersApplet.new
  @ehmp.btn_orders_date.click
end

Then(/^the Orders Results are sorted in reverse chronological order$/) do
  @ehmp = PobOrdersApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { @ehmp.tbl_order_date_header[:class].include? 'descending' }
  expect(@ehmp.tbl_order_date_header[:class]).to include 'descending'
  expect(VerifyTableValue.verify_date_only_sort_selectable('data-grid-orders', 1, true)).to be_true
end

Then(/^the Orders Results are sorted in the chronological order$/) do
  @ehmp = PobOrdersApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { @ehmp.tbl_order_date_header[:class].include? 'ascending' }
  expect(@ehmp.tbl_order_date_header[:class]).to include 'ascending'
  expect(VerifyTableValue.verify_date_only_sort_selectable('data-grid-orders', 1, false)).to be_true
end
