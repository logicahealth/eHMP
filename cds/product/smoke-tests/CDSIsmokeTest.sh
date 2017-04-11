#!/usr/bin/env sh

node=cdsinvocation

# The first thing we need to do is determine whether we are testing LOCALly or testing in AWS.

local_aws=`knife search node "name:$node* AND role:*$node* NOT name:*build*" -c ~/Projects/vistacore/.chef/knife.rb | grep '^Roles:' | head -1 | awk '{print $2}' | awk -F, '{print $1}'`

case $local_aws in
	local) IPaddr=`knife search node "name:$node* AND role:*local* AND role:*$node* NOT name:*build*" -c ~/Projects/vistacore/.chef/knife.rb | grep '^IP:' | head -1 | awk '{print $2}'` ;;
	aws) IPaddr=`knife search node "name:$node* AND role:*aws* AND role:*$node* NOT name:*build*" -c ~/Projects/vistacore/.chef/knife.rb | grep '^IP:' | head -1 | awk '{print $2}'` ;;
esac

ping -c 3 $IPaddr > /dev/null
if [ $? -eq 0 ]
then
	TCPPORT     
	successSTRING="Status = RUNNING"
	returnedSTRING=`curl http://$IPaddr:$TCPport/cds-results-service/rest/healthcheck 2> /dev/null`

	if [ "$returnedSTRING" == "$successSTRING" ]
	then
		status="PASSED"
	else
		status="FAILED"
	fi

	echo "CDSinvocation $status the Smoke Test!"
else
	echo "ERROR:  Either the CDSinvocation host is unreachable, or an invalid IP address has been specified"
	exit -2
fi
