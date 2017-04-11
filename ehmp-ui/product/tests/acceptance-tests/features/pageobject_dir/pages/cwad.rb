class CwadDetails < SitePrism::Page
  elements :fld_cwd_titles, "div.cwad-detail-list h5.cwad-title"
  element :loading , 'h5.loading'
  def open_and_title(title)
    self.class.element :btn_open_cwad, :xpath, "//section[@class='patient-postings']/descendant::span[contains(string(),'#{title}')]/ancestor::button"
    self.class.element :fld_cwad_panel_title, :xpath, "//h4[contains(@class, 'panel-title') and contains(string(), '#{title}')]"
  end
end
