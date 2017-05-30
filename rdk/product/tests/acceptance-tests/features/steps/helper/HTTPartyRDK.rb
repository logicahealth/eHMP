require "httparty"
require 'cucumber/term/ansicolor'

path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require "DefaultLogin.rb"
require "TestSupport.rb"
require "DomAccess.rb"
require "PatientPickerDomElements.rb"

class TestClients
  @users = {}

  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users["REDACTED"] = "REDACTED"
  @users['REDACTED'] = 'REDACTED'
  @users['REDACTED'] = 'REDACTED'

  def self.password_for(username)
    return @users[username]
  end
end

class Keychain < Hash
  def key(credentials)
    "#{credentials[:site]};#{credentials[:accessCode]};#{credentials[:verifyCode]};#{credentials[:division]};"
  end

  def [](credentials)
    super(key(credentials))
  end

  def []=(credentials, value)
    super(key(credentials), value)
  end
end

class HTTPartyRDK
  include HTTParty
  @keychain = Keychain.new
  @time_start = Time.new
  @time_done = Time.new
  @time_out_time = 300
  @divisions = {}
  @divisions["9E7A"] = "500"
  @divisions["C877"] = "507"

  def self.default_credentials
    return { :accessCode => "REDACTED", :verifyCode => "REDACTED", :site => "9E7A", :division => "500" }
  end

  def self.time_elapsed_last_call
    return @time_done - @time_start
  end

  def self.tokens_ready(credentials = default_credentials)
    tokens = @keychain[credentials]
    return !tokens.nil? && (tokens[:expires] - Time.now.utc > 60)  # expires over 60 seconds from now
  end

  def self.build_options(credentials)
    puts Color.grey "Using credentials: #{credentials}"
    tokens = @keychain[credentials]
    headers = {}
    headers['Cookie'] = tokens[:cookie] unless tokens[:cookie].nil?
    headers['Authorization'] = tokens[:jwt] unless tokens[:jwt].nil?

    options = {}
    options[:headers] = headers
    options[:verify] = false
    options[:timeout] = @time_out_time
    return options
  end

  def self.acquire_tokens(credentials = {})
    payload = default_credentials.merge(credentials)

    authentication_path = RDKQuery.new('authentication-authentication').path
    options = { :body => payload.to_json, :headers => { 'Content-Type' => 'application/json' }, :timeout => @time_out_time, :verify => false }
    puts Color.grey format_options_to_curl('POST', authentication_path, options)
    @response = HTTParty.post(authentication_path, options)
    puts Color.grey "Authentication: #{payload} had a #{@response.code} response"

    if @response.code != 200
      @keychain[credentials] = nil
      return @response
    end

    jwt = @response.headers['X-Set-JWT']
    cookie = @response.headers['set-cookie']
    puts Color.grey "Authentication JWT: #{jwt.inspect}"
    puts Color.grey "Authentication cookie: #{cookie.inspect}"
    cookie_hash = HTTParty::CookieHash.new
    cookie_hash.add_cookies(cookie)
    tokens = {}
    tokens[:cookie] = cookie_hash.dup.to_cookie_string
    tokens[:expires] = Time.parse(cookie_hash[:Expires]).utc
    tokens[:jwt] = "Bearer #{jwt}" unless jwt.nil?
    @keychain[credentials] = tokens
    return @response
  end

  def self.get_authentication_options(credentials = default_credentials)
    @response = nil
    options = {}
    options[:authentication_response] = acquire_tokens(credentials) unless tokens_ready(credentials)
    return options
  end

  def self.get_credentials(user, pass)
    credentials = {}
    credentials[:accessCode] = user.split(';')[1]
    credentials[:site] = user.split(';')[0]
    credentials[:verifyCode] = pass
    credentials[:division]= @divisions[user.split(';')[0]]
    return credentials
  end

  def self.add_body_header_options(options, json, headers)
    if json.is_a?(Hash)
      options[:body] = json.to_json
      headers['Content-Type'] = 'application/json' if headers['Content-Type'].nil?
    else
      options[:body] = json unless json.nil?
    end
    options[:headers] = headers unless headers.empty?
  end

  def self.get(path, json = nil, headers = {})
    options = get_authentication_options
    add_body_header_options(options, json, headers)
    return wrap_httparty('get', path, options)
  end

  def self.post(path, json = nil, headers = {})
    options = get_authentication_options
    add_body_header_options(options, json, headers)
    return wrap_httparty('post', path, options)
  end

  def self.put(path, json = nil, headers = {})
    options = get_authentication_options
    add_body_header_options(options, json, headers)
    return wrap_httparty('put', path, options)
  end

  def self.delete(path, json = nil, headers = {})
    options = get_authentication_options
    add_body_header_options(options, json, headers)
    return wrap_httparty('delete', path, options)
  end

  def self.get_as_user(path, user, pass, json = nil, headers = {})
    credentials = get_credentials(user, pass)
    options = get_authentication_options(credentials)
    add_body_header_options(options, json, headers)
    return wrap_httparty('get', path, options, credentials)
  end

  def self.post_as_user(path, user, pass, json = nil, headers = {})
    credentials = get_credentials(user, pass)
    options = get_authentication_options(credentials)
    add_body_header_options(options, json, headers)
    return wrap_httparty('post', path, options, credentials)
  end

  def self.put_as_user(path, user, pass, json = nil, headers = {})
    credentials = get_credentials(user, pass)
    options = get_authentication_options(credentials)
    add_body_header_options(options, json, headers)
    return wrap_httparty('put', path, options, credentials)
  end

  # Don't call this directly; use the methods above
  # We expect opt to already contain authenticated tokens
  def self.wrap_httparty(method, path, opt = {}, credentials = default_credentials)
    puts Color.magenta "#{method.upcase} #{path}"
    @response = nil
    return opt[:authentication_response] if opt.key?(:authentication_response) && opt[:authentication_response].code != 200

    options = deep_merge(build_options(credentials), opt)
    puts Color.grey format_options_to_curl(method, path, options)
    begin
      @time_start = Time.new
      begin
        @response = HTTParty.send(method.downcase, path, options)
        if @response.code == 401
          puts Color.red "Failed credentials: #{credentials}"
          puts Color.red "Failed keychain: #{@keychain}"
          @keychain[credentials] = nil
        end
      rescue Exception => e
        puts Color.red "Exception: #{e}"
      end
      @time_done = Time.new
      request_id = @response.headers['X-Request-ID']
      puts Color.grey "requestId: #{request_id}" if request_id
    rescue Exception => e
      @time_done = Time.new
      puts Color.red "Time to failure: #{time_elapsed_last_call}"
      raise e, "Time to failure: #{time_elapsed_last_call}"
    end
    if method.upcase == 'DELETE' && path == '/resource/authentication'
      @keychain[credentials] = nil
    end
    return @response
  end
end

def format_options_to_curl(method, path, options)
  command = ['curl -g -v']
  command << "-X #{method.upcase} " unless method.upcase == 'GET'
  command << options[:headers].map { |k, v| "-H '#{k}: #{v}'" }.join(' ')
  command << "-d '#{options[:body]}'" if options[:body]
  command << "'#{path}'"
  command.join(' ')
end

def deep_merge(first, second)
  merger = proc { |key, v1, v2| (v1.is_a? Hash) && (v2.is_a? Hash) ? v1.merge(v2, &merger) : v2 }
  first.merge(second, &merger)
end

class Color
  extend Cucumber::Term::ANSIColor
  # clear (reset)
  # bold, dark
  # black, red, green, yellow, blue, magenta, cyan, white
  def self.grey(string)
    # Basic ANSI grey color, compatible with Jenkins
    bold(black(string))
  end
end
