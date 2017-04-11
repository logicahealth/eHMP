require_relative 'workspace_navigation.rb'

class PobParentApplet < SitePrism::Page
  
  section :menu, MenuSection, ".workspace-selector"
    
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  element :fld_modal_body, "#modal-body"
  element :fld_modal_title, ".modal-title"
  
  # *****************  All_Button_Elements  ******************* #
  
  # *****************  All_Drop_down_Elements  ******************* #
  
  # *****************  All_Table_Elements  ******************* #
  def add_applet_buttons(appletid_css)
    self.class.element(:btn_applet_filter_toggle, "#{appletid_css} .applet-filter-button")
    self.class.element(:btn_applet_expand_view, "#{appletid_css} .applet-maximize-button")
    self.class.element(:btn_applet_refresh, "#{appletid_css} .applet-refresh-button")
    self.class.element(:btn_applet_help, "#{appletid_css} .applet-help-button")
    self.class.element(:btn_applet_minimize, "#{appletid_css} .applet-minimize-button")  
    self.class.element(:btn_applet_add, "#{appletid_css} .applet-add-button")
  end

  def add_title(appletid_css)
    title_css = "#{appletid_css} .panel-title-label"
    self.class.element(:fld_applet_title, title_css)
    @css_for_scroll = title_css
  end

  def scroll_into_view(title_css = nil)
    title_css = @css_for_scroll unless @css_for_scroll.nil?
    close_button = TestSupport.driver.find_element(:css, title_css)
    close_button.location_once_scrolled_into_view
  end
  
  def add_text_filter(appletid_css)
    self.class.element(:fld_applet_text_filter, "#{appletid_css} .form-search input")
  end

  def add_empty_table_row(appletid_css)
    self.class.element(:fld_empty_row, "#{appletid_css} tr.empty")
  end
  
  def add_empty_gist(appletid_css)
    self.class.element(:fld_empty_gist, "#{appletid_css} div.empty-gist-list")
  end
  
  def add_toolbar_buttons
    self.class.element(:fld_toolbar, ".btn-toolbar")
    self.class.element(:btn_detail_view, "[button-type=detailView-button-toolbar]")
    self.class.element(:btn_info, "[button-type=info-button-toolbar]")
    self.class.element(:btn_quick_view, "[button-type=quick-look-button-toolbar]")
  end

  def wait_until
    require "timeout"
    Timeout.timeout(Capybara.default_wait_time) do
      sleep(0.1) until yield
    end
  end

  def add_generic_error_message(appletid_css)
    self.class.element(:fld_error_msg, "#{appletid_css} .fa-exclamation-circle")
  end

  def td_text_in_alpha_order(td_array, a_z = true)
    higher = td_array[0].text.downcase
    (1..td_array.length-1).each do |i|
      # td_array[i].location_once_scrolled_into_view
      lower = td_array[i].text.downcase
      check_alpha = a_z ? ((higher <=> lower) <= 0) : ((higher <=> lower) >= 0)
      p "#{higher} listed before #{lower}" unless check_alpha
      return false unless check_alpha
      higher = lower
    end
    return true
  rescue Exception => e
    p "verify_alphabetic_sort: #{e}"
    return false
  end

  def load_and_wait_for_screenname
    max_attempt = 2
    begin
      load
      menu.wait_until_fld_screen_name_visible
    rescue => e
      max_attempt-=1
      raise e if max_attempt < 0
      p "no screen name: try refresh #{max_attempt}"
      retry if max_attempt >= 0
    end
  end
end
