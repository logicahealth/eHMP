#!/bin/bash

stack=$1
action=$2
backend=( jds pjds solr vxsync mocks vista )

usage() {
  echo
  echo "Usage: ./vms.sh <stack> <action>"
  echo "  stack:    r1.2, r2.0, or master"
  echo "  action:   stopAll, stopFrontend, startFrontend, or startAll"
  echo
}

if [ "$stack" != "r1.2" ] && [ "$stack" != "master" ] && [ "$stack" != "r2.0" ]; then
  echo "Invalid stack specified."
  usage
  exit
elif [ "$action" != "stopAll" ] && [ "$action" != "startAll" ] && [ "$action" != "startFrontend" ] && [ "$action" != "stopFrontend" ]; then
  echo "Invalid action specified."
  usage
  exit
fi

cd $HOME/Projects/vistacore/.chef/vms

for vmfile in *$stack.vm; do
  if [ -e $vmfile ]; then
    vmname="${vmfile%.*}"
    shortvmname="$( cut -d '-' -f 1 <<< "$vmname" )"
    if [ "$action" == "stopAll" ]; then
      echo "Stopping $vmname..."
      VAGRANT_HOME=$HOME/Projects/vistacore/.vagrant.d vagrant halt $vmname
    elif [ "$action" == "startAll" ] && [ "$stack" == "r1.2" ] || [ "$action" == "startFrontend" ]; then
      if [[ ! ${backend[*]} =~ "$shortvmname" ]]
      then
        echo "Starting $vmname..."
        VAGRANT_HOME=$HOME/Projects/vistacore/.vagrant.d vagrant up --no-provision $vmname  
      fi
    elif [ "$action" == "stopFrontend" ]; then
      if [[ ! ${backend[*]} =~ "$shortvmname" ]]
      then
        echo "Stopping $vmname..."
        VAGRANT_HOME=$HOME/Projects/vistacore/.vagrant.d vagrant halt $vmname 
      fi
    else
      echo "Starting $vmname..."
      VAGRANT_HOME=$HOME/Projects/vistacore/.vagrant.d vagrant up --no-provision $vmname
    fi
  else
    echo "No $stack vms found."
  fi
done
