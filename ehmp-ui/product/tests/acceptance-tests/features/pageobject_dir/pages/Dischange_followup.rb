require_relative 'parent_applet.rb'

class DischargeFollowup < PobParentApplet
  set_url '#/staff/discharge-care-coordination'
  set_url_matcher(/#\/staff\/discharge-care-coordination/)
  
  elements :fld_discharge_followup_table_row, "[data-appletid='discharge_followup'] tbody  tr.selectable"
  
  element :discharge_followup_applet, "[data-appletid=discharge_followup]"
  element :discharge_followup_expanded, "[data-view-type=expanded]"
  elements :fld_discharge_followup_headers, "[data-appletid=discharge_followup] table thead tr th"

  def initialize
    super
    appletid_css = "[data-appletid=discharge_followup]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_toolbar_buttons appletid_css
    add_quick_view_popover appletid_css
    add_empty_table_row appletid_css
  end
end
