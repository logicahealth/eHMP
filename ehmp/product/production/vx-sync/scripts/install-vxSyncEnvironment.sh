#!/bin/sh

#Node install script

nodeInstalled=$(brew list | grep 'node')
if [ -z "$nodeInstalled" ]; then
	echo "installing node via brew"
	brew install node
	echo "node installation complete"
else
	echo "node already installed"
fi



#Beanstalk install script

beanstalkInstalled=$(brew list | grep 'beanstalk')
if [ -z "$beanstalkInstalled" ]; then
	echo "installing beanstalk via brew"
	brew install beanstalk
	echo "beanstalk installation complete"
else
	echo "beanstalk already installed"
fi

echo "installations complete"