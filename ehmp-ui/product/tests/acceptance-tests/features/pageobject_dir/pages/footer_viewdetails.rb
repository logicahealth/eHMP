class PobViewDetails < SitePrism::Page
# *****************  All_Button_Elements  ******************* #
  element :btn_viewdetails_mysite, '#sync-source-sites li:nth-child(1)'
  element :btn_viewdetails_allva, '#sync-source-sites li:nth-child(2)'
  element :btn_viewdetails_dod, '#sync-source-sites li:nth-child(3)'
  element :btn_viewdetails_communities, '#sync-source-sites li:nth-child(4)'
  element :btn_viewdetails_close, '#sync-modal-close'
  element :btn_viewdetails, '#open-sync-modal'
  element :btn_viewdetails_X, "#modal-header [data-dismiss='modal']"
# *****************  All_Table_Elements  ******************* #
  element :tbl_mysite_domain, '#sync-site-detail th.sortable.renderable.domain'
  element :tbl_mysite_lastrefesh, '#sync-site-detail th.sync-detail-header-last-synced'
  element :tbl_mysite_newdatasince, '#sync-site-detail th.sync-detail-header-new-data-since'
  element :tbl_allva_site, '#sync-site-detail th.sync-detail-header-new-data-since'
  element :tbl_allva_domain, '#sync-site-detail th.sync-detail-header-new-data-since'
  element :tbl_allva_lastrefresh, '#sync-site-detail th.sync-detail-header-new-data-since'
  elements :tbl_viewdetail_table_row, '#sync-site-detail tbody tr'
# *****************  All_Heading_Elements  ******************* #
  element :hdr_heading_source, '#sync-site-detail-header'
  elements :hdr_ehmpdata_source, '#sync-source-sites li'
  element  :hdr_ehmpdatasource,  '#mainModalLabel'
  elements :hdr_viewdetail_table, '#sync-site-detail th.sortable.renderable'
  element :hdr_viewdetail, '#mainModalLabel'
 
end

