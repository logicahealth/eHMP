class AllergyModal < ModalElements
  element :btn_entered_in_error, ".modal-footer #error"
  element :fld_edit_error_msg, ".modal-footer p"
  elements :data_labels, ".detail-modal-content .row strong"

  element :fld_drug_classes, "span[data-detail=drugClasses]"
  element :fld_nature_of_reaction, "span[data-detail=natureOfReaction]"
  element :fld_entered_by, "span[data-detail=originatorName]"
  element :fld_originated, "span[data-detail=originatedFormatted]"
  element :fld_verified, "span[data-detail=verifierName]"
  element :fld_observed_or_historical, "span[data-detail=observedOrHistorical]"
  element :fld_observed_date, "span[data-detail=observedDate]"
  element :fld_facility, "span[data-detail=facilityName]"
  element :fld_severity, "div[data-detail=allergySeverity]"

  def initialize
    super
    add_navigation_btns
  end
end
