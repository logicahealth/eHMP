ehmp_ui_provision Cookbook
============================
This cookbook is designed to bring up any machines that are built around the artifacts from the ehmp-ui (or adk) repository.

Requirements
------------
#### Cookbooks
- machine::default

#### Gems
- chef-provisioning
- chef-provisioning-ssh (run-time installation)
- chef-provisioning-vagrant (optional)
- chef-provisioning-aws (optional)

Attributes
----------
#### ehmp_ui_provision::default

#### ehmp_ui_provision::ehmp-ui
<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><tt>[:ehmp_ui][:vagrant][:shared_folders]</tt></td>
    <td>Array</td>
    <td><tt>[ 
      { 
        :guest_path => "path/on/guest", 
        :host_path => "path/on/host", 
        :create => true 
      } 
    ]</tt></td>
  </tr>
</table>

Usage
-----
In order to deploy machine using this cookbook, simply override the runlist with ehmp_ui_provision::#{name of machine}

```bash
chef-client -o ehmp_ui_provision::ehmp-ui
```

License and Authors
-------------------
team-milkyway@vistacore.us
