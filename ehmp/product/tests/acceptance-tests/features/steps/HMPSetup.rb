class SetupEnv
  def initialize
    # @url = "https://hmpdemo.vainnovations.us/auth/login"
    # @accesscode = 'REDACTED'
    # @verifycode = 'REDACTED'
    # @facility = 'HMP SANDBOX'
    @url = "https://IP/"
    @accesscode = 'REDACTED'
    @verifycode = 'REDACTED'
    @facility = 'CAMP MASTER'
  end

  attr_accessor :url
  attr_accessor :accesscode
  attr_accessor :verifycode
  attr_accessor :facility
end
