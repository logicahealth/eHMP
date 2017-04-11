class PobStackedGraph < SitePrism::Page
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  #element :fld_search_stacked_graph, "[id^='stackedGraph']"
  element :fld_search_stacked_graph, ".tt-input"
  element :fld_vital_result, ".tt-dataset-vitals .fa-plus"
  element :fld_labtest_result, ".tt-dataset-labs .fa-plus"
  element :fld_med_result, ".tt-dataset-meds .fa-plus"
  elements :fld_stacked_graphs, ".collection-container .row.gist-item"
  elements :fld_row_label, ".collection-container .row.gist-item div[role=gridcell]:nth-of-type(1) [data-cell-tilesort]"
  element :no_graph_placeholder, "[data-appletid='stackedGraph'] .no-graph"

  # *****************  All_Button_Elements  ******************* #
  element :btn_stacked_filter, ".stacked-graph-filter-button"
  element :btn_delete_graph, "[button-type='deletestackedgraph-button-toolbar']"

  # *****************  All_Drop_down_Elements  ******************* #

  # *****************  All_Table_Elements  ******************* #

  def first_column_text_downcase
    fld_row_label.map { |screen| screen.text.downcase }
  end

  def suggestion_element(suggestion_text)
    self.class.element :fld_search_suggestion, :xpath, "//div[contains(@class, 'tt-suggestion')]/descendant::*[string() = '#{suggestion_text}']"
    fld_search_suggestion
  end

  def search_for_graph(search_term)
    TestSupport.driver.execute_script("$('.tt-input').focus();")
    fld_search_stacked_graph.set search_term
  end
end
