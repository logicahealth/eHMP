require "httparty"

path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require "DefaultLogin.rb"
require "TestSupport.rb"
require "DomAccess.rb"
require "PatientPickerDomElements.rb"

class TestClients
  @@users = {}
    
  @@users["SITE;USER"] = "PW"
  def self.password_for(username)
    return @@users[username]
  end
end

class HTTPartyWithSysAdminAuth
  include HTTParty
  @@auth = { :accessCode => "USER", :verifyCode => "PW", :site => "SITE", :division => "500" }
#remove this site before doing things
  @@site = nil
  @@time_start = Time.new
  @@time_done = Time.new
  @@time_out_time = 300
  @@cookie = nil
  @@jwt = nil

  def self.auth
    return @@auth
  end

  def self.time_elapsed_last_call
    return @@time_done - @@time_start
  end

  def self.tokens_ready
    !@@cookie.nil? || !@@jwt.nil?
  end

  def self.build_options
    headers = {}
    headers['Cookie'] = @@cookie unless @@cookie.nil?
    headers['Authorization'] = @@jwt unless @@jwt.nil?

    options = {}
    options[:headers] = headers
    options[:verify] = false
    options[:timeout] = @@time_out_time
    return options
  end

  def self.acquire_auth_details(opt)
    auth_details = {}
    if opt[:user] && opt[:path]
      auth_details[:accessCode] = opt.user.split(';')[1]
      auth_details[:site] = opt.user.split(';')[0]
      auth_details[:verifyCode] = opt.pass
    end
    return auth_details
  end

  #General login function to allow for cookie and jwt token storage
  def self.acquire_tokens(auth_details = {})
    default_auth = auth
    payload = { :accessCode => default_auth[:accessCode], :verifyCode => default_auth[:verifyCode], :site => default_auth[:site], :division => default_auth[:division] }.merge(auth_details).to_json

    authentication_path = RDKQuery.new('authentication-authentication').path
    @response = HTTParty.post(authentication_path, :body => payload, :headers => { 'Content-Type' => 'application/json' }, :timeout => @@time_out_time, :verify => false)

    p "HTTPartyWithBasicAuth: #{payload} had a #{@response.code} response"
    @@cookie = @response.headers['set-cookie']
    jwt = @response.headers['X-Set-JWT']
    @@jwt = 'Bearer ' + jwt unless jwt.nil?
    @@site = JSON.parse(payload)[:site]
    return @response
  end

  def self.get_authentication(auth_details = {})
    @response = nil
    @response = acquire_tokens(auth_details) unless tokens_ready
    return @response
  end

  def self.get_with_authorization(path)
    auth_resp = get_authentication
    options = {}
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_get(path, options)
  end

  def self.post_with_authorization(path)
    auth_resp = get_authentication
    options = {}
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_post(path, options)
  end

  def self.put_with_authorization(path)
    auth_resp = get_authentication
    options = {}
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_put(path, options)
  end

  def self.delete_with_authorization(path)
    auth_resp = get_authentication
    options = {}
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_delete(path, options)
  end

  def self.get_json_with_authorization(path, json = {}, headers = {})
    auth_resp = get_authentication
    options = {}
    options[:body] = json unless json.empty?
    options[:headers] = headers unless headers.empty?
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_get(path, options)
  end

  def self.post_json_with_authorization(path, json = {}, headers = {})
    auth_resp = get_authentication
    options = {}
    options[:body] = json unless json.empty?
    options[:headers] = headers unless headers.empty?
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_post(path, options)
  end

  def self.put_json_with_authorization(path, json = {}, headers = {})
    auth_resp = get_authentication
    options = {}
    options[:body] = json unless json.empty?
    options[:headers] = headers unless headers.empty?
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_put(path, options)
  end

  def self.delete_json_with_authorization(path, json = {}, headers = {})
    auth_resp = get_authentication
    options = {}
    options[:body] = json unless json.empty?
    options[:headers] = headers unless headers.empty?
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_delete(path, options)
  end

  def self.get_with_authorization_for_user(path, user, pass, json = {}, headers = {})
    auth_details = {}
    auth_details[:accessCode] = user.split(';')[1]
    auth_details[:site] = user.split(';')[0]
    auth_details[:verifyCode] = pass
    auth_resp = get_authentication(auth_details)

    options = {}
    options[:body] = json unless json.empty?
    options[:headers] = headers unless headers.empty?
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_get(path, options)
  end

  def self.post_json_with_authorization_for_user(path, user, pass, json = {}, headers = {})
    auth_details = {}
    auth_details[:accessCode] = user.split(';')[1]
    auth_details[:site] = user.split(';')[0]
    auth_details[:verifyCode] = pass
    auth_resp = get_authentication(auth_details)

    options = {}
    options[:body] = json unless json.empty?
    options[:headers] = headers unless headers.empty?
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_post(path, options)
  end

  def self.put_json_with_authorization_for_user(path, user, pass, json = {}, headers = {})
    auth_details = {}
    auth_details[:accessCode] = user.split(';')[1]
    auth_details[:site] = user.split(';')[0]
    auth_details[:verifyCode] = pass
    auth_resp = get_authentication(auth_details)

    options = {}
    options[:body] = json unless json.empty?
    options[:headers] = headers unless headers.empty?
    options[:response] = auth_resp unless auth_resp.nil?
    return execute_put(path, options)
  end

  #######################################
  # These calls are used by the above functions after a user has been established
  # Trying to use them without a user will likely cause a 401 due to the missing 
  # cookie or jwt tokens
  ########################################
  def self.execute_get(path, opt = {})
    p "GET " + path
    @response = nil

    return opt[:response] if opt.key?('response'.to_sym) && opt[:response].code != 200

    options = deep_merge(build_options, opt)
    #p "Options; #{options}"
    begin
      @@time_start = Time.new
      begin
        @response = HTTParty.get(path, options)
      rescue Exception => e
        p "Exception: #{e}"
      end
      @@time_done = Time.new
      log_id = @response.headers['logid']
      p "logId: #{log_id}" if log_id
    rescue Exception => e
      @@time_done = Time.new
      p "Time to failure: #{time_elapsed_last_call}"
      raise e, "Time to failure: #{time_elapsed_last_call}"
    end
    return @response
  end

  def self.execute_post(path, opt = {})
    p "POST " + path
    @response = nil

    return opt[:response] if opt.key?('response'.to_sym) && opt[:response].code != 200

    options = deep_merge(build_options, opt)
    #p "Options; #{options}"
    begin
      @@time_start = Time.new
      begin
        @response = HTTParty.post(path, options)
      rescue Exception => e
        p "Exception: #{e}"
      end
      @@time_done = Time.new
      log_id = @response.headers['logid']
      p "logId: #{log_id}" if log_id
    rescue Exception => e
      @@time_done = Time.new
      p "Time to failure: #{time_elapsed_last_call}"
      raise e, "Time to failure: #{time_elapsed_last_call}"
    end
    return @response
  end

  def self.execute_put(path, opt = {})
    p "PUT " + path
    @response = nil

    return opt[:response] if opt.key?('response'.to_sym) && opt[:response].code != 200

    options = deep_merge(build_options, opt)
    #p "Options; #{options}"
    begin
      @@time_start = Time.new
      begin
        @response = HTTParty.put(path, options)
      rescue Exception => e
        p "Exception: #{e}"
      end
      @@time_done = Time.new
      log_id = @response.headers['logid']
      p "logId: #{log_id}" if log_id
    rescue Exception => e
      @@time_done = Time.new
      p "Time to failure: #{time_elapsed_last_call}"
      raise e, "Time to failure: #{time_elapsed_last_call}"
    end
    return @response
  end

  def self.execute_delete(path, opt = {})
    p "DELETE " + path
    @response = nil

    return opt[:response] if opt.key?('response'.to_sym) && opt[:response].code != 200

    options = deep_merge(build_options, opt)
    #p "Options; #{options}"
    begin
      @@time_start = Time.new
      begin
        @response = HTTParty.delete(path, options)
      rescue Exception => e
        p "Exception: #{e}"
      end
      @@time_done = Time.new
      log_id = @response.headers['logid']
      p "logId: #{log_id}" if log_id
    rescue Exception => e
      @@time_done = Time.new
      p "Time to failure: #{time_elapsed_last_call}"
      raise e, "Time to failure: #{time_elapsed_last_call}"
    end
    @@cookie = nil if path <=> '/resource/authentication'
    @@jwt = nil if path <=> '/resource/authentication'
    return @response
  end
end

def deep_merge(first, second)
  merger = proc { |key, v1, v2| (v1.is_a? Hash) && (v2.is_a? Hash) ? v1.merge(v2, &merger) : v2 }
  first.merge(second, &merger)
end
