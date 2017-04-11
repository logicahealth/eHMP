#!/bin/bash -
#
# DLW - This script may go away once we have all of the tools and the web application to drive them

# Install the jq and ansifilter packages via rpm
if ! $(which jq &>/dev/null)
then
    sudo rpm -ivh /opt/vxsync/tools/sync-tools/rpm/jq-1.4-1.of.el6.x86_64.rpm
fi

if ! $(which ansifilter &>/dev/null)
then
    sudo rpm -ivh /opt/vxsync/tools/sync-tools/rpm/ansifilter-1.11-1.el6.x86_64.rpm
fi

# Configure postfix to be able to send mail with email-sysadmin.sh
if ! grep -q 'mydomain = vxsync.int' /etc/postfix/main.cf
then
    sudo sed -i 's/^#mydomain = \(.*\)$/#mydomain = \1\nmydomain = vxsync.int/' /etc/postfix/main.cf
    sudo service postfix restart
fi

exit 0
