#!/bin/bash
#
# INITIALIZE Startup Variables
VER="2016.06.07.201"
SPID="$BASHPID"
CONF="/opt/vxsync/tools/sync-tools/tools.properties"

while getopts "e:s:-" option
do
	case "${option}" in
		[eE])	# Send Email
			email_addr=${OPTARG}
			;;
		[sS])	# Subject
			subject=${OPTARG}
			;;
		[-*])	echo -e ""
			echo -e "eHMP email-sysadmin Tool, Version "$VER""
			echo -e "Use this tool to email reports to eHMP Sys Admins"
			echo -e ""
			echo "Startup Options are:"
			echo "-e [email address] Send email to address specified"
			echo "                   usage [ -e \"my.user@domain.com\" ]"
			echo "                         [ -e \"my.user@domain.com;other.user@domain.com\" ]"
			echo "-s [subject]       Subject line of email"
			echo "                   usage [ -s \"Subject of the email\""
			echo "--help             Print this Help screen"
			exit 0 ;;
	esac
done

# Set default variables if startup variables are not specified
dy=`(date +%m-%d-%g)`   #Date
ts=`(date +%R)`  	#Time Stamp
tools_dir="/opt/vxsync/tools/sync-tools"
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
ssh_askpass=/opt/vxsync/tools/sync-tools/email_pass.sh
display=:0

cat > $ssh_askpass << EOL
#!/bin/bash
echo "$pass"
EOL
chmod u+x $ssh_askpass

if [ -f "$CONF" ]
then
	. "$CONF"
else
	echo "Unable to find "$CONF". Exiting now..."
	exit 0
fi

if [ ! "$email_addr" ]; then email_addr="$USER@`hostname`"; fi
if [ ! "$subject" ]; then subject="System Status Report for "$ehmp_env_shortname""; fi

# Obtain RDK & SOLR IPs from IP Array
for current_server in "${ip_array[@]}"
do
	short_name=`echo -n "$current_server" | cut -f1 -d ':'`
	if [ $short_name == "RDK" ]; then	rdk_ip=`echo -n "$current_server" | cut -f2 -d ':'`; fi
	if [ $short_name == "SOLR" ]; then	solr_ip=`echo -n "$current_server" | cut -f2 -d ':'`; fi
	if [ $short_name == "JDS" ]; then	jds_ip=`echo -n "$current_server" | cut -f2 -d ':'`; fi
done

# Construct and send email
(	# Add email routing details
		echo "From: Tools Admin <$USER@`hostname`>";
		echo "To: "$email_addr"";
		echo "Subject: "$subject"";
	# Add HTML Header to Body
		echo 'MIME-Version: 1.0'
		echo 'Content-Type: text/html'
		echo 'Content-Disposition: inline'
		echo '<html>'
		echo '<style>'
		echo '<!--'
		echo 'h1   { font-family: Arial; font-size: 14pt; color: #003399; font-weight: bold; margin-top: 1; margin-bottom: 0 }'
		echo 'h2   { font-family: Arial; font-size: 12pt; color: #003399; font-weight: bold; margin-top: 1; margin-bottom: 0 }'
		echo 'h3   { font-family: Arial; font-size: 11pt; color: #003399; font-weight: bold; margin-top: 1; margin-bottom: 0; text-align:center }'
		echo 'body { font-family: Courier New; font-size: 10pt }'
		echo '-->'
		echo '</style>'
		echo '<body>'
		echo '<pre style="font: monospace">'
	# Add report to Body
		echo '<h1>eHMP Status Report</h1>'
	# Add Additional scripts here using the following 2 lines as a template
		#echo '<h2>REPORT TITLE</h2>'
		#"$tools_dir"/buried-jobs-report.sh -report
		echo '<h2>Disk Stats</h2>'
		"$tools_dir"/disk-stats.sh | ansifilter -H -f
		echo ""

		echo '<h2>Buried Jobs Report</h2>'
		"$tools_dir"/beanstalk-tool.sh -list -history  | ansifilter -H -f
		echo ""

		echo '<h2>Logs Report - RDK</h2>'
		echo -e "Total occurrences of uncaughtException in the following logs:"
		DISPLAY=$display SSH_ASKPASS=$ssh_askpass \
		setsid ssh $ssh_opts "$user"@"$rdk_ip" /opt/tools/log-report.sh -noTitle -history -p "uncaughtException" -l "/tmp/rdk_\*_error.log" 2>/dev/null | ansifilter -H -f
		echo ""
		echo -e "Total occurrences of socket hang up in the following logs:"
		DISPLAY=$display SSH_ASKPASS=$ssh_askpass \
		setsid ssh $ssh_opts "$user"@"$rdk_ip" /opt/tools/log-report.sh -noTitle -history -p "socket hang up" -o "i"  2>/dev/null | ansifilter -H -f
		echo ""
		echo -e "Total occurrences of ECONNRESET in the following logs:"
		DISPLAY=$display SSH_ASKPASS=$ssh_askpass \
		setsid ssh $ssh_opts "$user"@"$rdk_ip" /opt/tools/log-report.sh -noTitle -history -p "ECONNRESET" -l "/tmp/res-server-\*.log" 2>/dev/null | ansifilter -H -f
		echo ""
		echo -e "Total occurrences of createHangUpError in the following logs:"
		DISPLAY=$display SSH_ASKPASS=$ssh_askpass \
		setsid ssh $ssh_opts "$user"@"$rdk_ip" /opt/tools/log-report.sh -noTitle -history -p  "createHangUpError" -o "i" -l "/tmp/res-server-\*.log" 2>/dev/null | ansifilter -H -f
		echo ""
		echo '<h2>Logs Report - SOLR</h2>'
		echo -e "Total occurrences of OutOfMemoryError in the following logs:"
		DISPLAY=$display SSH_ASKPASS=$ssh_askpass \
		setsid ssh $ssh_opts "$user"@"$solr_ip" /opt/tools/log-report.sh -noTitle -history -p "OutofMemoryError" -o "i" 2>/dev/null | ansifilter -H -f
		echo ""
		echo -e "Total occurrences of Store Lookup build failed in the following logs:"
		DISPLAY=$display SSH_ASKPASS=$ssh_askpass \
		setsid ssh $ssh_opts "$user"@"$solr_ip" /opt/tools/log-report.sh -noTitle -history -p "Store Lookup build failed" 2>/dev/null | ansifilter -H -f
		echo ""

		echo '<h2>Logs Report - vxSync</h2>'
echo -e "Total occurrences of EPIPE in the following logs:"
                "$tools_dir"/log-report.sh -p "EPIPE" -l "/opt/vxsync/logs/vxsync-subscriber_primary*" -noTitle -history | ansifilter -H -f
                echo ""
		echo -e "Total occurrences of Unhandled 'error' event in the following logs:"
		"$tools_dir"/log-report.sh -p "Unhandled 'error' event" -l "/opt/vxsync/logs/vxsync-subscriber_primary.log" -noTitle -history | ansifilter -H -f
		echo ""
		echo -e "Total occurrences of uncaughtException in the following logs:"
		"$tools_dir"/log-report.sh -p "uncaughtException" -l "/opt/vxsync/logs/vxsync-subscriber_primary.log" -noTitle -history | ansifilter -H -f
		echo ""
		echo -e "Total occurrences of RpcSender -> error: timeout in the following logs:"
		"$tools_dir"/log-report.sh -p "RpcSender -> error: timeout" -l "/opt/vxsync/logs/vxsync-pollerHost*" -noTitle -history | ansifilter -H -f
		echo ""
                echo -e "Total occurrences of M  ERROR in the following logs:"
                "$tools_dir"/log-report.sh -p "M  ERROR" -l "/opt/vxsync/logs/vxsync-pollerHost*" -noTitle -history | ansifilter -H -f
                echo ""
                echo -e "Total occurrences of Failed to invoke vista in the following logs:"
                "$tools_dir"/log-report.sh -p "Failed to invoke vista" -l "/opt/vxsync/logs/vxsync-pollerHost*" -noTitle -history | ansifilter -H -f
                echo ""
		echo -e "Total occurrences of ECONNREFUSED in the following logs:"
		"$tools_dir"/log-report.sh -p "ECONNREFUSED" -l "/opt/vxsync/logs/vxsync-subscriber_storage*" -noTitle -history | ansifilter -H -f
		echo ""
		# This one should always be last as it has the -stats option
		echo -e "Total occurrences of Failed to parse the vista response into JSON in the following logs:"
		"$tools_dir"/log-report.sh -p "Failed to parse the vista response into JSON" -l "/opt/vxsync/logs/vxsync-pollerHost*" -noTitle -history -stats
		echo ""
	# Add HTML Footer to Body
		echo '</pre>'
		echo '</body>'
		echo '</html>'
) | /usr/sbin/sendmail -t

rm $ssh_askpass
