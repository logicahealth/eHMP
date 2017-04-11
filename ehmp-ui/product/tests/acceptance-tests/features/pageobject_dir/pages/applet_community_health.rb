require_relative 'parent_applet.rb'
class PobCommunityHealthApplet < PobParentApplet
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #

  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #

  # *****************  Detail Views  ******************* #
  element :btn_next, '#ccdNext'
  element :btn_previous, '#ccdPrevious'
  element :fld_patient_identifier, '#modal-body h5'
  element :fld_details, ".ccd-modal"

  def initialize
    super
    appletid_css = "[data-appletid=ccd_grid]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
  end
end
