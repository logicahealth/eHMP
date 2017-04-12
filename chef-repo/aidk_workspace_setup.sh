#!/bin/bash

if [ `whoami` != "root" ]; then
  echo
  echo "The chef-moderniztion-setup script must be run as root."
  echo "Please execute the script with the sudo command."
  echo
  exit -1
fi



# Download and install Chef-DK
if ! chef -v 2>/dev/null | grep -q 0.4.0; then
  if [ ! -f ~/Downloads/chefdk-0.4.0.1.dmg ] 
  then
    echo "Downloading Chef Development Kit 0.4.0..."
    curl -o ~/Downloads/chefdk-0.4.0.1.dmg http://nexus.vaftl.us:8081/nexus/content/repositories/ehmp/filerepo/third-party/program/chef/chef-dk/0.4.0.1/chef-dk-0.4.0.1.dmg
  fi
  echo "Installing Chef Development Kit 0.4.0..."
  echo "Mounting Chef dmg..."
  hdiutil attach ~/Downloads/chefdk-0.4.0.1.dmg
  echo "Attemping to install..."
  sudo installer -pkg /Volumes/Chef\ Development\ Kit/chefdk-0.4.0-1.pkg -target /
  echo "Unmounting Chef dmg..."
  hdiutil detach /Volumes/Chef\ Development\ Kit
fi

mkdir -p ~/Projects/vistacore

curl -o ~/Downloads/chef_setup_files.zip http://nexus.vaftl.us:8081/nexus/content/repositories/setup/workspace-setup/stripped-chefdk-config/0.1.0/stripped-chefdk-config-0.1.0.zip
unzip -o ~/Downloads/chef_setup_files.zip -d ~/Projects/vistacore/

if [ -f ~/Projects/vistacore/.chef/deploy.pem ]; then
  chmod 400 ~/Projects/vistacore/.chef/deploy.pem
fi

stack=$(echo $SUDO_USER | awk '{gsub("_", "-"); print}')
machines="jds solr mocks vista-kodak vista-panorama vxsync rdk ehmp-ui cdsdashboard cdsinvocation cdsmini opencds jbpm"
for machine in $machines; do
  if [ -d $HOME/Projects/vistacore/.chef/vms/.vagrant/machines/$machine-$stack/ ]; then
    echo "Moving $machine to $machine-dev."
    yes | /opt/chefdk/bin/knife node delete $machine-$stack-node
    mv $HOME/Projects/vistacore/.chef/vms/.vagrant/machines/$machine-$stack/ $HOME/Projects/vistacore/.chef/vms/.vagrant/machines/$machine-$stack-dev/
  fi
done

chef-client -j ~/Projects/vistacore/.chef/workstation.json --config ~/Projects/vistacore/.chef/knife.rb
