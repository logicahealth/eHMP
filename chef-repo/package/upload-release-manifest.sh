#!/bin/bash

file="artifact_versions.sh"
repo="releases"
url="$NEXUS_URL/nexus/service/local/artifact/maven/content"
group="us.vistacore"
artifact="artifact-versions-shell"
ext="sh"

curl -v -F r=$repo -F hasPom=false -F e=$ext -F g=$group -F a=$artifact -F v=$RELEASE_VERSION -F p=sh -F file=@$file -u $NEXUS_USER_NAME:$NEXUS_PASSWORD $url