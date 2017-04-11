require_relative 'common_modal_elements.rb'

class AllergyWritebackModal < ModalElements
  element :fld_allergen_label, "label[for='allergen']"

  element :fld_historical_label, "label[for='allergyType-h']"
  element :rdb_historical_check_box, "#allergyType-h"

  element :fld_observed_label, "label[for='allergyType-o']"
  element :rdb_observed_check_box, "#allergyType-o"
  element :fld_reaction_date_label, "label[for='reaction-date']"
  element :fld_reaction_date, "#reaction-date"

  element :fld_reaction_time_label, "label[for='reaction-time']"
  element :fld_reaction_time, "#reaction-time"

  element :fld_severity_label, "label[for='severity']"
  element :fld_severity, '#severity'

  element :fld_nature_of_reaction_label, "label[for='nature-of-reaction']"
  element :fld_nature_of_reaction, '#nature-of-reaction'

  element :fld_sign_symptom_label, '.signs-and-symptoms legend'
  element :fld_sign_symptom_filter, '#available-signs-and-symptoms-modifiers-filter-results'
  elements :fld_sign_symtptom_options, '.available-region .body.auto-overflow-y .table-row'

  element :fld_comment_label, "label[for='moreInfo']"
  element :fld_comment, '#moreInfo'
end
