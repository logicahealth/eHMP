Given(/^user is testing functionality$/) do
  @skip_login = true
  @error_messages = []
end

Given(/^user is done testing functionality$/) do
  @skip_login = false
end

Then(/^user reports results$/) do
  @error_messages.each do | msg |
    p msg
  end
  expect(@error_messages.length).to eq(0), "There were unexpected errors"
end
