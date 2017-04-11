class PobTimeline < SitePrism::Page
  set_url '/#news-feed'
  set_url_matcher(/\/#news-feed/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_timeline_heading, "#news-feed .grid-applet-heading"
  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
end
