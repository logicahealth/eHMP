class Wireframe < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("observation"), ClickAction.new, AccessHtmlElement.new(:id, "new-observation"))
  end
end
