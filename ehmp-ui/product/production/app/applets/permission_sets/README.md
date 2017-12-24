# Applet Id 
```javascript
{ id: 'permission_sets' }
```

# Information
This applet is unique in that it shares models and collections with three applets that are active at the same time:
* Permission 
* User Management
* Permission Sets 

Because of this, it is import to only preform changes on its data at the final point when the other applets are ready to receive these changes,
otherwise performance can quickly degrade as the other applets respond to unnecessary events.
 
In general the pattern for managing this, is to duplicate the model or collection that requires temporary updates and commit the changes when ready. 
The models have a purge method attached to them, which will clear any extra data on the model before adding it back into the shared collections.  
Extra data is anything, that is not supplied by the resource server or the fields createdOn and editedOn. 

**National Access**, is a value that is assigned to a permission set, if any permission in that set already has the national access flag. 

# Views

## Grid View 

Only has an expanded view, undefined values should be left blank

### Columns
|Field| Has Filter | Has Sort | Input | Output | 
|-----|------------|----------|-------|--------|
|Set Name | Yes | Yes| label<string>| Same as input| 
|Category | Yes | No | category<array> | Join array with comma |
|Status |  Yes | Yes | status<string>| Active, Inactive, or Deprecated |
|Created On | Yes | Yes | createdDateTime<date{YYYYMMDDHHmmss}> | MM/DD/YYYY |
|Created By | Yes | Yes | authorName<string>| Last, First |
|Edited On | Yes | Yes | lastUpdatedDateTime<date{YYYYMMDDHHmmss}> | MM/DD/YYYY |
|Created By | Yes | Yes | lastUpdatedName<string>| Last, First |
|Nat. Access | Yes | Yes | national-access<boolean> | Yes or No | 

## Details View 
Undefined values should be left blank.

### Additional Columns
|Field| Input | Output | 
|-----|-------| ------|
|Introduced | version.introduced<string> | same as input |
|Deprecated | version.deprecated<string,null>| input or N/A |
|Notes | notes<string> | same as input |
|Examples | examples | same as input |
|Individual Permissions| permissions<array> | Join array with comma |

## Abstract Form 

This applet utilizes an abstract form that is shared between the loading view and the create view.  It is mostly a tool to quickly build the UI and handle common functionality between create and edit. Additionally it automatically creates the forms footer buttons by inspecting the extending view for handler functions.  

## Edit View 
This form extends the create form step #1 which extends the abstract form.  Most of the logic is handled between those two views.
The unique changes are what happens when the submit button is pressed.

Deprecated Permission Sets should not be able to access this form

### Steps

#### Loading (Step #1)

* Waits for the version collection to finish fetching.  
* Buffer loads the permission multi-select so that the DOM does not lock up while the loading view is active. 

#### Edit Form (Step #2)

| Field | Require | Unique | Descriptions |
| ----- | ------- | ------ | ------------ |
| Set Name| True | True | The name of the permission set |
| Status | True | False | Active or Inactive | 
| Introduced | True | False | When the set becomes active | 
| Categories | True | False | Loose association with sets | 
| Description | True | False | Description |
| Notes | False | False | Extra Information | 
| Examples | False | False | Examples | 
| Permissions | False | False | The permissions that this set will contain| 

## Deprecated View 

### Steps 

### Loading (Step #1)

Fetches the versions 

### Main Form (Step #2)

| Field | Require | Unique | Descriptions |
| ----- | ------- | ------ | ------------ |
| version | True | False | The version that the deprecation becomes active | 


## Create View 

The create view extends the Abstract Form which is used to build elements of its UI. 

### Steps

#### Loading (Step #1)

* Waits for the version collection to finish fetching
* Waits for the features collection to finish fetching
* Buffer loads features multi-select to stop the DOM from locking up while the loading view is active
* Buffer loads the permission sets multi-select to stop the DOM from locking up with the loading view is active
* Buffers loads the permissions multi-select to stop the DOM from locking up with the loading view active 

#### Data Form (Step #2)

| Field | Require | Unique | Descriptions |
| ----- | ------- | ------ | ------------ |
| Set Name| True | True | The name of the permission set |
| Status | True | False | Active or Inactive | 
| Introduced | True | False | When the set becomes active | 
| Categories | True | False | Loose association with sets | 
| Description | True | False | Description |
| Notes | False | False | Extra Information | 
| Examples | False | False | Examples | 

#### Quick Select (Step #3)

Both features, and permission sets have permissions associated with it.  Anything selected here will have there permissions 
extracted out and used to pre-fill the permissions multi-select in the next step. 

| Field | Require | Unique | Descriptions |
| ----- | ------- | ------ | ------------ |
| Features | False | False | Mapping for Features to Permission |
| Permission Sets | False | False | Mapping for Sets to Permissions | 

#### Permission Selection (Step #4)

This view should be pre-filled with any permissions associated with step #3. At this point permissions can be added and removed. 
Hitting the back button on this form, will loose changes from what was pre-filled already, the user should be notified of this with an
alert modal. 

| Field | Require | Unique | Descriptions |
| ----- | ------- | ------ | ------------ |
| Permissions | False | False | The final set of permissions to be added to the set |

# Alerts 

## Loading Error 
A modal that indicates that a form was not opened because a resource call failed 

## Back Button Alert
Used on the final set of the creation view to indicate that any changes made will be lost 

## Toast Alerts (Success/Error in the upper right) 
Write back events should notify the use if the event has failed or succeed.  On success the form should be close automatically
 
## Bootstrap Alters
Create/Edit form step one will create a bootstrap warning if the Permission Set Name is not unique. 

# Messaging 
* This applet does not use global messaging it handles all of it updates based on the state of its shared data.
* This applet is not GDF responsive 
