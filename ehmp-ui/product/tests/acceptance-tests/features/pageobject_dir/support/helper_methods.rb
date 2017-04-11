# Helper Methods for page-objects cucumber
class HelperMethods
  def wait_until
    require "timeout"
    Timeout.timeout(Capybara.default_wait_time) do
      sleep(0.1) until yield
    end
  end
  
  # This method will select an object from lists and will perform click action
  def click_an_object_from_list(objects, text)
    objects.each do |item|
      if item.text.upcase.include? text.upcase
        item.click
        break
      end
    end
  end

  def click_all_objects_from_list(objects, text)
    objects.each do |item|
      if item.text.upcase.include? text.upcase
        item.click if item.visible?
      end
    end
  end

  def click_an_element_from_elements_list_by_providing_text(row_list, element_list, text)
    row_list.each_with_index do |item, index|
      if item.text.upcase.include? text.upcase
        element_list[index-1].click
        break
      end
    end
  end

  def only_text_exists_in_list(objects, text)
    objects.each do |item|
      if item.text.upcase.include? text.upcase
        next
      else
        return false
      end
    end
    true
  end
  
  # Object existance will return true or false
  def object_exists_in_list(objects, text)
    objects.each do |item|
      if item.text.upcase.include? text.upcase
        return true
      end
    end
    false
  end

  def object_not_exists_in_list(objects, text)
    objects.each do |item|
      if item.text.upcase.eql? text.upcase
        return false
      end
    end
    true
  end
  
  def compare_text_in_list(objects, text1, text2)
    objects.each do |item|
      #p item.text
      if [text1, text2].any? { |text| item.text.include? text }
        next
      else
        return false
      end
    end
    return true
  end

  # This method will print all the text from lists, can be used only for troubleshooting purposes
  def print_all_value_from_list_elements(objects)
    puts "Total count of the length is: #{objects.length}"
    objects.each do |item|
      puts  "Item text == >>> #{item.text.upcase}"
    end
  end

  def return_boolean_if_contain_data(objects, header)
    objects.each do |first_group|
      if first_group.text.include? header
        return true if first_group.text.split(":").length > 1
        break
      end
    end
    false
  end

  # Compare 2 array
  def compare_2array(first_object, second_object)
    value =  false
    first_object.each do |object|
      if object.to_a == second_object.to_a
        value = true
        break
      end
    end
    value
  end

  # Verify the Array is sorted by Ascending order
  # How to use it?
  # expect(ascending? objects).to be(true), "Values are not in Alphabetical Order"
  def ascending?(objects)
    column_values_array = []
    objects.each do |row|
      column_values_array << row.text.downcase
    end
    column_values_array == column_values_array.sort
  end
  
  # this takes an array object and sorts in ascending
  # expect(ascending_array? column_values_array).to be(true), "values are not in alphabetical order: #{column_values_array}"
  def ascending_array?(column_values_array)
    column_values_array == column_values_array.sort
  end
  
  # this takes an array object and sorts in descending
  # expect(descending_array? column_values_array).to be(true), "values are not in reverse alphabetical order: #{column_values_array}"
  def descending_array?(column_values_array)
    column_values_array == column_values_array.sort.reverse
  end

  # Verify the Array is sorted by Descending order
  # How to use it?
  # expect(descending? objects).to be(true), "Values are not in Alphabetical Order"
  def descending?(objects)
    column_values_array = []
    objects.each do |row|
      column_values_array << row.text.downcase
    end
    column_values_array == column_values_array.sort.reverse
  end

  def count_item_from_a_list(objects, word1, word2)
    count1 = 0
    count2 = 0
    objects.each do |item|
      if item.text.upcase.include? word1.upcase
        count1 += 1
      elsif item.text.upcase.include? word2.upcase
        count2 += 1
      end
    end
    return count1 + count2
  end

  # Defined applet_grid_loaded method: execution will wait until data has been loaded
  # How to use it? See below:
  # wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  # wait.until { applet_grid_loaded(@ehmp.has_fld_empty_row?, @ehmp.fld_expanded_applet_table_rows) }
  # wait.until { applet_grid_loaded(@ehmp.has_fld_empty_gist?, @ehmp.fld_allergy_gist_all_pills) }
  def applet_grid_loaded(empty_row_boolean, web_elements_row)
    return true if empty_row_boolean
    return web_elements_row.length > 0
  rescue => e
    p e
    false
  end

  def date_only?(text)
    date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
    !date_format.match(text).nil?
  rescue => date_time_exception
    p "#{date_time_exception}"
    false
  end

  def date_time?(text)
    date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} - \\d{2}:\\d{2}")
    !date_format.match(text).nil?
  rescue => date_time_exception
    p "#{date_time_exception}"
    false
  end

  def known_facilities_monikers 
    %w(TST1 TST2 NJS)
  end

  def known_facilities
    ['CAMP MASTER', 'CAMP BEE', 'ABILENE (CAA)', 'DOD', 'TROY']
  end
end

World do
  HelperMethods.new
end
