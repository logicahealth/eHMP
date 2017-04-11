class PobAppletMilitaryApplet < SitePrism::Page
  element :fld_military_history_thead, '[data-appletid="military_hist"] thead'
  element :fld_military_history_tbody, '[data-appletid="military_hist"] tbody'
  element :btn_edit_view, '[button-type="editView-button-toolbar"]'
  element :btn_detail_view, '[button-type="detailView-button-toolbar"]'
  element :btn_expand_military_history, '[data-appletid="military_hist"] .applet-maximize-button'
  element :tbl_military_hist_expanded_data_row_loaded, "#data-grid-military_hist tbody tr:nth-of-type(1) > td:nth-of-type(1)"
  element :tbl_military_hist_first_data_row, "#data-grid-applet-1 tbody tr:nth-of-type(1) > td:nth-of-type(1)"
  element :fld_military_history_modal_header, ".militaryhistory .workflow-header"
  element :fld_military_history_textarea, ".militaryhistory .modal-body textarea"
  element :btn_military_history_save, "#saveBtn"
  element :btn_military_history_cancel, "#cancelBtn"
  element :fld_military_history_edit_header, "#main-workflow-label-Edit-Military-History"
  element :fld_military_history_remaining_characters, ".description > span"
  element :btn_military_history_detail_view_close, "#close-btn"
  element :mdl_detail_view_title, ".modal-title"
  element :mdl_detail_view_description, ".workflow-controller .modal-body p"
  element :btn_military_history_dismiss_edit_view, '.modal-header [data-dismiss="modal"]'
  element :btn_minimize_military_history, '[data-appletid="military_hist"] .applet-minimize-button'
  
  elements :tbl_military_history_headers, "[data-appletid='military_hist'] thead th"
  elements :tbl_military_history_rows, "[data-appletid='military_hist'] tbody tr"

  def click_military_hist_data_row(row_num)
    self.class.element :tbl_military_hist_data_row, "#data-grid-applet-1 tbody tr:nth-of-type( #{row_num} ) > td:nth-of-type(1)"
    wait_until_tbl_military_hist_data_row_visible(DefaultTiming.default_table_row_load_time)
    max_attempt = 5
    begin
      tbl_military_hist_data_row.click
    rescue => e
      max_attempt-=1
      retry if max_attempt > 0
      raise e if max_attempt <= 0
    end
  end

  def get_military_history_expanded_data_row(tRow, tData)
    self.class.element :tbl_military_hist_column_data, "#data-grid-military_hist tbody tr:nth-of-type(#{tRow}) > td:nth-of-type(#{tData})"
    return tbl_military_hist_column_data.text
  end

  def get_military_history_data_row(type, tRow, tData, tag)
    self.class.element :tbl_military_history_header_data, "[data-appletid='military_hist'] #{type} tr:nth-of-type(#{tRow}) > #{tag}:nth-of-type(#{tData})"
    return tbl_military_history_header_data.text.split("P")[0].strip
    #return tbl_military_history_header_data.text
  end

  def get_remaining_character_number(description)
    description_length = description.length
    remaining_characters = 200 - description_length
    #p "description_length: #{description_length}"
    #p "remaining_characters #{remaining_characters}"
    return remaining_characters - 2
  end

  def find_remaining_char_span
    return find(".description > span")
  end

  def find_edit_modal_label
    return find("#main-workflow-label-Edit-Military-History")
  end

  def check_each_row_loaded(tRow)
    self.class.element :tbl_military_hist_data_row_loaded, "#data-grid-applet-1 tbody tr:nth-of-type(#{tRow}) > td:nth-of-type(1)"
    wait_until_tbl_military_hist_data_row_loaded_visible(DefaultTiming.default_table_row_load_time)
    return tbl_military_hist_data_row_loaded.visible?
  end
end


