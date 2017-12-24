require_relative 'parent_applet.rb'
class PobDocumentsList < PobParentApplet
  set_url '#/patient/documents-list'
  set_url_matcher(/#\/patient\/documents-list/)

  applet_id = "[data-appletid=documents]"
  element :fld_documents_heading, "div[data-appletid='documents'] .applet-chrome-header"
  elements :fld_date_headers, "[data-appletid=documents] td.group-by-header"

  elements :fld_table_head, "[data-appletid=documents] thead th"

  elements :fld_date_headers, "[data-appletid=documents] th[scope=rowGroup] button"
  elements :fld_date_headers_sr, "[data-appletid=documents] th[scope=rowGroup] button"
  elements :fld_document_data_rows, "[data-appletid='documents'] tbody tr:not(.row-header):not(.infinite-scrolling-indicator-container)"
  elements :fld_date_headers_badges, "[data-appletid=documents] th[scope=rowGroup] button span.badge"
  elements :fld_date_headers_visible_badges, "[data-appletid=documents] th[scope=rowGroup] button span.badge:not(.hidden)"

  elements :fld_document_rows, "[data-appletid=documents] tbody tr"
  elements :fld_document_rows_date, "[data-appletid=documents] tbody > tr > td[headers^=dateDisplayview]"
  elements :fld_document_rows_type, "[data-appletid=documents] tbody > tr > td:nth-child(4)"
  elements :fld_document_rows_description, "[data-appletid=documents] tbody > tr > td:nth-child(3)"
  elements :fld_document_rows_facility, "[data-appletid=documents] tbody > tr > td:nth-child(6)"

  # **  COLUMN HEADERS ** #
  element :fld_header_date, "[data-appletid=documents] th[id^='dateDisplayview'] button"
  element :fld_type_header, "[data-appletid=documents] th[id^='kindview'] button"
  element :fld_facility_header, "[data-appletid=documents] th[id^='facilityNameview'] button"
  element :fld_author_header, "[data-appletid=documents] th[id^='authorDisplayNameview'] button"
  element :fld_description_header, "[data-appletid=documents] th[id^='localTitleview'] button"

  element :fld_infinite_scroll_message, ".infinite-scrolling-indicator-container"
  element :sorting_message, "[data-appletid=documents] span[data-table-state=sorting]"
  element :loading_message, "[data-appletid=documents] span[data-table-state=loading]"

  element :btn_remove_all, "#{applet_id} .remove-all"

  # *********************  Methods  *************************** #

  def initialize
    super
    appletid_css = "[data-appletid=documents]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_adk_form_text_filter appletid_css
    add_empty_infinite_scroll_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons appletid_css
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    # p "#{fld_date_headers.length} and #{fld_document_data_rows.length}"
    return true if fld_date_headers.length > 0 && fld_document_data_rows.length > 0
    false
  end

  def document_types
    fld_document_rows_type.map { |td| td.text }
  end

  def document_facilities
    fld_document_rows_facility.map { |td| td.text }
  end

  def column_date_dateformat
    header_dates = []
    fld_document_rows_date.each do | row |
      full_text = row.text
      sr_text = /Press enter to view additional details./.match(full_text)
      row_date_formated_string = full_text.sub(sr_text.to_s, "").strip
#      p row_date_formated_string
      row_date = Date.strptime(row_date_formated_string, "%m/%d/%Y")
      header_dates.push(row_date)
    end
    header_dates
  end

  def column_date_group_dateformat
    header_dates = []
    fld_date_headers.each do | row |
      full_text = row.text
      sr_text = /\d* Results In/.match(full_text)
      row_date_formated_string = full_text.sub(sr_text.to_s, "").strip
      begin
        row_date = Date.strptime(row_date_formated_string, "%B %Y")
      rescue Exception => e
        p e
        p row_date_formated_string
        raise e
      end
      header_dates.push(row_date)
    end
    header_dates
  end

  def done_loading
    return true if has_no_fld_infinite_scroll_message?
    found_bottom = /All \d+ records are displayed./.match(fld_infinite_scroll_message.text)
    return true unless found_bottom.nil?
    false
  end

  def retrieve_report_all_records_loaded
    found_bottom = /\d+/.match(fld_infinite_scroll_message.text)
    p "message text did not match expected format, reporting -1 rows loaded" if found_bottom.nil?
    return -1 if found_bottom.nil?
    return found_bottom.to_s
  end

  def reporting_all_records_loaded
    return false unless has_fld_infinite_scroll_message?
    found_bottom = /All \d+ records are displayed/.match(fld_infinite_scroll_message.text)
    return !found_bottom.nil?
  end

  def infinite_scroll_serverside(css_row)
    driver = TestSupport.driver
    found_bottom = false
    number_of_attempts = 0
    until found_bottom && number_of_attempts > 2
      count1 = driver.find_elements(:css, css_row).length
      p "scroll row #{count1} into view"
      element = driver.find_element(:css, "#{css_row}:nth-child(#{count1})")
      element.location_once_scrolled_into_view
      scroller = "[data-appletid=documents] tbody"
      script = "$('#{scroller}').scroll();"
      # p script
      TestSupport.driver.execute_script(script)

      return false unless wait_for_fld_infinite_scroll_message
      wait_until(30) { done_loading }
      return true if reporting_all_records_loaded

      count2 = driver.find_elements(:css, css_row).length
      found_bottom = (count1 == count2)
      number_of_attempts = found_bottom ? number_of_attempts + 1 : 0
      sleep 1 if found_bottom
    end
    return found_bottom
  rescue Exception => e
    # p "error thrown #{e}"
    return false
  end

  def scroll
    wait_until(120) { infinite_scroll_serverside("[data-appletid='documents'] tbody tr") }
  rescue Exception => e
      p "could not scroll"
  end

  def sorted?(ascending, print_output = false)
    header_dates = column_date_group_dateformat
    row_dates = column_date_dateformat

    expected_header_dates = header_dates.sort
    expected_header_dates.reverse! unless ascending

    expected_row_dates = column_date_dateformat.sort
    expected_row_dates.reverse! unless ascending

    header_sorted = header_dates.eql?(expected_header_dates)
    rows_sorted = row_dates.eql?(expected_row_dates)
    p '--------------------headers-----------------------------------------' if !header_sorted && print_output
    (0..header_dates.length-1).each do | index |
      p "#{expected_header_dates[index]}: #{header_dates[index]}" if !header_sorted && print_output
    end
    p '--------------------rows-----------------------------------------' if !rows_sorted && print_output
    (0..row_dates.length-1).each do | index |
      matches = expected_row_dates[index].eql?(row_dates[index])
      p "#{expected_row_dates[index]}: #{row_dates[index]}: did it match? #{matches}" if !rows_sorted && print_output
    end
    return (header_sorted && rows_sorted)
  end
end
