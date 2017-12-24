class PobCogWheel < SitePrism::Page
  set_url '#/staff/provider-centric-view'
  # *****************  All_Form_Elements  ******************* #
  # *****************  All_Logo_Elements  ******************* #
  element :lgo_screen_title, "#screen-title"
  # *****************  All_Field_Elements  ******************* #
  # *****************  All_Button_Elements  ******************* #
  
  element :btn_workspace_editor_option, "[class^='workspace-editor-option']"
  element :btn_workspace_list, "[class='workspace-navigation-link']"
  # *****************  All_Drop_down_Elements  ******************* #
  element :ddl_staffview_workspace, "[data-original-title='Staff Workspace']"
  element :ddl_patientview_cogWheel, "[data-original-title='Workspace Options']"
  # *****************  All_Table_Elements  ******************* #
end
