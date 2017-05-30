Then(/^user scrolls the window to bring applet 1 to view$/) do 
  driver = TestSupport.driver
  element = driver.find_element(:css, "#applet-1")
  element.location_once_scrolled_into_view
end

When(/^user creates a user defined workspace$/) do
  screen = ScreenEditor.instance
  screen.wait_until_action_element_visible("Workspace Manager", 40)
  expect(screen.perform_action("Workspace Manager")).to be_true, "Error when attempting to open Workspace Manager"
  screen.wait_until_action_element_visible("Add New Workspace", 40)
  TestSupport.driver.manage.window.maximize
  expect(screen.perform_action("Add New Workspace")).to be_true, "Error when attempting to click on Add New Workspace"
  expect(screen.perform_action("Open Menu")).to be_true, "Error when attempting to Open Menu"
  screen.wait_until_action_element_visible("Launch", 40)
  expect(screen.perform_action("Launch")).to be_true, "Error when attempting to click on Add and Load"
end
