@Access_Pjds_stores @F799 @DE4201

Feature: F799 - View PJDS Stores

@F799_Get_Permission_Sets_List
Scenario: View array of permission sets
When the client requests authentication with accessCode "PW    " and verifyCode "PW    !!" and site "9E7A" and division "500" and contentType "application/json"
When the client requests to view all user permission sets
Then a successful response is returned
And the permission sets results contain more than 0 records

@F799_Get_Permissions_List
Scenario: View array of ehmp permissions
When the client requests to view all ehmp permissions
Then a successful response is returned
And the permissions results contain more than 0 records

@F799_Get_User_List
Scenario: View listing of Active and Inactive Users
When the client requests to view list Active and Inactive users with name search criteria "seven","labtech"
Then a successful response is returned
Then the results contains all required fields
