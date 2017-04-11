# rc-cookbook
[![Build Status](https://img.shields.io/travis/johnbellone/rc-cookbook.svg)](https://travis-ci.org/johnbellone/rc-cookbook)
[![Code Quality](https://img.shields.io/codeclimate/github/johnbellone/rc-cookbook.svg)](https://codeclimate.com/github/johnbellone/rc-cookbook)
[![Test Coverage](https://codeclimate.com/github/johnbellone/rc-cookbook/badges/coverage.svg)](https://codeclimate.com/github/johnbellone/rc-cookbook/coverage)
[![Cookbook Version](https://img.shields.io/cookbook/v/rc.svg)](https://supermarket.chef.io/cookbooks/rc)
[![License](https://img.shields.io/badge/license-Apache_2-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

[Library cookbook][0] which provides a resource for writing
runtime configuration files.

A runtime configuration file can come in many flavors, but ultimately
the purpose is to manage them using a simple resource. The only type
which is provided by default is a _bash runtime configuration_ which
is simply a key-value pair.

## Basic Usage
This cookbook supports several different formats for writing out
runtime configuration files from a [Ruby Hash object](http://docs.ruby-lang.org/en/2.0.0/Hash.html).

- [EDN](https://github.com/edn-format/edn)
- [YAML](https://en.wikipedia.org/wiki/YAML)
- [TOML](https://github.com/toml-lang/toml)
- [INI](https://en.wikipedia.org/wiki/INI_file)
- [Java .properties](https://en.wikipedia.org/wiki/.properties)
- [UNIX](https://en.wikipedia.org/wiki/Environment_variable#Unix) and [Windows](https://en.wikipedia.org/wiki/Environment_variable#DOS.2C_OS.2F2_and_Windows) [environment variables](https://en.wikipedia.org/wiki/Environment_variable)
- [JSON](https://en.wikipedia.org/wiki/JSON)

### Writing bashrc skeleton
Any new types can be added by modifying the resource (adding a type)
and writing the appropriate erb template. The example which is used
for testing purposes is writing out an [bashrc skeleton file][1] which
manages HTTP proxies.

```ruby
rc_file '/etc/skel/bashrc' do
  type 'bash'
  options(
    'http_proxy' => 'http://proxy.corporate.com:80',
    'https_proxy' => 'http://proxy.corporate.com:443',
    'ftp_proxy' => 'http://proxy.corporate.com:80',
    'no_proxy' => 'localhost,127.0.0.1'
  )
end
```
### Writing Berkshelf configuration
Additionally, this resource supports writing out standard configuration
file types such as JSON, YAML and EDN. The example below shows to write
out a Berkshelf configuration file in the JSON format.

```ruby
rc_file '/etc/skel/berkshelf.json' do
  type 'json'
  options(
    'cookbook' => {
      'copyright' => 'Bloomberg Finance L.P.',
      'email' => 'jbellone@bloomberg.net',
      'license' => 'apachev2'
    }
  )
end
```

[0]: http://blog.vialstudios.com/the-environment-cookbook-pattern#thelibrarycookbook
[1]: http://www.linfo.org/etc_skel.html
