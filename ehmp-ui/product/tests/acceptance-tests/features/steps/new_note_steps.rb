Then(/^New Note Modal is displayed$/) do
  tray = NewNote.new
  expect(tray.wait_for_title).to eq(true), "Expected tray title"
  expect(tray.title.text.upcase).to eq('new note'.upcase)
  
  tray.wait_for_btn_note_objects
  tray.wait_for_btn_open_consults
  expect(tray).to have_btn_note_objects
  expect(tray).to have_btn_open_consults
end
