# gradle cookbook

Requirements
============

Platform
--------

* Ubuntu, Debian

Dependencies
------------

The following cookbooks are dependencies:

* Java - gradle requires the JVM to work.
* ark - Used to unpack and install the Gradle tarball.

Usage
=====

Simply include the recipe where you want Gradle to be installed.

Attributes
==========

* default[:gradle][:version] defaults to 1.5
* default[:gradle][:home] defaults to /usr/local/gradle
* default[:gradle][:url] the download url for the gradle binary zip
* default[:gradle][:checksum] the checksum for the gradle binary zip downloaded in the url

Recipes
=======

* default Will install Gradle into the proper location, modify PATH and define GRADLE_HOME.

Author
======

Olle Hallin (olle.hallin@crisp.se)

