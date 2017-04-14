#
# Cookbook Name:: gradle
# Attributes:: default
#
# Author:: Olle Hallin (<olle.hallin@crisp.se>)
#
default[:gradle][:version]    = '1.5'
default[:gradle][:home]       = '/usr/local/gradle'
default[:gradle][:url]        = 'http://services.gradle.org/distributions/gradle-1.5-bin.zip'
# sha256sum
default[:gradle][:checksum]   = 'a5511a0659caa47d9d74fd2844c9da43157d2f78e63a0223c6289d88f5aaecbe'
