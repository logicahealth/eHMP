<!-- { "label": "For A Team", "path": "Picklist.Team_Management.Roles.forATeam", "tags": ["roles", "team"] } -->

::: page-description
# Roles For A Team #
Team Management Roles For A Team picklist resource collection.
:::

## Collection ##
Picklist collection used to fetch the list of roles for a specific team. **Roles** extends the `ADK.Resources.Picklist.Collection` abstraction with the following options:

```JavaScript
var Roles = ADK.Resources.Picklist.Collection.extend({
    resource: 'write-pick-list-roles-for-team',
    model: Role,
    comparator: 'name',
    params: function(method, options) {
        return {
            teamID: options.teamID || ''
        };
    }
});
```

## Model ##
Uses **Role** as the collection's `model` attribute. **Role** extends the `ADK.Resources.Picklist.Model` abstraction and specifies the following options:

```JavaScript
var Role = ADK.Resources.Picklist.Model.extend({
    idAttribute: 'roleID',
    label: 'name',
    value: 'roleID',
    childParse: 'false',
    defaults: {
        roleID: '',
        name: ''
    }
});
```

## Usage ##
### Definition ###
After resource load, the Roles For A Team picklist is available at: `ADK.UIResources.Picklist.Team_Management.Roles.ForATeam`
### Instantiation ###
```JavaScript
var roles = new ADK.UIResources.Picklist.Team_Management.Roles.ForATeam();
```

### Fetch ###
#### Options ####
The `teamID` (string) property is required when fetching the "Roles For A Team" picklist.
```JavaScript
roles.fetch({
	teamID: TEAM_ID
});
```
