@UserPermissionSets @F457 @DE2244 @DE4201

Feature: F457 - View and update user permission sets

@F457_Get_Permission_Sets_List
Scenario: View array of permission sets
When the client requests authentication with accessCode "PW    " and verifyCode "PW    !!" and site "9E7A" and division "500" and contentType "application/json"
When the client requests to view all user permission sets
Then a successful response is returned
And the permission sets results contain more than 0 records

@F457_Get_User_Permission_Sets_before
Scenario: View user permission sets
When the client requests to view permission sets for a specific user "urn:va:user:9E7A:10000000270"
Then a successful response is returned
Then the permission sets results contain exactly 2 values
Then the response contains permission sets
| table |
|read-access|
|standard-doctor|

@F457_Update_Permission_Sets
Scenario: Update permission sets
When the client requests to update user permission sets with content "{"user":{"uid":"urn:va:user:9E7A:10000000270", "permissionSets":["medical","provider"]},"permissionSets":["read-access"]}"
Then a successful response is returned
Then the permission sets results contain exactly 1 values
Then the response contains permission sets
| table |
|read-access|

@F457_Remove_Permission_Sets
Scenario: Remove permission sets
When the client requests to update user permission sets with content "{"user":{"uid":"urn:va:user:9E7A:10000000270","permissionSets":["standard-doctor","acc","medical"]},"permissionSets":"[]"}"
Then a successful response is returned
Then the permission sets results contain exactly 0 values
Then the response contains permission sets
| table |

@F457_Add_Permission_Sets
Scenario: Add a new permission sets
When the client requests to update user permission sets with content "{"user":{"uid":"urn:va:user:9E7A:10000000270","permissionSets":[]},"permissionSets":["read-access","standard-doctor"]}"
Then a successful response is returned
Then the permission sets results contain exactly 2 values
Then the response contains permission sets
| table |
|read-access|
|standard-doctor|

@F457_Get_User_Permission_Sets_after
Scenario: View user permission sets
When the client requests to view permission sets for a specific user "urn:va:user:9E7A:10000000270"
Then a successful response is returned
Then the permission sets results contain exactly 2 values
Then the response contains permission sets
| table |
|read-access|
|standard-doctor|
