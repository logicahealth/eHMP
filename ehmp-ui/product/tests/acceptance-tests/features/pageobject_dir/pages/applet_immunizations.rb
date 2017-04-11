require_relative 'parent_applet.rb'

class PobImmunizationsApplet < PobParentApplet
  
  set_url '#/patient/immunizations-full'
  set_url_matcher(/#\/patient\/immunizations-full/)
    
  # *****************  All_Form_Elements  ******************* #

  # *****************  All_Logo_Elements  ******************* #

  # *****************  All_Field_Elements  ******************* #
  element :fld_immunization_gist_item, "[data-infobutton='Tdap']"
  element :fld_immunization_type_select, "li:contains('PNEUMOCOCCAL CONJUGATE')"
  element :fld_ordering_provider, "#orderedBy"
  element :fld_dosage_input, "#dosage"
  element :fld_vis_date_input, "#visDateOffered"
  element :fld_comments, "#comments"
  element :fld_administered_date_input, "#administrationDateHistorical"
  element :fld_immunization_results, "#select2-immunizationType-results"
 
  elements :fld_immunization_gist, "[data-appletid=immunizations] .grid-container [data-infobutton-class=info-button-pill]"
  
  

  # *****************  All_Button_Elements  ******************* #
  element :btn_addBtn , ".addBtn [type='submit']"
  element :btn_next, '#toNext'
  element :btn_previous, '#toPrevious'

  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_immunization_type, "[x-is-labelledby='select2-immunizationType-container']"
  element :ddl_ordered_by, "[x-is-labelledby='select2-orderedByAdministered-container']"
  element :ddl_lot_number, "#lotNumberAdministered"
  element :ddl_route_of_administration, "#routeOfAdministration"
  element :ddl_anatomic_location, "#anatomicLocation"
  element :ddl_series, "#series"
  element :ddl_information_source, "#informationSource"
  # ***************** All_check_box_elements **************** #
  element :chk_administered, "#administeredHistorical-administered"
  element :chk_historical, "#administeredHistorical-historical"
  element :chk_information_stmt1, "#informationStatement-61"
  element :chk_information_stmt2, "#informationStatement-62"
  # *****************  All_Table_Elements  ******************* #
  elements :tbl_immunization_grid, "table[id='data-grid-immunizations'] tr.selectable"    
  elements :tbl_immunization_first_row_columns, "table[id='data-grid-immunizations'] tr.selectable:nth-child(1) td"
  elements :tbl_immunization_first_row_columns, "table[id='data-grid-immunizations'] td"
  element :tbl_modal_body_immunization_table, "#data-grid-immunizations-modalView"
  elements :tbl_summary_imm_names, "[data-appletid='immunizations'] table tbody tr.selectable td:first-of-type"
  elements :tbl_summary_imm_screenreader_text, "[data-appletid='immunizations'] table tbody tr.selectable td:first-of-type span"
  elements :tbl_immunization_headers, "table[id='data-grid-immunizations'] th a"
  elements :tbl_immunization_headers_screenreadertext, "table[id='data-grid-immunizations'] th span"

  # **************** Gist Elements ************************** #
  elements :fld_pills, '[data-appletid=immunizations] [data-infobutton-class=info-button-pill]'
  elements :hdr_quickview_headers, "[id^='urn:va:immunization:'] thead th"
  
  def initialize
    super
    appletid_css = "[data-appletid=immunizations]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_expanded_applet_fields appletid_css
    add_toolbar_buttons
  end
  
  def applet_loaded?
    return true if has_fld_empty_row?
    return tbl_immunization_grid.length > 0
  rescue => exc
    p exc
    return false
  end
  
  def applet_gist_loaded?
    return true if has_fld_empty_gist?
    return fld_immunization_gist.length > 0
  rescue => exc
    p exc
    return false
  end

  def wait_until_applet_loaded
    wait_until { applet_loaded? }
  end
  
  def wait_until_applet_gist_loaded
    wait_until { applet_gist_loaded? }
  end
  
  def add_immunization_data_info_btn(immunization_type)
    self.class.element(:btn_new_immunization_pill, "[data-infobutton^='#{immunization_type}']")    
  end
  
  def summary_immunization_names(num_names = 100)
    names_screenreader_text = tbl_summary_imm_names
    screenreader_text = tbl_summary_imm_screenreader_text
    names_only = []
    names_screenreader_text.each_with_index do | td_element, index |
      break if index > num_names
      name = td_element.text
      name = name.sub(screenreader_text[index].text, '')
      names_only.push(name.strip)
    end
    names_only
  end

  def immunization_table_headers
    # current header format
    # <a> HEADER TEXT <b><span.sr-only></span></b><span.sr-only></span></a>
    # so cut off header text at <b>
    header_only = []
    tbl_immunization_headers.each_with_index do | header, index |
      header_sections = header.native.attribute('innerHTML').split("<b")
      header_only.push(header_sections[0])
    end
    header_only
  end
end
