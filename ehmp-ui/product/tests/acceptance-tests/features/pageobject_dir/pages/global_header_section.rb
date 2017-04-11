class GlobalHeaderSection < SitePrism::Section
  element :fld_patient_name_tab, "#current-patient-nav-header-tab"
  element :fld_patient_name, "#current-patient-nav-header-tab span.nav-ccow"
  element :btn_logout, ".fa-sign-out"
end
