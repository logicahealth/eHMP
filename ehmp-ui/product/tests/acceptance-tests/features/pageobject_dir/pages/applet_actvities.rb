require_relative 'parent_applet.rb'
class PobActivitesApplet < PobParentApplet
  set_url '#/patient/activities-patient-full'
  set_url_matcher(/#\/patient\/activities-patient-full/)
  
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_consult_modal_title, "[class='panel-title-label']"
  elements :tbl_activity_rows, "[data-appletid='activities'] tbody tr"  
  elements :fld_add_activities, "#collapse-items-activities li"
  elements :fld_activity_type, "#data-grid-activities > tbody > tr > td:nth-child(4)"
  element :fld_domain_header, "[data-header-instanceid='activities-DOMAIN'] a"
  elements :fld_domain_column_data, "#data-grid-activities tr.selectable td:nth-child(4)"
  element :fld_search_activity, "[id='input-filter-search-activities']"
  elements :fld_activity_headers, "#data-grid-activities thead tr th"
  elements :fld_activity_mode_column_data, "#data-grid-activities tr.selectable td:nth-child(11)"
  elements :fld_activity_created_by_column_data, "#data-grid-activities tr.selectable td:nth-child(8)"

  # *****************  All_Button_Elements  ******************* #
  element :btn_activity_filter, "[id='grid-filter-button-activities']"
  element :ddL_activity_display_only, "div[data-appletid='activities'] .mode select"
  element :ddL_activity_primary_filter, "div[data-appletid='activities'] .primarySelection select"
  elements :fld_activity_primary_filter_options, "div[data-appletid='activities'] .primarySelection select option"
    
  def initialize
    super
    appletid_css = "[data-appletid=activities]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_expanded_applet_fields appletid_css
  end

  def applet_loaded?(allow_errors = DefaultLogin.local_testrun)
    return true if has_fld_error_msg? && allow_errors # this is here because locally this is allowed
    return true if has_fld_empty_row?
    return true if tbl_activity_rows.length > 0
    false
  end

  def number_expanded_applet_rows
    return 0 if has_fld_empty_row?
    tbl_activity_rows.length
  end

  def activity_types
    fld_activity_type.map { |td| td.text }
  end
end
