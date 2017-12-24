require 'page-object'

class Login
  include PageObject

  span(:facility, :css => '#selectedFacility ~ span span span')
  text_field(:station, :css => '.select2-search__field')
  text_field(:accessCode, :id => /accessCode/)
  text_field(:verifyCode, :id => /verifyCode/)
  button(:login, :id => /login/)

  button(:logout, :css => "[title = 'Sign out. Press enter to sign out']")
  button(:yesLogout, :text => 'Yes')

end