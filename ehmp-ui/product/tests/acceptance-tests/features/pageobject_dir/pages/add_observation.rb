class ObservationTrayModal < SitePrism::Page 
  element :fld_title, '#patientDemographic-newObservation .panel-title'
  element :btn_new_observation, "#patientDemographic-newObservation .action-list-container button"
  element :dd_observation_type_list, "#patientDemographic-newObservation .action-list-container .dropdown-menu"

  def select_observation(text)
    self.class.element :add_link, :xpath, "//a[contains(@class, 'add-new') and contains(string(), '#{text}')]"
    wait_until_add_link_visible
    add_link.click
  end
end
