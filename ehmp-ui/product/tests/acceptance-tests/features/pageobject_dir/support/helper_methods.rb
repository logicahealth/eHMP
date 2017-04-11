# Helper Methods for page-objects cucumber
class HelperMethods
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
      if item.text.upcase.include? text.upcase
        return false
      end
    end
    true
  end

  # This method will get the text from lists
  def get_text_from_list(objects)
    objects.each do |item|
      item.text.upcase
    end
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
end

World do
  HelperMethods.new
end
