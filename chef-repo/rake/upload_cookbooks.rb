require 'fileutils'

desc "Upload one cookbook"
task :upload_cookbook, [:cookbook] do |t, args|
  upload_cookbook(args[:cookbook])
end

desc "Upload all cookbooks"
task :upload_all_cookbooks, [:tag_name] do |t, args|
  raise "You need to pass the tag name as a parameter to this task!" if args[:tag_name].nil?
  FileUtils.rm_rf "cookbooks"
  FileUtils.mkdir "cookbooks"
  get_updated_cookbooks(args[:tag_name]).each { |cookbook| FileUtils.cp_r cookbook, "cookbooks" }
  system "knife upload cookbooks/ --freeze --config upload_knife.rb"
  raise "Uploading failed!" if $?.exitstatus != 0
  system "git tag #{args[:tag_name]} HEAD -f"
  system "git push origin #{args[:tag_name]}"
end

def upload_cookbook(cookbook)
  system "knife cookbook upload #{cookbook} --freeze --config #{$knife_rb}"
  raise "Uploading failed!" if $?.exitstatus != 0
end

def get_updated_cookbooks(tag_name)
  diff_files = `git diff --name-only #{tag_name} HEAD`
  cookbooks = []
  diff_files.split("\n").each do |file|
    result = file.match(/^((project|machine|wrapper|third_party)_cookbooks\/[^\/]*)/)
    # result[1] will be the cookbook directory, ex: "machine_cookbooks/ehmp_provision"
    cookbooks << result[1] if !result.nil? and !cookbooks.include?(result[1]) and Dir.exist?(result[1])
  end
  cookbooks
end
