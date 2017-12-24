class PobNotes < SitePrism::Page
  set_url '#/patient/overview'

  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_notes_applet_loaded, ".summary-list-container"
  element :fld_new_note_loaded, ".workflow-controller"
  element :fld_all_notes, "h4.panel-title"
  element :fld_unsigned_notes, "#heading-note-unsigned"
  element :fld_uncosigned_notes, "#heading-note-uncosigned"
  element :fld_recently_signed_notes, "#heading-note-recently-signed"
  #element :fld_note_form_header, "#main-workflow-label-New-Note"
  element :fld_note_form_header, "[id^='main-workflow-label-']"
  element :fld_note_title_label, "label[for='documentDefUidUnique']"
  element :fld_note_title, "[x-is-labelledby='select2-documentDefUidUnique-container']"
  element :fld_note_date_label, "label[for='derivReferenceDate']"
  element :fld_note_date, "#derivReferenceDate"
  element :fld_note_time_label, "label[for='derivReferenceTime']"
  element :fld_note_time, "#derivReferenceTime"
  element :fld_note_body_label, "label[for='noteBody']"
  element :fld_note_body, "#noteBody"
  element :fld_note_title_selection_box, "input[class='select2-search__field']"
  element :fld_unsigned_notes_section, "[aria-labelledby='heading-notes-unsigned']"
  element :fld_recently_signed_notes_section, "[aria-labelledby^='heading-notes-my-signed']"
  element :fld_signature_input_box, "#signatureCode"
  element :fld_note_preview_title, "#main-workflow-label-Preview-Note-TIU-Format"
  element :fld_note_preview_content, "#note-preview-body pre"
  element :fld_note_objects, ".note-object-container"
    
  elements :fld_all_headings, ".tray-summary-group-header"
  elements :fld_unsigned_notes_list, "[id^='unsigned-Notes-list-title']"
  #elements :fld_unsigned_notes_list, "#body-Notes-unsigned li h5"
  elements :fld_recently_signed_notes_list, "[id^='recently-signed-notes-list-title']"

  # *****************  All_Button_Elements  ******************* #
  element :btn_notes, "#patientDemographic-noteSummary [type=button]"
  element :btn_new_notes, "div.action-list-child-container [type=button]"
  element :btn_delete, "#noteConfirmDelete"
  #element :btn_close, "#close-form-btn"
  element :btn_close, ".modal-footer .note-close button"
  element :btn_sign, ".note-sign [type='submit']"
  element :btn_esign, "#esig-sign-btn"
  element :btn_action_item_dropdown, "#action-items-dropdown"
  element :btn_delete_confirmation, ".confirm-cancel-button [type='button']"
  element :btn_preview, "#preview-form-btn"
  element :btn_preview_close, "#preview-form-close-btn"
  element :btn_view_note_object, "#view-note-object-btn"

  elements :btn_all, "form[class='adk-form form-container'] button"
  elements :btn_obj, "[data-toggle='sidebar-subTray']"
  
#  elements :btn_all, ".control.inline-display.button-control"
#  elements :btn_obj, "div.sidebar.inline-display button"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
end
