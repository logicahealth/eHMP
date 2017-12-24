#require_relative '../pageobject_dir/appdocs_assignto.rb'
class DocumentationActions  
  extend ::RSpec::Matchers
  def self.navigate_and_verify
    doc_page = AppDocumentationHomePage.new
    wait = Selenium::WebDriver::Wait.new(:timeout => 5)
    doc_page.load

    expect(doc_page.frame.wait_for_header).to eq(true), "Header did not display"
    expect(doc_page.frame.wait_for_footer).to eq(true), "Footer did not display"
    expect(doc_page.wait_for_component_tree).to eq(true), 'Component tree did not display'
    wait.until { doc_page.components.length > 0 }
    true
  end
end

After('@documentation') do | scenario |

  if scenario.failed?
    temp_location = "#{scenario.location}_beforenav"
    screenshot_name = "#{temp_location}".gsub! ':', '_'
    take_screenshot screenshot_name
  end
  step 'Navigate to Staff View screen ignore errors'
end

When(/^user navigates to documentation home page$/) do
  expect(DocumentationActions.navigate_and_verify).to eq(true)
end

Given(/^user has navigated to the documentation home page$/) do
  expect(DocumentationActions.navigate_and_verify).to eq(true)
end

Then(/^the documentation home page displays a title "([^"]*)"$/) do |title|
  doc_page = AppDocumentationHomePage.new
  expect(doc_page).to have_frame
  expect(doc_page.frame).to have_headline
  expect(doc_page.frame.headline.text.upcase).to eq(title.upcase)
end

Then(/^the documentation home page displays a link for eHMP UI and developer guide$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_ehmpui_link
  doc_page.wait_for_ehmpui_developer_guide

  expect(doc_page).to have_ehmpui_link
  expect(doc_page.ehmpui_link.text.downcase).to eq("ehmp ui")
  expect(doc_page).to have_ehmpui_developer_guide
  expect(doc_page.ehmpui_developer_guide.text.downcase).to eq(doc_page.developer_guide_text)
end

Then(/^the documentation home page displays a link for ADK and developer guide$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_adk_link
  doc_page.wait_for_adk_developer_guide

  expect(doc_page).to have_adk_link
  expect(doc_page.adk_link.text.downcase).to eq("adk")
  expect(doc_page).to have_adk_developer_guide
  expect(doc_page.adk_developer_guide.text.downcase).to eq(doc_page.developer_guide_text)
end

Then(/^the documentation home page displays a link for RDK and developer guide$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_rdk_link
  doc_page.wait_for_rdk_developer_guide

  expect(doc_page).to have_rdk_link
  expect(doc_page.rdk_link.text.downcase).to eq("rdk")
  expect(doc_page).to have_rdk_developer_guide
  expect(doc_page.rdk_developer_guide.text.downcase).to eq(doc_page.developer_guide_text)
end

Then(/^the documentation home page displays a link for Fetch UI and api documentation guide$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_fetch_link
  doc_page.wait_for_fetch_api_doc

  expect(doc_page).to have_fetch_link
  expect(doc_page.fetch_link.text.downcase).to eq("fetch")
  expect(doc_page).to have_fetch_api_doc
  expect(doc_page.fetch_api_doc.text.downcase).to eq(doc_page.api_documentation_text)
end

Then(/^the documentation home page displays a link for Write Back and api documentation guide$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_writeback_link
  doc_page.wait_for_writeback_api_doc

  expect(doc_page).to have_writeback_link
  expect(doc_page.writeback_link.text.downcase).to eq("write back")
  expect(doc_page).to have_writeback_api_doc
  expect(doc_page.writeback_api_doc.text.downcase).to eq(doc_page.api_documentation_text)
end

Then(/^the documentation home page displays a link for Pick List and api documentation guide$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_picklist_link
  doc_page.wait_for_picklist_api_doc

  expect(doc_page).to have_picklist_link
  expect(doc_page.picklist_link.text.downcase).to eq("pick list")
  expect(doc_page).to have_picklist_api_doc
  expect(doc_page.picklist_api_doc.text.downcase).to eq(doc_page.api_documentation_text)
end

Then(/^the documentation home page displays a link for JDS and api documentation guide$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_jds_link
  doc_page.wait_for_jds_api_doc

  expect(doc_page).to have_jds_link
  expect(doc_page.jds_link.text.downcase).to eq("jds")
  expect(doc_page).to have_jds_api_doc
  expect(doc_page.jds_api_doc.text.downcase).to eq(doc_page.api_documentation_text)
end

When(/^the user selects the eHMP UI link$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_ehmpui_link

  expect(doc_page).to have_ehmpui_link
  doc_page.ehmpui_link.click
end

Then(/^the ui applets page is displayed$/) do
  applets_doc = AppDocumentationApplets.new

  applets_doc.wait_for_frame
  expect(applets_doc).to be_displayed, "#{applets_doc.current_url}"
  expect(applets_doc).to have_frame, "Expected page to display header, footer, page body"
  expect(applets_doc.frame).to have_header
  expect(applets_doc.frame).to have_headline
  expect(applets_doc.frame.headline.text.upcase).to eq("EHMP'S USER INTERFACE (EHMP-UI)")

  expect(applets_doc.frame.wait_for_page_description).to eq(true), "Page description did not load"
end

When(/^the user selects the eHMP UI developer guide$/) do
  doc_page = AppDocumentationHomePage.new

  doc_page.wait_for_ehmpui_developer_guide
  expect(doc_page).to have_ehmpui_developer_guide
  doc_page.ehmpui_developer_guide.click
end

When(/^the user selects the ADK link$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_adk_link

  expect(doc_page).to have_adk_link
  doc_page.adk_link.click
end

Then(/^the ADK page is displayed$/) do
  adk_doc = AppDocumentationADK.new
  expect(adk_doc).to be_displayed, "#{adk_doc.current_url}"
  adk_doc.wait_for_frame
  expect(adk_doc).to have_frame, "Expected page to display header, footer, page body"
  expect(adk_doc.frame).to have_header
  expect(adk_doc.frame).to have_headline
  expect(adk_doc.frame.headline.text.upcase).to eq("APPLICATION DEVELOPMENT KIT (ADK)")
  expect(adk_doc.frame.wait_for_page_description).to eq(true), "Page description did not load"
end

When(/^the user selects the AKD developer guide$/) do
  doc_page = AppDocumentationHomePage.new

  doc_page.wait_for_adk_developer_guide
  expect(doc_page).to have_adk_developer_guide
  doc_page.adk_developer_guide.click
end

When(/^the user selects the RDK link$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_rdk_link

  expect(doc_page).to have_rdk_link
  doc_page.rdk_link.click
end

Then(/^the RDK page is displayed$/) do
  rdk_doc = AppDocumentationRDK.new
  expect(rdk_doc).to be_displayed, "#{rdk_doc.current_url}"
  rdk_doc.wait_for_frame
  expect(rdk_doc).to have_frame, "Expected page to display header, footer, page body"
  expect(rdk_doc.frame).to have_header
  expect(rdk_doc.frame).to have_headline
  expect(rdk_doc.frame.headline.text.upcase).to eq("EHMP RESOURCE DEVELOPMENT KIT (RDK)")
  expect(rdk_doc.frame.wait_for_page_description).to eq(true), "Page description did not load"
end

When(/^the user selects the RDK developer guide$/) do
  doc_page = AppDocumentationHomePage.new

  doc_page.wait_for_rdk_developer_guide
  expect(doc_page).to have_rdk_developer_guide
  doc_page.rdk_developer_guide.click
end

When(/^the user selects the Fetch link$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_fetch_link

  expect(doc_page).to have_fetch_link
  doc_page.fetch_link.click
end

Then(/^the Fetch page is displayed$/) do
  fetch_page = AppDocumentationFetch.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  expect(fetch_page).to be_displayed, "#{fetch_page.current_url}"
  expect(fetch_page.wait_for_title).to eq(true), "Expected title to display"

  expect(fetch_page.title.text.upcase).to eq("VISTA EXCHANGE API (VX-API)")
  wait.until { fetch_page.navigation.length > 0 }
end

When(/^the user selects the Fetch API documentation$/) do
  doc_page = AppDocumentationHomePage.new

  doc_page.wait_for_fetch_api_doc
  expect(doc_page).to have_fetch_api_doc
  doc_page.fetch_api_doc.click
end

When(/^the user selects the Write Back link$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_writeback_link

  expect(doc_page).to have_writeback_link
  doc_page.writeback_link.click
end

Then(/^the Write Back page is displayed$/) do
  writeback_page = AppDocumentationWriteback.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  expect(writeback_page).to be_displayed, "#{writeback_page.current_url}"
  expect(writeback_page.wait_for_title).to eq(true), "Expected title to display"

  expect(writeback_page.title.text.upcase).to eq("VISTA EXCHANGE API (VX-API)")
  wait.until { writeback_page.navigation.length > 0 }
end

When(/^the user selects the Write Back API documentation$/) do
  doc_page = AppDocumentationHomePage.new

  doc_page.wait_for_writeback_api_doc
  expect(doc_page).to have_writeback_api_doc
  doc_page.writeback_api_doc.click
end

When(/^the user selects the Pick List link$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_picklist_link

  expect(doc_page).to have_picklist_link
  doc_page.picklist_link.click
end

Then(/^the Pick List page is displayed$/) do
  picklist_page = AppDocumentationPicklist.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  expect(picklist_page).to be_displayed, "#{picklist_page.current_url}"
  expect(picklist_page.wait_for_title).to eq(true), "Expected title to display"

  expect(picklist_page.title.text.upcase).to eq("VISTA EXCHANGE API (VX-API)")
  wait.until { picklist_page.navigation.length > 0 }
end

When(/^the user selects the Pick List API documentation$/) do
  doc_page = AppDocumentationHomePage.new

  doc_page.wait_for_picklist_api_doc
  expect(doc_page).to have_picklist_api_doc
  doc_page.picklist_api_doc.click
end

When(/^the user selects the JDS link$/) do
  doc_page = AppDocumentationHomePage.new
  doc_page.wait_for_jds_link

  expect(doc_page).to have_jds_link
  doc_page.jds_link.click
end

Then(/^the JDS page is displayed$/) do
  jds_page = AppDocumentationJds.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  expect(jds_page).to be_displayed, "#{jds_page.current_url}"
  expect(jds_page.wait_for_title).to eq(true), "Expected title to display"

  expect(jds_page.title.text.upcase).to eq("API DOCUMENTATION")
  wait.until { jds_page.navigation.length > 0 }
end

When(/^the user selects the JDS API documentation$/) do
  doc_page = AppDocumentationHomePage.new

  doc_page.wait_for_jds_api_doc
  expect(doc_page).to have_jds_api_doc
  doc_page.jds_api_doc.click
end

Then(/^the ui applets page has nav bar links$/) do |table|
  ui_page = AppDocumentationApplets.new
  ui_page.wait_for_nav_links
  expect(ui_page.nav_links.length).to be > 0
  nav_link_text = ui_page.nav_links.map { |element| element.text.upcase }
  table.rows.each do | header_text |
    expect(nav_link_text).to include header_text[0].upcase
  end
end

When(/^the user expands Extensions$/) do
  page = AppDocumentationAssignTo.new
  page.wait_for_nav_extensions
  expect(page).to have_nav_extensions
  page.nav_extensions.click
  page.wait_for_extensions
  expect(page).to have_extensions
end

When(/^the user expands Extensions\-UI$/) do
  page = AppDocumentationAssignTo.new
  expect(page).to have_extensions
  expect(page.extensions).to have_ui_tree_item
  page.extensions.ui_tree_item.click
end

When(/^the user expands Extensions\-Form$/) do
  page = AppDocumentationAssignTo.new
  expect(page).to have_extensions
  page.extensions.wait_for_form_tree_item
  expect(page.extensions).to have_form_tree_item
  page.extensions.form_tree_item.click
end

When(/^the user expands Extensions\-Controls$/) do
  page = AppDocumentationAssignTo.new
  expect(page).to have_extensions
  page.extensions.wait_for_controls_tree_item
  expect(page.extensions).to have_controls_tree_item
  page.extensions.controls_tree_item.click
end

When(/^the user selects Extensions\-Assign to$/) do
  page = AppDocumentationAssignTo.new
  expect(page).to have_extensions
  page.extensions.wait_for_assignto_tree_item
  expect(page.extensions).to have_assignto_tree_item
  page.extensions.assignto_tree_item.click
end

Then(/^the assign to form control extension page is displayed$/) do
  page = AppDocumentationAssignTo.new
  page.wait_for_page_description
  expect(page).to have_page_description
  expect(page).to have_toc
end

Then(/^the table of contents displays$/) do |table|
  page = AppDocumentationAssignTo.new
  page.wait_for_toc_options
  expect(page.toc_options.length).to be > 0
  toc_text = page.toc_options.map { |element| element.text.upcase }
  table.rows.each do | expected_entry |
    expect(toc_text).to include expected_entry[0].upcase
  end
end

When(/^user navigates to assign to documentation page$/) do
  page = AppDocumentationAssignTo.new
  page.load
  expect(page).to be_displayed
  expect(page.frame.wait_for_header).to eq(true), "Header did not display"
  expect(page.frame.wait_for_footer).to eq(true), "Footer did not display"
end
