#!/usr/bin/env sh

node=cdsinvocation

# The first thing we need to do is determine whether we are testing LOCALly or testing in AWS.

local_aws=`knife search node "name:$node* NOT name:*build*" -c ~/Projects/vistacore/.chef/knife.rb | grep '^Roles:' | head -1 | awk '{print $2}' | awk -F, '{print $1}'`

case $local_aws in
	local) IPaddr=`knife search node "name:$node* AND role:*local* NOT name:*build*" -c ~/Projects/vistacore/.chef/knife.rb | grep '^IP:' | head -1 | awk '{print $2}'` ;;
	aws) IPaddr=`knife search node "name:$node* AND role:*aws* NOT name:*build*" -c ~/Projects/vistacore/.chef/knife.rb | grep '^IP:' | head -1 | awk '{print $2}'` ;;
esac

ping -c 3 $IPaddr > /dev/null
if [ $? -eq 0 ]
then
	TCPport=8080
	targetURL=http://$IPaddr:$TCPport/cds-results-service/rest/invokeRulesForPatient
	jsonPayload=/tmp/jasonPayload.$$

cat << EOF > $jsonPayload
{
      "context": {
          "patientId" : "9E7A;100599",
          "userId" : "24",
          "siteId" : "111"
        },
      "reason":"providerInteractiveAdvice"
}
EOF

	result=`curl -X POST -H "Accept: Application/json" -H "Content-Type: application/json" -d @$jsonPayload $targetURL 2> /dev/null | grep -c Success`
	rm -f $jsonPayload

	if [ $result -eq 1 ]
	then
		status="PASSED"
	else
		status="FAILED"
	fi

	echo "The $node Integration Test $status"
else
	echo "ERROR:  Either the $node node is unreachable, or an invalid IP address has been specified"
	exit -2
fi
