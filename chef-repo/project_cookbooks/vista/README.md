Description
===========
recipes/default.rb - A base installation of the Albany Gold Disk VistA on CentOS
recipes/vpr.rb - Install of VPR*1.0*3
recipes/fmql.rb - Install FMQL 0.96
recipes/apache2.rb - Install apache2 with FMQL conf
recipes/new_person.rb - Create or update a VistA user


Requirements
============
Assumes that selinux::permissive is available in chef.cookbooks_path

Attributes
==========

Usage
=====



TODO
=====
Transitive Dependencies: 
	http://www.osehra.org/page/osehra-code-repository
Patching is a big deal:
	http://www.osehra.org/blog/managing-vista-packages
	