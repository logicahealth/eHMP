def set_ec2_tags
  slave = ENV['NODE_NAME'] || "rogue-#{ENV['USER']}"
  jenkins_job = ENV['JOB_NAME'] || "rogue-#{ENV['USER']}"
  date_modified = Time.new.getlocal.strftime("%Y%m%d-%H%M%S")

  tags = {
    "slave" => slave,
    "jenkins_job" => jenkins_job,
    "date_modified" => date_modified
  }
end
