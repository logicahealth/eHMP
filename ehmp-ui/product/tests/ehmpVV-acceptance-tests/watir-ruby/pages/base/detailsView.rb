require 'rubygems'
require 'watir-webdriver'
require 'page-object'
require_relative '../base/base'

class DetailsView
  include PageObject

  button(:additionalinstructions, :css => '#btnAdditionalInstructions')
  button(:startvidoevisitbtn, :css => '#btnStartVideoVisit')
  button(:closebtn_alert, :css => '.btn.btn-default.alert-cancel')

  button(:nobtn_alert, :css => '.btn.btn-default.btn-sm.alert-cancel')
  button(:yesbtn_alert, :css => '.btn.btn-primary.btn-sm.alert-continue')
  button(:closeicon, :css => '.close.btn[data-dismiss=modal]')

  button(:closebtn, :css => '.btn.btn-default.btn-sm[data-dismiss=modal]')
  div(:modelContent, :id => 'modal-content') 
  div(:alertModelContent, :css => '.alert-container.modal-dialog .modal-content') 
  div(:startModelContent, :css => '#mainAlert.modal .alert-container.modal-dialog .modal-content')
  table(:dataRows, :id => 'data-grid-applet-1')
end
