#!/bin/bash

path=chef-server-package.tar.gz

/opt/chefdk/bin/knife download roles/
tar -cvzf $path roles -C $HOME/.berkshelf/ cookbooks -C $WORKSPACE artifact_versions.sh

repo="${NEXUS_UPLOAD_REPO:-releases}"
group="us.vistacore"
artifact="chef-server-package"
ext="tar.gz"
url="$NEXUS_URL/nexus/service/local/artifact/maven/content"

curl -v -F r=$repo -F hasPom=false -F e=$ext -F g=$group -F a=$artifact -F v=$APP_VERSION -F p=tar.gz -F file=@$path -H "Authorization: Basic $NEXUSAUTH" $url
