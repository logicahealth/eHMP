class PobRecordSearch < SitePrism::Page
  set_url '/#record-search'
  set_url_matcher(/\/#record-search$/)

  element :fld_suggestion_list, "#suggestList"
  elements :fld_suggestion_list_items, :xpath, "//ul[@id='suggestList']/li"
  elements :fld_spelling_suggestions, :xpath, "//ul[@id='suggestList']/descendant::span[string() = 'Spelling Suggestion']"

  elements :fld_result_message, "#search-results-message"
  elements :fld_search_suggest_labels, "#suggestListDiv .label-default"
  element :fld_search_suggest_search_for, "#suggestList li:first-of-type"

  element :txt_search_text, '#searchText'
  element :fld_number_results, '.number-of-results'
  element :fld_first_main_group, ".mainGroup[style='display: block;']"
  elements :fld_main_group, 'div.mainGroup'
  elements :btn_expand_main_group, '.mainGroup > button'
  elements :btn_expand_sub_group, '.documentSubgroup > button'
  elements :fld_search_result_items_displayed, ".search-result-item[style='display: block;']"
  elements :fld_search_result_items_hidden, ".search-result-item[style='display: none;']"
  elements :fld_search_result_dates, ".subgroupItem .row > div:nth-of-type(1)"
  elements :fld_search_result_facilities, ".subgroupItem .row > div:nth-of-type(3)"

  element :fld_first_document_subgroup, '[aria-expanded=true] div.documentSubgroup'
  elements :fld_document_sub_groups, 'div.documentSubgroup'
  elements :fld_document_sub_group_badges, '.documentSubgroup span.badge'

  element :btn_all_range, '#all-range-text-search'
  element :btn_2yr, "button[id='2yr-range-text-search']"
  element :btn_active_2yr, "button[id='2yr-range-text-search'].active-range"
  element :btn_1yr, "button[id='1yr-range-text-search']"
  element :btn_active_1yr, "button[id='1yr-range-text-search'].active-range"
  element :btn_3m, "button[id='3mo-range-text-search']"
  element :btn_active_3m, "button[id='3mo-range-text-search'].active-range"
  element :btn_1m, "button[id='1mo-range-text-search']"
  element :btn_7d, "button[id='7d-range-text-search']"
  element :btn_72hr, "button[id='72hr-range-text-search']"
  element :btn_24hr, "button[id='24hr-range-text-search']"

  def displayed_result_dates
    p fld_search_result_items_displayed.length
    # p fld_search_result_items_displayed
    fld_search_result_items_displayed.map { | search_element | search_element['date'] }
  end

  def expand_all_results
    buttons = btn_expand_main_group
    buttons.each do | button |
      button.click if button['aria-expanded'] == 'false'
    end
    buttons = btn_expand_sub_group
    buttons.each do | button |
      button.click if button['aria-expanded'] == 'false'
    end
  end

  def verify_results_in_range(start_date, end_date)
    date_format_template = "%m/%d/%Y - %H:%M"
    range_date = displayed_result_dates
    range_date.each do | temp_date |
      p "verifying #{temp_date}"
      next if temp_date.upcase.eql?('UNKNOWN')

      row_date = DateTime.strptime(temp_date, date_format_template)
      date_in_range = row_date > start_date && (row_date <= end_date)
      p "#{row_date} is not in range #{start_date} - #{end_date}" unless date_in_range
      return false unless date_in_range  
    end
    return true
  rescue => e 
    p e
    return false
  end

  def search_suggestion_labels
    fld_search_suggest_labels.map { |label| label.text }
  end

  def search_suggestion_bold(text)
    self.class.elements :fld_search_suggestion_match, :xpath, "//*[@id='suggestList']/descendant::strong[string() = '#{text}']"
    fld_search_suggestion_match
  end

  def group_results(groupontext)
    p "div[id$='#{groupontext}'] .subgroupItem .row > div:nth-of-type(1)"
    p "div[id$='#{groupontext}'] .subgroupItem .row > div:nth-of-type(3)"
    self.class.elements :fld_subgroup_dates, "div[id$='#{groupontext}'] .subgroupItem .row > div:nth-of-type(1)"
    self.class.elements :fld_subgroup_facilities, "div[id$='#{groupontext}'] .subgroupItem .row > div:nth-of-type(3)"
  end
end
