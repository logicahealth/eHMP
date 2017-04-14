#!/bin/bash

# Get disk stats for current server.
## INITIALIZE Startup Variables
VER="2016.01.11.001"
SPID="$BASHPID"
CONF="/opt/vxsync/tools/sync-tools/tools.properties"
gray="\033[0;1;30m"
red="\033[1;1;31m"
yellow="\033[1;1;33m"
green="\033[0;0;32m"
blue="\033[0;0;34m"
bold="\033[0;0;1m"
reset="\033[0;1;0m"
normal="\033[0;1;0m"

user=vagrant
pass=vagrant
ssh_opts="-oLogLevel=error -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null"
ssh_askpass=/opt/vxsync/tools/sync-tools/disk_pass.sh
display=:0

cat > $ssh_askpass << EOL
#!/bin/bash
echo "$pass"
EOL
chmod u+x $ssh_askpass

verify_input () {	## Test Startup Variables and set default values if they don't exist
    re='^-?[0-9]+([.][0-9]+)?$'	# Used to verify that field is a number
	# Initiate Variables
	if [ -f "$CONF" ];
	then	. "$CONF"
	else	echo "Unable to find "$CONF". Exiting now..."
			exit 0
	fi

	# Create a temp directory with a unique name for this session.
	mkdir -p "$thome"/tmp/"$SPID"
	dsk_tmpf=""$thome"/tmp/"$SPID""
	chmod -R 776 "$dsk_tmpf"
}

env_loop () {	## Find IP and name for all servers in this environment and loop through to get disk info for each
	for current_server in "${ip_array[@]}"
	do
		short_name=`echo -n "$current_server" | cut -f1 -d ':'`
		ip_addr=`echo -n "$current_server" | cut -f2 -d ':'`

		# ssh to current server and get disk info
		DISPLAY=$display SSH_ASKPASS=$ssh_askpass setsid ssh $ssh_opts vagrant@"$ip_addr" df -h -P 2>/dev/null > "$dsk_tmpf"/disk-info_"$short_name".tmp

		# loop through disk info and parse out data. Save data to master file for entire environment.
		line_num=0
		while read line ;
			do
				if [ "$line_num" -gt 0 ];
				then
					# Parse Data
					dskFilesystem=`echo "$line" | awk '{ print $1 }'`
					dskSize=`echo "$line" | awk '{ print $2 }'`
					dskUsed=`echo "$line" | awk '{ print $3 }'`
					dskAvail=`echo "$line" | awk '{ print $4 }'`
					dskPercent=`echo "$line" | awk '{ print $5 }'`
					dskMount=`echo "$line" | awk '{ print $6 }'`
					dskPerUsed=${dskPercent%\%}  #Strip the trailing % sign

					# Send non-colored data to master file, pipe delimited
					echo ""$short_name" "$dskMount" "$dskSize" "$dskUsed" "$dskAvail" "$dskPerUsed"" >> "$dsk_tmpf"/master_disk_info.tmp
				fi
				line_num=$(expr "$line_num" + 1 )
			done < "$dsk_tmpf"/disk-info_"$short_name".tmp
	done
}

sort_color () {		## Sort and color data
	cat "$dsk_tmpf"/master_disk_info.tmp | sort -k1,1 -k6,6n >> "$dsk_tmpf"/master_disk_info_sorted.tmp
	echo -e "SERVER|DISK|Size|Used|Avail|%Used"$normal"" > "$dsk_tmpf"/master_disk_info_colored.tmp
	while read line ;
	do
		# Parse Data
		srvName=`echo "$line" | awk '{ print $1 }'`
		dskMount=`echo "$line" | awk '{ print $2 }'`
		dskSize=`echo "$line" | awk '{ print $3 }'`
		dskUsed=`echo "$line" | awk '{ print $4 }'`
		dskAvail=`echo "$line" | awk '{ print $5 }'`
		dskPerUsed=`echo "$line" | awk '{ print $6 }'`

		# Colorize percent used
		if [ "$dskPerUsed" -gt 70 ] && [ "$dskPerUsed" -lt 81 ];
		then	echo -e ""$srvName"|"$dskMount"|"$dskSize"|"$dskUsed"|"$dskAvail"| "$dskPerUsed"%" >> "$dsk_tmpf"/master_disk_info_colored.tmp
		fi
		if [ "$dskPerUsed" -gt 80 ] && [ "$dskPerUsed" -lt 91 ];
		then	echo -e ""$srvName"|"$dskMount"|"$dskSize"|"$dskUsed"|"$dskAvail"| "$yellow""$dskPerUsed"%"$normal"" >> "$dsk_tmpf"/master_disk_info_colored.tmp
		fi
		if [ "$dskPerUsed" -gt 90 ];
		then	echo -e ""$srvName"|"$dskMount"|"$dskSize"|"$dskUsed"|"$dskAvail"| "$red""$dskPerUsed"%"$normal"" >> "$dsk_tmpf"/master_disk_info_colored.tmp
		fi
	done < "$dsk_tmpf"/master_disk_info_sorted.tmp
}

print_report () {	## Print Results
	echo -en ""$bold""
	column -t -s "|" "$dsk_tmpf"/master_disk_info_colored.tmp
	echo -e ""$blue"Disks that have less than 70% used are not shown"$normal""
	echo ""
}

cleanup () {		## Cleanup tmp files.
	# Delete the TMP directory used in this script
	rm -rf "$dsk_tmpf"
	rm $ssh_askpass
}

verify_input
env_loop
sort_color
print_report
cleanup
