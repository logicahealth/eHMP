class ImmunizationDetail < ModalElements
  def add_field_label_element(text)
    upper = text.upcase
    lower = text.downcase
    self.class.element :header_label, :xpath, "//div[@id='modal-body']/descendant::strong[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]"
  end
end
