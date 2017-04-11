path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require 'HTTPartyRDK.rb'

class HTTPartyRDKTrustedSystems < HTTPartyRDK
  
  @keychain = Keychain.new
  
  def self.default_credentials
    return { :name => "CDS", :type => "internal" }
  end

  def self.acquire_tokens(credentials = {})
    payload = default_credentials.merge(credentials)
    
    system_type = credentials[:type]
    system_name = credentials[:name]

    authentication_path = RDKQuery.new("authentication-#{system_type}-systems-authenticate").path
    options = { :headers => { 'Content-Type' => 'application/json', 'Authorization' => system_name }, :timeout => @time_out_time, :verify => false }
    puts format_options_to_curl('POST', authentication_path, options)
    @response = HTTParty.post(authentication_path, options)
    p "System Authentication: #{payload} had a #{@response.code} response"

    if @response.code != 200
      @keychain[credentials] = nil
      return @response
    end

    jwt = @response.headers['X-Set-JWT']
    cookie = @response.headers['set-cookie']
    p "System Authentication JWT: #{jwt}"
    p "System Authentication cookie: #{cookie}"
    cookie_hash = HTTParty::CookieHash.new
    cookie_hash.add_cookies(cookie)
    tokens = {}
    tokens[:cookie] = cookie_hash.dup.to_cookie_string
    tokens[:expires] = Time.parse(cookie_hash[:Expires]).utc
    tokens[:jwt] = "Bearer #{jwt}" unless jwt.nil?
    @keychain[credentials] = tokens
    return @response
  end
  
  def self.get_credentials(name, type)
    credentials = {}
    credentials[:name] = name
    credentials[:type] = type
    return credentials
  end
  
  def self.get_as_user(path, system, type, json = nil, headers = {})
    credentials = get_credentials(system, type)
    options = get_authentication_options(credentials)
    add_body_header_options(options, json, headers)
    return wrap_httparty('get', path, options, credentials)
  end

  def self.post_as_user(path, system, type, json = nil, headers = {})
    credentials = get_credentials(system, type)
    options = get_authentication_options(credentials)
    add_body_header_options(options, json, headers)
    return wrap_httparty('post', path, options, credentials)
  end

  def self.put_as_user(path, system, type, json = nil, headers = {})
    credentials = get_credentials(system, type)
    options = get_authentication_options(credentials)
    add_body_header_options(options, json, headers)
    return wrap_httparty('put', path, options, credentials)
  end

  def self.delete_as_user(path, system, type, json = nil, headers = {})
    credentials = get_credentials(system, type)
    options = get_authentication_options(credentials)
    add_body_header_options(options, json, headers)
    return wrap_httparty('delete', path, options, credentials)
  end
end
