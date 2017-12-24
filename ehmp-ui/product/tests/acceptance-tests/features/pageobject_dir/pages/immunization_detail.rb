require_relative 'surgery_modal.rb'
class ImmunizationDetail < ModalElements
  include DescriptiveAllThere
  label_path = "//div[@id='modal-body']/descendant::div[@class='row']"
  field_path = "parent::span/following-sibling::span"
  element :label_name, :xpath, "#{label_path}/descendant::strong[string()='Name:']"
  element :fld_name, :xpath, "//div[@class='row']/descendant::strong[string()='Name:']/#{field_path}"
  element :label_series, :xpath, "#{label_path}/descendant::strong[string()='Series:']"
  element :fld_series, :xpath, "//div[@class='row']/descendant::strong[string()='Series:']/#{field_path}"
  element :label_date_admin, :xpath, "#{label_path}/descendant::strong[string()='Date administered:']"
  element :fld_date_admin, :xpath, "//div[@class='row']/descendant::strong[string()='Date administered:']/#{field_path}"
  element :btn_next, '#toNext'
  element :btn_previous, '#toPrevious'

  def add_field_label_element(text)
    upper = text.upcase
    lower = text.downcase
    self.class.element :header_label, :xpath, "//div[@id='modal-body']/descendant::strong[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]"
  end
end
