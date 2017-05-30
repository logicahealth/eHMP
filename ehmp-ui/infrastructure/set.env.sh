#!/bin/sh

#  set.env.sh
#
#
#  Created by Flowers, Jay on 11/8/12.
#

set +xe

project_name=ehmp-ui

jdk_version="jdk1.8.0_121"

export VAGRANT_BIN=/usr/local/bin/vagrant

export GRADLE_HOME=/usr/local/gradle/gradle-2.4
export GROOVY_HOME=/usr/local/groovy/groovy-2.0.6
export GRADLE_OPTS="-Xmx1G -Xms256m -Dorg.gradle.daemon=true -Dorg.gradle.parallel=true -Dorg.gradle.workers.max=1"
export PATH=$GROOVY_HOME/bin:$GRADLE_HOME/bin:$PATH

export CONFIGURE_ARGS="--with-ldflags='-Wno-error=unused-command-line-argument-hard-error-in-future'"

###########################################################################################################
#
#           EVERYTHING BELOW THIS IS CALCULATED.  DO NOT HARDCODE VALUES.
#
###########################################################################################################

red='\033[0;31m'
NC='\033[0m' # No Color

echo -n -e "\033]0;vistacore-${project_name}\007"

if [ ! -n "$JENKINS_HOME" ]; then
  install_for_user=$USER
  install_in_home=$HOME

  if [ ! -z "$SUDO_USER" ]; then
    install_for_user=$SUDO_USER
  fi

  if [ ! -z "$SUDO_HOME" ]; then
    install_in_home=$SUDO_HOME
  fi

  if [ ! -n "$install_in_home" ]; then
    install_in_home="/Users/$install_for_user"
    if [ ! -d $install_in_home ]; then
      install_in_home="/home/$install_for_user"
    fi
  fi

  if [ ! -d $install_in_home ]; then
    "failure: unable to find home directory for user $install_for_user"
    exit 1
  fi

  export WORKSPACE=$install_in_home/Projects/vistacore
  export PROJECT_HOME=$WORKSPACE/$project_name
else
  export PROJECT_HOME=$WORKSPACE
  export WORKSPACE=$JENKINS_HOME/Projects/vistacore
fi

# keep $JAVA_HOME out front to circumvent any previously installed jdks/jres
if uname -a | grep -q "Darwin"; then
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/$jdk_version.jdk/Contents/Home
  export PATH=/usr/local/git/bin:$PATH
else
  export JAVA_HOME=/usr/lib/jvm/$jdk_version
fi

export GEM_HOME=$WORKSPACE/.aidk_gems
export GEM_PATH=$GEM_PATH:$GEM_HOME:/opt/chefdk/embedded/lib/ruby/gems/2.1.0
export PATH=$JAVA_HOME:$GEM_HOME/bin:/opt/chefdk/bin:/opt/chefdk/embedded/bin:$PATH
export BERKSHELF_PATH=$WORKSPACE/.berkshelf
export VAGRANT_HOME=$WORKSPACE/.vagrant.d
export BUNDLE_PATH=$GEM_HOME
export BROWSER=firefox

function vagrant(){
  (
    $VAGRANT_BIN $@
    echo -n -e "\033]0;vistacore-$project_name\007"
  )
}

function berks_update(){
  (
    cd $PROJECT_HOME/.chef
    bundle exec berks update -c berkshelf-config.json
    cd $OLDPWD
  )
}

export VISTACORE_PROJECT=$project_name
