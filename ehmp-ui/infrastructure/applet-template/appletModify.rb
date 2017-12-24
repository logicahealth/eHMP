require 'fileutils'

def delete_template(applet)
  jenkinsDir = File.expand_path('../jenkins', File.dirname(__FILE__))
  jenkinsDevKin = jenkinsDir + "/#{applet}-dev.kin"
  jenkinsAcceptanceKin = jenkinsDir + "/#{applet}-acceptance-tests.kin"
  jenkinsAcceptanceTPL = jenkinsDir + "/templates/#{applet}-acceptance-test-build.tpl"
  jenkinsDevTPL = jenkinsDir + "/templates/#{applet}-gradle-dev-build.tpl"
  FileUtils.rm_f(jenkinsDevKin)
  puts "\n\ndeleted: #{jenkinsDevKin.split('/').last()}"
  FileUtils.rm_f(jenkinsAcceptanceKin)
  puts "\n\ndeleted: #{jenkinsAcceptanceKin.split('/').last()}"
  FileUtils.rm_f(jenkinsAcceptanceTPL)
  puts "\n\ndeleted: #{jenkinsAcceptanceTPL.split('/').last()}"
  FileUtils.rm_f(jenkinsDevTPL)
  puts "\n\ndeleted: #{jenkinsDevTPL.split('/').last()}"
  %x(git rm #{jenkinsDevKin} #{jenkinsAcceptanceKin} #{jenkinsAcceptanceTPL} #{jenkinsDevTPL})
end

def delete_applet(applet)
  appletDir = File.expand_path("../../product/production/applets/#{applet}", File.dirname(__FILE__))
  %x(git rm -r #{appletDir})
  FileUtils.rm_rf(appletDir, :secure => true)
  puts "\n\ndeleted: #{applet} directory"
  screen = File.expand_path("../../product/production/screens/#{applet}.js", File.dirname(__FILE__))
  %x(git rm #{screen})
  FileUtils.rm_f(screen)
  puts "\n\ndeleted: #{applet} screen"
  remove_screen_ref(applet)
  puts "\n\nremoved: #{applet} references on other screen"
  delete_template(applet)
  gradleSettings = File.expand_path('../../product/settings.gradle', File.dirname(__FILE__))
  new_contents = File.read(gradleSettings).gsub(/\ninclude ':production:applets:#{applet}'/, "")
  File.open(gradleSettings, "w") {|file| file.puts new_contents }
  %x(git add #{gradleSettings})
  puts "\n\n#{applet} applet deleted. Please commit the staged applet files before making any other modifications. \n\n"
end

def remove_screen_ref(applet)
    screenDir = File.expand_path("../../product/production/screens/", File.dirname(__FILE__))
    Dir.chdir(screenDir) do
      Dir.glob("*.js").each do |file|
        new_contents = File.read(file).gsub(/id: '#{applet}'.*?{\n\s*/m, "")
        File.open(file, "w") {|file| file.puts new_contents }
      end
      %x(git add #{screenDir})
    end
end
delete_applet(ARGV[0])
