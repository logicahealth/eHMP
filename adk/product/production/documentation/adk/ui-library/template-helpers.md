::: page-description
# Template Helpers #
ADK UI Library's Standardized Handlebar Template Helpers that are 508 Compliant
:::

::: definition
UI Template Helpers can be acccessed and used in handlebar templates by calling:
### **{{ui-[template-helper-name] ...}}** ###
:::

## Button ##
::: side-note
<!-- <button type="button" class="btn btn-default" title="Press enter to select">Normal</button>
<button type="button" class="btn btn-default" title="Press enter to select" disabled>Disabled</button>
<h4>Buttons Styles</h4>
<button type="button" class="btn btn-default" title="Press enter to select">Default</button>
<button type="button" class="btn btn-primary" title="Press enter to select">Primary</button>
<button type="button" class="btn btn-success" title="Press enter to select">Success</button>
<button type="button" class="btn btn-info" title="Press enter to select">Info</button>
<button type="button" class="btn btn-warning" title="Press enter to select">Warning</button>
<button type="button" class="btn btn-danger" title="Press enter to select">Danger</button>
<button type="button" class="btn btn-link" title="Press enter to select">Link</button>
<h4>Buttons with Icons</h4>
<button type="button" class="btn btn-default" title="Press enter to select"><i class="fa fa-th"></i> Coversheet</button>
<button type="button" class="btn btn-default" title="Press enter to select"><i class="fa fa-bar-chart"></i> Timeline</button>
<button type="button" class="btn btn-default" title="Press enter to select"><i class="fa fa-clipboard"></i> Meds Review</button>
<button type="button" class="btn btn-default" title="Press enter to select"><i class="fa fa-file-text-o"></i> Documents</button>
<h4>Size</h4>
<button type="button" class="btn btn-default btn-lg" title="Press enter to select">Large Button</button>
<button type="button" class="btn btn-default" title="Press enter to select">Default Button</button>
<button type="button" class="btn btn-default btn-sm" title="Press enter to select">Small Button</button> -->

![buttonTemplateHelpers](assets/buttonTemplateHelpers.png "Button Template Helpers Options")

:::
### Examples ###
```HTML
{{ui-button "Normal" classes="btn-default" title="Press enter to select"}}
{{ui-button "Disabled" classes="btn-default" title="Press enter to select" disabled=true}}

{{ui-button "Default" classes="btn-default" title="Press enter to select"}}
{{ui-button "Primary" classes="btn-primary" title="Press enter to select"}}
{{ui-button "Success" classes="btn-success" title="Press enter to select"}}
{{ui-button "Info" classes="btn-info" title="Press enter to select"}}
{{ui-button "Warning" classes="btn-warning" title="Press enter to select"}}
{{ui-button "Danger" classes="btn-danger" title="Press enter to select"}}
{{ui-button "Link" classes="btn-link" title="Press enter to select"}}

{{ui-button "Coversheet" classes="btn-default" title="Press enter to select" icon="fa-th"}}
{{ui-button "Timeline" classes="btn-default" title="Press enter to select" icon="fa-bar-chart"}}
{{ui-button "Meds Review" classes="btn-default" title="Press enter to select" icon="fa-clipboard"}}
{{ui-button "Documents" classes="btn-default" title="Press enter to select" icon="fa-file-text-o"}}

{{ui-button "Large Button" classes="btn-default" title="Press enter to select" size="lg"}}
{{ui-button "Default Button" classes="btn-default" title="Press enter to select"}}
{{ui-button "Small Button" classes="btn-default" title="Press enter to select" size="sm"}}
```
### Adding additional attributes ###
```HTML
<!-- Adding other attributes to the button tag -->
{{ui-button "Normal" classes="btn-default" title="Press enter to select" attributes='data-toggle=true role="tab"'}}
```