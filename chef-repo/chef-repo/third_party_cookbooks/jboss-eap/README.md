jboss-eap Cookbook
==================

This cookbook installs JBoss EAP 6 from a tar.gz and would probably work with JBoss AS 7 as well.  This has only been tested on RHEL 6.  This is a basic cookbook intended as a starting point for your environment.  By default this cookbook will install JBoss into /opt/jboss and setup the init script and log directoy. See the usage section for more details.

**Special attention should be paid to the permissions set on the jboss files as this cookbook sets them all to be writable by the jboss user and should not be considered a secure setup.**

Requirements
------------
- `opscode ark cookbook` - https://github.com/opscode-cookbooks/ark
- `java` - Not managed by this cookbook
- `JBoss EAP 6` Download the zip package "Red Hat JBoss Enterprise Application Platform 6.2.0" from [RHN](https://access.redhat.com/jbossnetwork/restricted/listSoftware.html?downloadType=distributions&product=appplatform&version=6.1.1) and host on your own server

Attributes
----------
* `node['jboss-eap']['version']` - used for versioned directory name (Default: 6.2.0)
* `node['jboss-eap']['install_path']` - Base directory that will hold the versioned jboss directory and symlink (Default: /opt)
* `node['jboss-eap']['symlink']` - Name of the symlink that points to the current versioned jboss directory (Default: jboss)
* `node['jboss-eap']['config_dir']` - Directory that holds the jboss-as.conf file (Default: /etc/jboss-as)
* `node['jboss-eap']['package_url']` - Url to obtain JBoss package
* `node['jboss-eap']['checksum']` - sha256sum of package_url file
* `node['jboss-eap']['log_dir']` - Directory to hold JBoss logs (Default: /var/log/jboss)
* `node['jboss-eap']['jboss_user']` - User to run JBoss as (Default: jboss)
* `node['jboss-eap']['jboss_group']` - Group owner of JBoss (Default: jboss)
* `node['jboss-eap']['admin_user']` - Management console username (Does nothing if not set)
* `node['jboss-eap']['admin_passwd']` - Management console user passwd (Does nothing if not set) # Note the password has to be >= 8 characters, one numeric, one special
* `node['jboss-eap']['start_on_boot']` - enables services (Default: false)

Usage
-----
#### jboss-eap::default
The default recipe downloads the EAP package and unpacks it to the versioned directory (/opt/jboss-6.2.0).  A jboss symlink is created that points to the versioned directory. (/opt/jboss points to /opt/jboss-6.2.0).  The EAP supplied init script is copied to /etc/init.d/jboss and the configuration file is setup at /etc/jboss-as/jboss-as.conf.  jboss/standalone/logs is then symlinked to the supplied log directory.

Specifying an admin_user and admin_password will add the user to the JBoss management console.  Only one user is supported at this time.  Note the password complexity requirements.  The add-user.sh script exits with status code 0 even if you fail to meet the password requirements so Chef will not throw an error.  

TODO: Convert this to an array of users

#### Example wrapper cookbook / recipe
```ruby
node.override['jboss-eap']['version'] = "6.2.0"
node.override['jboss-eap']['install_path'] = '/opt'
node.override['jboss-eap']['package_url'] = 'http://example.com/jboss-eap-6.2.0.zip'
node.override['jboss-eap']['checksum'] = '627773f1798623eb599bbf7d39567f60941a706dc971c17f5232ffad028bc6f4'
node.override['jboss-eap']['log_dir'] = '/var/log/jboss'
node.override['jboss-eap']['jboss_user'] = 'jboss'
node.override['jboss-eap']['jboss_group'] = 'jboss'
node.override['jboss-eap']['admin_user'] = "youradmin"
node.override['jboss-eap']['admin_passwd'] = "ZYxalFHy-7A" # Note the password has to be >= 8 characters, one numeric, one special
node.override['jboss-eap']['start_on_boot'] = true
include_recipe "jboss-eap"

```

#### Example role: 

```ruby
name "jboss-eap-6"
description "JBoss 6 EAP install"
run_list [
    "recipe[jboss-eap]",
    ]

default_attributes(
  "jboss-eap" => {
      "install_path" => "/opt",
    "package_url" => "http://example.com/jboss-eap-6.2.0.zip",
    "checksum" => "0ef5d62a660fea46e0c204a9f9f35ad4",
        "version" => "6.2.0",
        "admin_user" => "youradmin",
        "admin_passwd" => "ZYxalFHy-7A",
        "start_on_boot" => true
    }
  
)
```
#### jboss_java_option defintion
Use this to add JAVA_OPTS options to standalone.conf
```
jboss_java_option "logging fix" do
    option "-Dorg.jboss.as.logging.per-deployment=false"
end
```


License and Authors
-------------------
Authors: https://github.com/andrewfraley
