#
# ant_wrapper cookbook


default['ant']['version']        = '1.8.2'
default['ant']['url']            = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/apache/apache-ant/1.8.2/apache-ant-1.8.2-bin.tar.gz"
default['ant']['checksum']       = '664f48cfc9c4a9a832ec1dd9d2bed5229c0a9561e489dcb88841d75d3c2c7cf9'
default['ant']['install_method'] = "source"

default['ant']['libraries']      = {"ant-contrib" => "#{node[:common][:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/apache/ant-contrib/1.0b3/ant-contrib-1.0b3.jar"}

