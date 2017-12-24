class SetupEnv
  def initialize
    # @url = "https://hmpdemo.vainnovations.us/auth/login"
    # @accesscode = 'PW    '
    # @verifycode = 'PW    '
    # @facility = 'HMP SANDBOX'
    @url = "https://IP           /"
    @accesscode = 'USER  '
    @verifycode = 'PW      '
    @facility = 'CAMP MASTER'
  end

  attr_accessor :url
  attr_accessor :accesscode
  attr_accessor :verifycode
  attr_accessor :facility
end
