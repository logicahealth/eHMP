#!/bin/bash

red='\033[0;31m'
NC='\033[0m'

default_repos=("app/ehmp" "app/rdk" "app/adk" "app/ehmp-ui")

if whoami | grep -q 'root' ; then
  echo "${red}"
  echo "The git repository cloning script cannot be run as root."
  echo "Please execute the script without the sudo command."
  echo "${NC}"
  exit -1
fi

if [ $# -eq 0 ]; then
  echo
  echo "Which git repositories would you like to clone?"
  echo
  echo "Specify the key and the name of the repository in the format \"key/name\". Separate multiple repos with a space."
  echo "See https://code.vistacore.us/projects for available repositories, and their keys and names."
  echo "Default repos include: ${default_repos[@]}"
  echo "Enter \"default\" to clone all the default repositories listed above."
  IFS=' ' read -a repolist
else
  repolist=("$@")
fi

if [ "$repolist" == "default" ]; then
  repolist=("${default_repos[@]}")
fi

if [ ${#repolist[@]} -ne 0 ]; then
  echo
  echo "Enter your Vistacore Crowd username."
  read username
  echo
  echo "You may be prompted for your password for each repository cloned. This password is your Vistacore Crowd password."

  for repo in "${repolist[@]}"; do
    IFS='/' read -a array <<< "$repo"
    name=${array[1]}
    echo
    echo "Attempting to clone repository $name..."
    cd $HOME/Projects/vistacore/$name &> /dev/null && git status &> /dev/null
    if [ $? -ne 0 ]; then
      repo_dir=$HOME/Projects/vistacore/$name
      git clone https://$username@code.vistacore.us/scm/$repo.git $repo_dir
      if [[ " ${default_repos[*]} " == *" $repo "* && -d $repo_dir ]]; then
        cd $repo_dir && git checkout master
      fi
    else
      echo "${red}"
      echo "Repository $repo already exists.${NC}"
    fi
  done
fi
