class PobSummaryScreen < SitePrism::Page
  set_url '/#/patient/summary'
  set_url_matcher(/\/#\/patient\/summary$/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  section :menu, MenuSection, ".workspace-selector"
  section :traysidebar, TraySidebarSection, "[aria-label='Tray Sidebar']"
  elements :fld_all_applets, "[data-appletid]"

  def initialize
    @@tasks = PobTasksApplet.new
    @@conditions_applet = ConditionsGist.instance
    @@allergy_gist_applet = AllergiesGist.instance
    @@document_applet = PobDocumentsList.new
    @@numeric_results_applet = LabResultsGist.instance
    @@narrative_results_applet = NarrativeLabResults.instance
    @@active_meds_applet = MedicationGistContainer.instance
    @@activities = PobActivitesApplet.new
    @@stacked_graphs = PobStackedGraphsApplet.new
    @@appointments = PobAppointmentsApplet.new
  end

  def summary_applets_loaded?(print_checks = false)
    @@tasks.scroll_into_view
    return false unless print_applet_loading_outcome("Tasks", @@tasks.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Problems", @@conditions_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Allergy", @@allergy_gist_applet.applet_loaded?, print_checks)
    @@document_applet.scroll_into_view
    return false unless print_applet_loading_outcome("Documents", @@document_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Numeric Lab Results", @@numeric_results_applet.applet_grid_loaded, print_checks)
    return false unless print_applet_loading_outcome("Narrative Lab Result", @@narrative_results_applet.applet_loaded?, print_checks)
    return false unless print_applet_loading_outcome("Active Meds", @@active_meds_applet.applet_loaded?, print_checks)
    @@activities.scroll_into_view
    return false unless print_applet_loading_outcome("Activities", @@activities.applet_loaded?, print_checks)
    @@stacked_graphs.scroll_into_view
    return false unless print_applet_loading_outcome("Stacked Graphs", @@stacked_graphs.applet_loaded?, print_checks)
    @@appointments.scroll_into_view
    return false unless print_applet_loading_outcome("Appointments", @@appointments.applet_loaded?, print_checks)

    return true
  end

  def print_applet_loading_outcome(applet, result, print_checks)
    p "#{applet} loaded? #{result}" if print_checks
    result
  end

  def wait_for_all_applets_to_load_in_overview(timeout = 30)
    timeout.times do
      num_applets_displayed = fld_all_applets.length
      sleep 1 unless num_applets_displayed == 10
    end
  end

  def appletids_on_screen
    fld_all_applets.map { | element | element['data-appletid'] }
  end
end
