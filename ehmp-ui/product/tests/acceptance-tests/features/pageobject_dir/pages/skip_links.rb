class SkipLinks < SitePrism::Section
  element :btn_trigger_menu, ".skip-link-navigation-dropdown .dropdown-toggle button"
  elements :menu_options, ".skip-link-dropdown-menu [role=menuitem]"
end
