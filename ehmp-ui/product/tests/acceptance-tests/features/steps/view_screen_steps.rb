Then(/^"(.*?)" is active$/) do |screen_name|
  general = PobParentApplet.new
  general.wait_for_menu
  expect(general).to have_menu
  expect(general.menu).to have_fld_screen_name
  expect(general.menu.fld_screen_name.text.upcase).to eq(screen_name.upcase)
end
