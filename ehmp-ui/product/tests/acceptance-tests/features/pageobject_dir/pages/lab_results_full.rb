class PobLabResults < SitePrism::Page
  set_url '/#lab-results-grid-full'
  set_url_matcher(/\/#lab-results-grid-full/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_lab_results_applet_heading, "div[data-appletid='lab_results_grid'] .grid-applet-heading"
  element :fld_lab_results_data_thead, "table[id='data-grid-lab_results_grid'] thead"
  element :fld_lab_results_modal_data, "div[id='modal-body'] [id='data-grid-lab_results_grid-modalView']"

  elements :fld_lab_results_applet_row, "div[id='grid-panel-lab_results_grid'] [class='gist-item table-row-toolbar']"
  elements :fld_lab_results_table_row, "table[id='data-grid-lab_results_grid'] tr"

  # *****************  All_Button_Elements  ******************* #
  element :btn_lab_results_all, "button[id='all-range-lab_results_grid']"
  element :btn_sidekick_detail, "a[id='info-button-sidekick-detailView'] i"
  element :btn_lab_results_modal_close, "#modal-header #sm-close"

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
  def wait_to_load_all_data_in_lab_results_table
    30.times do
      i = fld_lab_results_table_row.length
      unless i > 0
        sleep(1)
      end
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
end
