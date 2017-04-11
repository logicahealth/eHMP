class PobAlert < SitePrism::Page
  element :mdl_alert_region, "#alert-region"
  element :mdl_alert_title, "#alert-region .modal-title"
  element :btn_cancel, "#alert-region .btn-default", "cancel"
  element :btn_delete, "#alert-region .btn-danger", "delete"
end
