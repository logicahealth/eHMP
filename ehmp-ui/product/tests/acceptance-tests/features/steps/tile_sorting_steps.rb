Then(/^the toolbar displays with a Tile Sort button$/) do
  problems = PobProblemsApplet.new
  problems.wait_for_btn_tile_sort
  expect(problems).to have_btn_tile_sort
end

def wait_for_jquery_to_return(timeout = DefaultLogin.wait_time)
  wait = Selenium::WebDriver::Wait.new(:timeout => timeout)
  begin
    wait.until { TestSupport.driver.execute_script("return window.jQuery.active") == 0 }
  rescue Exception => e
    count = TestSupport.driver.execute_script("return window.jQuery.active")
    p "We still have outstanding jQuery calls (#{count})"
    p "attempt to continue"
  end
end

When(/^the user moves the problem row to the top of the applet$/) do
  problems = PobProblemsApplet.new
  problems.wait_for_fld_gist_problem_names
  name_order = problems.gist_problem_names_only

  # after sort, expect last element to be first
  expected_name_order = Array.new(name_order)
  last = expected_name_order.pop
  expected_name_order.unshift(last)

  problems.wait_until_btn_tile_sort_visible
  problems.btn_tile_sort.click
  problems.wait_for_btn_tile_sort_active
  expect(problems).to have_btn_tile_sort_active

  move_times = name_order.length - 1
  (0..move_times).each do |i|
    problems.btn_tile_sort.native.send_keys(:up)
  end

  problems.btn_tile_sort.native.send_keys(:enter)
  wait_for_jquery_to_return
  problems.wait_until_btn_tile_sort_active_invisible
  expect(problems.gist_problem_names_only).to eq(expected_name_order)
  @manual_problem_gist_order = problems.gist_problem_names_only
end

When(/^the user moves the numeric lab gist row to the bottom of the applet$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_fld_lab_names
  name_order = ehmp.gist_numeric_lab_names_only

  # after sort, expect first element to be last
  expected_name_order = Array.new(name_order)
  first = expected_name_order.shift
  expected_name_order.push(first)

  ehmp.wait_until_btn_tile_sort_visible
  ehmp.btn_tile_sort.click
  ehmp.wait_for_btn_tile_sort_active
  expect(ehmp).to have_btn_tile_sort_active

  move_times = name_order.length - 1
  (0..move_times).each do |i|
    ehmp.btn_tile_sort.native.send_keys(:down)
  end
  ehmp.btn_tile_sort.native.send_keys(:enter)
  wait_for_jquery_to_return
  ehmp.wait_until_btn_tile_sort_active_invisible
  expect(ehmp.gist_numeric_lab_names_only).to eq(expected_name_order)
  @manual_numeric_gist_order = ehmp.gist_numeric_lab_names_only
end

When(/^the user moves the vital gist row to the bottom of the applet$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_fld_vital_names
  name_order = ehmp.gist_vital_names_only

  # after sort, expect first element to be last
  expected_name_order = Array.new(name_order)
  first = expected_name_order.shift
  expected_name_order.push(first)

  ehmp.wait_until_btn_tile_sort_visible
  ehmp.btn_tile_sort.click
  ehmp.wait_for_btn_tile_sort_active
  expect(ehmp).to have_btn_tile_sort_active

  move_times = name_order.length - 1
  (0..move_times).each do |i|
    ehmp.btn_tile_sort.native.send_keys(:down)
  end
  ehmp.btn_tile_sort.native.send_keys(:enter)
  wait_for_jquery_to_return
  ehmp.wait_until_btn_tile_sort_active_invisible
  expect(ehmp.gist_vital_names_only).to eq(expected_name_order)
  @manual_vitals_order = ehmp.gist_vital_names_only
end

Then(/^the Problems applet reports Manual sort$/) do
  problems = PobProblemsApplet.new
  expect(problems.wait_for_fld_manual_sort(20)).to eq(true)
  expect(problems.wait_for_btn_remove_manual_sort(20)).to eq(true)
  expect(problems).to have_fld_manual_sort
  expect(problems).to have_btn_remove_manual_sort
end

Given(/^the Problems applet does not report Manual sort$/) do
  problems = PobProblemsApplet.new
  expect(problems).to_not have_fld_manual_sort
  expect(problems).to_not have_btn_remove_manual_sort
end

Then(/^the Numeric Lab Results applet does not report Manual sort$/) do
  lab_results = PobNumericLabApplet.new
  expect(lab_results).to_not have_fld_manual_sort
  expect(lab_results).to_not have_btn_remove_manual_sort
end

Then(/^the Vitals applet does not report Manual sort$/) do
  ehmp = PobVitalsApplet.new
  expect(ehmp).to_not have_fld_manual_sort
  expect(ehmp).to_not have_btn_remove_manual_sort
end

Given(/^the Vitals Gist applet starts without Manual Sort$/) do
  ehmp = PobVitalsApplet.new
  applet_starts_without_manual_sort ehmp
end

def applet_starts_without_manual_sort(applet_elements)
  p "DE5841: Tile manual sort retained after workspace is deleted"
  applet_elements.wait_for_btn_remove_manual_sort
  applet_elements.btn_remove_manual_sort.click if applet_elements.has_btn_remove_manual_sort?
  applet_elements.wait_until_btn_remove_manual_sort_invisible
  expect(applet_elements).to_not have_fld_manual_sort
  expect(applet_elements).to_not have_btn_remove_manual_sort
end

Given(/^the Problems applet starts without Manual Sort$/) do
  problems = PobProblemsApplet.new
  applet_starts_without_manual_sort problems
end

Given(/^the Numeric Lab Results applet starts without Manual Sort$/) do
  lab_results = PobNumericLabApplet.new
  applet_starts_without_manual_sort lab_results
end

Then(/^the Numeric Lab Results applet reports Manual sort$/) do
  lab_results = PobNumericLabApplet.new
  lab_results.wait_for_fld_manual_sort
  lab_results.wait_for_btn_remove_manual_sort
  expect(lab_results).to have_fld_manual_sort
  expect(lab_results).to have_btn_remove_manual_sort
end

Then(/^the Vitals Gist applet reports Manual sort$/) do
  ehmp = PobVitalsApplet.new
  ehmp.wait_for_fld_manual_sort
  ehmp.wait_for_btn_remove_manual_sort
  expect(ehmp).to have_fld_manual_sort
  expect(ehmp).to have_btn_remove_manual_sort
end

When(/^the user clicks Manual sort to remove it$/) do
  problems = PobProblemsApplet.new
  problems.wait_for_btn_remove_manual_sort
  expect(problems).to have_btn_remove_manual_sort
  problems.btn_remove_manual_sort.click
  wait_for_jquery_to_return
end
