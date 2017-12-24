require_relative 'common_modal_elements.rb'

class AllergyWritebackModal < ModalElements
  element :fld_allergen_label, ".allergen label"

  element :fld_historical_label, :xpath, "//input[@value='h']/parent::label"
  element :rdb_historical_check_box, "input[value=h]"

  element :fld_observed_label, :xpath, "//input[@value='o']/parent::label"
  element :rdb_observed_check_box, "input[value=o]"
  element :fld_reaction_date_label, ".reaction-date label"
  element :fld_reaction_date, ".reaction-date input[type=text]"

  element :fld_reaction_time_label, ".reaction-time label"
  element :fld_reaction_time, ".reaction-time input[type=text]"

  element :fld_severity_label, ".severity label"
  element :fld_severity, '.severity select'

  element :fld_nature_of_reaction_label, ".nature-of-reaction label"
  element :fld_nature_of_reaction, '.nature-of-reaction select'

  element :fld_sign_symptom_label, '.signs-and-symptoms legend'
  element :fld_sign_symptom_filter, '#available-signs-and-symptoms-modifiers-filter-results'
  elements :fld_sign_symtptom_options, '.available-region .body.auto-overflow-y .table-row'

  element :fld_comment_label, ".moreInfo label"
  element :fld_comment, '.moreInfo textarea'
end
