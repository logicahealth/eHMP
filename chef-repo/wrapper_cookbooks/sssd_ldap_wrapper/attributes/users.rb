node.default[:sssd_ldap_wrapper][:users][:cache] = {
  :name => "cacheserver",
  :gid => 1111,
  :home => "/usr/cachesys",
  :shell => "/sbin/nologin"
}