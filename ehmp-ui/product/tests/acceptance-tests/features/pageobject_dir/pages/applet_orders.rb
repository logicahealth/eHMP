require_relative 'parent_applet.rb'
class PobOrdersApplet < PobParentApplet
  
  set_url '/#orders-full'
  set_url_matcher(/\/#orders-full/)
  
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_order_modal_title, "[id='main-workflow-label-Order-a-Lab-Test']"
  element :fld_available_lab_test_input_box, "input[class='select2-search__field']"
  element :fld_lab_test_select, "li:contains('24 HR URINE CALCIUM')"
  element :fld_collection_type, "#collectionType"
  element :fld_collection_date, "#collectionDate"
  element :fld_in_progress, "div.inProgressContainer"
  element :fld_override_reason, "#reason-for-override"
  element :fld_signature_code, "#signature-code"
  element :fld_discontinue_reason, "#reason"
  element :fld_sign_order_screen_loaded, ".order_summary"
  element :fld_tray_loader_message, ".tray-loader-message"
      
  elements :fld_order_preview_labels, ".col-xs-12 div"    
  elements :fld_order_modal_labels, ".form-group label"
  elements :fld_add_lab_order, "#collapse-items-orders li"

  # *****************  All_Button_Elements  ******************* #
  element :btn_toggle, ".btn.dropdown-toggle.btn-primary .caret"
  element :btn_accept_toggle, ".modal-footer .dropdown-toggle"
  element :btn_accept_add, "#acceptDrpDwnContainer"
  element :btn_accept_and_add, "#acceptDrpDwnContainer-accept-add"
  element :btn_accept, "#acceptDrpDwnContainer-accept"
  element :btn_accept_duplicate, ".modal-content .confirm"
  element :btn_sign_from_modal, "#ordersSignOrder"
  element :btn_sign_order, ".modal-content .alert-continue"
  element :btn_discontinue_order_from_modal, "#ordersDiscontinueOrder"
  element :btn_discontinue_order, ".discontinue .btn-danger"
  element :btn_save, "#saveButton"
  element :btn_order_24hr_range, "[name='24hrRange']"
  
  elements :btn_all, ".inline-display.button-control"
  elements :btn_submit_order, "[role='menuitem']"
  element :btn_orders_all, "#all-range-orders"
  element :btn_orders_date, "[tooltip-data-key='orders_orderdate'] a"

  element :btn_delete, ".workflow-controller .modal-footer [data-original-title='Delete']"
  element :btn_draft, ".workflow-controller .modal-footer button[id='saveButton']"
  element :btn_cancel, ".workflow-controller .modal-footer [data-original-title='Warning']"

  # *****************  All_Drop_down_Elements  ******************* #
  element :fld_available_lab_test_drop_down, "[x-is-labelledby='select2-availableLabTests-container']"
  element :ddl_urgency, "#urgency"

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_orders_grid, "#data-grid-orders tbody tr"
  element :tbl_order_empty_row, "#data-grid-orders tr.empty"
    
  element :tbl_orders_first_row, "#data-grid-orders tbody tr.selectable:nth-child(1)"
  element :tbl_orders_first_row_status, "#data-grid-orders tbody tr.selectable:nth-child(1) td:nth-child(3)"
  element :tbl_orders_first_row_order, "#data-grid-orders tbody tr.selectable:nth-child(1) td:nth-child(4)"
  element :tbl_order_date_header, "[data-appletid=orders] thead th:nth-of-type(1)"
  element :tbl_orders_data_row_loaded, "#data-grid-orders tbody tr:nth-of-type(1) > td:nth-of-type(1)"
  elements :tbl_coversheet_date_column, "#data-grid-orders tr.selectable td:nth-child(1)"
  elements :tbl_coversheet_date_column_screenreader, "#data-grid-orders tr.selectable td:nth-child(1) span"
  elements :tbl_coversheet_type_column, "#data-grid-orders tr.selectable td:nth-child(5)"

  # ****************** Methods *********************** #
  # *********************  Methods  ***************************#
  
  def initialize
    super
    appletid_css = "[data-appletid=orders]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
  end  
  
  def applet_loaded?
    return true if has_fld_empty_row?
    return tbl_orders_grid.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def wait_until_applet_loaded
    wait_until { applet_loaded? }
  end

  def rows_of_type(type)
    all_rows = tbl_orders_grid
    all_type_columns = tbl_coversheet_type_column
    return_rows = []
    all_type_columns.each_with_index do | type_element, index |
      p "Adding row #{type_element.text.upcase}" # if type_element.text.upcase == type.upcase
      return_rows.push all_rows[index] if type_element.text.upcase == type.upcase
    end
    return_rows
  end

  def date_column_text_only
    dates_screenreader_text = tbl_coversheet_date_column
    screenreader_text = tbl_coversheet_date_column_screenreader[0]
    dates_only = []
    dates_screenreader_text.each_with_index do | td_element, index |
      date = td_element.text
      date = date.sub(screenreader_text.text, '')
      dates_only.push(date.strip)
    end
    p dates_only
    dates_only
  end

  def verify_date_time_sort_selectable(reverse_chronilogical)
    format = "%m/%d/%Y"
    date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")

    for_error_message = reverse_chronilogical ? "is not greater then" : "is not less then"
    columns = date_column_text_only
    date_only = date_format.match(columns[0]).to_s
    higher = Date.strptime(date_only, format)
    (1..columns.length-1).each do |i|

      date_only = date_format.match(columns[i]).to_s
      lower = Date.strptime(date_only, format)
      p "Comparing #{higher}  with #{lower}"

      check_alpha = reverse_chronilogical ? ((higher >= lower)) : ((higher <= lower))
      p "#{higher} #{for_error_message} #{lower}" unless check_alpha
      return false unless check_alpha
      higher = lower
    end
    return true
  rescue Exception => e
    p "verify_date_sort: #{e}"
    return false
  end
end
