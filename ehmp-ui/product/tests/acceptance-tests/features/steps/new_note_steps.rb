class NewNote < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('Title'), VerifyText.new, AccessHtmlElement.new(:css, 'div.modal-header h4.modal-title'))
  end
end

Then(/^New Note Modal is displayed$/) do
  expect(NewNote.instance.perform_verification('Title', 'New Note')).to eq(true)
end
