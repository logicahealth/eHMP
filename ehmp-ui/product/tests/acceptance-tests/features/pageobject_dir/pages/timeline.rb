require_relative 'parent_applet.rb'

class PobTimeline < PobParentApplet
  set_url '#/patient/news-feed'
  set_url_matcher(/news-feed/)

  element :fld_timeline_heading, "#news-feed .applet-chrome-header"
  element :fld_date_column_header, "[data-header-instanceid='newsfeed-activityDateTime'] a"
  elements :td_date_column, '[data-appletid=newsfeed] tbody tr.selectable td:nth-of-type(2)'
  element :fld_type_column_header, "[data-header-instanceid='newsfeed-displayType'] a"
  elements :td_type_column, "#content-region [data-appletid=newsfeed] [id^=data-grid-applet-] tr.selectable td:nth-child(4)"
  element :fld_facility_column_header, "[data-header-instanceid='newsfeed-facilityName'] a"
  elements :td_facility_column, "#content-region [data-appletid=newsfeed] [id^=data-grid-applet-] tr.selectable td:nth-child(6)" 
  elements :tbl_timeline_table_data, "[data-appletid=newsfeed] table tr.selectable"
  elements :group_header_rows, "[data-appletid=newsfeed] tbody tr.group-by-header"
  elements :group_header_btns, "[data-appletid=newsfeed] tbody tr.group-by-header td.group-by-header button" 
  elements :groupd_header_badges_nothidden, "[data-appletid=newsfeed] tbody tr.group-by-header .group-by-count-badge:not(.hidden)"

  elements :discharged_admission_rows, :xpath, "//*[@data-appletid='newsfeed']/descendant::td[2 and starts-with(string(), 'Discharged')]/following-sibling::td[3 and string()='Admission']/parent::tr"

  def initialize
    super
    appletid_css = "[data-appletid='newsfeed']"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons appletid_css
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    return true if tbl_timeline_table_data.length > 0
    false
  end

  def all_types(type_text)
    self.class.elements :type_tds, :xpath, "//*[@data-appletid='newsfeed']/descendant::td[3 and string()='#{type_text}']"
    self.class.elements :type_rows, :xpath, "//*[@data-appletid='newsfeed']/descendant::td[3 and string()='#{type_text}']/parent::tr"
  end

  def all_activity_types(activity, type)
    td_path = "//*[@data-appletid='newsfeed']/descendant::td[3 and string()='#{type}']/parent::tr/descendant::td[2 and string()='#{activity}']"
    p td_path
    self.class.elements :type_tds, :xpath, td_path
    self.class.elements :type_rows, :xpath, "#{td_path}/parent::tr"
  end

  def date_column_text_only    
    td_date_column.map { | element| element.text.strip }
  end

  def verify_date_time_sort_selectable(reverse_chronilogical)
    format = "%m/%d/%Y - %H:%M"
    date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} - \\d{2}:\\d{2}")

    for_error_message = reverse_chronilogical ? "is not greater then" : "is not less then"
    columns = date_column_text_only
    date_only = date_format.match(columns[0]).to_s
    higher = Date.strptime(date_only, format)
    (1..columns.length-1).each do |i|

      date_only = date_format.match(columns[i]).to_s
      lower = Date.strptime(date_only, format)
      #p "Comparing #{higher}  with #{lower}"

      check_alpha = reverse_chronilogical ? ((higher >= lower)) : ((higher <= lower))
      p "#{higher} #{for_error_message} #{lower}" unless check_alpha
      return false unless check_alpha
      higher = lower
    end
    return true
  rescue Exception => e
    p "verify_date_sort: #{e}"
    return false
  end
end
