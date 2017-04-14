#!/bin/bash

## INITIALIZE Startup Variables
bold="\033[0;0;1m"
normal="\033[0;1;0m"
VER="2016.01.11.001"
CONF="/opt/vxsync/tools/sync-tools/log-report-conf.sh"
while getopts "a:d:h:l:n:o:p:s:-" option
do
	case "${option}" in
	[aA])	# Include All Archived versions of the specified log
		all=${OPTARG}
		;;
	[dD])	# Delete previous stats
		del_stats=${OPTARG}
		;;
	[hH])	# Record history
		history=${OPTARG}
		;;
	[oO])	# Standard GREP OPTIONS
		grep_opt=(${OPTARG})
		;;
	[nN])	# No Title
		noTitle=${OPTARG}
		;;
	[pP])	# Pattern to grep for. If not specified then default will be used.
		pattern=${OPTARG}
		;;
	[lL])	# Logs to search (this will overwrite the logs_array)
		logs_choice=${OPTARG}
		if [ ! -f logs_choice.txt ];
			then ls -ltr ${logs_choice} | rev | cut -f1 -d' ' | rev > logs_choice.txt
		fi
		logs_array=($(<logs_choice.txt))
		rm -rf log*_choice.txt
		;;
	[sS])	# Print other stats
		stats=${OPTARG}
		;;
	[-*])	# Display Help options
		echo -e ""
		echo -e "eHMP Log-Report Tool, Version "$VER""
		echo -e "Use this tool to view log stats"
		echo -e ""
		echo "Startup Options are:"
		echo -e ""$bold"-all"$normal"     Include all archived versions of the log. (your.log*)"
		echo "         usage [ -all ]"
		echo ""
		echo -e ""$bold"-delete"$normal"  Delete previous stats"
		echo "         usage [ -delete ]"
		echo ""
		echo -e ""$bold"-history"$normal" Record results in the History file."
		echo "         usage [ -history ]"
		echo ""
		echo -e ""$bold"-l"$normal"       Full path of Log(s) to search. Default = all eHMP logs"
		echo "         usage [ -l \"/opt/vxsync/logs/vxsync-pollerHost-9E7A.log*\"              ]"
		echo "               [ -l \"/opt/vxsync/logs/*\"                                        ]"
		echo "               [ -l \"/opt/vxsync/logs/* /opt/soap_handler/*.log\" ]"
		echo "               [ -l \"/var/log/bluepill*\"                                        ]"
		echo ""
		echo -e ""$bold"-noTitle"$normal" Do not print the title. Useful when emailing this report."
		echo "         usage [ -notitle ]"
		echo ""
		echo -e ""$bold"-p"$normal"       grep Pattern to use. Default = error"
		echo "         usage [ -p \"\\\"level\\\":50\" ]"
		echo "               [ -p \"Cleared lock\" ]"
		echo "               [ -p \"ERROR\"        ]"
		echo "               [ -p \"Failed to parse the vista response into JSON\" ]"
		echo ""
		echo -e ""$bold"-o"$normal"       standard grep OPTIONS to use."
		echo "         usage [ -o \"i\"  ] #--ignore-case"
		echo "               [ -o \"v\"  ] #--invert match"
		echo "               [ -o \"iv\" ] #--Use of multiple options"
		echo ""
		echo -e ""$bold"-stats"$normal" Print other stats."
		echo "         usage [ -stats ]"
		echo ""
		echo -e ""$bold"--help"$normal"   Print this Help screen"
		echo "         usage:[ --help ]"
		exit 0 ;;
	esac
done

init_vars() {		## Initialize other variables
	# Load the site specific configuration file
	if [ -f "$CONF" ];
	then	. "$CONF"
	else	echo "Unable to find "$CONF". Exiting now..."
			exit 0
	fi
	# Set the color variables
				gray="\033[0;1;30m"
				red="\033[1;1;31m"
				yellow="\033[1;1;33m"
				green="\033[0;0;32m"
				blue="\033[0;0;34m"
				bold="\033[0;0;1m"
				reset="\033[0;1;0m"
				normal="\033[0;1;0m"
	# convert slashes into underscores
		if [ "$logs_array" ];
		then	# Convert spaces into ~~ and convert / into ~ then remove all numbers
				query_dir_name=`echo "$logs_array" | sed -r 's/ /~~/g'  | sed -r 's/\//~/g' | sed -r 's/[0-9]//g'`
		else	query_dir_name="default_array"
		fi
	# Set the tools directory and the date/time-stamp variables
		tools_dir="/opt/vxsync/tools/sync-tools"
		dy=`(date +%m-%d-%g)`		#Date
		ts=`(date +%R)`		#Time Stamp

	# Set the search pattern if it was not specified at startup
		if [ ! "$pattern" ]; then	pattern="error"; fi
	# Determine the length of variables to establish minimum header length
		pat_length=${#pattern}
		query_dir_length=${#query_dir_name}
		report_min_width=$(expr $pat_length + $query_dir_length + 10)
	# strip special characters and spaces from "pattern" for use in creating the name of the History directory
		pattern_name=`echo "$pattern" | tr -dc '[:alnum:]\n\r' | tr '[:upper:]' '[:lower:]'`
		hist_dir="$tools_dir"/tmp/history/"$query_dir_name"_"$pattern_name"
	# Modify history directory name for the ALL search
		if [ "$all" ]; then hist_dir=""$hist_dir"_all" ; fi

	# Delete the previous stats if specified at startup
	if [ "$del_stats" ];	then delete_stats; fi

	# Set up history folder if selected at startup
	if [ "$history" ];
	then
		# Create a history folder for this Pattern if it does not exist. Different patterns will have different folders.
		if [ ! -d "$hist_dir" ];
		then	sudo mkdir -p "$hist_dir"
				sudo setfacl -bR "$hist_dir"/
				sudo chown root:root "$hist_dir" -R
				sudo chmod 777 "$hist_dir" -R
				touch "$hist_dir"/"$dy"_time_stamp.tmp
				touch "$hist_dir"/"$dy"_totals.tmp
		fi
		# Look for old time-stamp-file and delete it if it exists
		current_tsf=`ls "$hist_dir"/ | grep time_stamp`
		if [ ! "$current_tsf" == ""$dy"_time_stamp.tmp" ];
		then	rm -rf "$hist_dir"/
			mkdir -p "$hist_dir"
			sudo chmod 766 -R "$hist_dir"
			chown root:root "$hist_dir" -R
			touch "$hist_dir"/"$dy"_time_stamp.tmp
			touch "$hist_dir"/"$dy"_totals.tmp
		fi
	trim_history
	fi
}

delete_stats () {		# Delete old stats
	rm -rf "$tools_dir"/tmp/history
}

trim_history () {		# Delete old occurrences of history. Only keep the past XX records.
	history_details=`cat  "$hist_dir"/"$dy"_time_stamp.tmp`
	nbr=$(grep -o "|" <<< "$history_details" | wc -l)
	if [[ "$nbr" -ge 8 ]];
	then	# Too much history so get rid of the oldest record.
			for file in "$hist_dir"/*
			do
				sed -i 's/[^|]*|//' "$file"
			done
	fi
}

parse_logs() {		## Parse logs and store totals
	name_length_check=0
	name_length=20  # set to this default minimum due to length of header text
	total_length=0
	if [ "$history" ];
	then	# We are recording and displaying the history
		total=0
		error_count=0
		# Append time_stamp file with current time
			echo -n ""$ts"|" >> "$hist_dir"/"$dy"_time_stamp.tmp
		# Count the number of history items by counting the number of | in the xxx_time_stamp file
			hist_num=`awk -F\| '{print NF-1}' "$hist_dir"/"$dy"_time_stamp.tmp`

		# Start parsing
		for log in "${logs_array[@]}"
		do
			# Append an * to the end of the log if the ALL paramater was selected at startup
			if [ "$all" ]; then log=""$log"*" ; fi
			# Count the length of the name
			name_length_check=${#log}
			if [ "$name_length_check" -gt "$name_length" ]; then name_length="$name_length_check" ; fi
			# Convert / in name to ~
			query_file_name=`echo "$log" | sed -r 's/ /~~/g' | sed -r 's/\//~/g'`
			# Check for log history file and create it if it does not exist.
				if [ ! -f "$hist_dir"/"$query_file_name".tmp ]; then	touch "$hist_dir"/"$query_file_name".tmp; fi
			# Get log totals and append to log history file
			DIR=$(dirname "${log}")
			if [ -d "$DIR" ];
			then	# The directory is valid , proceed with grep.
					if [ "$grep_opt" ];
					then 	#use grep options selected at startup
							error_count=$(sudo grep -${grep_opt} ${pattern} ${log} 2>/dev/null |wc -l )
					else	# No grep options
							error_count=$(sudo grep "${pattern}" ${log} 2>/dev/null |wc -l )
					fi
					echo -n ""$error_count"|" >> "$hist_dir"/"$query_file_name".tmp
					total=$(expr $total + $error_count)
					error_count=0
			fi
		done
		echo -n ""$total"|" >> "$hist_dir"/"$dy"_totals.tmp
		# Count the length of the total
			total_length_check=${#total}
			if [ "$total_length_check" -gt "$total_length" ]; then total_length="$total_length_check" ; fi
		# Create report with all data from history folder
			IFS="|"
		# Create report
			rm -rf "$tools_dir"/tmp/log_results.tmp
			for file in "$hist_dir"/*
			do	filename=${file##*/}
				filename=${filename%.tmp}  #Remove extension from Filename
				if [ "$filename" == "$dy"_time_stamp ]; then filename="DATE: "$dy" TIME:"  ; fi
				if [ "$filename" == "$dy"_totals ];
				then 	filename="TOTALS"
					echo -n ""$filename"|" >> "$tools_dir"/tmp/log_results.tmp
					cat "$file" >> "$tools_dir"/tmp/log_results.tmp
					echo "" >> "$tools_dir"/tmp/log_results.tmp
					#print a separator line above the log name
					for ((i=1; i<$name_length; i++)); do echo -n "-" >> "$tools_dir"/tmp/log_results.tmp; done
					echo -n "--|" >> "$tools_dir"/tmp/log_results.tmp
					#print a separator line for each history item
					for ((i=0; i<$hist_num; i++)); do echo -n "--------|" >> "$tools_dir"/tmp/log_results.tmp; done
					echo "" >> "$tools_dir"/tmp/log_results.tmp
				else
					# Convert filename back to standard format by changing ~ to /
					undo_query_name=`echo "$filename" | sed -r 's/~~/ /g'  | sed -r 's/~/\//g'`
					echo -n ""$undo_query_name"|" >> "$tools_dir"/tmp/log_results.tmp
					cat "$file" >> "$tools_dir"/tmp/log_results.tmp
					echo "" >> "$tools_dir"/tmp/log_results.tmp
				fi
			done
	else	# We are NOT recording history.
		total=0
		error_count=0
		rm -rf "$tools_dir"/tmp/log_results.tmp
		for log in "${logs_array[@]}"
		do
			# Append an * to the end of the log if the ALL paramater was selected at startup
				if [ "$all" ]; then log=""$log"*" ; fi
			# Count the length of the name
				name_length_check=${#log}
				if [ "$name_length_check" -gt "$name_length" ]; then name_length="$name_length_check" ; fi
			# Get error count
			DIR=$(dirname "${log}")
			if [ -d "$DIR" ];
			then	#the directory is valid so proceed with grep
					if [ "$grep_opt" ];
					then 	#use grep options selected at startup
							error_count=$(sudo grep -${grep_opt} ${pattern} ${log} 2>/dev/null | wc -l )
					else	# No grep options
							error_count=$(sudo grep "${pattern}" ${log} 2>/dev/null | wc -l )
					fi
					# Convert filename back to standard format by changing ~ to /
					undo_query_name=`echo "$log" | sed -r 's/~~/ /g'  | sed -r 's/~/\//g'`
					echo ""$error_count"|"$undo_query_name"" >> "$tools_dir"/tmp/log_results.tmp
					# Update totals
					total=$(expr $total + $error_count)
					error_count=0
			fi
		done
		TOTAL=`printf "%'d" "$total"`
	fi
}

print_report() {	## Print totals
	# First remove all items that have no results
		rm -rf "$tools_dir"/tmp/log_results_trimmed.tmp
		while read line ;
		do
			# Check to see if line is a log-result line or a header line by checking to see if first character in the line is a /
			if [[ ${line:0:1} == "/" ]] ;
			then 	#This is a log-result so now check to see if results are greater than 0
					line_tot=`echo "$line" | cut -d '|' -f 2- | sed -e "s/|//g"`  # Remove pipes
					line_tota=`echo "$line_tot" | tr -d ' '`  # Remove leading spaces
					line_total=$(echo $line_tota | sed 's/^0*//')  #Remove leading zeros
					if [ "$line_total" == "" ]; then line_total=0; fi
					if [ ! "$line_total" == 0 ];
					then	echo "$line" >> "$tools_dir"/tmp/log_results_trimmed.tmp
					fi
			else 	# This is a header
					echo "$line" >> "$tools_dir"/tmp/log_results_trimmed.tmp
			fi
		done < "$tools_dir"/tmp/log_results.tmp

	# Now check for history
	if [ "$history" ];
	then	# We are displaying the history
		# determine the width of the report
			totals_width=$[10*hist_num]
			report_width=$(expr $name_length + $totals_width + 1)
			# Display plain title or title with vistaCore url
			if [ "$noTitle" ];
			then	# We are not displaying the title
					bogus=1
			else 	echo -e "Total occurrences of \""$blue""$pattern""$normal"\""
					echo "in the following logs:"
			fi

		# print a separator line above the report
			for ((i=0; i<$report_width; i++)); do echo -n "=" ; done
			echo ""
		# Parse out the totals
			totals_line=`grep 'TOTAL' "$tools_dir"/tmp/log_results_trimmed.tmp`
			line_total=`echo "$totals_line" | cut -d '|' -f 2`
		# Print data
			column -t -s "|" "$tools_dir"/tmp/log_results_trimmed.tmp
			if [ "$line_total" == 0 ]; then echo "Error not found in logs" ; fi
		#print a separator line below the report
			for ((i=0; i<$report_width; i++)); do echo -n "-" ; done
		# Delete report files
			rm -rf "$tools_dir"/tmp/log_results.tmp
			rm -rf "$tools_dir"/tmp/log_results_trimmed.tmp
			echo ""
	else	# We are NOT displaying the history
		# determine the width of the report
			report_width=$(expr $name_length + 11)
			# Display plain title or title with vistaCore url
			if [ "$noTitle" ];
			then	# We are not displaying the title
					bogus=1
			else 	echo -e "Total occurrences of \""$blue""$pattern""$normal"\""
					echo "in the following logs:"
			fi

		# print a separator line above the report
			for ((i=0; i<$report_width; i++)); do echo -n "=" ; done
			echo ""
		# Parse out the totals
			totals_line=`grep 'TOTAL' "$tools_dir"/tmp/log_results_trimmed.tmp`
			line_total=`echo "$totals_line" | cut -d '|' -f 2`
		# Print data
			column -t -s "|" "$tools_dir"/tmp/log_results_trimmed.tmp
			if [ "$line_total" == 0 ]; then echo -e "Error not found in logs" ; fi
		# print a separator line below the report
			for ((i=0; i<$report_width; i++)); do echo -n "-" ; done
			echo ""
			echo -e "TOTAL:"$bold""$TOTAL""$normal""
			if [ "$logs_choice" ]; then	echo -e ""$gray"(printed in reverse chronological order)"$normal"" ; fi
		# Delete report files
			rm -rf "$tools_dir"/tmp/log_results.tmp
			rm -rf "$tools_dir"/tmp/log_results_trimmed.tmp
	fi
}

## Run everything here
init_vars
parse_logs
print_report
if [ "$stats" ]; then	other_stats	; fi
