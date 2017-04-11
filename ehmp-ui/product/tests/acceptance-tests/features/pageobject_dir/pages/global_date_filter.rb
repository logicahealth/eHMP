class PobGlobalDateFilter < SitePrism::Page
  # *****************  All_Button_Elements  ******************* #
  element :btn_all_range, '#allRangeGlobal'
  element :btn_2yr_range, "button[id='2yrRangeGlobal']"
  element :btn_1yr_range, "button[id='1yrRangeGlobal']"
  element :btn_3mo_range, "button[id='3moRangeGlobal']"
  element :btn_1mo_range, "button[id='1moRangeGlobal']"
  element :btn_7d_range, "button[id='7dRangeGlobal']"
  element :btn_72hr_range, "button[id='72hrRangeGlobal']"
  element :btn_24hr_range, "button[id='24hrRangeGlobal']"
  element :btn_1hr_range, "button[id='1hrRangeGlobal']"
  element :btn_Apply_dates, "#customRangeApplyGlobal"
  # element :btn_custom_apply, "button[id='customRangeApplyGlobal']"
  element :btn_date_region_minimized, "#date-region-minimized"
  element :fld_from_date, "#filterFromDateGlobal"
  element :fld_to_date, "#filterToDateGlobal"

  element :fld_empty_row, "#data-grid-newsfeed-gdt tr.empty"
  elements :fld_rows, "#data-grid-newsfeed-gdt tbody tr.selectable"
  element :fld_inpatient_legend_label, :xpath, "//*[contains(@class, 'highcharts-legend-item')]/descendant::*[string() = 'Inpatient']"
  element :fld_inpatient_legend_color, :xpath, "//*[contains(@class, 'highcharts-legend-item')]/descendant::*[string() = 'Inpatient']/following-sibling::*"

  element :fld_outpatient_legend_label, :xpath, "//*[contains(@class, 'highcharts-legend-item')]/descendant::*[string() = 'Outpatient']"
  element :fld_outpatient_legend_color, :xpath, "//*[contains(@class, 'highcharts-legend-item')]/descendant::*[string() = 'Outpatient']/following-sibling::*"

  def gdt_newsfeed_applet_loaded
    return true if has_fld_empty_row?
    return true if fld_rows.length > 0
    return false
  end

  def wait_until_gdt_newsfeed_applet_loaded
    wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
    wait.until { gdt_newsfeed_applet_loaded }
  end

  def legend_color(element)
    element['fill']
  end

  def bins_with_color(color)
    # ex. bins_with_color('#8ADDFF')
    self.class.elements :fld_bins, :xpath, "//*[@class='highcharts-series-group']/descendant::*[@fill='#{color}']"
    fld_bins
  end
end
