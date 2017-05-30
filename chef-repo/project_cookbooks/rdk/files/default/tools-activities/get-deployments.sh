#!/bin/bash

function usage
{
    echo "usage: get-deployments [[-u username] [-p password] [-i ip]]"
}

username=
password=
ip=


while [ "$1" != "" ]; do
    case $1 in
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

url="http://${ip}/business-central/rest/deployment/processes?pagesize=2000"
finalfile=deployments-results.txt

rawxml=$(curl --request GET --user "${username}:${password}" --url "$url" --header 'accept: application/xml' --header 'cache-control: no-cache' --header 'content-type: application/xml')
allDeployments=$(grep -Eo "<deployment-id>(.+?)</deployment-id>" <<< $rawxml | sed -e 's/<\/deployment-id>/<\/deployment-id>\n/g' | sed -n 's/.*<deployment-id>\([^<]*\)<\/deployment-id>.*/\1/p')
unique_sorted_deployments=($(printf "%s\n" "${allDeployments[@]}" | sort -u))
printf "%s\n" "${unique_sorted_deployments[@]}" > $finalfile
