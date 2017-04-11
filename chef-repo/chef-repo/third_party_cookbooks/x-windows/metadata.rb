name						 "x-windows"
maintainer       "Eric G. Wolfe"
maintainer_email "wolfe21@marshall.edu"
license          "Apache 2.0"
description      "Installs x-windows for Oracle requirements"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "0.0.3"
%w{ redhat centos scientific amazon oracle debian ubuntu }.each do |os|
  supports os
end
