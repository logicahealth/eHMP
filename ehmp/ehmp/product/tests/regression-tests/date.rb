require 'date'


today = Date.today
weekday = today.strftime('%A')

if weekday == "Monday"
	puts "3"
else
	puts "1"

end
puts weekday