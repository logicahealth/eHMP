require 'rubygems'
require 'watir-webdriver'
require 'page-object'

# require_relative 'common_test_page'
# require_relative 'common_elements_page'

# Coversheet page for $BASE/#cover-sheet
class EhmpAdministrationPage
  include PageObject

  div(:ehmp_administration_applet, css: '[data-appletid=user_management]')
  a(:lastNameHeader, css: '#user_management-lastname > a')
  a(:firstNameHeader, css: '#user_management-firstname > a')
  a(:rolesHeader, css: '#user_management-roles > a')
  element(:firstCell, :td, css: '#data-grid-user_management tbody td:nth-child(1)')
  # element(:firstCell, :td, css: '#data-grid-user_management tr:nth-child(1) td:nth-child(1)')
  element(:modalTitle, :h4, id: 'mainModalLabel')
  element(:select31labtech, :tr, id: 'urn-va-user-9E7A-10000000003')

  # modal
  select_list(:roles, css: '.allRoles')
  span(:designated_roles, css: '.designatedRoles')
  button(:save_roles_btn, css: '#modal-save-button')
  element(:thirdCell, :td, css: '#urn-va-user-9E7A-10000000003 td:nth-child(3)')
end
