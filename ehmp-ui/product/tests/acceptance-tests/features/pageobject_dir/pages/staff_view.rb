class PatientSearchTray < SitePrism::Section
  element :fld_my_site_input, '.patientSelectionMySiteSearchText input'
  element :btn_my_site_search, ".patient-selection--my-site-search--input button[type='submit']"

  element :btn_open_cprslist, "li.sidebar.open button[aria-label^='My Cprs List']"
  element :btn_closed_cprslist, "li.sidebar:not(.open) button[aria-label^='My Cprs List']"
  element :btn_current_patient, "button[aria-label^='Current Patient']"

  element :open_ward, "li.sidebar:nth-of-type(6).open"
  element :closed_ward, "li.sidebar:nth-of-type(6):not(.open)"
  element :btn_open_ward, "li.sidebar:nth-of-type(6) button[id^='tray']"

  element :open_nationwide, "li.sidebar:nth-of-type(7).open"
  element :closed_nationwide, "li.sidebar:nth-of-type(7):not(.open)"
  element :btn_open_nationwide, "li.sidebar:nth-of-type(7) button[id^='tray']"

  element :open_recentpatients, "li.sidebar:nth-of-type(4).open"
  element :closed_recentpatients, "li.sidebar:nth-of-type(4):not(.open)"
  element :btn_open_recentpatients, "li.sidebar:nth-of-type(4) button[id^='tray']"
  element :icon_instructions, ".patientSelectionMySiteSearchText .instructions i"
end

class PobStaffView < SitePrism::Page
  set_url '#/staff/provider-centric-view'
  set_url_matcher(/#\/staff\/provider-centric-view/)

  section :workspace_nav, MenuSection, "#header-region"
  section :patient_search_tray, PatientSearchTray, ".patient-search-tray-list"

  element :fld_staff_view, "#current-staff-nav-header-tab"
  element :fld_active_staff_view, "#current-staff-nav-header-tab.active"

  element :fld_tray_title, "li.sidebar.open .panel-title"
  element :btn_search_tray_close, "li.sidebar.open .panel-heading button.close-tray"
  element :btn_search_tray_help, "li.sidebar.open .panel-heading button.help-icon-link"
  element :fld_search_no_results, "li.sidebar.open tr[data-message-type='no-results']"

  elements :fld_search_result_headers, "li.sidebar.open .table-view--patient-selection th"

  # ************************ my site elements ********************** #
  
  element :fld_my_site_instructions, "li.sidebar.open div.filter p:not(.sr-only)"
  element :fld_my_site_search_help, ".patientSelectionMySiteSearchText span.help-block"
  elements :my_site_search_results_name, "li.open .search-results tbody td:nth-of-type(1)"
  elements :results_name_screenreader, "li.open .search-results tbody td:nth-of-type(1) span.sr-only"
  elements :my_site_search_results_dob, "li.open .search-results tbody td:nth-of-type(2)"
  elements :results_dob_screenreader, "li.open .search-results tbody td:nth-of-type(2) span.sr-only"
  elements :my_site_search_results_gender, "li.open .search-results tbody td:nth-of-type(3)"

   # ************************ ward elements ********************** #

  element :fld_ward_label, "label[for^='wardLocation']"
  element :fld_ward_select, ".wardLocation select"
  element :ddl_ward_location, ".wardLocation [x-is-labelledby^='select2-wardLocation']"
  element :fld_ward_search_box, "input[class='select2-search__field']"
  element :fld_ward_filter_no_results, "li.select2-results__option.select2-results__message"
  elements :fld_ward_location_options, ".select2-results__option:not(.empty-option)"
  element :fld_ward_no_patients, "li.sidebar.open tr[data-message-type='no-results']"
  elements :fld_ward_name_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(1)" 
  elements :fld_ward_name_results_screenreader, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(1) span.sr-only"
  elements :fld_ward_dob_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(2)"
  elements :fld_ward_dob_results_screenreader, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(2) span.sr-only"
  elements :fld_ward_room_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(4)"
  elements :fld_ward_room_results_screenreader, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(4) span.sr-only"
  elements :fld_ward_gender_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(3)"
  
  # ************************ nationwide elements ********************** #
  element :fld_nationwide_lastname_label, "label[for^='lastName']"
  element :fld_nationwide_firstname_label, "label[for^='firstName']"
  element :fld_nationwide_dob_label, "label[for^='dob']"
  element :fld_nationwide_SSN_label, "label[for^='ssn']"

  element :fld_nationwide_lastname, '.input-control.lastName input'
  element :fld_nationwide_firstname, '.input-control.firstName input'
  element :fld_nationwide_dob, '.datepicker-control.dob input'
  element :fld_nationwide_ssn, '.input-control.ssn input'
  element :btn_nationwide_search, "li.sidebar.open button[type=submit]"
  element :fld_nw_no_patients, "li.sidebar.open tr[data-message-type='no-results']"
  elements :fld_nw_name_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(1)" 
  elements :fld_nw_name_results_screenreader, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(1) span.sr-only"
  elements :fld_nw_dob_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(2)"
  elements :fld_nw_gender_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(3)"
  elements :fld_nw_dob_results_screenreader, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(2) span.sr-only"

  # ************************ recent patients elements ********************** #
  elements :fld_rp_name_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(1)" 
  elements :fld_rp_name_results_screenreader, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(1) span.sr-only"
  elements :fld_rp_dob_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(2)"
  elements :fld_rp_dob_results_screenreader, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(2) span.sr-only"
  element :fld_rp_no_patients, "li.sidebar.open tr[data-message-type='no-results']"
  elements :fld_rp_gender_results, "li.sidebar.open .table-view--patient-selection tbody td:nth-of-type(3)"

  # ************************ cprs elements ********************** #

  elements :fld_cprs_result_headers, "li.sidebar.open .table-view--patient-selection th"

  elements :fld_all_applets, "[data-appletid]"

  def wait_for_all_applets_to_load(timeout = 30)
    expected_applet_count = 3
    timeout.times do
      num_applets_displayed = fld_all_applets.length
      sleep 1 unless num_applets_displayed == expected_applet_count
    end
    return (fld_all_applets.length == expected_applet_count)
  end

  def strip_sr_only_text(headers_with_extra)
    header_text = []
    headers_with_extra.each do | header_element |
      sr_only_elements = header_element.native.find_elements(:css, '.sr-only')
      start_text = header_element.text
      sr_only_elements.each do | sr_text_element |
        start_text = start_text.gsub(sr_text_element.text, '')
      end
      header_text.push(start_text.strip.upcase)
    end
    header_text
  end

  def fld_ward_result_headers_text
    strip_sr_only_text fld_search_result_headers
  end

  def fld_nw_result_headers_text
    strip_sr_only_text fld_search_result_headers
  end

  def fld_rp_result_headers_text
    strip_sr_only_text fld_search_result_headers
  end

  def fld_cprs_result_headers_text
    max_attempt = 2
    begin
      strip_sr_only_text fld_cprs_result_headers
    rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale
      max_attempt -= 1
      raise stale if max_attempt < 0
      p "stale element, retry"
      retry
    end
  end

  def fld_ward_result_name_text
    visible_text = []
    unique_sr_text = Set.new
    fld_ward_name_results_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end

    fld_ward_name_results.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def fld_nw_result_name_text
    visible_text = []
    unique_sr_text = Set.new
    fld_nw_name_results_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end

    fld_nw_name_results.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def fld_rp_result_name_text
    visible_text = []
    unique_sr_text = Set.new
    fld_rp_name_results_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end

    fld_rp_name_results.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def fld_ward_result_dob_text
    visible_text = []
    unique_sr_text = Set.new
    fld_ward_dob_results_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end

    fld_ward_dob_results.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def fld_nw_result_dob_text
    visible_text = []
    unique_sr_text = Set.new
    fld_nw_dob_results_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end

    fld_nw_dob_results.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def fld_rp_result_dob_text
    visible_text = []
    unique_sr_text = Set.new
    fld_rp_dob_results_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end

    fld_rp_dob_results.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def fld_ward_result_room_text
    visible_text = []
    unique_sr_text = Set.new
    fld_ward_room_results_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end

    fld_ward_room_results.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def ward_search_results_loaded?
    return true if has_fld_ward_no_patients?
    return true if fld_ward_dob_results.length > 0
    false
  end

  def nationwide_search_results_loaded?
    return true if has_fld_nw_no_patients?
    return true if fld_nw_dob_results.length > 0
  end

  def recentpatient_search_results_loaded?
    return true if has_fld_rp_no_patients?
    return true if fld_rp_dob_results.length > 0
  end

  def patient_name_visible_text
    visible_text = []
    unique_sr_text = Set.new
    results_name_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end

    my_site_search_results_name.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def patient_dob_visible_text
    visible_text = []
    unique_sr_text = Set.new
    results_dob_screenreader.each do | sr_text |
      unique_sr_text.add(sr_text.text)
    end
    p unique_sr_text
    my_site_search_results_dob.each do | full_name |
      full_name_text = full_name.text

      unique_sr_text.each do | text |
        full_name_text.gsub!(text, '')
      end
      visible_text.push(full_name_text)
    end
    visible_text
  end

  def my_site_gender_text
    my_site_search_results_gender.map { |gender| gender.text.upcase }
  end

  def ward_location_list_text
    fld_ward_location_options.map { |header| header.text.upcase }
  end

  def nationwide_gender_text
    fld_nw_gender_results.map { |gender| gender.text.upcase }
  end

  def allowable_genders
    %w{ MALE FEMALE UNKNOWN }
  end
end
