require 'rubygems'
require 'watir-webdriver'
require 'page-object'
require_relative '../base/base'

class CreateAppointment
  include PageObject

  button(:additem, :css => '.applet-add-button.btn.btn-sm.btn-icon')
  h4(:createaptmodeltitle, :css => '#main-workflow-label-Create-Video-Visit-Appointment.modal-title')
  button(:helpicon, :css => '.help-icon-button-container .help-icon-link[data-original-title=Help] .fa.fa-question.fa-lg')
  image(:dateicon, :css => '.input-group-addon .fa-calendar.fa')
  text_field(:date, :id => /appointmentDate-view/)
  button(:dateIcon, :css => '.calendar-container .fa.fa-calendar')
  text_field(:time, :id => /appointmentTime-view/)
  text_field(:timeHour, :css => '.bootstrap-timepicker-hour')
  text_field(:timeMinutes, :css => '.bootstrap-timepicker-minute')
  button(:timeIcon, :css => '.input-group-addon .fa-clock-o.color-primary')
  select_list(:duration, :id => /appointmentDuration-view/)
  text_field(:patientEmail, :id => /patientEmail/)
  text_field(:patientPhone, :id => /patientPhone-view/)

  select_list(:patientPhoneType, :id => /patientPhoneType-view/)
  text_field(:providerName , :id => /providerName-view/)
  text_field(:providerEmail , :id => /providerEmail-view/)
  text_field(:providerPhone , :id => /providerPhone-view/)
  text_area(:comment , :id => /comment-view/)
  span(:charCount, :css => '.char-count-region .top-margin-no.right-margin-xs.pull-right')
  radio_button(:yesRadio , :css => '.radio [name=additionalInstructionsOption][value=yes][type=radio][title=Yes]')
  radio_button(:noRadio , :css => '.radio [type=radio][name=additionalInstructionsOption][title=No][value=no]')
  button(:cancel , :id => 'cancelButton')
  button(:create , :id => 'createButton')
  span(:errorMessage, :id => /form-control-error-view/)
 
  #####
  div(:modelContent, :css => '.modal-content') 
  div(:cancelPopup, :id => /popover/)
  button(:noCancel, :id => /confirm-dismiss-button-view/)
  button(:yesCancel, :id => /confirm-cancel-button-view/)

  select(:selectinstructionsdropdownlist , :id => /instructionsList-view/)
  textarea(:instructionstopatient, :id => /instructionsToPatient-view/)
  div(:instructionssenttopatientlabel , :css => /instructionsToPatient-view/)

  span(:charCount_Additional, :css => '.textarea-control.instructionsToPatient .right-margin-xs.pull-right.top-margin-no')

  button(:actionTray, :css => '#patientDemographic-action .btn.btn-default') 
  div(:trayBody, :css => '#patientDemographic-action .sidebar-tray[role=region]')
  button(:btn_growl_close, '.close[type=button][data-notify=dismiss]')
  element :btn_modal_close, "#modal-close-button"
  div(:growlBody, :css => '.growl-alert.growl-alert-user[data-notify=container]')
  span(:growler_message, :css => '[data-notify=message]')
  div(:fld_growl_alert, :css => '.notify-message') 


end
