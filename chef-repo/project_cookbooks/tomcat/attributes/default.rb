
default["tomcat"]["version"] = "8"
version = node["tomcat"]["version"]
default["tomcat"]["prefix_dir"] = "/usr/local"
prefix_dir = node["tomcat"]["prefix_dir"]
default["tomcat"]["home"] = "#{prefix_dir}/tomcat/default"
default["tomcat"]["base"] = "#{prefix_dir}/tomcat/default"
tomcat_base = node["tomcat"]["base"]
default["tomcat"]["context_dir"] = "#{tomcat_base}/conf/Catalina/localhost"
default["tomcat"]["log_dir"] = "#{tomcat_base}/logs"
default["tomcat"]["tmp_dir"] = "#{tomcat_base}/temp"
default["tomcat"]["work_dir"] = "#{tomcat_base}/work"
default["tomcat"]["webapp_dir"] = "#{tomcat_base}/webapps"
default["tomcat"]["pid_file"] = "tomcat#{version}.pid"
default['tomcat']['shutdown_wait'] = '5'

# runtime settings
default["tomcat"]["use_security_manager"] = false
default["tomcat"]["user"] = "tomcat#{version}"
default["tomcat"]["group"] = "tomcat#{version}"
default["tomcat"]["http_port"] = 8080
default["tomcat"]["ssl_port"] = 8443
default["tomcat"]["ajp_port"] = 8009
default["tomcat"]["shutdown_port"] = 8005
default["tomcat"]["unpack_wars"] = true
default["tomcat"]["auto_deploy"] = true

# all the *_opts are later combined into JAVA_OPTS
default["tomcat"]["jvm_opts"] = ["-Xmx1024M", "-Djava.awt.headless=true"]
default["tomcat"]["jmx_opts"] = []
default["tomcat"]["webapp_opts"] = []
default["tomcat"]["more_opts"] = []

default['tomcat']['8']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/apache/apache-tomcat/8.0.20/apache-tomcat-8.0.20.tar.gz"
# default['tomcat']['8']['checksum'] = "e95a2dc7d9cee82bdf7c019615e203f5730672eb07db7cd2ebe133c893a93b84"

default['tomcat']['user_home'] = "/home/tomcat#{node["tomcat"]["version"]}"
default['tomcat']['service'] = "tomcat#{node["tomcat"]["version"]}"