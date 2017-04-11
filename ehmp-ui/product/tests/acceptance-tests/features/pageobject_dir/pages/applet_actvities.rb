require_relative 'parent_applet.rb'

class PobActivitesApplet < PobParentApplet
  elements :tbl_activity_rows, "[data-appletid='activities'] tbody tr"
  def initialize
    super
    appletid_css = "[data-appletid=activities]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_expanded_applet_fields appletid_css
  end

  def applet_loaded?
    return true if has_fld_error_msg? && DefaultLogin.local_testrun # this is here because locally this is allowed
    return true if has_fld_empty_row?
    return true if tbl_activity_rows.length > 0
    false
  end
end
