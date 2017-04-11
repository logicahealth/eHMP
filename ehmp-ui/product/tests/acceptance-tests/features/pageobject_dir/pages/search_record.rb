class PobSearchRecord < SitePrism::Page
  set_url '/#record-search'
  set_url_matcher(/\/#record-search/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  elements :fld_result_message, "#search-results-message"
  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
end

