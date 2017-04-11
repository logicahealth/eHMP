#
# Cookbook Name:: ehmp-ui_provision
# Attributes:: artifacts
#

default[:'ehmp-ui_provision'][:artifacts] = {
	:'ehmp-ui' => {
		:repo => "ehmp",
  	:group => "us.vistacore.ehmp-ui",
  	:artifact => "ehmp-ui",
  	:extension => "zip",
  	:version => ENV["EHMPUI_VERSION"],
    :release => true
  },
  :adk => {
    :repo => "ehmp",
    :group => "us.vistacore.adk",
    :artifact => "adk",
    :extension => "tgz",
    :version => ENV["ADK_VERSION"],
    :release => true
  }
}
