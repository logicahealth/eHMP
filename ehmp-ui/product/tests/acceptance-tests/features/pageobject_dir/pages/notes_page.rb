class PobNotes < SitePrism::Page
  set_url '/#overview'

  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_notes_applet_loaded, ".container-fluid"
  element :fld_new_note_loaded, ".modal-body"
  element :fld_all_notes, "h4.panel-title"
  element :fld_unsigned_notes, "#heading-note-unsigned"
  element :fld_uncosigned_notes, "#heading-note-uncosigned"
  element :fld_recently_signed_notes, "#heading-note-recently-signed"
  element :fld_note_form_header, "#main-workflow-label-New-Note"
  element :fld_note_title_label, "label[for='documentDefUidUnique']"
  element :fld_note_title, "[x-is-labelledby='select2-documentDefUidUnique-container']"
  element :fld_note_date_label, "label[for='derivReferenceDate']"
  element :fld_note_date, "#derivReferenceDate"
  element :fld_note_time_label, "label[for='derivReferenceTime']"
  element :fld_note_time, "#derivReferenceTime"
  element :fld_note_body_label, "label[for='text-0-content']"
  element :fld_note_body, "#text-0-content"
  element :fld_note_title_selection_box, "input[class='select2-search__field']"
  element :fld_unsigned_notes_section, "[aria-labelledby='heading-notes-unsigned']"
  element :fld_recently_signed_notes_section, "[aria-labelledby='heading-notes-recently-signed']"
  element :fld_signature_input_box, "#signatureCode"
  element :fld_note_preview_title, "#note-preview-title"
  element :fld_note_preview_content, ".note-preview-content"
    
  elements :fld_all_headings, "[class='container-fluid panel panel-default'] .panel-heading"
  elements :fld_unsigned_notes_list, "[id^='unsigned-notes-list-title']"
  elements :fld_recently_signed_notes_list, "[id^='recently-signed-notes-list-title']"

  # *****************  All_Button_Elements  ******************* #
  element :btn_notes, "#patientDemographic-noteSummary [type=button]"
  element :btn_new_notes, "div.action-list-child-container [type=button]"
  element :btn_delete, "#delete-form-btn"
  element :btn_close, "#close-form-btn"
  element :btn_sign, "#sign-form-btn"
  element :btn_esign, "#esig-sign-btn"
  element :btn_action_item_dropdown, "#action-items-dropdown"
  element :btn_delete_confirmation, "#btn-notes-operation-yes"
  element :btn_preview, "#preview-form-btn"
  element :btn_preview_close, "#preview-form-close-btn"
  
  elements :btn_all, "form[class='adk-form form-container'] button"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
end
