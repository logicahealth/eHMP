# https://github.com/elastic/topbeat/blob/master/etc/topbeat.yml
# https://www.elastic.co/guide/en/beats/topbeat/current/index.html
#
# capture interface traffic
default['topbeat']['config']['input']['period'] = 10
default['topbeat']['config']['input']['procs'] = ['.*']

# default['topbeat']['config']['shipper']['name'] = node['fqdn'] || node['host']
# default['topbeat']['config']['shipper']['tags'] = []

default['topbeat']['config']['output'] = {}
# elasticsearch host info
# default['topbeat']['config']['output']['elasticsearch']['enabled'] = true
# default['topbeat']['config']['output']['elasticsearch']['hosts'] = []
#
# default['topbeat']['config']['output']['redis']['enabled'] = false
# default['topbeat']['config']['output']['redis']['host'] = '127.0.0.1'
# default['topbeat']['config']['output']['redis']['port'] = 6_379
#
# default['topbeat']['config']['output']['file']['enabled'] = false
# default['topbeat']['config']['output']['file']['path'] = '/tmp/topbeat'
# default['topbeat']['config']['output']['file']['filename'] = 'topbeat'
# default['topbeat']['config']['output']['file']['rotate_every_kb'] = 1_000
# default['topbeat']['config']['output']['file']['number_of_files'] = 7
