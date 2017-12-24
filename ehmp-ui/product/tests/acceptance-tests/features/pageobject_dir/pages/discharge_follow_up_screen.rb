class PobDischargeFollowUpScreen < SitePrism::Page
  set_url '#/patient/summary'
  set_url_matcher(/#\/patient\/discharge-follow-up/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  section :menu, MenuSection, ".workspace-selector"
  
  elements :fld_all_applets, "[data-appletid]"
  element :fld_documents_filter, "[data-appletid='documents'] .form-control"
  elements :fld_pre_defined_filters, "[data-appletid='documents'] .filter-container-text-list .udaf-tag span"
  element :fld_filter_title, "[data-appletid='documents'] .filter-title-container .filter-title"
  element :link_discharge_follow_up, "a[href='#discharge-follow-up']"

  def initialize
    @@problems_applet = PobProblemsApplet.new
    @@document_applet = PobDocumentsList.new
    @@numeric_results_applet = PobNumericLabApplet.new
    @@narrative_results_applet = PobNarrativeLabResultsApplet.new
    @@active_meds_applet = PobActiveRecentMedApplet.new
    @@appointments = PobAppointmentsApplet.new
    @@orders = PobOrdersApplet.new
  end

  def discharge_follow_up_applets_loaded?(print_checks = false)
    return false unless print_applet_loading_outcome("Documents", @@document_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Numeric Lab Results", @@numeric_results_applet.applet_gist_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Narrative Lab Result", @@narrative_results_applet.applet_summary_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Active Meds", @@active_meds_applet.applet_gist_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Orders", @@orders.applet_loaded?, print_checks)
    @@problems_applet.scroll_into_view
    return false unless print_applet_loading_outcome("Problems", @@problems_applet.applet_loaded?, print_checks)
    @@appointments.scroll_into_view
    return false unless print_applet_loading_outcome("Appointments", @@appointments.applet_loaded?, print_checks)

    return true
  end

  def print_applet_loading_outcome(applet, result, print_checks)
    p "#{applet} loaded? #{result}" if print_checks
    result
  end

  def appletids_on_screen
    fld_all_applets.map { | element | element['data-appletid'] }
  end
  
  def applet_titles(data_appletid)
    po_id = "div[data-appletid='#{data_appletid}'] .panel-title-label"
    self.class.element :fld_applet_title, "#{po_id}"
    self.class.element :fld_applet_view_type, :xpath, "//div[@data-appletid='#{data_appletid}']/parent::div"
  end
  
end
