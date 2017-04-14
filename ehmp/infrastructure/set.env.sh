#!/bin/bash +xe

#  set.env.sh
#
#
#  Created by Flowers, Jay on 11/8/12.
#

set +xe

project_name=ehmp

green=$'\033[0;92m'
NC=$'\033[0m' # No Color

vagrant_version="1.4.3"
export VAGRANT_BIN=/usr/local/bin/vagrant

export GRADLE_OPTS="-Xmx1G -Xms256m  -Dorg.gradle.daemon=true -Dorg.gradle.parallel=true -Dorg.gradle.workers.max=1"
export GRADLE_HOME=/usr/local/gradle/gradle-2.4
export GROOVY_HOME=/usr/local/groovy/groovy-2.0.6
export PATH=$GROOVY_HOME/bin:$GRADLE_HOME/bin:$PATH

jdk_version="jdk1.8.0_92"

export destroyAll="destroyAll"
export startAll="startJDS startMocks startKodak startPanorama startVxSync"
export stopAll="stopJDS stopMocks stopKodak stopPanorama stopVxSync"
export deployAllDev="deployAllDev"
export deployAll="deployAll"
export MOCKS=true

export CONFIGURE_ARGS="--with-ldflags='-Wno-error=unused-command-line-argument-hard-error-in-future'"

export deployVE2All="deployVE2JDS deployMssql deployJmeadows deployKodak deployPanorama deployVE2Solr deployVE2Ehmp deployVE2VeApi"
export deployVE2AllDev="deployVE2JDS deployMssql deployJmeadows deployKodak deployPanorama deployVE2SolrDev deployVE2EhmpDev deployVE2VeApiDev"
export destroyVE2All="destroyVE2JDS destroyJmeadows destroyKodak destroyMssql destroyPanorama destroyVE2Solr destroyVE2Ehmp destroyVE2VeApi destroyOpeninfobutton"
export NPM_CONFIG_REGISTRY="https://store.vistacore.us/nexus/content/repositories/npm-all/"

###########################################################################################################
#
#           EVERYTHING BELOW THIS IS CALCULATED.  DO NOT HARDCODE VALUES.
#
###########################################################################################################

red='\033[0;31m'
NC='\033[0m' # No Color

if [ -n "$VISTACORE_PROJECT" ]; then
  echo -n -e "${red}########################################    FAILURE    ##############################################"
  printf "\n"
  printf "\n"
  echo "                       You have already sourced this terminal to a project."
  echo "                       You cannot source multiple times or from one project to another."
  echo "                       The project $VISTACORE_PROJECT has already been sourced."
  printf "\n"
  echo -n -e "###########################################################################################################${NC}"
  printf "\n"
  return
fi

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

export PATH=$JAVA_HOME/bin:/opt/chefdk/bin:/opt/chefdk/embedded/bin:$PATH
export GEM_PATH=/opt/chefdk/embedded/lib/ruby/gems/2.1.0

export GEM_HOME=$WORKSPACE/.aidk_gems
export GEM_PATH=$GEM_PATH:$GEM_HOME
export PATH=$GEM_HOME/bin:$PATH
export BERKSHELF_PATH=$WORKSPACE/.berkshelf
export VAGRANT_HOME=$WORKSPACE/.vagrant.d
export SLACK_GEM_HOME=$PROJECT_HOME/infrastructure/ruby
export RAKE_SYSTEM=$PROJECT_HOME/.rake
export BUNDLE_PATH=$GEM_HOME

function export_hmp(){
  BUNDLE_GEMFILE=~/projects/vistacore/ehmp/product/production/hmp/Gemfile bundle exec rake -f ~/projects/vistacore/ehmp/product/production/hmp/Rakefile export
}

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

function rake(){
  (
    if [ $1 == "-g" ]; then
      cd $RAKE_SYSTEM
      bundle install --quiet
      bundle exec rake $@
      cd $OLDPWD
    else
      `which rake` $@
    fi
  )
}

function rename_terminal(){
  (
    echo -n -e "\033]0;$@\007"
  )
}

export VISTACORE_PROJECT=$project_name
