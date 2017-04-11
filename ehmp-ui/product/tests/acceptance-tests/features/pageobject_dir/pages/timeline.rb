require_relative 'parent_applet.rb'

class PobTimeline < PobParentApplet
  set_url '/#news-feed'
  set_url_matcher(/\/#news-feed/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_timeline_heading, "#news-feed .grid-applet-heading"
  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
  
  def initialize
    super
    appletid_css = "[data-appletid=newsfeed]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons
  end
end
