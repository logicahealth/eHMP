class NewNote < SitePrism::Page
  element :title, '[id^=main-workflow-label-view]'
  element :btn_note_objects, :xpath, "//div[contains(@class, 'subtray-container')]/descendant::button[contains(string(), 'Note Objects')]"
  element :btn_open_consults, :xpath, "//div[contains(@class, 'subtray-container')]/descendant::button[contains(string(), 'Open Consults')]"
end
