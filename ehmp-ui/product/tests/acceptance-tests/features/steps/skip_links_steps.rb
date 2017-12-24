When(/^the user access the skip links menu through keyboard interaction$/) do
  page = PobPatientSearch.new
  expect(page).to have_skip_link_menu

  header = PobHeaderFooter.new
  expect(header.wait_for_btn_patients). to eq(true), "Recent patient button is not visible"

  header.btn_patients.native.send_keys [:shift, :tab]

  wait_until { TestSupport.driver.switch_to.active_element == page.skip_link_menu.btn_trigger_menu.native }
  page.skip_link_menu.wait_until_btn_trigger_menu_visible
end

Then(/^the home page skip links menu displays$/) do
  page = PobPatientSearch.new
  page.skip_link_menu.wait_for_btn_trigger_menu
  expect(page.skip_link_menu).to have_btn_trigger_menu
  page.skip_link_menu.btn_trigger_menu.native.send_keys :enter
  wait_until { page.skip_link_menu.menu_options.length > 0 }
end

Then(/^the skip links menu displays options$/) do |table|
  page = PobPatientSearch.new
  expect(page.skip_link_menu.menu_options.length).to be > 0
  menu_text = page.skip_link_menu.menu_options.map { |element| element.text.upcase }
  table.rows.each do | text |
    expect(menu_text).to include text[0].upcase
  end
end

When(/^the user access the patient screen skip links menu through keyboard interaction$/) do
  page = PobSummaryScreen.new
  expect(page).to have_skip_link_menu

  header = PobHeaderFooter.new

  header.link_nav_home.native.send_keys [:shift, :tab]
  wait_until { TestSupport.driver.switch_to.active_element == page.skip_link_menu.btn_trigger_menu.native }

  page.skip_link_menu.wait_until_btn_trigger_menu_visible
end

Then(/^the patient screen skip links menu displays$/) do
  page = PobSummaryScreen.new
  page.skip_link_menu.wait_for_btn_trigger_menu
  expect(page.skip_link_menu).to have_btn_trigger_menu
  page.skip_link_menu.btn_trigger_menu.native.send_keys :enter
  wait_until { page.skip_link_menu.menu_options.length > 0 }
end

Then(/^the patient screen skip links menu displays options$/) do |table|
  page = PobSummaryScreen.new
  expect(page.skip_link_menu.menu_options.length).to be > 0
  menu_text = page.skip_link_menu.menu_options.map { |element| element.text.upcase }
  table.rows.each do | text |
    expect(menu_text).to include text[0].upcase
  end
end

Then(/^the header displays a staff home button$/) do
  page = PobHeaderFooter.new
  expect(page.wait_for_link_nav_home).to eq(true)
  expect(page).to have_link_nav_home
end
