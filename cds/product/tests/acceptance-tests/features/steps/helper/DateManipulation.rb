class DateManipulation
  def string_of_todays_date(format = "%Y%m%d%H%M%S")
    today = Date.today
    todays_date_time = DateTime.new(today.year, today.mon, today.mday, 23, 59, 59)
    todays_date = todays_date_time.strftime(format)
    return todays_date
  end

  def string_of_months_ago(months, format = "%Y%m%d%H%M%S")
    today = Date.today
    new_date = today << months
    new_date_time = DateTime.new(new_date.year, new_date.mon, new_date.mday, 23, 59, 59)
    new_date_time_formatted_string = new_date_time.strftime(format)
    return new_date_time_formatted_string
  end

  def string_of_months_hence(months, format = "%Y%m%d%H%M%S")
    today = Date.today
    new_date = today >> months
    new_date_time = DateTime.new(new_date.year, new_date.mon, new_date.mday, 23, 59, 59)
    new_date_time_formatted_string = new_date_time.strftime(format)
    return new_date_time_formatted_string
  end
end
