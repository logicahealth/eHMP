# @description: All the HTML Elements the tests need to access / verify patient details displayed in the
# Transitory Patient area
class TransPatientBarHTMLElements < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('DOB'), VerifyText.new, AccessHtmlElement.new(:id, 'confirm_birthDate'))
    age_format = Regexp.new("\\d+y")
    add_verify(CucumberLabel.new('Age'), VerifyTextFormat.new(age_format), AccessHtmlElement.new(:id, 'confirm_age'))
    add_verify(CucumberLabel.new('Gender'), VerifyText.new, AccessHtmlElement.new(:id, 'confirm_gender'))
    add_verify(CucumberLabel.new('SSN'), VerifyContainsText.new, AccessHtmlElement.new(:id, 'confirm_ssn'))
  end

  def build_header_xpath(text)
    return "//div[contains(@class, 'patientName')][contains(string(), '#{text}')]"
  end

  def build_table_contents_xpath(_header, text)
    newxpath = "//div[contains(@class, 'patientInfo')]/div[contains(string(), '#{text}')]"
    return newxpath
  end
end
