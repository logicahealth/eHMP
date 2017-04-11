name             'logstash-forwarder_wrapper'
maintainer       'Accenture Federal Services'
maintainer_email 'vistacore@vistacore.us'
license          'All rights reserved'
description      'Installs/Configures logstash-forwarder_wrapper'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "2.0.2"


depends "logstash-forwarder", "=0.2.4"
