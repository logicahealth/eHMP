class PobVistaHealthSummariesApplet < PobParentApplet
  #set_url '/#vista-health-summaries-full'
  #set_url_matcher(/\/#vista-health-summaries-full/)
  
  set_url '#/patient/vista-health-summaries-full'
  set_url_matcher(/#\/patient\/vista-health-summaries-full/)
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  # *****************  All_Field_Elements  ******************* #
  
  # *****************  All_Button_Elements  ******************* #
  
  # *****************  All_Drop_down_Elements  ******************* #
  
  # *****************  All_Table_Elements  ******************* #
  facility_group = "#data-grid-vista_health_summaries"
  elements :fld_group_rows, "#{facility_group} tr.group-by-header"
  
  elements :fld_group_expand, "#{facility_group} td.group-by-header button"
  element :fld_header_facility, "[data-header-instanceid=vista_health_summaries-facilityMoniker] a"
  element :fld_header_report, "[data-header-instanceid=vista_health_summaries-hsReport] a"

  def initialize
    super
    appletid_css = "[data-appletid=vista_health_summaries]"
    add_applet_buttons appletid_css
    add_title appletid_css
    add_empty_table_row appletid_css
    add_generic_error_message appletid_css
  end

  def applet_loaded?
    return true if has_fld_empty_row?
    return fld_group_rows.length > 0
  rescue => exc
    p exc
    return false
  end

  def wait_until_applet_loaded
    wait_until { applet_loaded? }
  end

  def rows_for_label(label)
    xpath = "//tr[contains(@class, 'selectable')]/descendant::td[contains(string(), '#{label}')]"
    p xpath
    self.class.elements(:fld_labeled_rows, :xpath, xpath)
    fld_labeled_rows
  end

  def group_count_badge(label)
    path = "td.group-by-header button[title~='#{label}'] span.group-by-count-badge"
    p path
    self.class.element(:fld_badge_count, path)
  end

  def fld_group_labels
    self.class.elements :facility_group_labels, "td.group-by-header button[title]"
    facility_group_labels.map { |screen| screen['title'] }
  end

  def fld_group_labels_text
    self.class.elements :facility_group_labels, "td.group-by-header button[title]"
    facility_group_labels.map { |screen| screen.text.sub(/^\d* Results In /, '') }
  end
  
  def btn_vista_site(vista_site)
    p "td.group-by-header button[title~='#{vista_site}']"
    self.class.element :btn_facility, "td.group-by-header button[title~='#{vista_site}']"
  end

  def text_in_alpha_order_after_remote(td_array, a_z = true)
    # vista health summary has a special sorting requirement.  Remote reports should be sorted alphabetically first
    # then non-remote reports should be sorted alphabetically

    previous_text = td_array[0]
    checking_remote = previous_text.upcase.start_with? "REMOTE"
    (1..td_array.length-1).each do |i|
      current_text = td_array[i]
      if !(current_text.upcase.start_with? "REMOTE") && checking_remote
        checking_remote = false
        previous_text = current_text
        next
      end
      if (current_text.upcase.start_with? "REMOTE") && !checking_remote
        p "#{current_text} is listed out of order, remote reports should be listed first"
        return false
      end
      check_alpha = ((previous_text <=> current_text) <= 0)
      p "#{previous_text} is earlier then #{current_text}: #{check_alpha}" unless check_alpha
      return false unless check_alpha
      previous_text = current_text
    end
    return true
  rescue Exception => e
    p "verify_alphabetic_sort: #{e}"
    return false
  end
end
