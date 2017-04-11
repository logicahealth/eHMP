

class AddVitalModal < SitePrism::Page
  element :btn_expand_collapse_button, ".expandCollapseAll button"
  element :fld_temp_location, "#temperature-location-po"
  element :fld_modal_title, '#main-workflow-label-Enter-Vitals'

  element :fld_bp_input, '#bpInputValue'
  element :rbn_bp_unavailable, '#bp-radio-po-Unavailable'
  element :rbn_bp_refused, '#bp-radio-po-Refused'
  element :fld_bp_location, '#bp-location-po'
  element :fld_bp_method, '#bp-method-po'
  element :fld_bp_cuffsize, '#bp-cuff-size-po'
  element :fld_bp_position, '#bp-position-po'

  element :fld_temp_input, '#temperatureInputValue'
  element :rbn_temp_unavailable, '#temperature-radio-po-Unavailable'
  element :rbn_temp_refused, '#temperature-radio-po-Refused'
  element :fld_temp_location, '#temperature-location-po'
  element :rbn_temp_f, '#temperatureInputValue-F-radio'
  element :rbn_temp_c, '#temperatureInputValue-C-radio'

  element :fld_pulse_input, '#pulseInputValue'
  element :rbn_pulse_unavailable, '#pulse-radio-po-Unavailable'
  element :rbn_pulse_refused, '#pulse-radio-po-Refused'
  element :fld_pulse_method, '#pulse-method-po'
  element :fld_pulse_position, '#pulse-position-po'
  element :fld_pulse_site, '#pulse-site-po'
  element :fld_pulse_location, '#pulse-location-po'

  element :fld_resp_input, '#respirationInputValue'
  element :rbn_resp_unavailable, '#respiration-radio-po-Unavailable'
  element :rbn_resp_refused, '#respiration-radio-po-Refused'
  element :fld_resp_method, '#respiration-method-po'
  element :fld_resp_position, '#respiration-position-po'

  element :fld_pulseox_input, '#O2InputValue'
  element :rbn_pulseox_unavailable, '#po-radio-po-Unavailable'
  element :rbn_pulseox_refused, '#po-radio-po-Refused'
  element :fld_pulseox_suppox, '#suppO2InputValue'
  element :fld_pulseox_method, '#po-method-po'

  element :fld_height_input, '#heightInputValue'
  element :rbn_height_unavailable, '#height-radio-po-Unavailable'
  element :rbn_height_refused, '#height-radio-po-Refused'
  element :rbn_height_in, '#heightInputValue-in-radio'
  element :rbn_height_cm, '#heightInputValue-cm-radio'
  element :fld_height_quality, '#height-quality-po'

  element :fld_weight_input, '#weightInputValue'
  element :rbn_weight_unavailable, '#weight-radio-po-Unavailable'
  element :rbn_weight_refused, '#weight-radio-po-Refused'
  element :rbn_weight_lb, '#weightInputValue-lb-radio'
  element :rbn_weight_kg, '#weightInputValue-kg-radio'
  element :fld_weight_method, '#weight-method-po'
  element :fld_weight_quality, '#weight-quality-po'

  element :fld_cg_input, '#circumValue'
  element :rbn_cg_unavailable, '#cg-radio-po-Unavailable'
  element :rbn_cg_refused, '#cg-radio-po-Refused'
  element :rbn_cg_in, '#circumValue-in-radio'
  element :rbn_cg_cm, '#circumValue-cm-radio'
  element :fld_cg_site, '#cg-site-po'
  element :fld_cg_location, '#cg-location-po'
end
