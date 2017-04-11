class VitalModal < SitePrism::Page
  elements :fld_latest_col, "th:not([data-header-instanceid])"
  elements :tbl_vital_tests, "#data-grid-vitals-modalView tbody tr"
  element :btn_all_range, "#allRange"

  element :tbl_vital_tests_date_header, "[data-header-instanceid='vitals-modalView-observed']"
  def latest_column_text
    fld_latest_col.map { | header| header.text }
  end
end
