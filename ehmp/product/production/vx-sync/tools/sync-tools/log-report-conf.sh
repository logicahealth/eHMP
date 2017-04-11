#!/bin/bash
# Site specific variables to be used by log-report.sh
VER="2016.06.06.001"

# create the "logs_array" if it was not specified at startup
if [ ! "$logs_array" ];
then
	logs_array=(
		# "admin-endpoint*"
		# "jobrepo*"
		"/var/log/bluepill*.log"
		"/var/log/cron"
		"/var/log/messages"
		"/opt/soap_handler/output.log"
		"/opt/vxsync/logs/vxsync-document-retrieval-endpoint"
		"/opt/vxsync/logs/vxsync-error-handling-endpoint*"
		"/opt/vxsync/logs/vxsync-operational-sync-endpoint*"
		"/opt/vxsync/logs/vxsync-pollerHost*"
		"/opt/vxsync/logs/vxsync-subscriber_document*"
		"/opt/vxsync/logs/vxsync-subscriber_enrichment*"
		"/opt/vxsync/logs/vxsync-subscriber_error*"
		"/opt/vxsync/logs/vxsync-subscriber_hdr*"
		"/opt/vxsync/logs/vxsync-subscriber_jmeadows*"
		"/opt/vxsync/logs/vxsync-subscriber_pgd*"
		"/opt/vxsync/logs/vxsync-subscriber_primary*"
		"/opt/vxsync/logs/vxsync-subscriber_publish*"
		"/opt/vxsync/logs/vxsync-subscriber_prioritization*"
		"/opt/vxsync/logs/vxsync-subscriber_storage*"
		"/opt/vxsync/logs/vxsync-subscriber_vistaProcessor*"
		"/opt/vxsync/logs/vxsync-subscriber_vler*"
		"/opt/vxsync/logs/vxsync-sync-request-endpoint*"
		"/opt/vxsync/logs/vxsync-writeback-endpoint*"
	)
fi

other_stats () {	## Other stats that show totals for different errors and include totals for the related PID/ICNs within the errors
					## This is only called if the user selects the -stats startup flag.
	# Parsing commands go here. Create commands that do the following:
	# 1. Grep the specified log for the error you are looking for.
	# 2. Parse the grep response for all instances of the PID or ICN
	# 3. Pipe the PIDS into the "sort | uniq --count" command to get totals for each account.
	# 4. Direct those results to a unique tmp file.
	# Put all that together into a one-line command:   grep | parse | sort | uniq --count > "$tools_dir"/tmp/other_stats_##.tmp
	# Also include info in the the stats_array below.

	for file in /opt/vxsync/logs/vxsync-pollerHost* ; do grep "Failed to parse the vista response into JSON" "$file" | jq '.msg' | grep -o -P ".{0,0}pid.{0,25}" | grep 'pid\\' | cut -f3 -d'\' | grep ';' | tr -d '"' | sort | uniq --count ; done >> "$tools_dir"/tmp/other_stats_01.tmp

	grep -o -P ".{0,0}Error retrieving patient.{0,55}" /opt/vxsync/logs/vxsync-subscriber_primary.log* | cut -f3 -d':' | cut -f1 -d',' | tr -dc '[:alnum:]\n\r' | tr '[:upper:]' '[:lower:]' | sort | uniq --count > "$tools_dir"/tmp/other_stats_02.tmp

	grep -o -P ".{0,0}Error getting HDR Data for domain.{0,45}" /opt/soap_handler/output.log | cut -f9 -d ' ' | sort | uniq --count > "$tools_dir"/tmp/other_stats_03.tmp

	grep -o -P ".{0,0}got the kind of error that we shouldn't get from MVI.  patient.{0,45}" /opt/vxsync/logs/vxsync-subscriber_primary.log* | cut -f4 -d':' | cut -f2 -d'"' | sort | uniq --count > "$tools_dir"/tmp/other_stats_04.tmp

	grep -o -P ".{0,0}Unable to retrieve HDR sync for .{0,145}" /opt/vxsync/logs/vxsync-subscriber_hdr.log* | cut -f4 -d ':' | cut -f2 -d' ' | sort | uniq --count > "$tools_dir"/tmp/other_stats_05.tmp

	grep "Unable to retrieve VLER document for" /opt/vxsync/logs/vxsync-subscriber_vler.log* | cut -f9 -d ':' | cut -f2 -d' ' | sort | uniq --count > "$tools_dir"/tmp/other_stats_06.tmp

	# Stats Array: Add an entry for the command you created above to the stats_array. The entry should include the pattern your are greping for and the file you are grepping
	# along with the  unique tmp file mentioned in step #4 above. This should all be separated by a pipe:
	# "pattern | log_file | tmp_file | vistaCore troubleshooting document number"
	stats_array=(
		"Failed to parse the vista response into JSON|/opt/vxsync/logs/vxsync-pollerHost*|other_stats_01.tmp|13698974"
		"Error retrieving patient|/opt/vxsync/logs/vxsync-subscriber_primary*|other_stats_02.tmp|13698983"
		"Error getting HDR Data for domain|/opt/soap_handler/output.log|other_stats_03.tmp|13698988"
		"error that we shouldn't get from MVI|/opt/vxsync/logs/vxsync-subscriber_primary*|other_stats_04.tmp|13698990"
		"Unable to retrieve HDR sync|/opt/vxsync/logs/vxsync-subscriber_hdr*|other_stats_05.tmp|13698993"
		"Unable to retrieve VLER document|/opt/vxsync/logs/vxsync-subscriber_vler*|other_stats_06.tmp|13698996"
	)
    #	FOR loop that processes the items above and prints the results
	if [ "$noTitle" ];
	then	# Process as HTML
		echo "" > "$tools_dir"/tmp/other_stats.tmp
		echo '<h2>Other Log Statistics</h2>' >> "$tools_dir"/tmp/other_stats.tmp
			for stat in "${stats_array[@]}"
			do
				pat=`echo "$stat" | cut -f1 -d'|'`
				log=`echo "$stat" | cut -f2 -d'|'`
				err=`echo "$stat" | cut -f3 -d'|'`
				doc=`echo "$stat" | cut -f4 -d'|'`
				# If there are no results then add a no results message
				if [ ! -s  "$tools_dir"/tmp/"$err" ]; then	echo -e "      0 Error not found in current log." | ansifilter -H -f >  "$tools_dir"/tmp/"$err"; fi
				#if [ ! -f  "$log" ]; then	echo -e "      0 Log does not exist or is empty."  | ansifilter -H -f >  "$tools_dir"/tmp/"$err"; fi
				echo "======================================================================"  | ansifilter -H -f >> "$tools_dir"/tmp/other_stats.tmp
				echo -e "Search Pattern: $pat" >> "$tools_dir"/tmp/other_stats.tmp
				echo -e "Log(s)Searched:"$bold" "$log""$reset"" | ansifilter -H -f >> "$tools_dir"/tmp/other_stats.tmp
				echo "----------------------------------------------------------------------"  | ansifilter -H -f >> "$tools_dir"/tmp/other_stats.tmp
				cat "$tools_dir"/tmp/"$err" | awk  -vC0=$reset -vC1=$bold -vC2=$reset -F' ' -v OFS='\t' '{print C1,$1,C2$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9 C0}' | ansifilter -H -f >> "$tools_dir"/tmp/other_stats.tmp
			done
			cat "$tools_dir"/tmp/other_stats.tmp
			echo ""
			rm -rf "$tools_dir"/tmp/other_stats*.tmp
	else	# Proces as ANSI
		echo "" > "$tools_dir"/tmp/other_stats.tmp
		echo -e ""$bold"OTHER LOG STATISTICS"$normal"" >> "$tools_dir"/tmp/other_stats.tmp
			for stat in "${stats_array[@]}"
			do
				pat=`echo "$stat" | cut -f1 -d'|'`
				log=`echo "$stat" | cut -f2 -d'|'`
				err=`echo "$stat" | cut -f3 -d'|'`
				# If there are no results then add a no results message
				if [ ! -s  "$tools_dir"/tmp/"$err" ]; then	echo -e "      0 Error not found in current log." >  "$tools_dir"/tmp/"$err"; fi
				if [ ! -f  "$log" ]; then	echo -e "      0 Log does not exist or is empty." >  "$tools_dir"/tmp/"$err"; fi
				echo "======================================================================" >> "$tools_dir"/tmp/other_stats.tmp
				echo -e "Search Pattern:"$blue" "$pat""$reset"" >> "$tools_dir"/tmp/other_stats.tmp
				echo -e "Log(s)Searched:"$bold" "$log""$reset"" >> "$tools_dir"/tmp/other_stats.tmp
				echo "----------------------------------------------------------------------" >> "$tools_dir"/tmp/other_stats.tmp
				cat "$tools_dir"/tmp/"$err" | awk  -vC0=$reset -vC1=$bold -vC2=$reset -F' ' -v OFS='\t' '{print C1,$1,C2$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9 C0}' >> "$tools_dir"/tmp/other_stats.tmp
			done
			cat "$tools_dir"/tmp/other_stats.tmp
			echo ""
			rm -rf "$tools_dir"/tmp/other_stats*.tmp
		fi
}
