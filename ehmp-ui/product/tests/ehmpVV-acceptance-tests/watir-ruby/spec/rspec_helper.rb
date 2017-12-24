require 'page-object'
require 'page-object/page_factory'
require 'rspec'
require 'watir-webdriver'

path = File.expand_path('../../common', __FILE__)
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path('../../module', __FILE__)
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path('../../module/database', __FILE__)
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path('../../helper', __FILE__)
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

p path = File.expand_path('../../pages/', __FILE__)
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path('../../pages/base', __FILE__)
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

path = File.expand_path('../../spec', __FILE__)
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

# p path = File.expand_path( __FILE__)
# p path = File.expand_path('../../spec', __FILE__)

RSpec.configure do |c|
  # declare an exclusion filter
  c.filter_run_excluding :broken => true
  c.filter_run_excluding :regression => true
  c.filter_run_excluding :acceptance => true
  c.filter_run_excluding :smoketest => true
  c.filter_run_excluding :archived => true
end

RSpec.configure do |config|

  fetch_current_example = RSpec.respond_to?(:current_example) ? proc { RSpec.current_example } : proc { |context| context.example }

  config.include PageObject::PageFactory

  config.after(:each) do
    example = fetch_current_example.call(self);

    if example.exception
      meta = example.metadata
      filename = File.basename(meta[:file_path])
      line_number = meta[:line_number]
      buildJobUrl = ENV["JOB_URL"]
      buildJobNumber = ENV["BUILD_NUMBER"]
      screenshot_name = "screenshot-#{filename}-#{line_number}.png"
      screenshot_dir = "screenshots" + (buildJobNumber != nil ? ("_" + buildJobNumber.to_s) : "")
      screenshot_path = screenshot_dir + "/#{screenshot_name}"


      if !Dir.exists?(screenshot_dir)
        Dir.mkdir screenshot_dir
      end

      @driver.screenshot.save screenshot_path
      puts "----Test Failed @ URL =>  " + @driver.url
      puts "----Screenshot ------------------------------------------------------------------------"
      puts meta[:full_description] + "\n  Screenshot: #{screenshot_path}\n  " + (buildJobUrl != nil ? buildJobUrl.to_s : "") + "/ws/veteran-appointment-requests/test/watir-ruby/" + screenshot_path
      puts "---------------------------------------------------------------------------------------"
    end
  end

end

BASE_URL = "https://IP        /#/"
DEMO_URL = "https://ehmp.vistacore.us/#/logon"
VAR_URL = "https://ehmp.vistacore.us/#/logon"
TIME_OUT_LIMIT = 300

#App Static variables
PRIMARY_CARE = "Primary Care"
AUDIOLOGY = "Audiology"
OPTOMETRY = "Optometry"
MENTAL_HEALTH = "Outpatient Mental Health"

UserAccessPu = {"access_code" => "USER  ", "verify_code" => "PW      ", "station" => "KODAK"}
