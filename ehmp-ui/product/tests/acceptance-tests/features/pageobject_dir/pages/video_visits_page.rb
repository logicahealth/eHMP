require_relative 'parent_applet.rb'

# http://tianhsky.ueuo.com/blog/2012/03/18/ruby-class-inheritances-vs-extend-vs-include/
# include: you can consider this is equivalent to copying the code from wherever it includes from
module DescriptiveAllThere
  def all_there?
    # p "special all_there"
    Capybara.using_wait_time(0) do
      has_functions = self.class.mapped_items.map { |element| "has_#{element}?" }
      has_functions.each do | element_has_function |
        unless send(element_has_function)
          p "#{element_has_function} failed"
          return false
        end
      end
      return true
    end
  end
end

class VideoVisitsApplet < PobParentApplet
  applet_id = "[data-appletid=video_visits]"
  elements :tbl_headers, "#{applet_id} th a"
  element :tbl_header_datetime, "[data-header-instanceid=video_visits-dateTimeFormatted] a"
  elements :tbl_rows_date_column, "#{applet_id} tbody tr td:nth-of-type(2)"
  elements :tbl_rows, "#{applet_id} tbody tr"

  def initialize
    super
    appletid_css = "[data-appletid=video_visits]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_text_filter_elements appletid_css
    add_text_filter appletid_css
    add_quick_view_popover appletid_css
    add_toolbar_buttons appletid_css
  end

  def date_column_regex
    Regexp.new("\\d{2}\/\\d{2}\/\\d{4} - \\d{2}:\\d{2} \\w{3}")
  end
end

class VideoVisitsDetails < SitePrism::Page
  include DescriptiveAllThere
  label_path = "//div[@class='detail-modal-content']"
  field_path = "following-sibling::span"

  element :appointment_detail_section, :xpath, "//div[@id='modal-body']/descendant::h5[contains(string(), 'Appointment Details')]"
  element :appointment_date_time_header, :xpath, "#{label_path}/descendant::strong[string()='Date/Time:']"
  element :appointment_date_time_fld, :xpath, "//div[@class='row']/descendant::strong[string()='Date/Time:']/#{field_path}"
  element :appointment_facility_header, :xpath, "#{label_path}/descendant::strong[string()='Facility/Location:']"
  element :appointment_facility_fld, :xpath, "//div[@class='row']/descendant::strong[string()='Facility/Location:']/#{field_path}"
  element :appointment_provider_header, :xpath, "#{label_path}/descendant::strong[string()='Provider:']"
  element :appointment_provider_fld, :xpath, "//div[@class='row']/descendant::strong[string()='Provider:']/#{field_path}"

  element :contact_section, :xpath, "//div[@id='modal-body']/descendant::h5[contains(string(), 'Contact Info')]"
  element :contact_phone_header, :xpath, "#{label_path}/descendant::strong[string()='Patient Phone:']"
  # p "#{label_path}/descendant::strong[string()='Patient Phone:']/#{field_path}"
  # element :contact_phone_fld, :xpath, "#{label_path}/descendant::strong[string()='Patient Phone:']/#{field_path}"
  element :contact_email_header, :xpath, "#{label_path}/descendant::strong[string()='Patient Email:']"
  element :contact_email_fld, :xpath, "#{label_path}/descendant::strong[string()='Patient Email:']/#{field_path}"
  element :contact_emergency_header, :xpath, "#{label_path}/descendant::strong[string()='Emergency Contact:']"
  element :contact_emergency_fld, :xpath, "#{label_path}/descendant::strong[string()='Emergency Contact:']/#{field_path}"

  element :comments_section, :xpath, "//div[@id='modal-body']/descendant::h5[contains(string(), 'Comments')]"

  element :btn_previous, '#toPrevious'
  element :btn_next, '#toNext'
  element :btn_header_close, '.modal-header button.close'
  element :btn_footer_close, '.modal-footer button[data-dismiss=modal]'
  element :btn_start_video, "[data-action='StartVideoVisit']"
end

class CreateVideoDisplay < SitePrism::Page
  include DescriptiveAllThere
  tray_id = '#patientDemographic-action'
  element :tray_title, "#{tray_id} .modal-title"
  element :help_icon, "#{tray_id} .help-icon-button-container"
  elements :headers, "#{tray_id} label"
  element :fld_date, "#{tray_id} [name=appointmentDate]"
  element :fld_time, "#{tray_id} [name=appointmentTime]"
  element :btn_open_time, '.bootstrap-timepicker span.input-group-addon'
  element :duration, "#{tray_id} [name=appointmentDuration]"
  element :fld_patient_email, "#{tray_id} [name=patientEmail]"
  element :fld_patient_phone, "#{tray_id} [name=patientPhone]"
  element :fld_phone_type, "#{tray_id} [name=patientPhoneType]"
  element :fld_provider_name, "#{tray_id} [name=providerName]"
  element :fld_provider_email, "#{tray_id} [name=providerEmail]"
  element :fld_provider_phone, "#{tray_id} [name=providerPhone]"
  element :fld_comment, "#{tray_id} [name=comment]"
  element :label_add_instructions, ".additionalInstructionsOption .faux-label"
  element :rb_add_instructions_yes, ".additionalInstructionsOption [value='yes']"
  element :rb_add_instrucitons_no, ".additionalInstructionsOption [value='no']"
  element :btn_cancel, '#cancelButton'
  element :btn_create, '#createButton'

  element :fld_add_instructions, '[name=instructionsList]'
  element :fld_instructions_to_patients, '[name=instructionsToPatient]'
  element :btn_increment_time, ".bootstrap-timepicker-widget [data-action='incrementHour']"
end

class Tray < SitePrism::Page
  element :loading_screen, '.sidebar.open .tray_loader'
end
