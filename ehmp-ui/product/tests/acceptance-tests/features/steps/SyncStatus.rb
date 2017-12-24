Then(/^the user looks for patientstatus icon site,All VA ,DOD and Externals$/) do |table|
  footer = PobHeaderFooter.new

  table.rows.each do |field_name|
    begin
      status_text = footer.fld_sync_status.map { |element| element.text.upcase }
      expect(status_text).to include field_name[0].upcase
    rescue => e
      p "#{e}"
      raise e
    end
  end
end

