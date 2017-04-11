jds Cookbook
============

e.g.
This cookbook makes your favorite breakfast sandwich.

Requirements
------------

e.g.
#### packages
- `toaster` - jds needs toaster to brown your bagel.

Attributes
----------

e.g.
#### jds::default
<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><tt>['jds']['bacon']</tt></td>
    <td>Boolean</td>
    <td>whether to include bacon</td>
    <td><tt>true</tt></td>
  </tr>
</table>

Usage
-----
#### jds::default

e.g.
Just include `jds` in your node's `run_list`:

```json
{
  "name":"my_node",
  "run_list": [
    "recipe[jds]"
  ]
}
```

Contributing
------------

e.g.
1. Fork the repository on Github
2. Create a named feature branch (like `add_component_x`)
3. Write your change
4. Write tests for your change (if applicable)
5. Run the tests, ensuring they all pass
6. Submit a Pull Request using Github

License and Authors
-------------------
Authors:
