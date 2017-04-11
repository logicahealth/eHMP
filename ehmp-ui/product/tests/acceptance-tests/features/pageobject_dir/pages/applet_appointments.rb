require_relative 'parent_applet.rb'
class PobAppointmentsApplet < PobParentApplet
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_appointments_applet_heading, "div[data-appletid='appointments'] .grid-applet-heading"
  element :fld_appointment_data_thead, "[data-appletid='appointments'] table thead"

  elements :fld_appointment_table_row, "[data-appletid='appointments'] table tbody tr"
  elements :fld_appointment_modal_headers, "#modal-body p strong"
  elements :expanded_appointment_modal_headers, "#data-grid-appointments > thead th"

  # *****************  All_Button_Elements  ******************* #
  element :btn_appointments_24hr, "button[id='24hr-range-appointments']"
  element :btn_appointments_all, "button[id='all-range-appointments']"

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
  def wait_for_all_data_to_load_in_appointment_table
    30.times do
      i = fld_appointment_table_row.length
      unless i > 0
        sleep(1)
      end
    end
  end
  
  def initialize
    super
    appletid_css = "[data-appletid=appointments]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    return true if fld_appointment_table_row.length > 0
    false
  end
end
