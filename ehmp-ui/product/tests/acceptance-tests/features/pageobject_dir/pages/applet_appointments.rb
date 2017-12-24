require_relative 'parent_applet.rb'
require_relative 'expanded_datefilter.rb'
class PobAppointmentsApplet < PobParentApplet
  set_url '#/patient/appointments-full'
  set_url_matcher(/#\/patient\/appointments-full/)

  section :menu, MenuSection, ".workspace-selector"

  element :fld_appointments_applet_heading, "div[data-appletid='appointments'] .applet-chrome-header"
  element :fld_appointment_data_thead, "[data-appletid='appointments'] table thead"

  elements :fld_appointment_table_row, "[data-appletid='appointments'] table tbody tr"
  elements :tbl_headers, "[data-appletid='appointments'] thead th"
  elements :tbl_date_columns, "[data-appletid=appointments] .data-grid table tbody tr td:nth-child(2)"
  element :header_description, "[data-header-instanceid='appointments-formattedDescription'] a"
  
  elements :fld_description_column_values, "[data-appletid='appointments'] tbody tr td:nth-of-type(3)"
  # *************** EXPANDED *************** #
  section :date_range_filter, ExpandedDateFilter, "#grid-filter-appointments"
  elements :expanded_facility_column, "[data-appletid='appointments'] tbody tr td:nth-of-type(8)"
  element :fld_source_dropdown, "#select-source-appointments"

  def appletid
    'appointments'
  end

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
    add_toolbar_buttons appletid_css
    add_text_filter appletid_css
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    return true if fld_appointment_table_row.length > 0
    false
  rescue Selenium::WebDriver::Error::StaleElementReferenceError
    retry
  end

  def rows_with_text(input_text)
    upper = input_text.upcase
    lower = input_text.downcase

    path =  "//div[@data-appletid='appointments']//table/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"
    self.class.elements :rows_with_text, :xpath, path
    rows_with_text
  end

  def tbl_headers_text
    with_screenreader_text = tbl_headers.map { |element| element.text }
    # ex. Medication ( Name of medication ) Press enter to sort
    # regex will strip out the '( Name of medication ) Press enter to sort'
    without_screenreader_text = with_screenreader_text.map { |header_text| header_text.split('(')[0].strip }
    without_screenreader_text
  end
end
