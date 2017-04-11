@UserList @F457

Feature: F457 - View Listing of Users

@F457_Get_User_List_1
Scenario: View listing of Active Users
When the client requests authentication with accessCode "vk1234" and verifyCode "vk1234!!" and site "9E7A" and division "500" and contentType "application/json"
When the client requests to view list Active users with name search criteria "eight","provider"
Then a successful response is returned
Then the results contains all required fields

@F457_Get_User_List_2
Scenario: View listing of Active and Inactive Users
When the client requests to view list Active and Inactive users with name search criteria "seven","labtech"
Then a successful response is returned
Then the results contains all required fields

@F457_Get_User_List_3
Scenario: View listing of Active Standard Doctor Users
When the client requests to view list Active users with name and role search criteria "eight","provider","standard-doctor"
Then a successful response is returned
Then the results contains all required fields
