Description
===========
[![Build Status](https://travis-ci.org/tas50/Firefox.svg?branch=master)](https://travis-ci.org/tas50/Firefox)

This cookbook installs the `latest` version of Firefox by default. 
You can also specify a specific version, e.g. `33.0.1`. 
Windows and Mac OS X platforms provide an option to select a specific language with `en-US` being the default.
 A `firefox_version` method is also available to retrieve exact version installed.

Requirements
============

Platforms
---------

* CentOS/RHEL
* Mac OS X
* Ubuntu
* Windows

Cookbooks
---------

These cookbooks are referenced with suggests instead of depends, so be sure to upload the cookbook that applies to 
target platform.

- dmg
- windows

Attributes
==========

* `version` - Version of firefox to download.  Default is `latest`.
* `lang` - Language of firefox to install.  Windows and Mac OS X only. Default is `en-US`.
* `releases_url` - URL for the releases directory for use by Windows and Mac OS X only. Linux platforms use package 
manager.

Usage
=====

Include the default recipe on a node's runlist to ensure that Firefox is installed.

The following example retrieves the version installed by using `firefox_version` method:

```ruby
v = firefox_version
```
