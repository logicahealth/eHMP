def avoid_block_nesting(row_defined_in_cucumber, cols_displayed_in_browser)
  for col_index in 0..row_defined_in_cucumber.length - 1
    #p "comparing #{row_defined_in_cucumber[col_index]} to #{cols_displayed_in_browser[col_index].attribute("innerHTML").strip}"
    if row_defined_in_cucumber[col_index] == cols_displayed_in_browser[col_index].attribute("innerHTML").strip
      matched = true
    else
      matched = false
      break
    end #if
  end #for col_index
  return matched
end

def avoid_block_nesting_text(row_defined_in_cucumber, cols_displayed_in_browser)
  error_message = []
  for col_index in 0..row_defined_in_cucumber.length - 1
    #    p "comparing #{row_defined_in_cucumber[col_index]} to #{cols_displayed_in_browser[col_index].text}"
    error_message.push("comparing #{row_defined_in_cucumber[col_index]} to #{cols_displayed_in_browser[col_index].text}")
    cols_displayed_in_browser[col_index].location_once_scrolled_into_view
    if row_defined_in_cucumber[col_index] == cols_displayed_in_browser[col_index].text
      matched = true
    else
      matched = false
      break
    end #if
  end #for col_index
  p error_message unless matched
  return matched
end

class TableContainer < AccessBrowserV2
  include Singleton
  def initialize
    super
    #Care team
    add_verify(CucumberLabel.new("Rows - Care Team Details"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#patientDemographic-providerInfo .table tbody tr"))

    # Orders
    add_verify(CucumberLabel.new("Rows - Orders Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=orders] .data-grid table tbody tr"))

    # Numeric Lab Results
    add_verify(CucumberLabel.new("Rows - Lab Detail"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body .table-responsive tbody"))
    add_verify(CucumberLabel.new("Rows - Lab History"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body .data-grid table tbody tr"))
    add_verify(CucumberLabel.new("Rows - Numeric Lab Results Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .backgrid tbody tr"))

    add_verify(CucumberLabel.new("Complete Table - Numeric Lab Results applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] table"))

    add_action(CucumberLabel.new("Numeric Lab Results Applet - Disabled Next Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .backgrid-paginator .disabled a[title=\"Next\"]"))
    add_action(CucumberLabel.new("Control - Numeric Lab Results Applet - Next Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .backgrid-paginator li a[title=\"Next\"]"))

    #Active Medications
    add_verify(CucumberLabel.new("Rows - Active & Recent Medications Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#activeMeds-interventions-gist-items div.gist-item"))
    add_verify(CucumberLabel.new("Rows - Active Medications Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#activeMeds-interventions-gist-items div.gist-item"))

    #Immunization Gist
    add_verify(CucumberLabel.new("Rows - Immunization Gist Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=immunizations] .data-grid table tbody tr"))

    #Immunization Gist hover table
    add_verify(CucumberLabel.new("Rows - Immunization Gist Hover Table"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='urn:va:immunization:2939:57:44']/tbody/descendant::tr"))

    #Documents Gist
    add_verify(CucumberLabel.new("Rows - Documents Gist Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-documents tbody tr"))

    #Allery Gist
    add_verify(CucumberLabel.new("Rows - Allergy Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-allergy_grid tbody tr"))

    #Problems Gist Quick View table
    add_verify(CucumberLabel.new("Rows - Problems Gist Quick View Table"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='urn_va_problem_SITE_711_141']/tbody/descendant::tr"))

    #Stacked Graph Quick View Table
    add_verify(CucumberLabel.new("Rows - Stacked Graph Quick View Table"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='urn:va:vital:DOD:0000000003:1000000582']/tbody/tr"))

    #Encounters Gist Quick View table - Visits
    add_verify(CucumberLabel.new("Rows - Encounters Gist Quick View - Visits"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='encountersTooltipVisits']/tbody/descendant::tr"))
    #Encounters Gist Quick View table - Visit Type
    add_verify(CucumberLabel.new("Rows - Encounters Gist Quick View - Visit Type"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='encounters-Visit-GENERALINTERNALMEDICINE']/tbody/descendant::tr"))

    #Encounters Gist Quick View table - Procedure
    add_verify(CucumberLabel.new("Rows - Encounters Gist Quick View - Procedures"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='encountersTooltipProcedures']/tbody/descendant::tr"))
    #Encounters Gist Quick View table - Procedure Name
    add_verify(CucumberLabel.new("Rows - Encounters Gist Quick View - Procedure Name"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='encounters-Procedure-PULMONARYFUNCTIONINTERPRET']/tbody/descendant::tr"))

    #Encounters Gist Quick View table - Appointment
    add_verify(CucumberLabel.new("Rows - Encounters Gist Quick View - Appointments"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='encountersTooltipAppointments']/tbody/descendant::tr"))
    #Encounters Gist Quick View table - Appointment Type
    add_verify(CucumberLabel.new("Rows - Encounters Gist Quick View - Appointment Type"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='encounters-Appointment-GENERALINTERNALMEDICINE']/tbody/descendant::tr"))

    #Encounters Gist Quick View table - Appointment
    add_verify(CucumberLabel.new("Rows - Encounters Gist Quick View - Admissions"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='encountersTooltipAdmissions']/tbody/descendant::tr"))
    #Encounters Gist Quick View table - Appointment Type
    add_verify(CucumberLabel.new("Rows - Encounters Gist Quick View - Diagnosis"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//table[@id='encounters-Admission-OBSERVATION']/tbody/descendant::tr"))

    #Active Problems expand view table
    add_verify(CucumberLabel.new("Rows - Active Problems Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] table tbody tr"))
    add_verify(CucumberLabel.new("Rows - Activities Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=activities] table tbody tr"))

    #Patient Header Phone Group Quick Look table
    add_verify(CucumberLabel.new("Rows - Phone Group QuickLook"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#ql-phone-table-container table tbody tr"))
    add_verify(CucumberLabel.new("Rows - Address Group QuickLook"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#pt-address-row-container tr"))
    add_verify(CucumberLabel.new("Rows - Next Of Kin Group QuickLook"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#nok-contact-row-container tr"))
    add_verify(CucumberLabel.new("Rows - Email Group QuickLook"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#pt-email-row-container tr"))
    add_verify(CucumberLabel.new("Rows - Emergency Contact Group QuickLook"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#em-contact-row-container tr"))
    add_verify(CucumberLabel.new("Rows - Care Team Quicklook"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#patientDemographic-providerInfo .popover-content .table tbody tr"))
  
    # Newsfeed / Time table
    add_verify(CucumberLabel.new("Rows - Newsfeed Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#content-region [data-appletid=newsfeed] .data-grid table tbody tr"))
    add_verify(CucumberLabel.new("Rows - Newsfeed Applet data"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#content-region [data-appletid=newsfeed] .data-grid table tbody tr.selectable"))
    add_verify(CucumberLabel.new("Rows - Newsfeed Applet groups"), VerifyContainsText.new, AccessHtmlElement.new(:css, '#content-region [data-appletid=newsfeed] .data-grid table tr.groupByHeader'))
      
    # Documents / Time table
    add_verify(CucumberLabel.new("Rows - Documents Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#content-region [data-appletid=documents] .data-grid table tbody tr"))
    add_verify(CucumberLabel.new("Rows - Documents Applet data"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#content-region [data-appletid=documents] .data-grid table tbody tr.selectable"))
    add_verify(CucumberLabel.new("Rows - Documents Applet groups"), VerifyContainsText.new, AccessHtmlElement.new(:css, '#content-region [data-appletid=documents] .data-grid table tr.groupByHeader'))
  
    #Problems
    add_verify(CucumberLabel.new('Rows - Problems Gist Applet'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] .gist-item"))
    add_verify(CucumberLabel.new('Rows - Vitals Applet'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid=vitals] .data-grid table tr.selectable'))
  
    #Appointments
    add_verify(CucumberLabel.new('Rows - Appointment Applet'), VerifyContainsText.new, AccessHtmlElement.new(:css, '[data-appletid=appointments] .data-grid table tbody tr.selectable'))
    
  end # initialize
end

# ######################## functions ########################

def verify_single_row(table_name, expected_row)
  @tc = TableContainer.instance

  expected_first_row = expected_row.rows[0]

  rows_key = "Rows - #{table_name}"
  @tc.wait_until_action_element_visible(rows_key, 15)

  actual_first_row = @tc.get_elements(rows_key)[0]
  actual_first_row_cells = actual_first_row.find_elements(:css, "td")

  for i in 0...expected_first_row.size do
    verify_elements_equal(expected_first_row[i], actual_first_row_cells[i].text)
  end
end

# ######################## Then ########################

