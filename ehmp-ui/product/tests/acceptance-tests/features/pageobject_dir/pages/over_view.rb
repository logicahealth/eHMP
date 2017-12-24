# This is the over view  page objects
path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require 'workspace_navigation.rb'
require 'tray_sidebar_section.rb'

class PobOverView < SitePrism::Page
  set_url '#/patient/overview'
  #set_url_matcher(/\/#\/patient\/overview$/)
  set_url_matcher(/#\/patient\/overview/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  section :menu, MenuSection, ".workspace-selector"
  section :traysidebar, TraySidebarSection, "[aria-label='Tray Sidebar']"
  section :patient_view, PatientViewSection, '#context-header-region'

  # element :fld_patient_search_button, "//input[@id='patientSearchInput']"
  element :fld_patient_demographic_patient_info, "#patientDemographic-patientInfo"
  element :fld_demo_patientInfo, ".patient-demographic-content .patient-info"
  element :fld_bottom_region, "#bottom-region"
  element :fld_app_version, "#appVersion"
  element :fld_immunizations_applet, "div[data-appletid='immunizations']"
  element :fld_cover_sheet, "a[href='#cover-sheet']"
  element :fld_news_feed, "a[href='#news-feed']"
  element :fld_overview, "a[href='#overview']"
  element :fld_medication_review, "a[href='#medication-review]"
  element :fld_documents_list, "a[href='#documents-list]"
  element :fld_search_box, "[id^=searchText]"
  element :fld_inactivity_warning_modal, ".modal-dialog #footercontent"
  element :fld_panel_title, "h4.panel-title"
  element :fld_link_help_ehmp_header, "#top-region .help-button-container .help-icon-link"

  elements :fld_data_grid_table_newsfeed_row, "#data-grid-newsfeed tr"
  elements :fld_all_applets, "#overview .panel-title-label"
  elements :fld_allergies, "div[id^='pill-gist-popover-urn:va:allergy']"
  elements :fld_immunization_gist_items, "div[id^='pill-gist-popover-urn:va:immunization']"
  elements :fld_lab_results_age_rows, "#grid-panel-lab_results_grid .table-cell.flex-width-0_5.text-center"
  elements :fld_cwad_details, "div.group-wrapper"
  elements :fld_cwad_visible_titles, "div[aria-hidden='false'] .cwad-title"

  # *****************  All_Button_Elements  ******************* #
  element :btn_patient_search, "#patientSearchButton"
  element :btn_date_region, "#date-region-minimized"
  element :btn_all, "#allRangeGlobal"
  element :btn_apply_date_region, "#customRangeApplyGlobal"
  element :btn_search_box, "#submit [class='fa fa-search']"
  element :btn_date_region, "#navigationPanel #date-region-minimized"
  element :btn_all_range_global, "#allRangeGlobal"
  element :btn_glodal_date_apply, "#customRangeApplyGlobal"
  element :btn_inactivity_warning_modal_close, ".modal-content button[class='close']"

  element :btn_allergy_maximize, "div[data-appletid=allergy_grid] .fa-expand"
  element :btn_lab_results_maximize, "div[data-appletid='lab_results_grid'] .fa-expand"

  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_filter_toggle, ".btn.btn-default.dropdown-toggle"

  # *****************  Methods   *********************** #
  def wait_for_all_applets_to_load_in_overview
    30.times do
      i = fld_all_applets.length
      unless i > 8
        sleep(1)
      end
    end
  end
end
