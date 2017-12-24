class NumericLabResultsModal < SitePrism::Page 
  element :btn_previous_lab, '#labssPrevious'
  element :btn_next_lab, '#labssNext'

  element :fld_data_table, '#lrDataTableView'
  element :fld_data_table_title, '#lrDataTableView h5'

  element :tbl_dta, '#data-grid-lab_results_grid-modalView'
  row_css = '#data-grid-lab_results_grid-modalView tbody tr[data-row-instanceid]'
  elements :tbl_headers, "#data-grid-lab_results_grid-modalView thead th"
  elements :tbl_data_rows, row_css
  elements :tbl_date_columns, "#{row_css} td:nth-of-type(1)"
  elements :tbl_flag_columns, "#{row_css} td:nth-of-type(2)"
  elements :tbl_result_columns, "#{row_css} td:nth-of-type(1)"
  elements :tbl_facility_columns, '#data-grid-lab_results_grid-modalView tbody tr[data-row-instanceid] td:nth-of-type(4)'
  element :fld_total_tests_label, '[id=lrDataTableView] [id=totalTests]'
  element :fld_total_tests, '[id=lrDataTableView] [id=totalTests] span'

  element :graph_container, '#modal-body #chartContainer'
  elements :graph_points, "#modal-body .highcharts-markers path"
  elements :graph_date_labels, "#modal-body #chartContainer .highcharts-axis-labels text[text-anchor=end] tspan"

  element :fld_from_date, '#filterFromDate'
  element :fld_to_date, '#filterToDate'
  element :btn_filter_apply, '#customRangeApply'

  def date_column_correct_format?
    helper = HelperMethods.new
    tbl_date_columns.each do | date_element |
      next if helper.date_time? date_element.text
      next if helper.date_only? date_element.text
      p "#{date_element.text} did not match allowable format"
      return false
    end
    return true
  end

  def facility_column_allowed_names?
    helper = HelperMethods.new
    tbl_facility_columns.each do | facility_element |
      next if helper.known_facilities_monikers.include? facility_element.text
      p "#{facility_element.text} is not an allowable facility moniker. Allowable monikers are #{helper.known_facilities_monikers}"
      return false
    end
    return true
  end
end
