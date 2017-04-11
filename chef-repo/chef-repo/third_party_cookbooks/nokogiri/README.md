# nokogiri
Description
===========

Installs nokogiri

Requirements
============
## Cookbooks
* apt
* yum
* libxml2
* build-essential

## Testing Gems
* berkshelf
* test-kitchen
* kitchen-vagrant
* chefspec

Recipes
=======

default
-------
The default recipe will install the dependencies to build nokogiri and then
gem install nokogiri.

chefgem
-------
the chefgem recipe will install the dependencies to build nokogiri and chef_gem install nokogiri


Attributes
==========

* default['nokogiri']['gem_binary']
* default['nokogiri']['options']
* default['nokogiri']['version']


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
