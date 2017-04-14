# Xvfb Cookbook

[![Cookbook Version](http://img.shields.io/cookbook/v/xvfb.svg?style=flat-square)][cookbook]
[![Build Status](http://img.shields.io/travis/dhoer/chef-xvfb.svg?style=flat-square)][travis]
[![GitHub Issues](http://img.shields.io/github/issues/dhoer/chef-xvfb.svg?style=flat-square)][github]

[cookbook]: https://supermarket.chef.io/cookbooks/xvfb
[travis]: https://travis-ci.org/dhoer/chef-xvfb
[github]: https://github.com/dhoer/chef-xvfb/issues

This cookbook installs Xvfb and configures it as a service. Xvfb is an X server that can run on machines with no
display hardware and no physical input devices.  It emulates a dumb framebuffer using virtual memory.

## Requirements

- Chef 11 and Ruby 1.9.3 or higher.

## Platforms

- CentOS, RedHat, Fedora
- Debian, Ubuntu

## Cookbooks

These cookbooks are referenced with suggests, so be sure to depend on the cookbooks that apply:

- apt - Debian, Ubuntu platforms
- yum - CentOS, RedHat, Fedora platforms

## Usage

Just include `recipe[xvfb]` in your run_list.

## Attributes

- `node['xvfb']['display']` - Display number to listen for connections. Default is `:0`.
- `node['xvfb']['screennum']` - Screen number. Default is `0`.
- `node['xvfb']['dimensions']` - Screen width, height, and depth.  Default is `1280x1024x24`.
- `node['xvfb']['args']` - Additional arguments.  Default is `nil`.  Set to `-ac`  to disable access control
restrictions.

See [attributes/default.rb](https://github.com/dhoer/chef-xvfb/blob/master/attributes/default.rb) for complete list
of attributes.

## Getting Help

- Ask specific questions on [Stack Overflow](http://stackoverflow.com/questions/tagged/chef-xvfb).
- Report bugs and discuss potential features in [Github issues](https://github.com/dhoer/chef-xvfb/issues).

## Contributing

Please refer to [CONTRIBUTING](https://github.com/dhoer/chef-xvfb/blob/master/CONTRIBUTING.md).

## License

MIT - see the accompanying [LICENSE](https://github.com/dhoer/chef-xvfb/blob/master/LICENSE.md) file for details.

