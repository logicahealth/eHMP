class TraySidebarSection < SitePrism::Section
  element :fld_tray, "[aria-label='Tray Sidebar']"
  element :btn_open_encounter, '#patientDemographic-encounter > button'
  element :btn_open_observations, '#patientDemographic-newObservation > button'
  element :btn_open_actions, '#patientDemographic-action > button'
  element :btn_open_notes, '#patientDemographic-noteSummary > button'
end

class ActionTraySection < SitePrism::Section
  element :tray_title, "h4.panel-title"
  element :fld_my_task_header, "[id^='heading-actions-my-tasks']"
  element :btn_my_task, "[id^='heading-actions-my-tasks'] button"
  element :fld_my_tasks_list_group, "[id^='collapse-actions-my-tasks']"
  elements :fld_my_tasks_list, "[id^='collapse-actions-my-tasks'] li"

  element :fld_my_drafts_header, "[id^='heading-actions-my-drafts']"
  elements :fld_my_drafts_list, "[id^='collapse-actions-my-drafts'] li"
end
