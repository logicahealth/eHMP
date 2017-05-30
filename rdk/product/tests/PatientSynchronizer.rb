require 'json'
require 'httparty'
require 'parallel'
require 'fileutils'

class PatientSynchronizer

  # Number of Patients to synchronize in parallel. Running multiple synchronizations in parallel
  # reduces total time compared to serial synchronization.
  @num_threads = 5

  # Maximum time to wait before releasing synchronization thread. The sync process will
  # continue to execute in the background even if this timeout is reached, but most likely there
  # was an unexpected error and the logs should be checked.
  @max_wait_seconds = 500

  # Interval to wait between checking synchronization status for a patient.
  @wait_interval_seconds = 2

  # Returns a list of all patient identifiers (ICN if available, or site;dfn if not)
  def self.get_all_pids(jds_url)
    json = JSON.parse(HTTParty.get("#{jds_url}/data/find/pt-select").body)
    return json["data"]["items"].collect { | pt | (pt["icn"] || pt["pid"]) }
  end

  # Export all the VPR JSON data for a list of patients
  def self.export_patient_list(jds_url, pid_list)
    pid_list.each { |pid| export_patient(jds_url, pid) }
  end

  # Export all the VPR JSON data for a given patient
  def self.export_patient(jds_url, pid)
    ["problem", "allergy", "consult", "vital", "lab", "procedure", "obs", "order", "treatment",
    "med", "ptf", "factor", "immunization", "exam", "cpt", "education", "pov", "skin", "image",
    "appointment", "surgery", "document", "visit", "mh", "patient"].each do |domain|
      json = JSON.parse(HTTParty.get("#{jds_url}/vpr/#{pid}/find/#{domain}").body)

      # recursively create directory to store file
      filename = "jds/#{pid.gsub(';','-')}/#{pid.gsub(';','-')}_#{domain}.json"
      dirname = File.dirname(filename)
      unless File.directory?(dirname)
        FileUtils.mkdir_p(dirname)
      end

      # write formatted JSON to file
      File.open(filename,"w") do |f|
        f.write(JSON.pretty_generate(json))
        f.close
      end
    end
  end

  def self.wait_until_operational_data_loaded(jds_url, time_out, sites)
    loop_wait_time = 5
    operational_sync_complete = false
    wait_until = Time.new + time_out

    p "Checking operational data status. This might take a few minutes."

    sites.each do |site|
        path = "#{jds_url}/statusod/#{site}"
        while Time.new <= wait_until
          begin
            json = '';
            response = HTTParty.get(path)

            p "Operational Data Response Code for #{site}: #{response.code}"
            if response.code == 200
              json = JSON.parse(response.body)
              if json.key?("completedStamp") && json["completedStamp"]["sourceMetaStamp"][site]["syncCompleted"]
                operational_sync_complete = true
              else
                operational_sync_complete = false
              end
            else
              operational_sync_complete = false
            end

            if operational_sync_complete
              p "Operational data has been synchronized for #{site}"
              break
            else
              sleep loop_wait_time
            end
          end
        end
    end

    unless operational_sync_complete
      p "Operational Data Sync NOT Complete and document NOT returned."
      p "----------------"
      fail "Timeout waiting for Operational-Data to sync after #{time_out} seconds elapsed"
    end
  end

  def self.synchronize(vxsync_url, pid, time_out)
    time_start = Time.new
    query_param = "icn=#{pid}"
    if pid.include? ';'
      query_param = "pid=#{pid}"
    end

    wait_until = time_start + time_out

    sync_url = "#{vxsync_url}/sync/doLoad?#{query_param}"
    response = HTTParty.get(sync_url, {:verify => false})

    if response.code == 202
      p "#{pid}: Started synchronization"
    else
      p "#{pid}: Failed to start synchronization"
      p response
    end

    while Time.new <= wait_until
      begin
        if is_sync_complete vxsync_url, pid
          return (Time.new - time_start).round(1)
        else
          sleep @wait_interval_seconds
        end
      end
    end

    if Time.new > wait_until
      p "#{pid}: Allowable time limit reached. Sync request will continue to be processed in the background."
      return (Time.new - time_start).round(1)
    end
  end

  def self.synchronizeNoPrimary(vxsync_url, pid, time_out)
    time_start = Time.new
    query_param = "icn=#{pid}"
    if pid.include? ';'
      query_param = "pid=#{pid}"
    end

    wait_until = time_start + time_out

    sync_url = "#{vxsync_url}/sync/demographicSync"
    if pid == '4325678V4325678'
      demographics = {:givenNames=>"PATIENT",:familyName=>"DODONLY",:genderCode=>"M",:ssn=>"*****1234",:birthDate=>"19670909",:address=>[{:city=>"Norfolk",:line1=>"Lost Street",:state=>"VA",:use=>"H",:zip=>"20152"}],:telecom=>[{:use=>"H",:value=>"301-222-3333"}],:id=>"4325678V4325678^NI^200M^USVHA",:facility=>"200M",:dataSource=>"USVHA",:pid=>"4325678V4325678",:idType=>"NI",:idClass=>"ICN",:fullName=>"DODONLY,PATIENT",:displayName=>"DODONLY,PATIENT",:age=>47,:ssn4=>"1234",:genderName=>"Male",:ageYears=>"Unk",:dob=>"19670909"}
    elsif pid == '4325679V4325679'
      demographics = {:givenNames=>"PATIENT",:familyName=>"ICNONLY",:genderCode=>"M",:ssn=>"*****1235",:birthDate=>"19671010",:address=>[{:city=>"Norfolk",:line1=>"ICN Street",:state=>"VA",:use=>"H",:zip=>"20152"}],:telecom=>[{:use=>"H",:value=>"301-222-3334"}],:id=>"4325679V4325679^NI^200M^USVHA",:facility=>"200M",:dataSource=>"USVHA",:pid=>"4325679V4325679",:idType=>"NI",:idClass=>"ICN",:fullName=>"ICNONLY,PATIENT",:displayName=>"ICNONLY,PATIENT",:age=>47,:ssn4=>"1235",:genderName=>"Male",:ageYears=>"Unk",:dob=>"19671010"}
    end

    response = HTTParty.post(sync_url,
      :body => { :icn => pid, :demographics => demographics}.to_json,
      :headers => { 'Content-Type' => 'application/json' })

    if response.code == 202
      p "#{pid}: Started synchronization"
    else
      p "#{pid}: Failed to start synchronization"
      p response
    end

    while Time.new <= wait_until
      begin
        if is_sync_complete vxsync_url, pid
          return (Time.new - time_start).round(1)
        else
          sleep @wait_interval_seconds
        end
      end
    end

    if Time.new > wait_until
      p "#{pid}: Allowable time limit reached. Sync request will continue to be processed in the background."
      return (Time.new - time_start).round(1)
    end
  end

  def self.is_sync_complete(vxsync_url, pid)
    query_param = "icn=#{pid}"
    if pid.include? ';'
      query_param = "pid=#{pid}"
    end

    status_url = "#{vxsync_url}/sync/status?#{query_param}"
    response = HTTParty.get(status_url, { :verify => false })

    if response.code == 200
      status = JSON.parse(response.body)

      if status.key?("syncStatus") && status["syncStatus"].key?("completedStamp") && !status["syncStatus"].key?("inProgress") && status["jobStatus"].empty?
        return true
      elsif status.key?("jobStatus") && status["jobStatus"] && !status["jobStatus"].empty? && status["jobStatus"][0]["status"] == 'error'
        error_text = status["jobStatus"][0]["error"]
        type = status["jobStatus"][0]["type"]
        p "#{pid}: Sync FAILED, error: #{error_text} for #{type}"
        return true
      end
    end

    return false
  end

  def self.synchronize_patient_list(vxsync_url, time_out, pid_list)
    time_start = Time.new
    count = 0
    Parallel.each_with_index(pid_list, :in_threads => @num_threads) do | pid |
      if pid == '4325678V4325678' or pid == '4325679V4325679'
        seconds = synchronizeNoPrimary(vxsync_url, pid, @max_wait_seconds)
      else
        seconds = synchronize(vxsync_url, pid, @max_wait_seconds)
      end
      count = count + 1
      p "#{pid}: Finished in #{seconds}s (#{count} of #{pid_list.length})"
    end
    p "Total time: #{(Time.new - time_start).round(1)}s"
  end

end
