class ExpandedDateFilter < SitePrism::Section
  element :grid_filter, ".grid-filter-daterange"
  element :btn_all, ".btn-date-range button[id^='all-range']"
  element :btn_all_active, ".btn-date-range button[id^='all-range'].active-range"
  element :btn_24hr, ".btn-date-range button[id^='24hr-range']"
  element :btn_2yr_range, "button[id^='2yr-range']"
  element :btn_1yr_range, "button[id^='1yr-range']"
  element :btn_3mo_range, "button[id^='3mo-range']"
end
