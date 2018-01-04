#!/bin/sh

if uname -a | grep -q "Darwin"; then
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_131.jdk/Contents/Home
fi
