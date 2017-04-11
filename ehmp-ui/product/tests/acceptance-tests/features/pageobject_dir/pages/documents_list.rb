class PobDocumentsList < SitePrism::Page
  set_url '/#documents-list'
  set_url_matcher(/\/#documents-list/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_documents_heading, "div[data-appletid='documents'] .grid-applet-heading"
  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
end
