Then(/^POB the CommunityHealthSummaries coversheet table contains headers$/) do |table|
  @ehmp = PobCoverSheet.new
  @ehmp.wait_for_fld_Community_Health_Summaries_title(30)
  @ehmp.wait_for_fld_Community_Health_Summaries_thead
  expect(@ehmp).to have_fld_Community_Health_Summaries_thead
  table.rows.each do |field, value|
    @ehmp.fld_Community_Health_Summaries_thead.text.include? "#{field}" "#{value}"
  end
end
