#!/bin/bash

## INITIALIZE Startup Variables
VER="2016.02.24.002"
SPID="$BASHPID"
tools_dir="/opt/vxsync/tools/sync-tools"
vxsync_ip="localhost"
hist_length=10
histdir_owner="$USER"
histdir_group=root
gray="\033[0;1;30m"
red="\033[1;1;31m"
yellow="\033[1;1;33m"
green="\033[0;0;32m"
blue="\033[0;0;34m"
bold="\033[0;0;1m"
reset="\033[0;1;0m"
normal="\033[0;1;0m"
while getopts "d:h:k:l:n:s:t:v:-" option
do
	case "${option}" in
		[dD])	# Delete previous stats
			del_stats=${OPTARG}
			;;
		[hH])	# Record history
			history=${OPTARG}
			;;
		[kK])	# Kick buried jobs
			kick=${OPTARG}
			;;
		[nN])   # No Kick buried jobs
			nokick=${OPTARG}
			;;
		[lL])	# List Jobs.
			print_rpt=${OPTARG}
			if [ "$print_rpt" == "istall" ]; then print_rpt_all=${OPTARG} ; fi
			;;
		[sS])	# Print Beanstalk stats
			bs_stats=${OPTARG}
			;;
		[tT])	# List Beanstalk Tubes
			print_tubes=${OPTARG}
			;;
		[vV])	# VxSync Server
			vxsync_ip=${OPTARG}
			;;
		[--])	# Display Help options
			clear
			echo -e "eHMP Beanstalk Tool, Version "$VER""
			echo -e "Use this tool to manage Beanstalk Jobs on the VxSync server"
			echo -e ""
			echo "Startup Options are:"
			echo "-delete     Delete previous stats from the history file"
			echo "            usage [ -delete ]"
			echo ""
			echo "-history    Record results in the History file."
			echo "            usage [ -history ]"
			echo "                  [ -history -list ] (View the history file for tubes with values greater than 0.)"
			echo "                  [ -history -listall ] (View the history file for all tubes.)"
			echo ""
			echo "-kick       Kick buried jobs"
			echo "            usage [ -kick ] (Kick all buried jobs)"
			echo "                  [ -kick -history ] (Kick all buried jobs and record event in history file.)"
			echo "                  [ -k jobname ] (Kick a specific job)"
			echo "             i.e. [ -k \"vxs-jmeadows-sync-request\" ] or [ -k \"vxs-jmeadows-sync-request\" -history ]"
			echo "                  [ -k \"vxs-jmeadows-sync-request,vxs-enterprise-sync-request\" ]"
			echo ""
			echo "             Kick Exceptions: Use the NOkick (-n) option instead of the (-kick) option to kick all buried"
			echo "                              jobs Except tubes that start with specified pattern."
			echo "             i.e. [ -n \"vxs-hdr\" ] (Kick all jobs except HDR jobs.)"
			echo ""
			echo "-list       List buried jobs (Not available when using the -kick option)"
			echo "            usage:[ -list ] (Only print tubes with values greater than 0)"
			echo "                  [ -listall  ] (Print all tubes)"
			echo "                  [ -list -history ] (View the history file for tubes with values greater than 0.)"
			echo "                  [ -listall -history ] (View the history file for all tubes)"
			echo ""
			echo "-stats      Print Beanstalk Stats"
			echo "            usage [ -stats ]"
			echo ""
			echo "-tubes      Print Beanstalk Tubes"
			echo "            usage [ -tubes ] (Print list of tubes with option to select one for more details)"
			echo "                  [ -tubesall ] (Print details on all tubes)"
			echo "                  [ -t \"vxs-jmeadows-sync-request\" ] (Print details on a specific tube)"
			echo ""
			echo "-v          VxSync server ip or hostName"
			echo "            usage [ -v \"hostname or ip\" ]"
			echo ""
			echo "--help      Print this Help screen"
			echo "            usage:[ --help ]"
			exit 0 ;;
	esac
done


set_vars () {	## Create variables for the script
	# Set variables
		dy=`(date +%m-%d-%g)`   #Date
		ts=`(date +%R)`  		#Time Stamp
		if [ "$del_stats" ]; then history=true	; fi   # This must be set to get the correct history folder below when deleting history.
		if [ "$history" ];
		then	# User has selected to record the history
				hist_dir=""$tools_dir"/tmp/history/buried_jobs"
				if [ ! -d "$hist_dir" ];
				then	# Create the history directory
					sudo mkdir -p "$hist_dir"
					sudo chmod 766 "$hist_dir" -R
					sudo chown "$histdir_owner":"$histdir_group" "$hist_dir" -R
				fi
		else	# User does not want to record history, they just want to see the current stats.
				hist_dir=""$tools_dir"/tmp/no_history"
				if [ ! -d "$hist_dir" ];
				then	# Create the history directory
					sudo mkdir -p "$hist_dir"
					sudo chmod 766 "$hist_dir" -R
					sudo chown "$histdir_owner":"$histdir_group" "$hist_dir" -R
				fi
				delete_stats  # This will delete and recreate the no_history folder
		fi
		if [ ! -d "$hist_dir" ]; then delete_stats	; fi
		tmpfile=""$tools_dir"/tmp/tubeStats.json"

	# Define TUBE Array
		# Get data for the array
		curl -s "http://"$vxsync_ip":PORT/beanstalk/stats-tube" | python -c "import sys, json; print json.dumps(json.load(sys.stdin).keys(), indent=4)" > "$tools_dir"/tmp/tubes.tmp
		sed -i '1d;$d' "$tools_dir"/tmp/tubes.tmp  #Remove first and last line
		sed -i 's/,//g' "$tools_dir"/tmp/tubes.tmp  #Remove all commas
		sed -i "s/\"/'/g" "$tools_dir"/tmp/tubes.tmp #Replace all double quotes with single quotes
		sed -i 's/^ *//' "$tools_dir"/tmp/tubes.tmp #Remove all leading white-space
		# Create the Array
		tubes=`cat "$tools_dir"/tmp/tubes.tmp | sort`
		tube_array=($tubes)
		#for i in ${tube_array[@]}; do echo $i; done  # Print array to screen for testing
		rm -rf "$tools_dir"/tmp/tubes.tmp
}

get_data () {		# Get updated statistics
	# Append time_stamp file with current time
	echo -n ""$ts"|" >> "$hist_dir"/"$dy"_time_stamp.tmp

	# Get stats and save to tmpfile
	curl -s "http://"$vxsync_ip":PORT/beanstalk/stats-tube" | python -m json.tool > "$tmpfile"

	for tube in "${tube_array[@]}"
	do	buried_jobs=`python -c "import sys, json; print json.load(sys.stdin)["$tube"]['current-jobs-buried']" < "$tmpfile"`
		tube_name="${tube//\'}"
		echo -n ""$buried_jobs"|" >> "$hist_dir"/"$tube_name".tmp
	done
}

get_stats () {		# Get Beanstalk Stats
	# Get stats and print to screen
	curl -s "http://"$vxsync_ip":PORT/beanstalk/stats" | jq .[]
}

list_tubes () {		# List all Beanstalk Tubes
	case "$print_tubes" in
		ubes )	# Print list of tubes with option to see more details on one
				# Get tubes and print to screen
				curl -s "http://"$vxsync_ip":PORT/beanstalk/list-tubes" | jq .[] | sort | tr -d '"' > "$tools_dir"/tmp/list-raw.txt
				line_num=1
				while read line
				do	echo -e "("$blue""$line_num""$reset") "$line"" >> "$tools_dir"/tmp/nbrd_list.txt
					line_num=$(expr $line_num + 1)
				done < "$tools_dir"/tmp/list-raw.txt
				column -t -s "|" "$tools_dir"/tmp/nbrd_list.txt
				echo "==========================="
				echo -e "Enter the tube ("$blue"num"$reset") for details, or"
				echo -en "press "$blue"ENTER"$reset" to quit: "
				read choice
				if [ "$choice" ];
				then 	chosen_tube=`sed -n "$choice"p "$tools_dir"/tmp/list-raw.txt`
						echo ""
						curl -s "http://"$vxsync_ip":PORT/beanstalk/stats-tube/"$chosen_tube"" | jq .[]
						echo ""
						echo -en "press "$blue"ENTER"$reset" to continue: "
						read nothing
						rm -rf "$tools_dir"/tmp/nbrd_list.txt
						rm -rf "$tools_dir"/tmp/list-raw.txt
						list_tubes
						exit 0
				fi
				rm -rf "$tools_dir"/tmp/nbrd_list.txt
				rm -rf "$tools_dir"/tmp/list-raw.txt
				;;
		ubesall )	# Print details on all tubes
				curl -s "http://"$vxsync_ip":PORT/beanstalk/stats-tube" | jq .[]
				;;
		* )		# Print details on specific tube
				curl -s "http://"$vxsync_ip":PORT/beanstalk/stats-tube"/"$print_tubes" | jq .
				;;
	esac
}

delete_stats () {		# Delete old stats
	sudo rm -rf "$hist_dir"
	sudo mkdir -p "$hist_dir"
	sudo touch "$hist_dir"/"$dy"_time_stamp.tmp
	sudo chmod 766 "$hist_dir" -R
	sudo chown "$histdir_owner":"$histdir_group" "$hist_dir" -R
}

print_report () {	# Print report to screen (if selected at startup).
	if [ "$print_rpt_all" ];
	then 	print_report_all	# Call the PRINT_REPORT_ALL function to print all records
	else						# Only print records with values
		IFS="|"
		# Create screen report
		rm -rf "$tools_dir"/tmp/report.tmp
		grand_total=0
		for file in "$hist_dir"/*
		do
			filename=${file##*/}
			filename=${filename%.tmp}
			# Add totals for all items Except for the TimeStamp item.
			if [[ ! $filename =~ .*time_stamp ]];
			then
				items=`cat "$file"`
				items_array=($items);
				total=0
				history=`cat  "$hist_dir"/"$dy"_time_stamp.tmp`
				nbr=$(grep -o "|" <<< "$history" | wc -l)
				file_total=`echo "$items" | awk -F"|" -v x="$nbr" '{print $x}'`
				grand_total=$(expr $grand_total + $file_total)
				for i in "${items_array[@]}"; do
					if [ "$i" == "kick" ] || [ "$i" == "-" ]; then i=0 ; fi  # This was a kick job so change the placeholder from "kick" to 0 so it can be added
					total=$(expr $total + $i)
				done
				if [ "$total" -gt 0 ] || [ "$filename" == "default" ];
				then
					echo -n ""$filename"|" >> "$tools_dir"/tmp/report.tmp
					cat "$file" >> "$tools_dir"/tmp/report.tmp
					echo "" >> "$tools_dir"/tmp/report.tmp
				fi
			else
					echo -n ""$filename"|" >> "$tools_dir"/tmp/report.tmp
					cat "$file" >> "$tools_dir"/tmp/report.tmp
					echo "" >> "$tools_dir"/tmp/report.tmp
					# Print separator
					echo -n "--------------------|" >> "$tools_dir"/tmp/report.tmp
					history=`cat  "$hist_dir"/"$dy"_time_stamp.tmp`
					nbr=$(grep -o "|" <<< "$history" | wc -l)
					if [ "$nbr" == 0 ]; then nbr=1  ; fi
					while [[ "$nbr" -gt 0 ]]; do
						echo -n "-----|" >> "$tools_dir"/tmp/report.tmp
						nbr=$(expr $nbr - 1)
					done
					echo "" >> "$tools_dir"/tmp/report.tmp
			fi
		done
		echo "=======================|" >> "$tools_dir"/tmp/report.tmp
		echo ""$grand_total" jobs currently buried|" >> "$tools_dir"/tmp/report.tmp
		column -t -s "|" "$tools_dir"/tmp/report.tmp
	fi
}

print_report_all () {	# Print report to screen (if selected at startup) for all items (even if they have 0 values)
	IFS="|"
	# Create screen report
	rm -rf "$tools_dir"/tmp/report.tmp
	for file in "$hist_dir"/*
	do
		filename=${file##*/}
		filename=${filename%.tmp}
		echo -n ""$filename"|" >> "$tools_dir"/tmp/report.tmp
		cat "$file" >> "$tools_dir"/tmp/report.tmp
		echo "" >> "$tools_dir"/tmp/report.tmp
		# Print separator
		if [[ $filename =~ .*time_stamp ]];
		then
			echo -n "--------------------|" >> "$tools_dir"/tmp/report.tmp
			history=`cat  "$hist_dir"/"$dy"_time_stamp.tmp`
			nbr=$(grep -o "|" <<< "$history" | wc -l)
			if [ "$nbr" == 0 ]; then nbr=1  ; fi
			while [[ "$nbr" -gt 0 ]]; do
				echo -n "-----|" >> "$tools_dir"/tmp/report.tmp
				nbr=$(expr $nbr - 1)
			done
			echo "" >> "$tools_dir"/tmp/report.tmp
		fi
	done
	column -t -s "|" "$tools_dir"/tmp/report.tmp
}

trim_history () {		# Delete old orrurances of history. Only keep the past XX records.
	his_len=$(expr $hist_length - 1)
	history=`cat  "$hist_dir"/"$dy"_time_stamp.tmp`
	nbr=$(grep -o "|" <<< "$history" | wc -l)
	if [ "$nbr" -gt "$his_len" ];
	then	# Too much history so get rid of the oldest record.
			for file in "$hist_dir"/*
			do
				sed -i 's/[^|]*|//' "$file"
			done
	fi
}

kick_jobs () {		# Kick buried jobs
	case "$kick" in
		ick )
				# Kick ALL buried jobs
				curl -s "http://"$vxsync_ip":PORT/beanstalk/kick"
				# Append time_stamp file with Kick comment
				echo -n ""$ts"|" >> "$hist_dir"/"$dy"_time_stamp.tmp
				echo ""

				# Update history files
				for tube in "${tube_array[@]}"
				do
					tube_name="${tube//\'}"
					echo -n "kick|" >> "$hist_dir"/"$tube_name".tmp
				done
				;;
		* )		# Kick specified Jobs
				# First check to see if there are multiple jobs specified. If so then create an array
				if [ "${kick#*,}" != "$kick" ];
				then 	# Found Multiple Jobs separated by commas
						IFS=',' read -r -a jobs_array <<< "$kick"
						for job in "${jobs_array[@]}"
						do
							curl -s "http://"$vxsync_ip":PORT/beanstalk/kick/"$job""
							echo " "$job""
						done
						# Append time_stamp file with Kick comment
						echo -n ""$ts"|" >> "$hist_dir"/"$dy"_time_stamp.tmp
						echo ""
						# Update history files
						for tube in "${tube_array[@]}"
						do
							tube_name="${tube//\'}"
							if [[ ${jobs_array[*]} =~ "$tube_name" ]];
							then	echo -n "kick|" >> "$hist_dir"/"$tube_name".tmp
							else	echo -n "-|" >> "$hist_dir"/"$tube_name".tmp
							fi
						done
				else 	# Found only one job
						curl -s "http://"$vxsync_ip":PORT/beanstalk/kick/"$kick""
					    echo " "$kick""
						# Append time_stamp file with Kick comment
						echo -n ""$ts"|" >> "$hist_dir"/"$dy"_time_stamp.tmp
						echo ""
						# Update history files
						for tube in "${tube_array[@]}"
						do
							tube_name="${tube//\'}"
							if [[ "$kick" =~ "$tube_name" ]];
							then	echo -n "kick|" >> "$hist_dir"/"$tube_name".tmp
							else	echo -n "-|" >> "$hist_dir"/"$tube_name".tmp
							fi
						done
				fi
				;;
	esac
}

nokick_jobs () {		# Kick buried jobs except the tube specified

	# Get list of tubes and store in tmp file
	curl -s "http://"$vxsync_ip":PORT/beanstalk/list-tubes" | jq .[] | sort | tr -d '"' > "$tools_dir"/tmp/tube-list-raw.txt
	# Append time_stamp file with Kick comment
	echo -n ""$ts"|" >> "$hist_dir"/"$dy"_time_stamp.tmp

	# loop through list and test to see if the current tube is one we can kick
	while read line
	do		# Test line
			if [[ "$line" != "$nokick"* ]];
			then 	curl -s "http://"$vxsync_ip":PORT/beanstalk/kick/"$line""
				    echo " "$line""
					# Update history files
					echo -n "kick|" >> "$hist_dir"/"$line".tmp
			else 	# Update history files
					echo -n "-|" >> "$hist_dir"/"$line".tmp
			fi
	done < "$tools_dir"/tmp/tube-list-raw.txt
}

# Run everything

if [ "$bs_stats" ]; then get_stats ; exit 0 ; fi
if [ "$print_tubes" ]; then list_tubes ; exit 0 ; fi
set_vars
if [ "$del_stats" ]; then delete_stats; fi
trim_history
if [ "$kick" ]; then kick_jobs; exit 0 ; fi
if [ "$nokick" ]; then nokick_jobs; exit 0 ; fi
get_data
if [ "$print_rpt" ] ; then print_report; fi
rm -rf "$tools_dir"/tmp/report.tmp
rm -rf "$tmpfile"
