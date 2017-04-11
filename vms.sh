#!/bin/bash

stack=$1
action=$2

usage() {
  echo
  echo "Usage: ./vms.sh <stack> <action>"
  echo "  stack:    r1.3 or master"
  echo "  action:   stopAll or startAll"
  echo
}

if [ "$stack" != "r1.3" ] && [ "$stack" != "master" ]; then
  echo "Invalid stack specified."
  usage
  exit
elif [ "$action" != "stopAll" ] && [ "$action" != "startAll" ]; then
  echo "Invalid action specified."
  usage
  exit
fi

cd $HOME/Projects/vistacore/.chef/vms

for vmfile in *$stack.vm; do
  if [ -e $vmfile ]; then
    vmname="${vmfile%.*}"
    if [ "$action" == "stopAll" ]; then
      echo "Stopping $vmname..."
      VAGRANT_HOME=$HOME/Projects/vistacore/.vagrant.d vagrant halt $vmname
    else
      echo "Starting $vmname..."
      VAGRANT_HOME=$HOME/Projects/vistacore/.vagrant.d vagrant up --no-provision $vmname
    fi
  else
    echo "No $stack vms found."
  fi
done
