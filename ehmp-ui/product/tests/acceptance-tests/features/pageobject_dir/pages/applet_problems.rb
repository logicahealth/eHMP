require_relative 'parent_applet.rb'

class PobProblemsApplet < PobParentApplet 
  
  set_url '#/patient/problems-full'
  set_url_matcher(/#\/patient\/problems-full/)
    
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_problems_gist_item, "[data-appletid=problems] [data-cell-instanceid='event_name_urn_va_problem_DOD_0000000003_1000000528']"
  elements :fld_problem_gist_toolbar_trigger, "[data-appletid='problems'] .table-row-toolbar .table-row [dialog-toggle='toolbar']"
  elements :fld_problems_gist, "[data-appletid=problems] .gist-item-list .gist-item"
  
  element :fld_quick_view_no_toolbar, "[data-item-instanceid='onset_formatted_urn_va_problem_SITE_711_139']"

  element :fld_open_tray, "#patientDemographic-newObservation.sidebar.open"
  element :fld_add_problem_title, "[id^=main-workflow-label-view]"

  elements :fld_all_problems_expanded_view, "[data-appletid='problems'] .data-grid table tr.selectable"
  elements :fld_expanded_facilities, "[data-appletid='problems'] tbody td .facilityName"
  elements :fld_gist_problem_names, "[data-appletid='problems'] .problem-name span:not(.sr-only)"
  elements :fld_gist_onset, "[data-appletid='problems'] [data-item-instanceid^='onset_formatted']"

  elements :fld_problems_headers, "[data-appletid='problems'] [data-header-instanceid]"
  element :fld_manual_sort, ".tilesort-remove-sort"
  element :btn_remove_manual_sort, ".tilesort-remove-sort button"

  # *****************  All_Button_Elements  ******************* #
  element :btn_next, '#ccdNext'
  element :btn_previous, '#ccdPrevious'

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_problems, "[data-appletid='problems'] .data-grid table tr.selectable"
  element :tbl_empty_row, "[data-appletid='problems'] .data-grid table tr.empty"
  elements :tbl_summary_problem_names, "[data-appletid=problems] tr.selectable td:first-of-type"
  elements :tbl_summary_problem_names_srelement, "[data-appletid=problems] tr.selectable td:first-of-type span"
  elements :tbl_problems_quick_view, ".table-condensed tr"
  elements :tbl_problems_quick_view_headers, "div.popover [id^=urn_va_problem_] thead th"
  
  element :col_problems, "[data-appletid=problems] [data-header-instanceid='name-header']"
  element :col_acuity, "[data-appletid=problems] [data-header-instanceid='onset-date-header']"
  element :col_status, "[data-appletid=problems] [data-header-instanceid='status-name-header']"
  element :col_facility, "[data-appletid=problems] [data-header-instanceid='facility-name-header']"
  
  element :col_problem_name, "[data-header-instanceid='problems-problemText'] a"
    
  # *************** CIW **************** #
  element :pbm_essential_hypertension, :xpath, "//div[@data-appletid='problems']/descendant::span[contains(string(), 'Essential hypertension')]/ancestor::div[starts-with(@data-cell-instanceid, 'event_name_urn_va_problem')]"
  elements :udw_pbm_essential_hypertension, :xpath, "//*[@data-appletid='problems']/descendant::td[contains(string(), 'Hypertension')]"
  element :btn_associated_workspace_multiple, "[aria-label='associated workspace']"
  elements :fld_sub_menu_items, "[aria-labelledby^='submenuview'].dropdown-menu .list-group-item"
  element :btn_associated_workspace, ".associatedworkspace-button-toolbar"
  element :btn_second_udw, "[aria-labelledby^='submenuview'].dropdown-menu li:nth-child(2) a"
    

  # *************** DETAILS ************** #
  element :btn_edit_problem, '#editBtn'
  def initialize
    super
    appletid_css = "[data-appletid=problems]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons appletid_css
    add_quick_view_popover appletid_css
    add_tile_sort_elements
    add_text_filter appletid_css
  end
  
  def applet_loaded?
    return true if has_fld_empty_row?
    return tbl_problems.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def applet_gist_loaded?
    return true if has_fld_empty_gist?
    return fld_gist_problem_names.length > 0
  rescue => exc
    p exc
    return false
  end

  def wait_until_applet_loaded
    wait_until { applet_loaded? }
  end
  
  def wait_until_applet_gist_loaded
    wait_until { applet_gist_loaded? }
  end

  def number_expanded_applet_rows
    return 0 if has_tbl_empty_row?
    tbl_problems.length
  end

  def summary_problem_name
    names_screenreader_text = tbl_summary_problem_names
    screenreader_text = tbl_summary_problem_names_srelement
    names_only = []
    names_screenreader_text.each_with_index do | td_element, index |
      name = td_element.text
      name = name.sub(screenreader_text[index].text, '') unless index >= screenreader_text.length
      names_only.push(name.upcase.strip)
    end
    names_only
  end

  def gist_problem_names_only
    fld_gist_problem_names.map { | name_element | name_element.text  }
  end

  def gist_acuity_column_text
    fld_gist_acuity.map { | name_element | name_element.text  }
  end

  def gist_status_column_text
    fld_gist_status.map { | name_element | name_element.text  }
  end

  def gist_facility_column_text
    fld_gist_facility.map { | name_element | name_element.text  }
  end

  def rows_for_facility(facility)
    self.class.elements :fld_facility_rows, :xpath, "//span[@class='facilityName' and contains(string(),'#{facility}')]/ancestor::tr"
  end

  def expanded_row_elements(data_row_instanceid)
    self.class.element :td_acuity, "[data-row-instanceid='#{data_row_instanceid}'] .acuityType"
  end
end
