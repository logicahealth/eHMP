class PobDemographicsElements < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_patient_info_title, "#patient-header-demographic-details .sidebar.open .panel-title"
  element :fld_home_phone_label, '#pt-header-pt-phone dt:nth-of-type(1)'
  element :fld_home_phone_value, '#pt-header-pt-phone dl dd:nth-of-type(1)'

  element :fld_cell_phone_label, '#pt-header-pt-phone dt:nth-of-type(2)'
  element :fld_cell_phone_value, '#pt-header-pt-phone dl dd:nth-of-type(2)'
  element :fld_cell_phone_discrepancies, '#demo-cell-phone .fa-exclamation-circle'

  element :fld_work_phone_label, '#pt-header-pt-phone dt:nth-of-type(3)'
  element :fld_work_phone_value, '#pt-header-pt-phone dl>dd:nth-of-type(3)'
  element :fld_work_phone_discrepancies, '#demo-work-phone .fa-exclamation-circle'

  element :fld_patient_info_block, '.patient-info'
  elements :fld_patient_info_options, '.patient-info span'
  element :fld_patient_name_status, '.patient-demographic-content h2'
  element :fld_patient_dob, "[data-instanceid='patientDemographic-patientInfo-dob']"
  element :fld_patient_info, ".patient-info.toggle-details p"
  element :fld_patient_gender, "#patientDemographic-patientInfo-gender"
  element :fld_patient_ssn, "#patientDemographic-patientInfo-ssn"

  element :fld_provider_info_title, "#patient-header-provider-details .sidebar.open .panel-title"
  element :fld_home_address_value, "#pt-header-pt-address dd:nth-of-type(1)"
  element :fld_home_temp_add_value, "#pt-header-pt-address dd:nth-of-type(3)"
  element :fld_temp_address_titile, "#pt-header-pt-address dt:nth-of-type(2)"
  element :fld_email_value, "#pt-header-email .group-content"
  element :fld_em_con_relationship_value, "#pt-header-em-contact dd:nth-of-type(1)"
  element :fld_em_con_name_value, "#pt-header-em-contact dd:nth-of-type(2)"
  element :fld_em_home_ph_value, "#pt-header-em-contact dd:nth-of-type(3)"
  element :fld_em_work_ph_value, "#pt-header-em-contact dd:nth-of-type(4)"
  element :fld_em_home_add_value, "#pt-header-em-contact dd:nth-of-type(5)"
  element :fld_nok_relationship_value, "#pt-header-nok-contact dd:nth-of-type(1)"
  element :fld_nok_name_value, "#pt-header-nok-contact dd:nth-of-type(2)"
  element :fld_nok_home_ph_value, "#pt-header-nok-contact dd:nth-of-type(3)"
  element :fld_nok_work_ph_value, "#pt-header-nok-contact dd:nth-of-type(4)"
  element :fld_nok_home_add_value, "#pt-header-nok-contact dd:nth-of-type(5)"
  element :fld_ins_service_connected_value, "#pt-header-em-ins dd:nth-of-type(1)"
  element :fld_ins_service_cond_value, "#pt-header-em-ins dd:nth-of-type(2)"
  element :fld_ins_service_insurance_value, "#pt-header-em-ins dd:nth-of-type(16)"
  element :fld_veteran_status_value, "#pt-header-em-misc dd:nth-of-type(1)"
  element :fld_marital_status_value, "#pt-header-em-misc dd:nth-of-type(2)"
  element :fld_religion_value, "#pt-header-em-misc dd:nth-of-type(3)"
  element :fld_patient_information_provider, "#patientInformationProviderInfoSummary"
  element :fld_patient_provider_info, "#patientProviderInformation"

  elements :fld_phone_values, "#pt-header-pt-phone dd .group-data"
  elements :fld_provider_group_header, ".group-wrapper h5"
  elements :fld_patient_info_provider_headers, "#patientInformationProviderInfoSummary .info strong"
  elements :fld_patient_info_provider_groups, "#patientInformationProviderInfoSummary .info"
  elements :fld_demographic_group_headers, ".group-header>h5"
  elements :fld_demographic_group_fields, ".group-content>dl>dt"
  # *****************  All_Button_Elements  ******************* #
  element :btn_demographic, ".patient-demographic button[id^='tray'][aria-expanded='false']"
  element :btn_close_demographic, ".patient-demographic button[id^='tray'][aria-expanded='true']"
  element :btn_provider_info, "#patient-header-provider-details button[id^= tray]"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #

  attr_reader :patient_care_provider_header
  def initialize
    @patient_care_provider_header = {}
    @patient_care_provider_header['primary_care_provider'] = 1
    @patient_care_provider_header['primary_care_assoc_provider'] = 2
    @patient_care_provider_header['mh_treatment_team'] = 3
    @patient_care_provider_header['mh_treatment_coordinator'] = 4
  end

  def phone_in_correct_format?(element_text)
    return true if element_text.eql?('No Record Found')
    phone_text_format = Regexp.new("\\(\\d{3}\\) \\d{3}-\\d{4}")
    no_match = phone_text_format.match(element_text).nil?
    p "#{element_text} was not in expected format of #{phone_text_format}" if no_match
    return !no_match
  end

  def verify_phone_format_in_list(objects)
    objects.each do |item|
      return true if item.text.include?('No Record Found')
      p 'Test-----'
      p phone_text_format = Regexp.new("\\(\\d{3}\\) \\d{3}\\d{4}")
      p no_match = phone_text_format.match(item.text).nil?
      p "#{item.text} was not in expected format of #{phone_text_format}" if no_match
      return false if no_match
    end
    false
  end
  
  def dob_age_in_correct_format?(element_text)
    dob_age_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} \\(\\d+\\y\\)")
    no_match = dob_age_format.match(element_text).nil?
    p "#{element_text} was not in expected format of #{dob_age_format}" if no_match
    return !no_match
  end

  def birth_date
    dob_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
    dob = dob_format.match(fld_patient_dob.text)
    dob.to_s
  end

  def age
    age_format = Regexp.new("\\(\\d+\\y\\)")
    just_age = Regexp.new("\\d+")
    age_with_year = age_format.match(fld_patient_dob.text)
    age = just_age.match(age_with_year.to_s)
    age.to_s
  end

  def load_decrepant_elements(partialId)
    self.class.element :btn_decrepant, "[data-target='#discrepanciesCollapse#{partialId}']"
    self.class.element :fld_decrepant_info, "#discrepanciesCollapse#{partialId}[aria-expanded='true'] .discrepancy-group"
  end

  def load_patient_care_provider_header_elements(partialid)
    nth_type = @patient_care_provider_header[partialid]
    fail "'#{partialid}' is not a defined element" if nth_type.nil?
    self.class.elements :fld_primary_care_provider, ".group-wrapper:nth-of-type(#{nth_type}) dt"
  end

  def provider_group_header_text
    fld_provider_group_header.map { | item | item.text }
  end
end
