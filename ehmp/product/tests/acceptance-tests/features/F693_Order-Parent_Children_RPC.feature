@RPC
Feature: F693 - Orders Applet Enhancements


@rpc_order 
Scenario: Client should get the full set of children related IENs from the parent IEN (DFN=8)
  Given a client connect to VistA using "Panorama"
  When the client search for "9781" related Order IENs  
  Then the client receive the whole set of related IENs and what their relationship is
    | relationship | related IENs   |
    | children     | 9782,9783,9784 |
  
@rpc_order 
Scenario: Client should get the full set of parent and siblings related IENs from the child IEN (DFN=8)
  Given a client connect to VistA using "Kodak"
  When the client search for "9782" related Order IENs  
  Then the client receive the whole set of related IENs and what their relationship is
    | relationship | related IENs |
    | parent       | 9781         |
    | siblings     | 9783, 9784   | 
    
@rpc_order 
Scenario: Client should get the full set of children related IENs from the parent IEN (DFN=66)
  Given a client connect to VistA using "Kodak"
  When the client search for "10876" related Order IENs  
  Then the client receive the whole set of related IENs and what their relationship is
    | relationship | related IENs               |
    | children     | 10877, 10878, 10879, 10880 |
    
@rpc_order 
Scenario: Client should get the full set of parent and siblings related IENs from the child IEN (DFN=66)
  Given a client connect to VistA using "Kodak"
  When the client search for "10880" related Order IENs  
  Then the client receive the whole set of related IENs and what their relationship is
    | relationship | related IENs        |
    | parent       | 10876               |
    | siblings     | 10877, 10878, 10879 |

@rpc_order 
Scenario: Client should get the empty array when parent IEN does not have any child related IEN (DFN=66)
  Given a client connect to VistA using "Kodak"
  When the client search for "11975" related Order IENs  
  Then the client receive the "" error message 
    
         
@rpc_order 
Scenario: Client should get error message when invalid IEN entered
  Given a client connect to VistA using "Kodak"
  When the client search for "108809t" related Order IENs 
  Then the client receive the "Nonexisting order" error message
  
  Given a client connect to VistA using "Kodak"
  When the client search for "t108809" related Order IENs 
  Then the client receive the "No order selected" error message 
  

