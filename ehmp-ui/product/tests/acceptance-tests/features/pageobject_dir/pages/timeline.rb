require_relative 'parent_applet.rb'

class PobTimeline < PobParentApplet
  set_url '/#news-feed'
  set_url_matcher(/\/#news-feed/)

  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_timeline_heading, "#news-feed .applet-chrome-header"
  elements :td_date_column, '#data-grid-newsfeed tr.selectable td:nth-of-type(1)'
  elements :td_date_column_screenreader, '#data-grid-newsfeed tr.selectable td:nth-of-type(1) span' 
  elements :tbl_timeline_table_data, "#data-grid-newsfeed tr.selectable"
  # *****************  All_Button_Elements  ******************* #

  # *****************  All_Drop_down_Elements  ******************* #

  # *********************  Methods  ***************************#
  
  def initialize
    super
    appletid_css = "[data-instanceid='newsfeed']"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
    add_empty_gist appletid_css
    add_toolbar_buttons
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    return true if tbl_timeline_table_data.length > 0
    false
  end

  def date_column_text_only
    dates_screenreader_text = td_date_column
    screenreader_text = td_date_column_screenreader[0]
    dates_only = []
    dates_screenreader_text.each_with_index do | td_element, index |
      date = td_element.text
      date = date.sub(screenreader_text.text, '')
      dates_only.push(date.strip)
    end
    dates_only
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
      p "Comparing #{higher}  with #{lower}"

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
