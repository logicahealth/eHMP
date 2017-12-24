<!-- { "label": "Teams", "path": "Picklist.Team_Management.Teams", "tags": ["teams"] } -->

::: page-description
# Teams #
Team Management Teams common elements.
:::

## Team Model ##
The **Team** model extends `ADK.Resources.Picklist.Model` with the options defined below, and is re-used across all picklist defined under "Teams".

```JavaScript
var Team = ADK.Resources.Picklist.Model.extend({
    idAttribute: 'teamID',
    label: 'teamName',
    value: 'teamID',
    childParse: 'false',
    defaults: {
        teamName: '',
        teamID: ''
    }
});
```
