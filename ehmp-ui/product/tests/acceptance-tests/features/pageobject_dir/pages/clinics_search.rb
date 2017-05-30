class PobClinicsSearch < SitePrism::Page
  set_url '#/staff/provider-centric-view'
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  element :open_clinics_search, ".patient-search-tray-list li.sidebar:nth-of-type(4).open"
  element :closed_clinics_search, ".patient-search-tray-list li.sidebar:nth-of-type(4):not(.open)"
  # *****************  All_Button_Elements  ******************* #
  element :btn_open_clinics_search, ".patient-search-tray-list li.sidebar:nth-of-type(4) button[id^='tray']"
  element :btn_close_clinics_search_x, "li.sidebar.open .close-tray"
  element :btn_clinics_helpicon, "li.sidebar.open .panel-heading button.help-icon-link"
  element :btn_clinics_location, "li.sidebar.open .select2-selection__arrow"
  element :btn_clinics_minusThirtyDays, "li.sidebar.open .minusThirtyDays button.date-range-item" 
  element :btn_clinics_minusThirtyDays_active, "li.sidebar.open .minusThirtyDays .active"
  element :btn_clinics_minusSevenDays, "li.sidebar.open .minusSevenDays button.date-range-item"
  element :btn_clinics_minusSevenDays_active, "li.sidebar.open .minusSevenDays .active"  
  element :btn_clinics_minusOneDay, "li.sidebar.open .minusOneDay button.date-range-item" 
  element :btn_clinics_minusOneDay_active, "li.sidebar.open .minusOneDay .active" 
  element :btn_clinics_plusOneDay, "li.sidebar.open .plusOneDay button.date-range-item" 
  element :btn_clinics_plusOneDay_active, "li.sidebar.open .plusOneDay .active" 
  element :btn_clinics_plusSevenDay, "li.sidebar.open .plusSevenDay button.date-range-item" 
  element :btn_clinics_plusSevenDay_active, "li.sidebar.open .plusSevenDay .active" 
  element :btn_clinics_today_active, "li.sidebar.open .today .active"
  element :btn_clinics_today, "li.sidebar.open .today button"
  element :btn_clinics_apply, "li.sidebar.open button[class='btn btn-primary left-margin-md valign-top']"
  elements :btn_clinics_active, "li.sidebar.open .btn-group--date-range button.active"
  # *****************  All_Heading_Elements  ******************* #
  element :hdr_heading_clinics_tray, "li.sidebar.open .header-title-container"
  element :hdr_error_from_date, ".fromDate span[id^='form-control-error']"
  element :hdr_error_to_date, ".toDate span[id^='form-control-error']"
  # *****************  All_Field_Elements  ******************* #
  element :fld_disabled_clinics_location, '.clinicLocation select[disabled]'
  element :fld_clinics_location, '.clinicLocation .select2-selection[x-is-labelledby^="select2-clinicLocation"]'
  elements :fld_clinics_location_options, "div.clinicLocation select option:not([value=''])"
  element :fld_clinics_from_date, ".datepicker-control.fromDate .datepicker-input"
  element :fld_clinics_to_date, ".datepicker-control.toDate .datepicker-input"
  elements :fld_clinics_date_resultes, "li.sidebar.open .search-results td.flex-width-1"
  elements :fld_clinics_result_headers, "li.sidebar.open .table-view--patient-selection th"
  element :fld_clinics_location_label, "label[for^='clinicLocation']"
  element :fld_clinics_fromdate_label, "label[for^='fromDate']"
  element :fld_clinics_todate_label, "label[for^='toDate']"
  # *****************  All_Table_Elements  ******************* #
  element :tbl_clinics_search_resultes, "li.sidebar.open .search-results"
  elements :tbl_clinics_search_resultes_rows, "li.sidebar.open .search-results tbody tr"
  element :tbl_clinics_search_resultes_rows1, "li.sidebar.open .search-results tbody tr:nth-of-type(1) td:nth-of-type(1)"
  elements :tbl_clinics_resultes_AppDate, "li.sidebar.open .search-results tbody td:nth-of-type(1)"
  elements :tbl_clinics_resultes_patientname, "li.sidebar.open .search-results tbody td:nth-of-type(2)"
  elements :tbl_clinics_resultes_DateOfBirth, "li.sidebar.open .search-results tbody td:nth-of-type(3)"
  elements :tbl_clinics_resultes_DateOfBirth_screenreader, "li.sidebar.open .search-results tbody td:nth-of-type(3) span.sr-only"
  elements :tbl_clinics_results_gender, "li.sidebar.open .search-results tbody td:nth-of-type(4)"
  element :tbl_clinics_error, "li.sidebar.open [data-message-type=no-results]"
  element :tbl_clinics_table, "li.sidebar.open .search-results .no-scroll"
  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_clinics_location_compandpen, ".select2-results__options li:nth-of-type(2)"
  element :ddl_clinics_location_results, '.select2-results ul[id^="select2-clinicLocation"]'

  def tbl_clinics_resultes_text
    visible_text = []
    unique_sr_text = Set.new
    tbl_clinics_resultes_DateOfBirth_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end
    tbl_clinics_resultes_DateOfBirth.each do | full_name |
      full_name_text = full_name.text
      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def clinics_search_results_loaded?
    return true if has_tbl_clinics_error?
    return true if tbl_clinics_resultes_patientname.length > 0
    false
  end

  def tbl_clinics_results_gender_text
    tbl_clinics_results_gender.map { |td| td.text }
  end
end
