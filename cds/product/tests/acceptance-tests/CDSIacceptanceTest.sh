#!/bin/sh

if [ $# -eq 1 ]
then
	IPaddr=$1
	ping -c 3 $1 > /dev/null
	if [ $? -eq 0 ]
	then
		TCPport=PORT
		targetURL=http://$IPaddr:$TCPport/cds-results-service/rest/invokeRulesForPatient
		jsonPayload=/tmp/jasonPayload.$$

	cat << EOF > $jsonPayload
{
      "context": {
          "patientId" : "SITE;100599",
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

		echo "The CDSinvocation Acceptance Test $status"
	else
		echo "ERROR:  Either the CDSinvocation host is unreachable, or an invalid IP address has been specified"
		exit -2
	fi
else
	echo "Usage:  $0 IPaddress (of the CDSinvocation node)"
	exit -1
fi
