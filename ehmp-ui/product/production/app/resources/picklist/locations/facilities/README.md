<!-- { "label": "Facilities", "path": "Picklist.Locations.Facilities", "tags": ["facilities", "locations"] } -->

::: page-description
# Facilities #
Locations Facilities picklist resource collection.
:::

## Collection ##
Picklist collection used to fetch the list of eHMP facilities. **Facilities** extends the `ADK.Resources.Picklist.Collection` abstraction with the following options:

```JavaScript
var Facilities = ADK.Resources.Picklist.Collection.extend({
    resource: 'facility-list',
    model: Facility,
    parse: function(resp, options) {
        return _.get(resp, 'data.items');
    }
});
```

## Model ##
Uses **Facility** as the collection's `model` attribute. **Facility** extends the `ADK.Resources.Picklist.Model` abstraction and specifies the following options:

```JavaScript
var Facility = ADK.Resources.Picklist.Model.extend({
    idAttribute: 'division',
    label: 'name',
    value: 'division',
    childParse: 'false',
    defaults: {
        name: '',
        siteCode: '',
        division: '',
    }
});
```

## Usage ##
### Definition ###
After resource load, the Facilities picklist is available at: `ADK.UIResources.Picklist.Locations.Facilities`
### Instantiation ###
```JavaScript
var people = new ADK.UIResources.Picklist.Locations.Facilities();
```

### Fetch ###
#### Options ####
No additional options required.
```JavaScript
people.fetch();
```
