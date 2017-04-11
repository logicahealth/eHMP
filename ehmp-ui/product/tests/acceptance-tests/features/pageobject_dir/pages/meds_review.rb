class PobMedsReview < SitePrism::Page
  set_url '/#medication-review'
  set_url_matcher(/\/#medication-review/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_med_review_header, "#medsReviewMainGroup_OUTPATIENT b"
  element :fld_med_review_header_name, "#medication-review .col-sm-12.selectable.header"
  element :fld_inpatient_meds_group, "[id^='accordion'] [href^='#inpatient'] b"
  element :fld_outpatient_meds_group, "[id^='accordion'] [href^='#outpatient'] b"

  elements :fld_med_review_applet_rows, "[data-appletid='medication_review'] [class='panel-heading medsItem']"
  elements :fld_inpatient_meds_rows, "[id^='inpatient-accordion'] .panel-heading.medsItem"
  elements :fld_outpatient_med_rows, "[id^='outpatient-accordion'] .panel-heading.medsItem"
  elements :fld_panel_all_level_headers, "[class='panel-collapse collapse in'] [class^='bottom-']"

  # *****************  All_Button_Elements  ******************* #
  element :btn_toolbar_popover, "[style*='block'] .toolbarPopover [tooltip-data-key='toolbar_detailview']"

  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_outpatient_meds, "#ui-collapse-124>b"

  # *********************  Methods  ***************************#
end
