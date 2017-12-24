Given(/^workspace "(.*?)" is listed$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  predefined_screen_ids = @ehmp.predefined_screens_ids
  p predefined_screen_ids
  expect(predefined_screen_ids).to include(workspace_id)
end

When(/^user clones the "(.*?)" workspace$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  wait_for = Time.now + 10 # sec
  begin
    num_udw = @ehmp.fld_userdefined_screens.length
    expect(@ehmp.clone_workspace(workspace_id)).to eq(true)
    wait_for_jquery_to_return
    expect(@ehmp.fld_userdefined_screens.length).to eq(num_udw + 1), "Expected number of udw to increase"
  rescue => e
    raise e if Time.now > wait_for
    p 'DE8535: retry'
    retry 
  end
end

When(/^the user filters the workspace manager on term "(.*?)"$/) do |title|
  @ehmp = PobWorkspaceManager.new

  @ehmp.toggle_filter_open
  expect(@ehmp.has_fld_filter_screens?).to eq(true)
  screen_count = @ehmp.fld_all_screens.length
  @ehmp.fld_filter_screens.set title
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { screen_count != @ehmp.fld_all_screens.length }
end

Then(/^the workspace manager only displays workspaces with term "(.*?)"$/) do |term|
  @ehmp = PobWorkspaceManager.new
  all_titles = @ehmp.all_titles
  expect(all_titles.length).to be > 0
  all_titles.each do | title |
    expect(title).to include(term)
  end
end

Then(/^the workspace manager only displays workspaces with description "(.*?)"$/) do |term|
  @ehmp = PobWorkspaceManager.new
  all_descriptions = @ehmp.all_descriptions
  expect(all_descriptions.length).to be > 0
  all_descriptions.each do | desc |
    expect(desc).to include(term)
  end
end

When(/^the user sets the description of udw "(.*?)" to "(.*?)"$/) do |udw_id, udw_desc|
  page = PobWorkspaceManager.new
  page.add_user_defined_workspace_elements udw_id
  expect(page).to have_input_desc
  page.input_desc.native.send_keys [:shift, :home], :backspace
  page.input_desc.native.send_keys udw_desc
  page.input_desc.native.send_keys :tab
  wait_for_screen_clear
end

When(/^the user customizes the "(.*?)" workspace$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  # take_screenshot("before_customize")
  expect(@ehmp.customize_workspace(workspace_id)).to eq(true)
  # take_screenshot("customize_workspace")
  @ehmp = WorkspaceEditor.new

  WorkspaceActions.workspace_editor_displayed

  # @ehmp.wait_for_btn_accept
  # @ehmp.wait_for_fld_applet_carousel
  # @ehmp.wait_for_fld_visual_boundary

  # expect(@ehmp).to have_btn_accept
  # expect(@ehmp).to have_fld_applet_carousel
  # expect(@ehmp).to have_fld_visual_boundary

  # @ehmp.wait_until_btn_accept_visible
  # @ehmp.wait_until_fld_applet_carousel_visible
  # @ehmp.wait_until_fld_visual_boundary_visible

  unless @ehmp.fld_applets_in_current_view.length == 0
    p "Expected clean slate, but this workspace has #{@ehmp.fld_applets_in_current_view.length} applets on it"
    @ehmp.wait_until_fld_applets_in_current_view_visible(30)
    applets = @ehmp.fld_applets_in_current_view
    applets.each do | applet |
      id = applet['data-instanceid'].split('-')[1]
      remove_applet_from_current_view id
    end
    expect(@ehmp.fld_applets_in_current_view.length).to eq(0)
  end
end

Then(/^the applet "(.*?)" Allergies Trend applet is displayed$/) do |id|
  @ehmp = UserDefinedWorkspace.new
  @ehmp.applet_built_from(id, 'allergy_grid')
  expect(@ehmp.has_temp_applet_div?).to eq(true), "Expected applet-#{id} be visible"
  expect(@ehmp.temp_applet_div['data-view-type']).to eq('gist'), "Expected applet-#{id} to be of data-view-type=gist"
  expect(@ehmp.has_temp_applet?).to eq(true), "Expected applet-#{id} to be applet type 'allergy_grid'"
end

Then(/^the applet "(.*?)" Military History Summary applet is displayed$/) do |id|
  @ehmp = UserDefinedWorkspace.new
  @ehmp.applet_built_from(id, 'military_hist')
  expect(@ehmp.has_temp_applet_div?).to eq(true), "Expected applet-#{id} be visible"
  expect(@ehmp.temp_applet_div['data-view-type']).to eq('summary'), "Expected applet-#{id} to be of data-view-type=summary"
  expect(@ehmp.has_temp_applet?).to eq(true), "Expected applet-#{id} to be applet type 'allergy_grid'"
end

Then(/^the applet "(.*?)" Allergies summary applet is displayed$/) do |id|
  @ehmp = UserDefinedWorkspace.new
  @ehmp.applet_built_from(id, 'allergy_grid')
  expect(@ehmp.has_temp_applet_div?).to eq(true), "Expected applet-#{id} be visible"
  expect(@ehmp.temp_applet_div['data-view-type']).to eq('summary'), "Expected applet-#{id} to be of data-view-type=summary"
  expect(@ehmp.has_temp_applet?).to eq(true), "Expected applet-#{id} to be applet type 'allergy_grid'"
end

Then(/^the applet "(.*?)" Allergies expanded applet is displayed$/) do |id|
  @ehmp = UserDefinedWorkspace.new
  @ehmp.applet_built_from(id, 'allergy_grid')
  expect(@ehmp.has_temp_applet_div?).to eq(true), "Expected applet-#{id} be visible"
  expect(@ehmp.temp_applet_div['data-view-type']).to eq('expanded'), "Expected applet-#{id} to be of data-view-type=expanded"
  expect(@ehmp.has_temp_applet?).to eq(true), "Expected applet-#{id} to be applet type 'allergy_grid'"
end

When(/^the user edits the user defined workspace$/) do
  @ehmp = UserDefinedWorkspace.new
  expect(@ehmp.wait_for_menu).to eq(true)
  expect(@ehmp.menu.wait_for_btn_cog_wheel).to eq(true)
  @ehmp.menu.btn_cog_wheel.click

  @ehmp.menu.wait_for_btn_workspace_editor_option
  expect(@ehmp.menu).to have_btn_workspace_editor_option
  @ehmp.menu.btn_workspace_editor_option.click

  @ehmp = WorkspaceEditor.new
  @ehmp.wait_until_btn_accept_visible
  @ehmp.wait_until_fld_applet_carousel_visible

end

When(/^the user changes applet "(.*?)" to a Summary View$/) do |id|

  @ehmp = WorkspaceEditor.new
  @ehmp.edit_applet_element(id)
  expect(@ehmp.has_edit_applet?).to eq(true)
  @ehmp.edit_applet.click

  @ehmp.wait_for_btn_add_summary_view
  expect(@ehmp).to have_btn_add_summary_view
  @ehmp.btn_add_summary_view.click
end

When(/^the user filters the applet carousel on text "(.*?)"$/) do |text|
  @ehmp = WorkspaceEditor.new
  num_applets_in_carousel = @ehmp.fld_applets_in_carousel.length
  @ehmp.btn_filter_carousel.click unless @ehmp.has_fld_search_applets?
  @ehmp.wait_until_fld_search_applets_visible
  @ehmp.fld_search_applets.set text
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_applets_in_carousel.length != num_applets_in_carousel }
end

Then(/^the carousel only displays applets including text "(.*?)"$/) do |text|
  applets_in_carousel = @ehmp.fld_applet_titles_in_carousel
  applets_in_carousel.each do | applet |
    expect(applet.text.downcase).to include(text.downcase)
  end
end

Then(/^the applet carousel applets are displayed in alphabetical order$/) do
  @ehmp = WorkspaceEditor.new unless @ehmp.is_a? WorkspaceEditor
  applets = @ehmp.fld_applet_titles_in_carousel
  expect(applets.length).to be > 0

  higher = applets[0].text.downcase
  (1..applets.length-1).each do |i|
    lower = applets[i].text.downcase
    expect((higher <=> lower) <= 0).to eq(true), "'#{higher}' to '#{lower}' is not in alphabetical order"
    higher = lower      
  end
end

Then(/^the applet carousel displays left and right arrows$/) do
  @ehmp = WorkspaceEditor.new unless @ehmp.is_a? WorkspaceEditor

  expect(@ehmp.has_fld_applet_carousel_next?).to eq(true)
  expect(@ehmp.has_fld_applet_carousel_prev?).to eq(true)
end

Then(/^the applet carousel updates applet list when the user selects right arrow$/) do
  @ehmp = WorkspaceEditor.new unless @ehmp.is_a? WorkspaceEditor

  applet_titles = @ehmp.fld_applet_titles_in_carousel
  first_title = applet_titles[0].text

  @ehmp.fld_applet_carousel_next.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  # following line may still have timing issue, but lets give it a shot
  wait.until { @ehmp.fld_applet_titles_in_carousel.length > 0 && @ehmp.fld_applet_titles_in_carousel[0].text.eql?(first_title) == false }
end

Then(/^the applet carousel updates applet list when the user selects left arrow$/) do
  @ehmp = WorkspaceEditor.new unless @ehmp.is_a? WorkspaceEditor

  applet_titles = @ehmp.fld_applet_titles_in_carousel
  first_title = applet_titles[0].text

  @ehmp.fld_applet_carousel_prev.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  # following line may still have timing issue, but lets give it a shot
  wait.until { @ehmp.fld_applet_titles_in_carousel.length > 0 && @ehmp.fld_applet_titles_in_carousel[0].text.eql?(first_title) == false }
end

def remove_applet_from_current_view(id)
  @ehmp = WorkspaceEditor.new unless @ehmp.is_a? WorkspaceEditor
  @ehmp.edit_applet_element(id)
  expect(@ehmp.has_edit_applet?).to eq(true), "expected an applet with id applet-#{id} to be displayed"
  @ehmp.edit_applet.click
  @ehmp.wait_until_fld_view_switchboard_visible
  num_applets_in_workspace = @ehmp.li_applets_in_gridster.length
  # p num_applets_in_workspace
  @ehmp.remove_applet_element(id)
  @ehmp.remove_applet.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  # following line may still have timing issue, but lets give it a shot
  wait.until { @ehmp.li_applets_in_gridster.length !=  num_applets_in_workspace }
  wait.until { @ehmp.has_fld_view_switchboard? == false }
  # p  @ehmp.li_applets_in_gridster.length
  expect(@ehmp.has_edit_applet?).to eq(false), "applet-#{id} is (incorrectly) still visible"
end

When(/^the user removes applet "(.*?)" from workspace$/) do |id|
  remove_applet_from_current_view id
end

Then(/^no Allergy applet with id "(.*?)" is displayed$/) do |id|
  @ehmp = UserDefinedWorkspace.new
  @ehmp.applet_built_from(id, 'allergy_grid')
  expect(@ehmp.has_no_temp_applet_div?).to eq(true)
end

When(/^the user clicks the Workspace Manager$/) do
  wait_for_jquery_to_return
  @ehmp = PobCommonElements.new
  expect(@ehmp).to have_btn_workspace_options
  @ehmp.btn_workspace_options.click
  @ehmp.wait_for_workspace_options_menu
  expect(@ehmp).to have_workspace_options_menu
  expect(@ehmp).to have_btn_workspace_manager_option
  @ehmp.btn_workspace_manager_option.click
  WorkspaceActions.workspace_manager_displayed
end

Then(/^the customize screen displays a visual that defines the workspace$/) do
  @ehmp = WorkspaceEditor.new unless @ehmp.is_a? WorkspaceEditor
  expect(@ehmp.has_fld_visual_boundary?).to eq(true)
end

When(/^the user chooses to launch workspace "([^"]*)"$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.add_user_defined_workspace_elements(workspace_id)
  expect(@ehmp.has_btn_launch?).to eq(true), "Unable to find Launch link"
  @ehmp.btn_launch.click
end

Then(/^the applet "([^"]*)" grid loads without issue$/) do |id|
  @ehmp = UserDefinedWorkspace.new
  @ehmp.build_applet_grid_elements id
  @ehmp.wait_until_applet_grid_loaded
  expect(@ehmp.applet_grid_loaded?).to eq(true)
end

Given(/^the user is viewing the Workspace Manager window$/) do
  WorkspaceActions.workspace_manager_displayed
end

Then(/^the Workspace Manager window title is "([^"]*)"$/) do |title|
  manager = PobWorkspaceManager.new
  expect(manager).to have_fld_workspace_manager_title
  expect(manager.fld_workspace_manager_title.text.upcase).to eq(title.upcase)
end

Then(/^the predefined screens have a visual indicator indicating they cannot be cutomized$/) do |table|
  manager = PobWorkspaceManager.new
  table.rows.each do | text, value |
    manager.add_predefined_workspace value
    expect(manager).to have_predefined_customize_lock, "Expected #{text} screen to have a customize lock and it did not"
  end
end

When(/^the user selects the plus to add a new user defined workspace$/) do
  manager = PobWorkspaceManager.new
  num_udw = manager.fld_userdefined_screens.length
  expect(manager).to have_btn_add_workspace
  manager.btn_add_workspace.click
  wait_until { manager.fld_userdefined_screens.length > num_udw }
end

Then(/^a new user defined workspace is added with the title "([^"]*)"$/) do |new_title|
  manager = PobWorkspaceManager.new
  titles = manager.fld_udw_titles.map { |element| element.value.upcase }
  expect(titles).to include new_title.upcase
end

Then(/^the new user defined workspace has a customize link$/) do
  manager = PobWorkspaceManager.new
  manager.add_user_defined_workspace_elements(PobWorkspaceManager.default_new_uwd)
  expect(manager).to have_btn_customize
  expect(manager.btn_customize.text.upcase).to eq('customize'.upcase)
end

Then(/^the user defined workspace named "([^"]*)" has a customize link$/) do |udw_name|
  manager = PobWorkspaceManager.new
  manager.add_user_defined_workspace_elements(udw_name)
  expect(manager).to have_btn_customize
  expect(manager.btn_customize.text.upcase).to eq('customize'.upcase)
end

Then(/^the new user defined workspace has a disabled launch link$/) do
  manager = PobWorkspaceManager.new
  manager.add_user_defined_workspace_elements(PobWorkspaceManager.default_new_uwd)
  expect(manager).to have_btn_launch_disabled
  expect(manager.btn_launch_disabled.text.upcase).to eq('launch'.upcase)
end

When(/^the user defined workspace "([^"]*)" has an enabled customize link$/) do |title|
  manager = PobWorkspaceManager.new
  manager.add_user_defined_workspace_elements(title)
  expect(manager).to have_btn_customize
  expect(manager.btn_customize.text.upcase).to eq('customize'.upcase)
end

When(/^the user defined workspace "([^"]*)" has an enabled launch link$/) do |title|
  manager = PobWorkspaceManager.new
  manager.add_user_defined_workspace_elements(title)
  expect(manager).to have_btn_launch
  expect(manager.btn_launch.text.upcase).to eq('launch'.upcase)
  manager.wait_for_btn_launch_disabled
  expect(manager).to_not have_btn_launch_disabled
end

