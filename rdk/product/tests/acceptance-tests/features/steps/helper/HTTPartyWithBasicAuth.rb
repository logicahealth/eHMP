require "httparty"

path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require "DefaultLogin.rb"
require "TestSupport.rb"
require "DomAccess.rb"
require "PatientPickerDomElements.rb"

class TestClients
  @@users = {}

  @@users["9E7A;PW    "] = "PW    !!"
  @@users["C877;PW    "] = "PW    !!"
  @@users["9E7A;pr12345"] = "pr12345!!"
  @@users["UnauthorizedUser"] = "PW      "
  @@users["AuditLogUser"] = "PW    !!"
  @@users["9E7A;PW    "] = "PW    !!"
  @@users["9E7A;1tdnurse"] = "PW      "
  @@users["9E7A;PW    "] = "baduser"
  @@users["9E7A;PW    "] = "PW    !!"
  @@users["C877;PW    "] = "PW    !!"
  @@users["9E7A;nurse18"] = "eigh18!!"
  def self.password_for(username)
    return @@users[username]
  end
end

class HTTPartyWithBasicAuth
  include HTTParty
  #@@auth = { :username => "9E7A;PW    ", :password => "PW    !!" }
  @@auth = { :accessCode => "PW    ", :verifyCode => "PW    !!", :site => "9E7A" }
  @@time_start = Time.new
  @@time_done = Time.new
  @@time_out_time = 300
  @@cookie = nil

  def self.auth
    p "HTTPartyWithBasicAuth: #{@@auth}"
    return @@auth
  end
  def self.time_elapsed_last_call
    return @@time_done - @@time_start
  end

  def self.acquire_cookie
    p "acquire cookie"
    default_auth = auth
    
    access_code = default_auth['accessCode']
    verify_code = default_auth['verifyCode']
    site = default_auth['site']
    jsonreq = { "accessCode"=> access_code, "verifyCode" => verify_code, "site" => site } 
    reqjson = jsonreq.to_json

    authentication_path = RDKQuery.new('authentication-authentication').path
    authentication_response = HTTParty.get(authentication_path)
    p "auth response code #{authentication_response.code}"
    @response = HTTPartyWithBasicAuth.post_json_with_authorization(authentication_path, reqjson, { 'Content-Type' => 'application/json', 'Cookie' => authentication_response.headers['Set-Cookie'] })

    @@cookie = @response.request.options[:headers]['Cookie']
    return @@cookie
  end

  def self.post_with_authorization(path)
    acquire_cookie if @@cookie.nil?
    # "Authorization", "Basic QjM2Mjs1MDA6cHUxMjM0O3B1MTIzNCEh"
    # directory = post(path, { :verify => false, :headers => @@header,  :basic_auth => @@auth })
    p "POST " + path
    @@time_start = Time.new
    # directory = post(path, { :verify => false, :query => @@auth, :timeout => @@time_out_time })
    directory = post path, headers: { 'Cookie' => @@cookie }
    @@time_done = Time.new
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end

  def self.get_with_authorization(path, time_out = @@time_out_time)
    acquire_cookie if @@cookie.nil?
    p "GET " + path
    directory = nil
    begin

      @@time_start = Time.new
      begin
        # directory = get(path, { :verify => false, :query => @@auth, :timeout => time_out })
        directory = get path, headers: { 'Cookie' => @@cookie }
      rescue Exception => e
        p "Exception: #{e}"
      end
      @@time_done = Time.new
      log_id = directory.headers['logid']
      p "logId: #{log_id}" if log_id
    rescue Exception => e
      @@time_done = Time.new
      p "Time to failure: #{time_elapsed_last_call}"
      raise e, "Time to failure: #{time_elapsed_last_call}"
    end
    return directory
  end

  def self.get_with_authorization_for_user(path, user, pass)
    p "GET " + path
    p "Auth user: " + user
    access = user.split(';')[1]
    site = user.split(';')[0]
    @@time_start = Time.new
    auth = { :accessCode => access, :verifyCode => pass, :site => site }
    directory = get(path, { :verify => false, :query => auth, :timeout => @@time_out_time })
    @@time_done = Time.new
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end

  def self.put_with_authorization(path)
    p "PUT " + path
    @@time_start = Time.new
    directory = put(path, { :verify => false, :query => @@auth, :timeout => @@time_out_time })
    @@time_done = Time.new
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end

  def self.post_json_with_authorization(path, json, headers = {})
    p path
    options = {}
    options[:verify] = false
    options[:query] = @@auth
    options[:timeout] = @@time_out_time
    options[:body] = json
    options[:headers] = headers unless headers.empty?
    directory = post(path, options)
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end

  def self.put_json_with_authorization(path, json, headers = {})
    p "PUT " + path
    options = {}
    options[:verify] = false
    options[:query] = @@auth
    options[:timeout] = @@time_out_time
    options[:body] = json
    options[:headers] = headers unless headers.empty?
    directory = put(path, options)
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end

  def self.put_json_with_authorization_for_user(path, json, headers = {}, user, pass)
    p "PUT " + path
    access = user.split(';')[1]
    site = user.split(';')[0]
    auth2 = { :accessCode => access, :verifyCode => pass, :site => site }
    options = {}
    options[:verify] = false
    options[:query] = auth2
    options[:timeout] = @@time_out_time
    options[:body] = json
    options[:headers] = headers unless headers.empty?
    directory = put(path, options)
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end

  def self.delete_with_authorization(path)
    p "DELETE " + path 
    @@time_start = Time.new
    #directory = delete(path, { :verify => false, :basic_auth => @@auth,  :timeout => @@time_out_time, :body => json })
    # directory = delete(path, { :verify => false, :query => @@auth,  :timeout => @@time_out_time, :body => json }) 
    directory = delete(path, { :verify => false, :query => @@auth,  :timeout => @@time_out_time })  
    @@time_done = Time.new
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end

  def self.get_json_with_authorization(path, json, headers = {})
    p path
    options = {}
    options[:verify] = false
    options[:query] = @@auth
    options[:timeout] = @@time_out_time
    options[:body] = json
    options[:headers] = headers unless headers.empty?
    directory = get(path, options)
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end

  def self.delete_json_with_authorization(path, json, headers = {})
    p path
    options = {}
    options[:verify] = false
    options[:query] = @@auth
    options[:timeout] = @@time_out_time
    options[:body] = json
    options[:headers] = headers unless headers.empty?
    directory = delete(path, options)
    log_id = directory.headers['logid']
    p "logId: #{log_id}" if log_id
    return directory
  end
end
