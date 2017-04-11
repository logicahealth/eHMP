require 'rubygems'
require 'watir-webdriver'
require 'page-object'

# Numeric Lab Results page object
class LabResultsPage
  include PageObject
  button(:numeric_lab_results_gist_plus_button, css: '#a4fcd86f8715 .applet-add-button.btn.btn-sm.btn-link')
  button(:glucose_result, css: '#observations_GLUCOSE .row.equalHeights.noMargin.border-vertical')
  button(:add_order, css: '#ordersView-button-toolbar')
  button(:numeric_lab_results_coversheet_plus_button, css: '#\39 dc9f289d846 .applet-add-button.btn.btn-sm.btn-link')
end
