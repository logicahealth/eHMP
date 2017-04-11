#
# Author:: Julian Dunn (<jdunn@opscode.com>)
# Cookbook Name:: oracle-xe
# Attributes:: default
#
# Copyright 2013, Opscode, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Put the Oracle XE RPM somewhere and list its URL in this attribute. Typically you'll want
# to do this from within a role
default['oracle-xe']['url'] = nil

default['oracle-xe']['http-port'] = 8079
default['oracle-xe']['tnslsnr-port'] = 1521
default['oracle-xe']['oracle-password'] = 'password'
default['oracle-xe']['start-lsnr-on-boot'] = true
