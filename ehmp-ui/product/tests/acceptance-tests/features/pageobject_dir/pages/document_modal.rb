class DocumentDetail < ModalElements
  element :fld_detail_label, '.document-detail h5'

  element :fld_facility_label, 'span[data-detail-label=facility]'
  element :fld_facility, 'span[data-detail=facility]'

  element :fld_type_label, 'span[data-detail-label=type]'
  element :fld_type, 'span[data-detail=type]'
  element :fld_status_label, 'span[data-detail-label=status]'
  element :fld_status, 'span[data-detail=status]'
  element :fld_date_label, 'span[data-detail-label=date-time]'
  element :fld_date, 'span[data-detail=date-time]'
  element :fld_providers_label, 'span[data-detail-label=providers]'
  element :fld_providers, 'span[data-detail=providers]'

  element :fld_results_region, '.results-region h5'
  elements :fld_results_links, '.result-links-region button.detail-result-link'
  element :fld_result_doc, '.result-docs-region .detail-modal-content'
end
