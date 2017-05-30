#!/bin/bash

function usage
{
    echo "usage: discontinue-lab-orders [[-d deploymentid] [-u username] [-p password] [-i ip]]"
}

deploymentid=
username=
password=
ip=

while [ "$1" != "" ]; do
    case $1 in
        -d | --deploymentid )   shift
                                deploymentid=$1
                                ;;
        -u | --username )       shift
                                username=$1
                                ;;
        -p | --password )       shift
                                password=$1
                                ;;
        -i | --ip )             shift
                                ip=$1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

if [[ -z $deploymentid ]]; then
	echo "deploymentid is required"
	exit 1
fi

if [[ -z $username ]]; then
	echo "username is required"
	exit 1
fi

if [[ -z $password ]]; then
	echo "password is required"
	exit 1
fi

if [[ -z $ip ]]; then
	echo "ip is required"
	exit 1
fi

# echo deploymentid=$deploymentid
# echo username=$username
# echo password=$password
# echo ip=$ip

body="<?xml version='1.0' encoding='UTF-8' standalone='yes'?><command-request><deployment-id>${deploymentid}</deployment-id><signal-event event-type='ORDER.UPDATED'><event xsi:type='signalData' xmlns:xs='http://www.w3.org/2001/XMLSchema' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'><orderStatusCode><![CDATA[urn:va:order-status:dc]]></orderStatusCode></event></signal-event></command-request>"

curl --request POST --user "${username}:${password}" --url "http://{$ip}/business-central/rest/execute" --header 'accept: application/xml' --header 'cache-control: no-cache' --header 'content-type: application/xml' --header "kie-deployment-id: ${deploymentid}" --data "${body}"