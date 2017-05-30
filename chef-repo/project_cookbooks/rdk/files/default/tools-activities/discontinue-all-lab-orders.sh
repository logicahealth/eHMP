#!/bin/bash

function usage
{
    echo "usage: discontinue-all-lab-orders.sh [[-u username] [-p password] [-i ip]]"
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

./get-deployments.sh -u "$username" -p "$password" -i "$ip" ;

IFS=$'\n'
labDeployments=$(grep "VistaCore:Order" deployments-results.txt)

for deploymentId in "$labDeployments"
do
    echo discontinuing lab orders with Process Definition ID "$deploymentId"
   ./discontinue-lab-orders.sh -d "$deploymentId" -u "$username" -p "$password" -i "$ip" ;
done