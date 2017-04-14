default['filebeat']['config']['logging']['to_files'] = true
default['filebeat']['config']['logging']['files']['path'] = '/var/log/beat'
default['filebeat']['config']['logging']['files']['name'] = 'filebeat'
default['filebeat']['config']['logging']['files']['rotateeverybytes'] = 10485760
default['filebeat']['config']['logging']['level'] = 'debug'
default['filebeat']['config']['logging']['selectors'] = ["*"]
default['filebeat']['etc']['paths'] = ['/var/log/rdk/*.log', '/var/log/vxsync/*.log', '/var/log/secure', '/var/log/httpd/access.log']