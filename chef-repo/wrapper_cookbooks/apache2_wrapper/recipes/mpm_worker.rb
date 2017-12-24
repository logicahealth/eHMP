
# Create mpm_worker.conf in conf-enabled

# Note that this does not use the apache2::apache_module resource
# That resource will also load the mpm_worker.so dynamic library which does not exist
# in the current version of Apache. It is compiled into the apache executable.
apache_conf 'mpm_worker' do
  enable true
end