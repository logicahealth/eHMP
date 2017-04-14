default['topbeat']['config']['logging']['to_files'] = true
default['topbeat']['config']['logging']['files']['path'] = '/var/log/beat'
default['topbeat']['config']['logging']['files']['name'] = 'topbeat'
default['topbeat']['config']['logging']['files']['rotateeverybytes'] = 10485760
default['topbeat']['config']['logging']['level'] = 'debug'
default['topbeat']['config']['logging']['selectors'] = ["*"]