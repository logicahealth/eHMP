class AppDocExtensionDropdown < SitePrism::Section
  element :extensions_dropdown, "li.open .searchable-list-container-search-Extensions"
  element :ui_tree_item, :xpath, "//*[string() = 'UI']/parent::div/preceding-sibling::div/a"
  element :form_tree_item, :xpath, "//*[string() = 'Form']/parent::div/preceding-sibling::div/a"
  element :controls_tree_item, :xpath, "//*[string() = 'Controls']/parent::div/preceding-sibling::div/a"
  element :assignto_tree_item, :xpath, "//div[contains(@class, 'tree-of-items')]/descendant::a/*[string() = 'Assign To']"
end

class AppDocumentationAssignTo < SitePrism::Page
  set_url 'documentation/#/ui/extensions/ui/form/controls/assign_to/'
  set_url_matcher Regexp.new("documentation/#/ui/extensions/ui/form/controls/assign_to/")

  section :frame, DocumentationFrame, ".ui"
  element :page_description, ".page-description h1"
  element :nav_extensions, :xpath, "//a[string() = 'Extensions']"
  section :extensions, AppDocExtensionDropdown, :xpath, "//a[string() = 'Extensions']/parent::li"
  element :toc, '#toc'
  elements :toc_options, "#toc ul > li > a"
end
