class TraySidebarSection < SitePrism::Section
  element :fld_tray, "[aria-label='Tray Sidebar']"
  element :btn_open_encounter, '#patientDemographic-encounter > button'
  element :btn_open_observations, '#patientDemographic-newObservation > button'
  element :btn_open_actions, '#patientDemographic-action > button'
  element :btn_open_notes, '#patientDemographic-noteSummary > button'
end
