require 'chef/util/file_edit'
require 'chef/log'
require 'fileutils'

def render_template(applet)
  substitute = { '[project name]' => applet }
  folder = File.expand_path('applets', File.dirname(__FILE__))
  Dir.mkdir(folder)

  FileUtils.cp_r("production", folder)
  

  appletDir = nil
  
  Dir.chdir(folder) do
    substitute.each{ |k,v| 
      key = k.gsub('[', '').gsub(']', '')
      puts "\n\n looking for: #{key} and value : #{v} \n\n"

      while Dir.glob("**/*#{key}*").size != 0
        element = Dir.glob("**/*#{key}*").first
        puts "\n\n found: #{element} \n\n"
        FileUtils.move(element, element.gsub(/(.*)#{key}/, "\\1#{v}").gsub('[', '').gsub(']', ''))
      end
    }

    substitute.each{ |k, v|
      key = k.gsub('[', '').gsub(']', '')
      Dir.glob("**/*").each do |file|
        next unless ::File.exists? file
        next unless File.file?(file) && File.size?(file)
        fileEditor = Chef::Util::FileEdit.new(file)
        fileEditor.instance_eval do
          def write_file!
            if file_edited
              ::File.open(original_pathname, "w") do |newfile|
                contents.each do |line|
                  newfile.puts(line)
                end 

                newfile.flush
              end 

              self.file_edited = false
            end
          end
        end 
        key_to_be = "#{key}".insert(0, "[\\[]").insert(-1, '[\]]')
        begin
          fileEditor.search_file_replace(key_to_be, "#{v}")
        rescue Exception => e
          Chef::Log.warn("error on search/replace of key:#{key_to_be} value:#{v} for file #{file}, error:\n #{e}")
        end
        fileEditor.write_file!
      end
    }

    appletDir = File.expand_path('../../../product/production/app/applets', File.dirname(__FILE__))
    FileUtils.cp_r(folder + "/production/" + applet, appletDir)

    
  end

  gradleSettings = File.expand_path('../../product/settings.gradle', File.dirname(__FILE__))

  File.open(gradleSettings, 'a') {|file| file.write("include ':production:applets:#{applet}'\n") }

  stageAppletFiles(appletDir,  applet, gradleSettings)

  FileUtils.rm_rf(folder, :secure => true)

  puts "\n #{applet} applet created. Please commit the staged applet files before making any other modifications. \n"
end

def stageAppletFiles(appletDir, applet, gradleSettings)
  projectDir = File.expand_path('../..', File.dirname(__FILE__))

  appletDir = appletDir + "/" + applet
  

  Dir.chdir(projectDir) do
    %x[git add #{appletDir} #{gradleSettings} ]
  end
end

def createApplet(applet)
  appletDir = File.expand_path("../../product/production/app/applets/#{applet}", File.dirname(__FILE__))

  if File.exists? appletDir
    puts "\n #{applet} applet exists. Cannot create applet. \n"
  else
    render_template(applet)
  end
end

createApplet(ARGV[0])