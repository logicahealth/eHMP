require_relative 'parent_applet.rb'

class PobMedsReview < PobParentApplet
  
  set_url '/#medication-review'
  set_url_matcher(/\/#medication-review/)
       
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_med_review_header, "#medsReviewMainGroup_OUTPATIENT b"
  element :fld_med_review_header_name, "#medication-review .col-sm-12.selectable.header"
  element :fld_inpatient_meds_group, "[id^='accordion'] [data-type-row='inpatient']"
  element :fld_outpatient_meds_group, "[id^='accordion'] [data-type-row='outpatient']"
  element :fld_med_item, :xpath, "//div[contains(@class, 'col-xs-3') and contains(string(), 'methocarbamol')]"

  elements :fld_med_review_applet_rows, "[data-appletid='medication_review'] [class='panel-heading meds-item']"
  elements :fld_inpatient_meds_rows, "#inpatient-medication_review div.medication-layout-view .meds-item .col-xs-3:nth-of-type(1)"
  elements :fld_outpatient_med_rows, "#outpatient-accordion-medication_review div.medication-layout-view .meds-item .col-xs-3:nth-of-type(1)"
  # #outpatient-accordion-medication_review div.medication-layout-view .meds-item .col-xs-3:nth-of-type(1)
  elements :fld_panel_all_level_headers, "[class='panel-collapse collapse in'] strong"

  # *****************  All_Button_Elements  ******************* #
  element :btn_toolbar_popover, "[style*='block'] .toolbarPopover [tooltip-data-key='toolbar_detailview']"

  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_outpatient_meds, "#ui-collapse-124>b"

  # *********************  Methods  ***************************#
  
  def initialize
    super
    appletid_css = "[data-appletid=medication_review]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons
  end
  
  def meds_review_applet_loaded?
    return true if has_fld_empty_row?
    return fld_med_review_applet_rows.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def wait_until_meds_review_applet_loaded
    wait_until { meds_review_applet_loaded? }
  end
end
