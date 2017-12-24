Then(/^user scrolls the window to bring applet 1 to view$/) do 
  driver = TestSupport.driver
  element = driver.find_element(:css, "#applet-1")
  element.location_once_scrolled_into_view
end
