Given(/^workspace "(.*?)" is listed$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  predefined_screen_ids = @ehmp.predefined_screens_ids
  p predefined_screen_ids
  expect(predefined_screen_ids).to include(workspace_id)
end

When(/^user clones the "(.*?)" workspace$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  expect(@ehmp.clone_workspace(workspace_id)).to eq(true)
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
  @ehmp.all_titles.each do | title |
    expect(title).to include(term)
  end
end

Then(/^the workspace manager only displays workspaces with description "(.*?)"$/) do |term|
  @ehmp = PobWorkspaceManager.new
  @ehmp.all_descriptions.each do | desc |
    expect(desc).to include(term)
  end
end

When(/^the user sets the description of udw "(.*?)" to "(.*?)"$/) do |arg1, arg2|
  workspace_manager = WorkspaceManager.instance  
  workspace_manager.add_action(CucumberLabel.new('workspace desc input'), SelectAllSendKeysAndEnterActionNoClear.new, AccessHtmlElement.new(:css, "[data-screen-id=#{arg1}] div:nth-child(4) input"))
  expect(workspace_manager.perform_action('workspace desc input', arg2)).to eq(true)
end

When(/^the user customizes the "(.*?)" workspace$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  expect(@ehmp.customize_workspace(workspace_id)).to eq(true)
  @ehmp = CustomizeWorkspace.new
  @ehmp.wait_until_btn_done_visible
  @ehmp.wait_until_fld_applet_carousel_visible
  @ehmp.wait_until_fld_visual_boundary_visible
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
  expect(@ehmp.temp_applet_div['data-view-type']).to eq('summary'), "Expected applet-#{id} to be of data-view-type=gist"
  expect(@ehmp.has_temp_applet?).to eq(true), "Expected applet-#{id} to be applet type 'allergy_grid'"
end

Then(/^the applet "(.*?)" Allergies expanded applet is displayed$/) do |id|
  @ehmp = UserDefinedWorkspace.new
  @ehmp.applet_built_from(id, 'allergy_grid')
  expect(@ehmp.has_temp_applet_div?).to eq(true), "Expected applet-#{id} be visible"
  expect(@ehmp.temp_applet_div['data-view-type']).to eq('expanded'), "Expected applet-#{id} to be of data-view-type=gist"
  expect(@ehmp.has_temp_applet?).to eq(true), "Expected applet-#{id} to be applet type 'allergy_grid'"
end

When(/^the user edits the user defined workspace$/) do
  @ehmp = CustomizeWorkspace.new
  @ehmp.wait_for_btn_workspace_editor
  expect(@ehmp).to have_btn_workspace_editor
  @ehmp.btn_workspace_editor.click

  @ehmp.wait_until_btn_done_visible
  @ehmp.wait_until_fld_applet_carousel_visible
end

When(/^the user changes applet "(.*?)" to a "(.*?)"$/) do |id, view|

  @ehmp = CustomizeWorkspace.new
  @ehmp.edit_applet_element(id)
  expect(@ehmp.has_edit_applet?).to eq(true)
  @ehmp.edit_applet.click

  screen = ScreenEditor.instance
  html_action_element = view
  screen.wait_until_action_element_visible(html_action_element, 40)
  expect(screen.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

When(/^the user filters the applet carousel on text "(.*?)"$/) do |text|
  @ehmp = CustomizeWorkspace.new
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
  @ehmp = CustomizeWorkspace.new unless @ehmp.is_a? CustomizeWorkspace
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
  @ehmp = CustomizeWorkspace.new unless @ehmp.is_a? CustomizeWorkspace

  expect(@ehmp.has_fld_applet_carousel_next?).to eq(true)
  expect(@ehmp.has_fld_applet_carousel_prev?).to eq(true)
end

Then(/^the applet carousel updates applet list when the user selects right arrow$/) do
  @ehmp = CustomizeWorkspace.new unless @ehmp.is_a? CustomizeWorkspace

  applet_titles = @ehmp.fld_applet_titles_in_carousel
  first_title = applet_titles[0].text

  @ehmp.fld_applet_carousel_next.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  # following line may still have timing issue, but lets give it a shot
  wait.until { @ehmp.fld_applet_titles_in_carousel.length > 0 && @ehmp.fld_applet_titles_in_carousel[0].text.eql?(first_title) == false }
end

Then(/^the applet carousel updates applet list when the user selects left arrow$/) do
  @ehmp = CustomizeWorkspace.new unless @ehmp.is_a? CustomizeWorkspace

  applet_titles = @ehmp.fld_applet_titles_in_carousel
  first_title = applet_titles[0].text

  @ehmp.fld_applet_carousel_prev.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  # following line may still have timing issue, but lets give it a shot
  wait.until { @ehmp.fld_applet_titles_in_carousel.length > 0 && @ehmp.fld_applet_titles_in_carousel[0].text.eql?(first_title) == false }
end

def remove_applet_from_current_view(id)
  @ehmp = CustomizeWorkspace.new unless @ehmp.is_a? CustomizeWorkspace
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
  @ehmp = PobCommonElements.new
  expect(@ehmp.has_btn_workspace_manager?).to eq(true)
  @ehmp.btn_workspace_manager.click
end

Then(/^the customize screen displays a visual that defines the workspace$/) do
  @ehmp = CustomizeWorkspace.new unless @ehmp.is_a? CustomizeWorkspace
  expect(@ehmp.has_fld_visual_boundary?).to eq(true)
end

Then(/^the user defined workspace "([^"]*)" launch link says Launch$/) do |udw_id|
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.add_user_defined_workspace_elements(udw_id)
  expect(@ehmp.has_btn_launch?).to eq(true), "Unable to find Launch link"
  expect(@ehmp.has_btn_customize?).to eq(false)
  expect(@ehmp.btn_launch.text).to eq('Launch')
end

When(/^the user defined workspace "([^"]*)" launch link says Customize$/) do |udw_id|
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.add_user_defined_workspace_elements(udw_id)
  expect(@ehmp.has_btn_launch?).to eq(false)
  expect(@ehmp.has_btn_customize?).to eq(true), "Unable to find Customize link"
  expect(@ehmp.btn_customize.text).to eq('Customize')
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
