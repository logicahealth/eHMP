require_relative 'parent_applet.rb'

class PobLabResults < PobParentApplet
  
  set_url '#/patient/lab-results-grid-full'
  set_url_matcher(/lab-results-grid-full/)
    
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_lab_results_applet_heading, "div[data-appletid='lab_results_grid'] .applet-chrome-header"
  element :fld_lab_results_data_thead, "[data-appletid='lab_results_grid'] table thead"
  element :fld_lab_results_modal_data, "div[id='modal-body'] [id='data-grid-lab_results_grid-modalView']"

  elements :fld_lab_results_applet_row, "[data-appletid='lab_results_grid'] .data-grid table [class='gist-item table-row-toolbar']"
  elements :fld_lab_results_table_row, "[data-appletid='lab_results_grid'] .data-grid table tr"

  elements :fld_non_panel_date_rows, "table[id='data-grid-lab_results_grid'] tbody > tr[dialog-toggle] td.flex-width-date"

  # *****************  All_Button_Elements  ******************* #
  section :date_range_filter, ExpandedDateFilter, "#grid-filter-lab_results_grid"
  element :btn_sidekick_detail, "a[id='info-button-sidekick-detailView'] i"
  element :btn_lab_results_modal_close, "#modal-header #sm-close"

  element :fld_lab_results_modal_header , '[data-appletid=lab_results_grid] .header'

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
  def wait_to_load_all_data_in_lab_results_table
    30.times do
      i = fld_lab_results_table_row.length
      unless i > 0
        sleep(1)
      end
      break if i > 0
    end
  end

  # Click on a table Row Cell by providing text
  def click_table_cell_by_text(tableId, columnNum, text)
    self.class.elements(:tableRows, "#{'#' + tableId + ' tbody tr td:nth-of-type(' + columnNum.to_s + ')'}")
    tableRows.each do |record|
      if record.text.upcase.include? text.upcase
        record.click
        break
      end
    end
  end
  
  def initialize
    super
    appletid_css = "[data-appletid=lab_results_grid]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons appletid_css
  end
end
