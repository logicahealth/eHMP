#!/bin/bash

# usage: sudo ./record-update/utils/run-vista-site-data-resync-util.sh --site SITE,SITE --domain allergy --updateTime 20071217151553

# Each of the following values can all be overridden by
# setting an environment variable of the same name:
#   VXSYNC_LOG_DIR - location for all log files
#   VXSYNC_DIR - location of VxSync directory
#   NODE_EXE - node executable command and path


# check each of the variables and set those that are
# undefined or empty with the original hard-coded values
if [ -z "${VXSYNC_LOG_DIR}" ]; then
  VXSYNC_LOG_DIR="/var/log/vxsync/"
fi

if [ -z "${VXSYNC_DIR}" ]; then
  VXSYNC_DIR="/opt/vxsync_client"
fi

if [ -z "${NODE_EXE}" ]; then
  NODE_EXE="/usr/local/bin/node"
fi

echo
echo "Running record-update subenvironment with the following settings:"
echo "VXSYNC_LOG_DIR=${VXSYNC_LOG_DIR}"
echo "VXSYNC_DIR=${VXSYNC_DIR}"
echo "NODE_EXE=${NODE_EXE}"
echo


# verify that these directories exist, and create them if they don't
if [ ! -d ${VXSYNC_LOG_DIR} ]; then
  echo "Creating log directory ${VXSYNC_LOG_DIR}"
  mkdir -p ${VXSYNC_LOG_DIR}
fi


pushd ${VXSYNC_DIR} > /dev/null

${NODE_EXE} --max-old-space-size=6144 ./record-update/utils/run-vista-site-data-resync-util.js $@ >> ${VXSYNC_LOG_DIR}/update-vista-site-data-resync-util.log &

echo "Vista Site Data Resync Utility started."
echo
echo "Process ID: $$"

popd
