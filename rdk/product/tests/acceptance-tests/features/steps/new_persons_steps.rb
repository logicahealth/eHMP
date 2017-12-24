When(/^the user requests new persons$/) do |table|
  @response = PickListCalls.wait_until_call_returns_success(PickListCalls.method(:picklist), 'write-pick-list-new-persons', table, 60)
  expect(@response).to_not be(nil), "Did not receive a valid response"
end
