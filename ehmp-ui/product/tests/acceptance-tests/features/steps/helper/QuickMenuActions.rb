class QuickMenuActions
  extend ::RSpec::Matchers
  def self.verify_quick_menu(applet)
    applet.wait_for_fld_toolbar
    applet.wait_for_fld_toolbar_visible
    expect(applet.fld_toolbar.length).to be > 0
    expect(applet).to have_fld_toolbar_visible
  end

  def self.verify_quick_menu_collapsed(applet)
    applet.wait_for_fld_toolbar
    expect(applet.fld_toolbar.length).to be > 0
    expect(applet).to have_no_quick_menu_open, "Quick Icon Menu is expanded" 
  end

  def self.select_quick_menu(applet)
    applet.wait_for_fld_toolbar
    expect(applet.fld_toolbar.length).to be > 0
    max_attempt = 1
    begin
      applet.fld_toolbar[0].click
      expect(applet.wait_for_quick_menu_open).to eq(true)
    rescue Exception => e
      max_attempt -= 1
      retry if max_attempt >= 0
      raise e
    end
  end

  def self.verify_menu_options(applet, options_table)
    applet.wait_for_fld_menu_items
    expect(applet.fld_menu_items.length).to be > 0
    menu_text = applet.fld_menu_items.map { |element| element.text.upcase }
    options_table.rows.each do |item|
      expect(menu_text).to include item[0].upcase
    end 
  end

  def self.open_menu_click_detail_button(applet)
    applet.wait_for_fld_toolbar_visible
    expect(applet).to have_fld_toolbar_visible
    max_attempt = 1
    begin
      applet.fld_toolbar_visible.click
      expect(applet.wait_for_quick_menu_open).to eq(true)
    rescue Exception => e
      max_attempt -= 1
      retry if max_attempt >= 0
      raise e
    end
    click_detail_button(applet)
  end

  def self.open_menu_click_gototask_button(applet)
    applet.wait_for_fld_toolbar_visible
    expect(applet).to have_fld_toolbar_visible
    applet.fld_toolbar_visible.click
    applet.wait_for_btn_gototask
    expect(applet).to have_btn_gototask
    applet.btn_gototask.click 
  end

  def self.click_detail_button(applet)
    applet.wait_for_btn_detail_view
    expect(applet).to have_btn_detail_view
    applet.btn_detail_view.click
  end
  
  def self.verify_popover_table(applet)
    applet.wait_for_tbl_quick_view(30)
    expect(applet.tbl_quick_view.length).to be > 0
  end
  
  def self.verify_popover_table_headers(applet, table)
    headers = applet.tbl_quick_view_headers.map { |element| element.text.upcase }
    table.rows.each do |item|
      expect(headers).to include item[0].upcase
    end 
  end
end

