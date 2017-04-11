#
# Cookbook Name:: keytool
# Recipe:: test
#
# Copyright (C) 2014 Jean-Francois Theroux
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Test keystore - store password is 1qaz2wsx
cookbook_file '/tmp/keystore.jks' do
  action :create_if_missing
end

file '/tmp/storepass' do
  content 'supersecretsauce'
end

# Clean up before each run
%w(/tmp/thawtepremiumserverca.crt /var/tmp/extra-cnnicroot.crt).each do |e|
  file e do
    action :delete
  end
end

# Change keystore password tests
keytool_manage 'cacerts' do
  action :storepasswd
  keystore '/etc/pki/java/cacerts'
  storepass 'changeit'
  new_pass 'supersecretsauce'
end

# Export tests
keytool_manage 'export thawtepremiumserverca' do
  cert_alias 'thawtepremiumserverca'
  keystore '/etc/pki/java/cacerts'
  storepass_file '/tmp/storepass'
end

keytool_manage 'export extra-cnnicroot' do
  cert_alias 'extra-cnnicroot'
  file '/var/tmp/extra-cnnicroot.crt'
  keystore '/etc/pki/java/cacerts'
  storepass 'supersecretsauce'
  additional '-v'
end

# Import keystore tests
p12_file_name = 'keytool.example.com.p12'
p12_file_path = "#{Chef::Config[:file_cache_path]}/#{p12_file_name}"

cookbook_file p12_file_path do
  source p12_file_name
end

keytool_manage "import keytool.example.com keystore from PKCS12 format" do
  cert_alias 'importkeystore'
  file p12_file_path
  keystore "#{Chef::Config[:file_cache_path]}/#{p12_file_name}.jks"
  storepass 'supersecretsauce'
  srcstorepass 'saucesecretsuper'
  srcstoretype 'PKCS12'
  action :importkeystore
end

# Delete tests
keytool_manage 'delete thawtepremiumserverca' do
  cert_alias 'thawtepremiumserverca'
  action :deletecert
  keystore '/tmp/keystore.jks'
  storepass '1qaz2wsx'
end

keytool_manage 'delete extra-cnnicroot' do
  cert_alias 'extra-cnnicroot'
  action :deletecert
  keystore '/tmp/keystore.jks'
  storepass '1qaz2wsx'
end

# Import tests
keytool_manage 'import thawtepremiumserverca' do
  cert_alias 'thawtepremiumserverca'
  action :importcert
  keystore '/tmp/keystore.jks'
  storepass '1qaz2wsx'
end

keytool_manage 'import extra-cnnicroot' do
  cert_alias 'extra-cnnicroot'
  action :importcert
  file '/var/tmp/extra-cnnicroot.crt'
  keystore '/tmp/keystore.jks'
  storepass '1qaz2wsx'
end

keytool_manage 'create a new keystore' do
  action :createstore
  keystore '/tmp/keystore.jks'
  keystore_alias 'testkeystore'
  common_name 'test_common_name'
  org_unit 'test_org_unit'
  org 'test_org'
  location 'test_location'
  country 'country'
  storepass '1qaz2wsx'
end
