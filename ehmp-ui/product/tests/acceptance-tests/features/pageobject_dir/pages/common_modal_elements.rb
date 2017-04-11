class ModalElements < SitePrism::Page
  element :fld_modal_title, '#mainModalLabel'
  element :btn_close, '#modal-close-button'
  element :btn_x_close, '.modal-header button.close'
  element :btn_modal_close, "#modal-footer [data-dismiss='modal']"
  element :modal_body, "#modal-body"
  elements :fld_modal_detail_labels, "#modal-body [data-detail-label]"
  element :fld_alert_modal_title, "#newActionsModalLabel"
  element :btn_yes, ".modal-footer .alert-continue"
  element :btn_no, ".modal-footer .alert-cancel"
  element :fld_modal_body, ".modal-body"
end
