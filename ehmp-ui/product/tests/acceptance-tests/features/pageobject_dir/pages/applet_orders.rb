require_relative 'parent_applet.rb'

class OrderLabTestTray < SitePrism::Section
  element :fld_order_modal_title, "[id^=main-workflow-label-view]"
  element :fld_available_lab_test_input_box, "input[class='select2-search__field']"
  element :select_collection_sample, ".collectionSample select"
  element :select_specimen, ".specimen select"
  element :select_collection_type, ".collectionType select"
  element :btn_toggle, ".btn.dropdown-toggle.btn-primary .caret"
end

class PobOrdersApplet < PobParentApplet
  
  set_url '#/patient/orders-full'
  set_url_matcher(/#\/patient\/orders-full/)

  section :order_lab_tray, OrderLabTestTray, ".sidebar-tray.right"

  # *****************  All_Field_Elements  ******************* #
  element :fld_lab_test_select, "li:contains('24 HR URINE CALCIUM')"

  element :fld_override_reason, "[name='reason_for_override']"
  element :fld_signature_code, ".signature_code input:not([disabled])"
  element :fld_discontinue_reason, ".reason select"
      
  elements :fld_order_preview_labels, ".col-xs-12 div"    
  elements :fld_order_modal_labels, ".form-group label"
  elements :fld_add_lab_order, "#collapse-items-orders li a"

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
  section :date_range_filter, ExpandedDateFilter, "#grid-filter-lab_results_grid"
  element :btn_orders_date, "[data-header-instanceid='orders-entered'] a"

  element :btn_delete, ".workflow-controller .modal-footer [data-original-title='Delete']"
  element :btn_draft, ".workflow-controller .modal-footer button[id='saveButton']"
  element :btn_cancel, ".workflow-controller .modal-footer [data-original-title='Warning']"

  # *****************  All_Drop_down_Elements  ******************* #
  element :fld_available_lab_test_drop_down, "[x-is-labelledby^='select2-availableLabTests']"
  element :ddl_urgency, "[id^=urgency]"

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_orders_grid, "[data-appletid=orders] table tbody tr"
  element :tbl_order_empty_row, "[data-appletid=orders] tr.empty"
    
  element :tbl_orders_first_row, "[data-appletid=orders] tbody tr.selectable:nth-child(1)"
  element :tbl_orders_first_row_status, "[data-appletid=orders] tbody tr.selectable:nth-child(1) td:nth-child(4)"
  element :tbl_orders_first_row_order, "[data-appletid=orders] tbody tr.selectable:nth-child(1) td:nth-child(5)"
  element :tbl_order_date_header, "[data-appletid=orders] thead th:nth-of-type(2)"
  element :tbl_orders_data_row_loaded, "[data-appletid=orders] tbody tr:nth-of-type(1) > td:nth-of-type(2)"
  elements :tbl_coversheet_date_column, "[data-appletid=orders] tr.selectable td:nth-child(2)"
  elements :tbl_coversheet_type_column, "[data-appletid=orders] tr.selectable td:nth-child(6)"
  elements :expanded_tbl_headers, "[data-appletid=orders] thead th"
  elements :tbl_rows, "[data-appletid=orders] tbody tr.selectable"

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
    add_toolbar_buttons appletid_css
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
  
  def number_expanded_applet_rows
    return 0 if has_fld_empty_row?
    tbl_orders_grid.length
  end    

  def rows_of_type(type)
    all_rows = tbl_orders_grid
    all_type_columns = tbl_coversheet_type_column
    return_rows = []
    all_type_columns.each_with_index do | type_element, index |
      #p "Adding row #{type_element.text.upcase}" # if type_element.text.upcase == type.upcase
      return_rows.push all_rows[index] if type_element.text.upcase == type.upcase
    end
    return_rows
  end

  def date_column_text_only
    dates_only = tbl_coversheet_date_column.map { |element| element.text.strip }
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
      #p "Comparing #{higher}  with #{lower}"

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
