
class Alert < SitePrism::Page
  element :mdl_alert_region, "#alert-region"
  element :mdl_alert_title, "#alert-region .modal-title"
  element :btn_cancel, "#alert-region .btn-default", "cancel"
  element :btn_delete, "#alert-region .btn-danger", "delete"
end

class PobWorkspaceManager < SitePrism::Page
  elements :fld_predefined_screens, '.predefined-screen-row'
  elements :fld_predefined_screens_delete_icons, :xpath, "//*[contains(@class, 'fa-lock')]/ancestor::*[contains(@class, 'predefined-screen-row')]"
  elements :fld_editable_titles, :xpath, "//form[contains(@class, 'editor-title')]/ancestor::div[contains(@class, 'tableRow')]"
  elements :fld_editable_descriptions, :xpath, "//form[contains(@class, 'editor-description')]/ancestor::div[contains(@class, 'tableRow')]"

  def predefined_screens_ids
    fld_predefined_screens.map { |screen| screen['id'] }
  end

  def predefined_screen_delete_icons_ids
    fld_predefined_screens_delete_icons.map { |screen| screen['id'] }
  end

  def screens_with_editable_titles
    fld_editable_titles.map { |screen| screen['id'] }
  end

  def screens_with_editable_descriptions
    fld_editable_descriptions.map { |screen| screen['id'] }
  end

  def clone_workspace(workspace_id)
    css_path = "##{workspace_id} .duplicate-worksheet"
    self.class.element(:btn_clone, css_path)
    wait_until_btn_clone_visible
    btn_clone.click
    true
  rescue => e
    p "#{e}: '#{css_path}'"
    false 
  end
end
