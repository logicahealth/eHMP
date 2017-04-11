# libxml2

Description
===========

Installs libxml2 and libxml2 development packages

Requirements
============
## Cookbooks
* apt
* yum

## Testing Gems
* berkshelf
* test-kitchen
* kitchen-vagrant
* chefspec

Recipes
=======

default
-------
The default recipe includes either the apt or yum cookbook depending on your distro and then installs the libxml2 and libxml2 development packages.

Attributes
==========

If you would like to avoid installing the development package, set the following to false.

* default['libxml2']['install_devel'] = true

If you want libxml2 to be installed at compile time, for example if you need
libxml2 installed for a chef_gem, set the following to true.

* default['libxml2']['compile_time'] = false


License and Author
==================

* Author:: Greg Hellings (<greg@thesub.net>)


Copyright 2014, B7 Interactive, LLC.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
