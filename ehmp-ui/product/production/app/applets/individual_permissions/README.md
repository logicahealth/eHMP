# Applet Id

```javascript
{ id: 'individual_permissions' }
```

# Information 
This applet is unique in that it shares models and collections with three applets that are active at the same time:
* Permission 
* User Management
* Permission Sets 

Because of this, it is import to only perform changes on its data at the final point when the other applets are ready to receive these changes,
otherwise performance can quickly degrade as the other applets respond to unnecessary events.
 
In general the pattern for managing this, is to duplicate the model or collection that requires temporary updates and commit the changes when ready. 
The models have a purge method attached to them, which will clear any extra data on the model before adding it back into the shared collections.  
Extra data is anything, that is not supplied by the resource server or the fields createdOn and editedOn. 


# Views

Undefined fields are defaulted to blank 

## Grid View

### Summary
|Field| Has Filter | Has Sort | Input | Output | 
|-----|------------|----------|-------|--------|
| Name | Yes | Yes | label<string> | Same as input |
| Description | Yes | Yes | description<string> | Same as input |
| Status | Yes | Yes | version.status<string> | Capitalized input | 

### Expanded 
|Field| Has Filter | Has Sort | Input | Output | 
|-----|------------|----------|-------|--------|
| Name | Yes | Yes | label<string> | Same as input |
| Description | Yes | Yes | description<string> | Same as input |
| Status | Yes | Yes | version.status<string> | Capitalized input | 
|Created On | Yes | Yes | createdDateTime<date{YYYYMMDDHHmmss}> | MM/DD/YYYY |
| Nat Access | Yes | Yes | national-access<boolean> | Yes or No | 

## Details View 

### Additional Columns
|Field| Input | Output | 
|-----|-------| ------ |
| Feature Category | None | *See note bellow* |
| Introduced | version.introduced<string> | same as input |
| Starts | version.startsAt<string> | same as input |
| Ends | version.endsAt<string> | same as input |
|Deprecated | version.deprecated<string,null>| input or N/A |
|Notes | notes<string> | same as input |
|Examples | examples | same as input |
|Assigned Sets| None | *See note bellow* |

*Note: The permissions collection does not have enough information to complete its details view. For this is uses the shared data to access the permission sets collection. The feature categories and assigned sets obtained by iterating over the permission sets and checking if they contain that permission.* 

## Assign Form
A multi select of permission sets, for each selected the current permission is added or removed from that set. 

*Note: Once again this is handled by the applets sharing their data.  Though this is initiated by the individual permission applet, it is handled by the permission set collection*

# Alters 
The Assign form uses a toast style success error alert to indicate if the writeback is worked.  If so the form will be closed automatically. 

# Messaging 
* This applet does not use global messaging it handles all of it updates based on the state of its shared data.
* This applet is not GDF responsive 
