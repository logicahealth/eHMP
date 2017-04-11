require_relative 'parent_applet.rb'

class PobNarrativeLabResultsApplet < PobParentApplet
  set_url '#/patient/narrative-lab-results-grid-full'
  set_url_matcher(/#\/patient\/narrative-lab-results-grid-full/)
      
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_col_description, "[data-header-instanceid='narrative_lab_results_grid-description'] a"
  elements :fld_description_column_values, "#data-grid-narrative_lab_results_grid tbody tr td:nth-of-type(2)"

  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #
  elements :fld_applet_table_rows, "#data-grid-narrative_lab_results_grid tbody tr"
   
  def initialize
    super
    appletid_css = "[data-appletid=narrative_lab_results_grid]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
    add_text_filter appletid_css
  end

  def row_text
    fld_applet_table_rows.map { |tr| tr.text }
  end
end
