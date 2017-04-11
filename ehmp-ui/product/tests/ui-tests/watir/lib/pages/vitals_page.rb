require 'rubygems'
require 'watir-webdriver'
require 'page-object'

# VitalsGistPage: Page-Object for vitals gist on overview page and expanded vitals gist
class VitalsPage
  include PageObject

  span(:vitalsTitle, css: '[data-appletid=vitals] .panel-title')

  # Vitals buttons
  button(:refresh, css: '[data-appletid=vitals] .applet-refresh-button')
  link(:help, id: 'help-button-vitals')
  button(:add, css: '[data-appletid=vitals] .applet-add-button')
  button(:maximize, css: '[data-appletid=vitals] .applet-maximize-button')
  button(:filter, css: '[data-appletid=vitals] .applet-filter-button')
  button(:minimize, css: '[data-appletid=vitals] .applet-minimize-button')

  # Latest Vitals
  element(:bp_label, :td, css: '[data-appletid=vitals] [data-infobutton=BP] td:nth-child(1)')
  element(:bp_result, :td, css: '[data-appletid=vitals] [data-infobutton=BP] td:nth-child(2)')
  element(:bp_date, :td, css: '[data-appletid=vitals] [data-infobutton=BP] td:nth-child(3)')
  element(:bp_row, :tr, css: '[data-appletid=vitals] [data-infobutton=BP]')
  element(:bp_no_record, :td, xpath: "//tr[@data-infobutton = 'BP']/descendant::td[contains(string(), 'No Record')]")

  element(:p_label, :td, css: '[data-appletid=vitals] [data-infobutton=P] td:nth-child(1)')
  element(:p_result, :td, css: '[data-appletid=vitals] [data-infobutton=P] td:nth-child(2)')
  element(:p_date, :td, css: '[data-appletid=vitals] [data-infobutton=P] td:nth-child(3)')

  element(:r_label, :td, css: '[data-appletid=vitals] [data-infobutton=R] td:nth-child(1)')
  element(:r_result, :td, css: '[data-appletid=vitals] [data-infobutton=R] td:nth-child(2)')
  element(:r_date, :td, css: '[data-appletid=vitals] [data-infobutton=R] td:nth-child(3)')

  element(:t_label, :td, css: '[data-appletid=vitals] [data-infobutton=T] td:nth-child(1)')
  element(:t_result, :td, css: '[data-appletid=vitals] [data-infobutton=T] td:nth-child(2)')
  element(:t_date, :td, css: '[data-appletid=vitals] [data-infobutton=T] td:nth-child(3)')

  element(:po2_label, :td, css: '[data-appletid=vitals] [data-infobutton=PO2] td:nth-child(1)')
  element(:po2_result, :td, css: '[data-appletid=vitals] [data-infobutton=PO2] td:nth-child(2)')
  element(:po2_date, :td, css: '[data-appletid=vitals] [data-infobutton=PO2] td:nth-child(3)')

  element(:pn_label, :td, css: '[data-appletid=vitals] [data-infobutton=PN] td:nth-child(1)')
  element(:pn_result, :td, css: '[data-appletid=vitals] [data-infobutton=PN] td:nth-child(2)')
  element(:pn_date, :td, css: '[data-appletid=vitals] [data-infobutton=PN] td:nth-child(3)')

  element(:wt_label, :td, css: '[data-appletid=vitals] [data-infobutton=WT] td:nth-child(1)')
  element(:wt_result, :td, css: '[data-appletid=vitals] [data-infobutton=WT] td:nth-child(2)')
  element(:wt_date, :td, css: '[data-appletid=vitals] [data-infobutton=WT] td:nth-child(3)')

  element(:bmi_label, :td, css: '[data-appletid=vitals] [data-infobutton=BMI] td:nth-child(1)')
  element(:bmi_result, :td, css: '[data-appletid=vitals] [data-infobutton=BMI] td:nth-child(2)')
  element(:bmi_date, :td, css: '[data-appletid=vitals] [data-infobutton=BMI] td:nth-child(3)')
  element(:bmi_row, :tr, css: '[data-appletid=vitals] [data-infobutton=BMI]')

  a(:vital_detail, id: 'info-button-sidekick-detailView')
  h4(:vital_modal_title, class: 'modal-title')
  button(:vital_modal_xclose, css: '#modal-header button.close')
  div(:mainModal, id: 'mainModalDialog')
  div(:mainModalBackdrop, css: 'div.modal-backdrop.fade.in')

  def applet_finish_loading?
    return false unless bp_label?
    return false unless bp_result?
    true
  end
end
