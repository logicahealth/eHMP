require 'page-object'

class Base
  include PageObject
  def initialize(driver)
    @driver = driver
    super(driver)
  end

  #app title
  h1(:title, :css => '.main-title' )

  #primary title
  h2(:primary_header, :css => '.primary-header h2')
  #secondary title
  h2(:secondary_header, :css => '.secondary-header h2')
  #user Menu
  button(:userMenu, :id => 'user-menu-toggle-btn')

  #footer
  span(:rightFooter, :css => 'footer.main-footer span:nth-child(2)')
  span(:leftFooter, :css => 'footer.main-footer span:nth-child(1)')

  #home
  button(:home_btn, :id=>'home-btn')


  def getFocusedElement()
    return element_with_focus
  end

end