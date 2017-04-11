class PobAppointmentsApplet < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_appointments_applet_heading, "div[data-appletid='appointments'] .grid-applet-heading"
  element :fld_appointment_data_thead, "table[id='data-grid-appointments'] thead"

  elements :fld_appointment_table_row, "table[id='data-grid-appointments'] tr"

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
end
