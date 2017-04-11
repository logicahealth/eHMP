require_relative 'parent_applet.rb'

class PobStackedGraphsApplet < PobParentApplet
  elements :fld_columnheaders, "[aria-label='Stacked Graphs Grid'] [role='columnheader']"
  def initialize
    super
    appletid_css = "[data-appletid=stackedGraph]"
    add_applet_buttons appletid_css
    add_title appletid_css

    add_generic_error_message appletid_css
  end

  def applet_loaded?
    return true if fld_columnheaders.length > 0
    false
  end
end
