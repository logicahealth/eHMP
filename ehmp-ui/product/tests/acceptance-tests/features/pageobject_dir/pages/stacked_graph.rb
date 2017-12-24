class PobStackedGraph < PobParentApplet
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  #element :fld_search_stacked_graph, "[id^='stackedGraph']"
  element :fld_search_stacked_graph, ".tt-input"
  element :fld_vital_result, ".tt-dataset-vitals .fa-plus"
  element :fld_labtest_result, ".tt-dataset-labs .fa-plus"
  element :fld_med_result, ".tt-dataset-meds .fa-plus"
  elements :fld_stacked_graphs, ".collection-container .gist-item"
  elements :fld_row_label, ".collection-container .gist-item [data-cell-tilesort]"
  element :no_graph_placeholder, "[data-appletid='stackedGraph'] .no-graph"
  elements :fld_first_row, "[data-appletid='stackedGraph'] .gist-item [data-cell-tilesort]"

  # *****************  All_Button_Elements  ******************* #
  element :btn_stacked_filter, ".stacked-graph-filter-button"
  element :btn_delete_graph, ".deletestackedgraph-button-toolbar"

  def initialize
    super
    appletid_css = "[data-appletid=stackedGraph]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_toolbar_buttons appletid_css
    add_quick_view_popover appletid_css
  end

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
