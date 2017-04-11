require_relative 'parent_applet.rb'
class PobOrdersApplet < PobParentApplet
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_order_modal_title, "[id='main-workflow-label-Order-a-Lab-Test']"
  element :fld_available_lab_test_input_box, "input[class='select2-search__field']"
  element :fld_lab_test_select, "li:contains('24 HR URINE CALCIUM')"
  element :fld_collection_type, "#collectionType"
  element :fld_in_progress, "div.inProgressContainer"
  element :fld_override_reason, "#reason-for-override"
  element :fld_signature_code, "#signature-code"
  element :fld_discontinue_reason, "#reason"
  element :fld_sign_order_screen_loaded, ".order_summary"
      
  elements :fld_order_preview_labels, ".col-xs-12 p"    
  elements :fld_order_modal_labels, ".form-group label"

  # *****************  All_Button_Elements  ******************* #
  element :btn_add_orders, "[data-appletid=orders] .applet-add-button"
  element :btn_expand_orders, "[data-appletid=orders] .applet-maximize-button"
  element :btn_toggle, ".btn.dropdown-toggle.btn-primary .caret"
  element :btn_accept_toggle, ".modal-footer .dropdown-toggle"
  element :btn_accept_add, "#acceptDrpDwnContainer"
  element :btn_accept_and_add, "#acceptDrpDwnContainer-accept-add"
  element :btn_accept, "#acceptDrpDwnContainer-accept"
  element :btn_accept_duplicate, "#mainModalDialog button:nth-child(2)"
  element :btn_sign_from_modal, "#ordersSignOrder"
  element :btn_sign_order, ".modal-content .alert-continue"
  element :btn_discontinue_order_from_modal, "#ordersDiscontinueOrder"
  element :btn_discontinue_order, ".modal-footer .alert-continue"
  element :btn_order_24hr_range, "[name='24hrRange']"
  
  elements :btn_all, ".inline-display.button-control"
  elements :btn_submit_order, "[role='menuitem']"
  element :btn_orders_all, "#all-range-orders"
  element :btn_orders_date, "[tooltip-data-key='orders_orderdate']"

  # *****************  All_Drop_down_Elements  ******************* #
  element :fld_available_lab_test_drop_down, "[x-is-labelledby='select2-availableLabTests-container']"

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_orders_grid, "#data-grid-orders tbody tr"
  element :tbl_order_empty_row, "#data-grid-orders tr.empty"
    
  element :tbl_orders_first_row, "#data-grid-orders tbody tr.selectable:nth-child(1)"
  element :tbl_orders_first_row_status, "#data-grid-orders tbody tr.selectable:nth-child(1) td:nth-child(3)"
  element :tbl_orders_first_row_order, "#data-grid-orders tbody tr.selectable:nth-child(1) td:nth-child(4)"
  element :tbl_order_date_header, "[data-appletid=orders] th:nth-of-type(1)"
  element :tbl_orders_data_row_loaded, "#data-grid-orders tbody tr:nth-of-type(1) > td:nth-of-type(1)"
  elements :tbl_coversheet_date_column, "#data-grid-orders tr.selectable td:nth-child(1)"
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
    add_toolbar_buttons
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
end
