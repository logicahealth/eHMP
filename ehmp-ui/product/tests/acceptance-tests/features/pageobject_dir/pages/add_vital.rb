

class AddVitalModal < SitePrism::Page
  element :btn_expand_collapse_button, ".expandCollapseAll button"
  element :fld_temp_location, "#temperature-location-po"
  element :fld_modal_title, '#main-workflow-label-Enter-Vitals'

  element :fld_bp_input, "[name='bpInputValue']"
  element :rbn_bp_unavailable, "[name='bp-radio-po'][value='Unavailable']"
  element :rbn_bp_refused, "[name='bp-radio-po'][value='Refused']"
  element :fld_bp_location, "[id^='bp-location-po']"
  element :fld_bp_method, "[id^='bp-method-po']"
  element :fld_bp_cuffsize, "[id^='bp-cuff-size-po']"
  element :fld_bp_position, "[id^='bp-position-po']"

  element :fld_temp_input, "[name='temperatureInputValue']"
  element :rbn_temp_unavailable, "[name='temperature-radio-po'][value='Unavailable']"
  element :rbn_temp_refused, "[name='temperature-radio-po'][value='Refused']"
  element :fld_temp_location, "[name='temperature-location-po']"
  element :rbn_temp_f, "[title='fahrenheit']"
  element :rbn_temp_c, "[title='celsius']"

  element :fld_pulse_input, "[name='pulseInputValue']"
  element :rbn_pulse_unavailable, "[name='pulse-radio-po'][value='Unavailable']"
  element :rbn_pulse_refused, "[name='pulse-radio-po'][value='Refused']"
  element :fld_pulse_method, "[id^='pulse-method-po']"
  element :fld_pulse_position, "[id^='pulse-position-po']"
  element :fld_pulse_site, "[id^='pulse-site-po']"
  element :fld_pulse_location, "[id^='pulse-location-po']"

  element :fld_resp_input, "[name='respirationInputValue']"
  element :rbn_resp_unavailable, "[name='respiration-radio-po'][value='Unavailable']"
  element :rbn_resp_refused, "[name='respiration-radio-po'][value='Refused']"
  element :fld_resp_method, "[id^='respiration-method-po']"
  element :fld_resp_position, "[id^='respiration-position-po']"

  element :fld_pulseox_input, "[name='O2InputValue']"
  element :rbn_pulseox_unavailable, "[name='po-radio-po'][value='Unavailable']"
  element :rbn_pulseox_refused, "[name='po-radio-po'][value='Refused']"
  element :fld_pulseox_suppox, "[name='suppO2InputValue']"
  element :fld_pulseox_method, "[name='po-method-po']"

  element :fld_height_input, "[name='heightInputValue']"
  element :rbn_height_unavailable, "[name='height-radio-po'][value='Unavailable']"
  element :rbn_height_refused, "[name='height-radio-po'][value='Refused']"
  element :rbn_height_in, "[name='heightInputValue-radio-units'][value='in']"
  element :rbn_height_cm, "[name='heightInputValue-radio-units'][value='cm']"
  element :fld_height_quality, "[id^='height-quality-po']"

  element :fld_weight_input, "[name='weightInputValue']"
  element :rbn_weight_unavailable, "[name='weight-radio-po'][value='Unavailable']"
  element :rbn_weight_refused,  "[name='weight-radio-po'][value='Refused']"
  element :rbn_weight_lb, "[name='weightInputValue-radio-units'][value='lb']"
  element :rbn_weight_kg, "[name='weightInputValue-radio-units'][value='kg']"
  element :fld_weight_method, "[id^='weight-method-po']"
  element :fld_weight_quality, "[id^='weight-quality-po']"

  element :fld_cg_input, "[name='circumValue']"
  element :rbn_cg_unavailable, "[name='cg-radio-po'][value='Unavailable']"
  element :rbn_cg_refused, "[name='cg-radio-po'][value='Refused']"
  element :rbn_cg_in, "[name='circumValue-radio-units'][value='in']"
  element :rbn_cg_cm, "[name='circumValue-radio-units'][value='cm']"
  element :fld_cg_site, "[id^='cg-site-po']"
  element :fld_cg_location, "[id^='cg-location-po']"
end
