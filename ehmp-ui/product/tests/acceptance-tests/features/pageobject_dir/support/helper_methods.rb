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

  # This method will print all the text from lists, can be used only for troubleshoot purposes
  def print_all_value_from_list_elements(objects)
    puts "Total count of the length is: #{objects.length}"
    objects.each do |item|
      puts  item.text.upcase
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
    ['TST1', 'TST2']
  end

  def known_facilities
    ['CAMP MASTER', 'CAMP BEE', 'ABILENE (CAA)', 'DOD', 'TROY']
  end
end

World do
  HelperMethods.new
end
