#!/bin/bash
#
# run-update.sh
#
# Sets up and runs the record-update subenvironment
#


# Each of the following values can all be overridden by
# setting an environment variable of the same name:
#   CONFIG_FILE - location of the config file
#   VXSYNC_LOG_DIR - location for all log files
#   VXSYNC_DIR - location of VxSync directory
#   BEANSTALK_DATA_DIR - location for beanstalk persistence file
#   BEANSTALK_EXE - beanstalk executable command and path
#   NODE_EXE - node executable command and path
#   UPDATE_HANDLER_COUNT - number of record-update handler processes


# check each of the variables and set those that are
# undefined or empty with the original hard-coded values
if [ -z "${VXSYNC_LOG_DIR}" ]; then
  VXSYNC_LOG_DIR="/var/log/vxsync/"
fi

if [ -z "${VXSYNC_DIR}" ]; then
  VXSYNC_DIR="/opt/vxsync_client"
fi

if [ -z "${BEANSTALK_DATA_DIR}" ]; then
  BEANSTALK_DATA_DIR="${VXSYNC_DIR}/data/record-update/beanstalk"
fi

if [ -z "${BEANSTALK_EXE}" ]; then
  BEANSTALK_EXE="beanstalkd"
fi

if [ -z "${NODE_EXE}" ]; then
  NODE_EXE="/usr/local/bin/node"
fi

if [ -z "${UPDATE_HANDLER_COUNT}" ]; then
  UPDATE_HANDLER_COUNT=5
fi

if [ -z "${CONFIG_FILE}" ]; then
  CONFIG_FILE="${VXSYNC_DIR}/record-update/update-config.json"
fi

# check to see if ${CONFIG_FILE} exists and if it does,
# explode relative path of ${CONFIG_FILE} into absolute path
if [ ! -e "${CONFIG_FILE}" ]; then
  echo "Could not find config file: ${CONFIG_FILE}"
  exit 1
else
  CONFIG_FILE="$( cd "$(dirname ${CONFIG_FILE})" && pwd )"/"$(basename ${CONFIG_FILE})"
fi


echo
echo "Running record-update subenvironment with the following settings:"
echo "CONFIG_FILE=${CONFIG_FILE}"
echo "VXSYNC_LOG_DIR=${VXSYNC_LOG_DIR}"
echo "VXSYNC_DIR=${VXSYNC_DIR}"
echo "BEANSTALK_DATA_DIR=${BEANSTALK_DATA_DIR}"
echo "BEANSTALK_EXE=${BEANSTALK_EXE}"
echo "NODE_EXE=${NODE_EXE}"
echo "UPDATE_HANDLER_COUNT=${UPDATE_HANDLER_COUNT}"
echo


# verify that these directories exist, and create them if they don't
if [ ! -d ${BEANSTALK_DATA_DIR} ]; then
  echo "Creating beanstalk persistence directory ${BEANSTALK_DATA_DIR}"
  mkdir -p ${BEANSTALK_DATA_DIR}
fi

if [ ! -d ${VXSYNC_LOG_DIR} ]; then
  echo "Creating log directory ${VXSYNC_LOG_DIR}"
  mkdir -p ${VXSYNC_LOG_DIR}
fi

pushd ${VXSYNC_DIR} > /dev/null


# kill child processes created by this script
function kill_children {
  for (( num=1; num<=${UPDATE_HANDLER_COUNT}+2; num++ ))
  do
    kill %${num}
  done
}

# kill call 'kill_children' function when this script is exited (via Ctrl+C or other signal that closes the script)
trap kill_children EXIT

# run persistent beanstalk
${BEANSTALK_EXE} -p 4999 -b ${BEANSTALK_DATA_DIR} -f0 -V -z 20000000 > ${VXSYNC_LOG_DIR}/beanstalkd.log &

# run error-request handler
${NODE_EXE} ./subscriberHost.js --profile error --config-override ${CONFIG_FILE} > ${VXSYNC_LOG_DIR}/update-error.log &

# run ${UPDATE_HANDLER_COUNT} processes of record-update handler
for (( num=1; num<=${UPDATE_HANDLER_COUNT}+2; num++ ))
do
  ${NODE_EXE} ./subscriberHost.js --profile update --config-override ${CONFIG_FILE} > ${VXSYNC_LOG_DIR}/subscriberHost-update.log &
done

echo "run-update.sh: Record Update Subenvironment is running."
echo "Press CTRL+C to close the subenvironment."
echo
echo "Note:"
echo "To run this script in the background, start it followed by an \& as shown below:"
echo "sudo ./record-update/run-update.sh \&"
echo
echo "When running this script in the background, it can only be closed via kill command,"
echo "so take note of the process id."
echo
echo "Process ID: $$"

# This will wait for all child processes to end
wait

popd


