class PobRecordSearch < PobParentApplet
  set_url '#/patient/record-search'
  set_url_matcher(/record-search$/)

  element :fld_suggestion_list, ".suggest-list"
  elements :fld_suggestion_list_items, :xpath, "//ul[contains(@class, 'suggest-list')]/li"
  elements :fld_spelling_suggestions, :xpath, "//ul[contains(@class, 'suggest-list')]/descendant::span[string() = 'Spelling Suggestion']"
  element :fld_no_results_message, "#suggestListDiv #noResults"
  elements :fld_result_message, "#search-results-message"
  elements :fld_search_suggest_labels, "#suggestListDiv .label-default"
  element :fld_search_suggest_search_for, ".suggest-list li:first-of-type"

  element :txt_search_text, '[id^=searchText]'
  element :txt_search_results, ".search-results-content"
  element :fld_number_results, '.number-of-results'
  element :fld_num_result_count, ".text-search-number-of-results-count"
  elements :fld_main_group, 'div.search-group'
  elements :btn_expand_main_group, '.search-group > button'
  elements :btn_expand_sub_group, '.documentSubgroup > button'
  elements :fld_search_results_data_rows, '.search-result-item'
  elements :fld_search_result_items_displayed, ".search-result-item.searchResultItem-filterable"
  elements :fld_search_result_items_hidden, ".search-result-item[style='display: none;']"
  elements :fld_search_result_dates, ".subgroupItem .row > div:nth-of-type(1) span"
  elements :fld_search_result_facilities, ".subgroupItem .row > div:nth-of-type(4)"
    
  elements :fld_community_health_search_result_titles, ".topLevelItem .row strong"
  elements :fld_community_health_search_result_dates, ".topLevelItem .row > .col-xs-11 div:nth-of-type(2) span"
  elements :fld_community_health_search_result_facilities, ".topLevelItem .row > .col-xs-11 div:nth-of-type(4)"

  element :fld_first_document_subgroup, '[aria-expanded=true] div.documentSubgroup'
  elements :fld_document_sub_groups, 'div.documentSubgroup'
  elements :fld_document_sub_group_badges, '.documentSubgroup span.badge'

  element :btn_all_range, "[data-appletid='search'] [id^=allRange]"
  element :btn_2yr, "[data-appletid='search'] button[id^='2yrRange']"
  element :btn_active_2yr, "[data-appletid='search'] button[id^='2yrRange'].date-range-item.active"
  element :btn_1yr, "[data-appletid='search'] button[id^='1yrRange']"
  element :btn_active_1yr, "[data-appletid='search'] button[id^='1yrRange'].date-range-item.active"
  element :btn_3m, "[data-appletid='search'] button[id^='3moRange']"
  element :btn_active_3m, "[data-appletid='search'] button[id^='3moRange'].date-range-item.active"
  element :btn_1m, "[data-appletid='search'] button[id^='1moRange']"
  element :btn_7d, "[data-appletid='search'] button[id^='7dRange']"
  element :btn_72hr, "[data-appletid='search'] button[id^='72hrRange']"
  element :btn_24hr, "[data-appletid='search'] button[id^='24hrRange']"
  element :btn_view_synonyms_used, ".text-search-synonyms"
  element :btn_text_search_close, ".text-search-close-button"

  element :status_result, "[data-detail='status']"
  elements :search_term_match, ".cpe-search-term-match"
  element :popover_content_line1, ".popover-content p:nth-child(1)" #pop-over displays when View Synonyms Used button is clicked
  element :popover_content_synonyms, ".popover-content p.bold-font" #pop-over contains synonyms of the searched text
  elements :txt_highlighted_text, "html > body mark.cpe-search-term-match"
  elements :modal_search_term_highlights, "#modal-body mark.cpe-search-term-match"
  elements :count_frame, "iframe"

  def displayed_result_dates
    p fld_search_result_items_displayed.length
    # p fld_search_result_items_displayed
    fld_search_result_items_displayed.map { | search_element | search_element['date'] }
  end

  def expand_all_results
      
    buttons = btn_expand_main_group
    buttons.each do | button |
      button.native.location_once_scrolled_into_view
      button.click if button['aria-expanded'] == 'false'
    end
      
    buttons = btn_expand_sub_group
    buttons.each do | button |
      button.native.location_once_scrolled_into_view
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
    self.class.elements :fld_search_suggestion_match, :xpath, "//*[contains(@class, 'suggest-list')]/descendant::strong[string() = '#{text}']"
    fld_search_suggestion_match
  end

  def group_results(groupontext)
    #p "div[id$='#{groupontext}'] .subgroupItem .row > div:nth-of-type(1)"
    #p "div[id$='#{groupontext}'] .subgroupItem .row > div:nth-of-type(3)"
    self.class.elements :fld_subgroup_dates, "div[id$='#{groupontext}'] .subgroupItem .row > div:nth-of-type(1)"
    self.class.elements :fld_subgroup_facilities, "div[id$='#{groupontext}'] .subgroupItem .row > div:nth-of-type(3)"
  end
  
  def main_group_results(groupontext)
    self.class.elements :fld_maingroup_titles, "div[id$='#{groupontext}'] .topLevelItem .row strong"
    self.class.elements :fld_maingroup_dates, "div[id$='#{groupontext}'] .topLevelItem .row > .col-xs-11 div:nth-of-type(2) span"
    self.class.elements :fld_maingroup_facilities, "div[id$='#{groupontext}'] .topLevelItem .row > .col-xs-11 div:nth-of-type(4)"
  end
  
  def expand_main_group(group_name)
    po_id = "[groupid="+"'"+"resultGroup#{group_name}"+"'] button"
    self.class.element :fld_main_group_title, "#{po_id}"
  end
  
  def expand_sub_group(group_name)
    po_id = "resultSubGroupTitle" + "#{group_name}"
    self.class.element :fld_sub_group_title, "[id^='#{po_id}']"
  end
  
  def sub_group_search_items(group_name)
    po_id = "resultSubGroup" + "#{group_name}"
    self.class.elements :fld_sub_group_items, "[id^='#{po_id}'] .search-result-item .row"
  end
  
  def verify_main_group_data(group_name)
    po_id = "[groupid="+"'"+"resultGroup#{group_name}"+"']"
    self.class.element :fld_main_group_data, "#{po_id}"
  end
   
  def verify_sub_group_data(group_name)
    po_id = "resultSubGroup" + "#{group_name}"
    self.class.element :fld_sub_group_data, "[id^='#{po_id}']"
  end
  
  def define_element_suggestion_text(i)
    self.class.element :fld_text_search_suggestion, ".suggest-list li:nth-child(#{i}) a span:nth-child(1)"
  end

  def community_health_summaries_titles
    ['Summarization of Episode Note', 'Continuity of Care Document']
  end
  
  def consult_titles
    ['PHYSICAL THERAPY', 'NEUROSURGERY', 'RHEUMATOLOGY']
  end
  
  def ehmp_facilities
    ['PANORAMA', 'KODAK']
  end

  def community_health_facility_correct_format?(text)
    # facility_format = Regexp.new('[a-zA-Z0-9\\W]')
    facility_format = Regexp.new('[\\w+]')
    !facility_format.match(text).nil?
  rescue => facility_exception
    p "#{facility_exception}"
    false
  end
end
