require_relative 'parent_applet.rb'

class PobProblemsApplet < PobParentApplet 
  
  set_url '#/patient/problems-full'
  set_url_matcher(/#\/patient\/problems-full/)
    
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_problems_gist_item, "[data-appletid=problems] [data-cell-instanceid=event_name_urn_va_problem_DOD_0000000003_1000000528]"
  elements :fld_problems_gist, "[data-appletid=problems] .gist-item-list .gist-item"

  element :fld_open_tray, "#patientDemographic-newObservation.sidebar.open"
  element :fld_add_problem_title, "#main-workflow-label-Add-Problem"

  # *****************  All_Button_Elements  ******************* #
  element :btn_next, '#ccdNext'
  element :btn_previous, '#ccdPrevious'

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  elements :tbl_problems, "table[id='data-grid-problems'] tr.selectable"
  element :tbl_empty_row, "table[id='data-grid-problems'] tr.empty"
  elements :tbl_summary_problem_names, "[data-appletid=problems] tr.selectable td:first-of-type"
  elements :tbl_summary_problem_names_srelement, "[data-appletid=problems] tr.selectable td:first-of-type span"

  def initialize
    super
    appletid_css = "[data-appletid=problems]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons
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
    return fld_problems_gist.length > 0
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
      name = name.sub(screenreader_text[index].text, '')
      names_only.push(name.upcase.strip)
    end
    names_only
  end
end
