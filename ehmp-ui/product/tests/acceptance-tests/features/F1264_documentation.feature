@F1264 @documentation
Feature: Staff Context Workspaces - documentation

Scenario:
  When the user navigates to the workspaceManager page
  Then the documentation displays a "Workspace Selector" section 
  And the documentation displays subsections
   | subsection|
   | Workspace Options Dropdown |
  And the documenation displays sub-sub-sections
   | subsection|
   | Options Registration |

Scenario:
  When the user navigates to the contexts page
  And the documentation displays subsections
   | subsection|
   | Color Theme |

Scenario:
  When the user navigates to the contexts admin page
  Then the the documentation displays a Color Theme section

Scenario:
  When the user navigates to the contexts staff page
  Then the the documentation displays a Color Theme section