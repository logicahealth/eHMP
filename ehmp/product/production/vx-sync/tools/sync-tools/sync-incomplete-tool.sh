#! /bin/bash -
#
# Author: David Wicksell <dlw@linux.com>
#
# Script to display information about patients that are not sync complete
# It can display the JPID, ICN, PID, and count of such patients
#
# Using the -l icn|pid option can be used to feed a for loop to automatically sync patients
# E.g. for pid in $(./sync-incomplete-tool.sh -l pid); do curl -s "http://<vx-sync-addr>:8080/sync/doLoad?pid=$pid"; done | jq .
# E.g. for icn in $(./sync-incomplete-tool.sh -l icn); do curl -s "http://<vx-sync-addr>:8080/sync/doLoad?icn=$icn"; done | jq .
#
# Or if you want to first clear the patient, then sync them, e.g.
# for pid in $(./sync-incomplete-tool.sh -l pid); do curl -s "http://<vx-sync-addr>:8080/sync/clearPatient=$pid"; curl -s "http://<vx-sync-addr>:8080/sync/doLoad?pid=$pid"; done | jq .

if [[ $1 == "--help" ]]
then
    echo "Usage: `basename $0` [-d] [-h <hostname>] [-l icn|pid] [-t <timeout>]"
    echo -e "\t-d turns on more detail (ICN and PIDs that are not sync complete)"
    echo -e "\t-h sets the hostname/ipaddr of JDS, if necessary"
    echo -e "\t-l will output a list (ICN or PIDs that are not sync complete) for further processing"
    echo -e "\t-t sets the timeout for the JDS request"

    exit 0
fi

if ! command -v jq &>/dev/null
then
    ! command -v yum &>/dev/null && echo "Please install the jq package to proceed"; exit 1

    set -e
    sudo yum install `pwd`/`dirname $0`/rpm/jq-1.4-1.of.el6.x86_64.rpm
    set +e
fi

CONF="`pwd`/`dirname $0`/tools.properties"

if [[ -f $CONF ]]
then
    source $CONF

    HOST=$(echo ${ip_array["JDS"]} | cut -d : -f 2)
else
    HOST="localhost"
fi

PATH=$PATH:/usr/local/bin

TIMEOUT=""

while getopts dh:l:t: OPT
do
    case $OPT in
    'd') # Detail mode
        DETAIL="on"
        ;;
    'h') # Passed in hostname
        HOST="$OPTARG"
        ;;
    'l') # Pass back the ICN or the first PID as a list
        DETAIL="on"
        LIST="$OPTARG"
        ;;
    't') # Timeout for initial curl command
        TIMEOUT="-m $OPTARG"
        ;;
    '?') #invalid option
        exit 1
        ;;
    esac
done

PATS=$(curl $TIMEOUT -s "http://${HOST}:9080/vpr/all/patientlist")

if [[ $(echo $PATS) == "" ]]
then
    echo "Curl Error:"
    echo '{"error":{"message":"Curl returned nothing"}}' | jq .
    exit 2
elif [[ $(echo $PATS | jq .error | tr -d '\n') != "null" ]]
then
    echo "JDS Error:"
    echo $PATS | jq .
    exit 3
else
    JPIDS=$(echo $PATS | jq -r ".items | .[] | .jpid")
fi

CNT=0 ICNT=0

for JPID in $JPIDS
do
    if [[ $CNT == 0 && $LIST == "" ]]
    then
        echo "Patients' PIDs that are not sync complete:"
        echo "------------------------------------------"
        echo
    fi

    STATUS=$(curl -s "http://${HOST}:9080/sync/combinedstat/${JPID}")

    if [[ $(echo $STATUS | jq .error | tr -d '\n') != "null" ]]
    then
        continue
    elif [[ $(echo $STATUS | jq .syncCompleted) == "false" ]]
    then
        if [[ $DETAIL == "on" ]]
        then
            if [[ $LIST == "icn" ]]
            then
                echo $STATUS | jq -r .icn
            elif [[ $LIST == "pid" ]]
            then
                if [[ $(echo $STATUS | jq .sites | tr -d '\n') != "null" ]]
                then
                    echo $STATUS | jq -r ".sites | .[] | .pid" | grep -Ev 'DOD;|HDR;|JPID;|VLER;' | head -1
                fi
            else
                echo -n "JPID: "
                echo $JPID

                echo -en "Last Sync Request: "
                EPOCH=$(echo $STATUS | jq -r .latestEnterpriseSyncRequestTimestamp)
                echo $EPOCH [$(node -e "console.log(new Date($EPOCH).toDateString())")]

                echo -en "\tICN:   "
                echo $STATUS | jq -r .icn

                if [[ $(echo $STATUS | jq .sites | tr -d '\n') != "null" ]]
                then
                    PIDS=$(echo $STATUS | jq -r ".sites | .[] | select(.syncCompleted == "false") | .pid")
                    echo $PIDS | tr " " "\n" | sed 's/\(.*\)/\tPID:   \1/'
                fi

                echo -en "\tError: "
                if [[ $(echo $STATUS | jq .hasError | tr -d '\n') != "null" ]]
                then
                    echo $STATUS | jq -r .hasError
                else
                    echo "false"
                fi

                echo
            fi
        else
            echo $JPID
        fi

        ICNT=$((ICNT + 1))
    fi

    CNT=$(($CNT + 1))
done

if [[ $LIST == "" ]]
then
    echo -e "$ICNT of $CNT patients are not sync complete"
fi

exit 0
