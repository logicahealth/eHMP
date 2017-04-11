if VBoxManage list runningvms 2>/dev/null | grep -q "vxsync"; then  
  ssh -i /Users/$USER/Projects/vistacore/.vagrant.d/insecure_private_key vagrant@IPADDRES 'if [ -a /opt/vxsync/scripts/shutdownVxSync.sh ]; then sudo /opt/chef/embedded/bin/bluepill vxsync unmonitor; sudo sh /opt/vxsync/scripts/shutdownVxSync.sh; fi'
fi