When(/^the user navigates to the workspaceManager page$/) do
  page = AppDocWorkspaceManager.new
  page.load

  page.wait_for_h2
  page.wait_for_h3

  expect(page.h2.length).to be > 0
  expect(page.h3.length).to be > 0
end

Then(/^the documentation displays a "([^"]*)" section with subsections$/) do |arg1, table|
  page = AppDocMainContent.new
  main_headers = page.h2.map { |header| header.text.upcase }
  sub_headers = page.h3.map { |header| header.text.upcase }
  expect(main_headers).to include arg1.upcase
  table.rows.each do | expected_sub_header |
    expect(sub_headers).to include expected_sub_header[0].upcase
  end
end

When(/^the user navigates to the contexts page$/) do
  page = AppDocContext.new
  page.load

  page.wait_for_h2
  page.wait_for_h3

  expect(page.h2.length).to be > 0
  expect(page.h3.length).to be > 0
end

Then(/^the documentation displays a "([^"]*)" section$/) do |arg1|
  page = AppDocMainContent.new
  headers = page.h2.map { |header| header.text.upcase }
  expect(headers).to include arg1.upcase
end

Then(/^the documentation displays subsections$/) do |table|
  page = AppDocMainContent.new
  sub_headers = page.h3.map { |header| header.text.upcase }

  table.rows.each do | expected_sub_header |
    expect(sub_headers).to include expected_sub_header[0].upcase
  end
end

Then(/^the documenation displays sub\-sub\-sections$/) do |table|
  page = AppDocMainContent.new
  sub_headers = page.h4.map { |header| header.text.upcase }

  table.rows.each do | expected_sub_header |
    expect(sub_headers).to include expected_sub_header[0].upcase
  end
end

When(/^the user navigates to the contexts admin page$/) do
  page = AppDocContextsAdmin.new
  page.load
  page.wait_for_h2
  
  expect(page.h2.length).to be > 0
end

Then(/^the the documentation displays a Color Theme section$/) do
  page = AppDocMainContent.new
  headers = page.h2.map { |header| header.text.upcase }
  expect(headers).to include "Color Theme".upcase
end

When(/^the user navigates to the contexts staff page$/) do
  page = AppDocContextsStaff.new
  page.load
  page.wait_for_h2

  expect(page.h2.length).to be > 0
end
