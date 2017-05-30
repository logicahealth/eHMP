#Team Neptune 
#F144_AllergiesApplet.feature

Given(/^user selects patient "(.*?)" to view$/) do |search_value|
  con = Ehmpui.instance
  con.perform_action("Search Field", search_value)
  #Then the search results display 2 results
  num_seconds = 5
  expected_num = 2
  con.wait_until_xpath_count("Patient List Length", expected_num, num_seconds)
  con.perform_verification("Patient List Length", expected_num)
  #Given user selects patient 0 in the list
  con.select_patient_in_list(0)
end
