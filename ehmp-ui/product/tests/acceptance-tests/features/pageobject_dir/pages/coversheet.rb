path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require 'global_header_section.rb'
class PobCoverSheet < SitePrism::Page
  set_url '/#/patient/cover-sheet'
  set_url_matcher(/\/#\/patient\/cover-sheet/)

  section :global_header, GlobalHeaderSection, ".navbar"
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_bottom_region, "#bottom-region"
  element :fld_Community_Health_Summaries_title, "div[data-appletid='ccd_grid'] .applet-chrome-header"
  element :fld_Community_Health_Summaries_thead, "div[data-appletid='ccd_grid'] thead"
  element :fld_appointments_thead, "div[data-appletid='appointments'] thead"

  elements :fld_applet_items, "#cover-sheet .panel-title-label"

  # *****************  All_Button_Elements  ******************* #
  element :btn_appointments_expand, "div[data-appletid='appointments'] .fa-expand"

  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_coversheet, "#navigation-navbar span#screenName"

  # *********************  Methods  ***************************#
  def wait_for_all_applets_to_load_in_coversheet
    30.times do
      i = fld_applet_items.length
      unless i > 8
        sleep(1)
      end
    end
  end
end
