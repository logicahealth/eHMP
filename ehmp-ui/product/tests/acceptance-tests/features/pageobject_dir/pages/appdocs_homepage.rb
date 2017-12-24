
class DocumentationFrame < SitePrism::Section
  element :header, '#header .navbar-header'
  element :footer, "footer.navbar-fixed-bottom"
  element :headline, '#headline'
  element :page_description, '.page-description'
end

class AppDocumentationHomePage < SitePrism::Page 
  set_url 'documentation/'

  section :frame, DocumentationFrame, ".sdk"
  element :component_tree, "div.container div.tree"
  elements :components, "div.tree div.component"

  element :ehmpui_link, "div.component.ehmp-ui > a"
  element :ehmpui_developer_guide, "div.component.ehmp-ui a[id$=ui_link]"
  element :adk_link, "div.component.adk > a"
  element :adk_developer_guide, "div.component.adk a[id$=adk_link]"
  element :rdk_link, "div.component.rdk > a"
  element :rdk_developer_guide, "div.component.rdk a[id$=rdk_link]"
  element :fetch_link, "div.component.vxapi a[href$=fetch]:not(.btn)"
  element :writeback_link, "div.component.vxapi a[href$=write-health-data]:not(.btn)"
  element :picklist_link, "div.component.vxapi a[href$=write-pick-list]:not(.btn)"
  element :jds_link, "div.component.ehmp div.component > a[href$=jds]"

  def initialize
    super
    self.class.element(:fetch_api_doc, :xpath, vx_developer_guide_xpath('/sdk#Fetch'))
    self.class.element(:writeback_api_doc, :xpath, vx_developer_guide_xpath('/sdk#Write-Back'))
    self.class.element(:picklist_api_doc, :xpath, vx_developer_guide_xpath('/sdk#Pick-List'))
    self.class.element(:jds_api_doc, :xpath, vx_developer_guide_xpath('/sdk#JDS'))
  end

  def developer_guide_text
    "Developer Guide".downcase
  end

  def api_documentation_text
    "Api Documentation".downcase
  end

  def vx_developer_guide_xpath(h3_id)
    for_debugging = "//*[@id='#{h3_id}']/parent::a/parent::div/descendant::a[@id='/sdk#vxApi_link']"
    # p for_debugging
    for_debugging
  end
end
